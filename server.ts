import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import sqlite3 from "sqlite3";

const db = new sqlite3.Database("database.sqlite");

// Initialize Database Tables with UNIQUE constraints for Duplication Prevention
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS edc (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    TAHUN TEXT,
    PERIODE TEXT,
    POSISI TEXT,
    NAMA_KANCA TEXT,
    NAMA_UKER TEXT,
    TID TEXT,
    MID TEXT,
    NAMA_MERCHANT TEXT,
    SALES_VOLUME REAL,
    SALDO_POSISI REAL,
    RATAS_SALDO REAL,
    JML_TRANSAKSI INTEGER,
    NAMA_USER_PEMRAKARSA TEXT,
    VENDOR TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  // Index for upsert and faster lookups
  db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_edc_tid_period ON edc (TID, PERIODE)`);

  db.run(`CREATE TABLE IF NOT EXISTS qris (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    PERIODE TEXT,
    POSISI TEXT,
    MBDESC TEXT,
    BRDESC TEXT,
    STOREID TEXT,
    NAMA_MERCHANT TEXT,
    AKUMULASI_SV_TOTAL REAL,
    SALDO_POSISI REAL,
    RATAS_SALDO REAL,
    AKUMULASI_TRX_TOTAL INTEGER,
    PN_PEMRAKASA TEXT,
    STATUS TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_qris_store_period ON qris (STOREID, PERIODE)`);
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "100mb" }));

  // --- API ROUTES ---

  // Get Stats (Dynamic Calculation)
  app.get("/api/stats/:type", (req, res) => {
    const { type } = req.params;
    const table = type === "edc" ? "edc" : "qris";
    
    db.get(`SELECT PERIODE, created_at FROM ${table} ORDER BY created_at DESC LIMIT 1`, (err, latest) => {
      if (!latest) return res.json({ current: {}, previous: {}, lastUpdate: null });

      const currentPeriod = latest.PERIODE;
      
      // Get previous period contextually
      db.get(`SELECT DISTINCT PERIODE FROM ${table} WHERE PERIODE != ? ORDER BY created_at DESC LIMIT 1`, [currentPeriod], (err, prev) => {
        const prevPeriod = prev?.PERIODE;

        const getStatsQuery = (period: string) => {
          if (type === "edc") {
            return `SELECT 
              COUNT(*) as total,
              SUM(SALES_VOLUME) as sales_vol,
              SUM(SALDO_POSISI) as casa,
              COUNT(CASE WHEN SALES_VOLUME > 15000000 THEN 1 END) as productive
            FROM edc WHERE PERIODE = '${period}'`;
          } else {
            return `SELECT 
              COUNT(*) as total,
              SUM(AKUMULASI_SV_TOTAL) as sales_vol,
              SUM(SALDO_POSISI) as casa,
              COUNT(CASE WHEN AKUMULASI_SV_TOTAL > 50000 THEN 1 END) as productive
            FROM qris WHERE PERIODE = '${period}'`;
          }
        };

        db.get(getStatsQuery(currentPeriod), (err, currentStats) => {
          if (!prevPeriod) {
            return res.json({ current: currentStats, previous: {}, lastUpdate: latest.created_at });
          }
          db.get(getStatsQuery(prevPeriod), (err, prevStats) => {
            res.json({
              current: currentStats,
              previous: prevStats,
              lastUpdate: latest.created_at
            });
          });
        });
      });
    });
  });

  // Get Merchant Comparison Data (Real MoM)
  app.get("/api/merchant-detail/:type/:id", (req, res) => {
    const { type, id } = req.params;
    const table = type === "edc" ? "edc" : "qris";
    const idField = type === "edc" ? "TID" : "STOREID";

    db.get(`SELECT * FROM ${table} WHERE id = ?`, [id], (err, currentDoc) => {
      if (!currentDoc) return res.status(404).json({ error: "Not found" });

      db.get(`SELECT * FROM ${table} WHERE ${idField} = ? AND PERIODE != ? ORDER BY created_at DESC LIMIT 1`, 
        [currentDoc[idField], currentDoc.PERIODE], (err, prevDoc) => {
          res.json({ current: currentDoc, previous: prevDoc || null });
      });
    });
  });

  // Get List with Advanced Filtering
  // Get List with Advanced Filtering & MoM Join
  app.get("/api/list/:type", (req, res) => {
    const { type } = req.params;
    const { 
      page = 1, 
      limit = 5, 
      search = "", 
      unit = "", 
      vendor = "",
      pemrakarsa = "",
      sort = "NAMA_MERCHANT", 
      order = "ASC", 
      filterType = "all" 
    } = req.query;
    
    const table = type === "edc" ? "edc" : "qris";
    const idField = type === "edc" ? "TID" : "STOREID";
    const salesField = type === "edc" ? "SALES_VOLUME" : "AKUMULASI_SV_TOTAL";
    const casaField = "SALDO_POSISI";
    const trxField = type === "edc" ? "JML_TRANSAKSI" : "AKUMULASI_TRX_TOTAL";
    const offset = (Number(page) - 1) * Number(limit);

    // 1. Logic WHERE Clause
    let whereClause = "WHERE t1.PERIODE = (SELECT MAX(PERIODE) FROM " + table + ")";
    const params: any[] = [];

    if (search) {
      whereClause += ` AND (t1.NAMA_MERCHANT LIKE ? OR t1.${idField} LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (unit && unit !== "Semua Unit Kerja" && unit !== "") {
      const unitColumn = type === 'edc' ? 'NAMA_UKER' : 'BRDESC';
      whereClause += ` AND t1.${unitColumn} LIKE ?`;
      params.push(`%${String(unit).trim()}%`);
    }

    if (pemrakarsa && pemrakarsa !== "Semua Pemrakarsa" && pemrakarsa !== "") {
      const pmColumn = type === 'edc' ? 'NAMA_USER_PEMRAKARSA' : 'PN_PEMRAKASA';
      whereClause += ` AND t1.${pmColumn} LIKE ?`;
      params.push(`%${String(pemrakarsa).trim()}%`);
    }

    if (filterType === "produktif") {
      whereClause += ` AND t1.${salesField} > ${type === 'edc' ? '15000000' : '50000'}`;
    } else if (filterType === "non-produktif") {
      whereClause += ` AND t1.${salesField} <= ${type === 'edc' ? '15000000' : '50000'}`;
    }

    // 2. Sorting Maps
    const sortMaps: any = {
      casa: `t1.${casaField}`,
      sales: `t1.${salesField}`,
      trx: `t1.${trxField}`,
      NAMA_MERCHANT: "t1.NAMA_MERCHANT"
    };
    const sortColumn = sortMaps[sort as string] || 't1.NAMA_MERCHANT';

    // 3. QUERY SAKTI (JOIN Data Bulan Ini vs Bulan Lalu)
    // t1 = Data Periode Terbaru (Current)
    // t2 = Data Periode Sebelumnya (Previous)
    const dataQuery = `
      SELECT 
        t1.*,
        t2.${salesField} as prev_sales,
        t2.${casaField} as prev_casa,
        t2.${trxField} as prev_trx,
        t2.PERIODE as prev_periode
      FROM ${table} t1
      LEFT JOIN ${table} t2 ON t1.${idField} = t2.${idField} 
        AND t2.PERIODE = (
          SELECT MAX(PERIODE) FROM ${table} 
          WHERE ${idField} = t1.${idField} AND PERIODE < t1.PERIODE
        )
      ${whereClause} 
      ORDER BY ${sortColumn} ${order} 
      LIMIT ? OFFSET ?
    `;

    const countQuery = `SELECT COUNT(*) as count FROM ${table} t1 ${whereClause}`;

    db.get(countQuery, params, (err, countResult) => {
      db.all(dataQuery, [...params, Number(limit), offset], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        res.json({
          data: rows || [],
          total: countResult?.count || 0,
          page: Number(page),
          totalPages: Math.ceil((countResult?.count || 0) / Number(limit))
        });
      });
    });
  });

  // Fast Bulk Upload with UPSERT (SQLite equivalent: INSERT OR REPLACE)
  app.post("/api/save-edc", (req, res) => {
    const data = req.body;
    
    // Use transaction for speed
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");
      
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO edc (
          TAHUN, PERIODE, POSISI, NAMA_KANCA, NAMA_UKER, TID, MID, NAMA_MERCHANT, 
          SALES_VOLUME, SALDO_POSISI, RATAS_SALDO, JML_TRANSAKSI, NAMA_USER_PEMRAKARSA, VENDOR
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `);
      
      const cleanNum = (v: any) => parseFloat(String(v || 0).replace(/[Rp.\s]/g, '').replace(',', '.')) || 0;
      const cleanInt = (v: any) => parseInt(String(v || 0).replace(/[.\s,]/g, '')) || 0;

      data.forEach((item: any) => {
        // Detect vendor from data if available or use a default
        const vendor = item.VENDOR || item.NAMA_VENDOR || 'General';
        
        stmt.run(
          item.TAHUN, item.PERIODE, item.POSISI, item.NAMA_KANCA, item.NAMA_UKER, 
          item.TID, item.MID, item.NAMA_MERCHANT, 
          cleanNum(item.SALES_VOLUME),
          cleanNum(item.SALDO_POSISI),
          cleanNum(item.RATAS_SALDO),
          cleanInt(item.JML_TRANSAKSI),
          item.NAMA_USER_PEMRAKARSA,
          vendor
        );
      });
      
      stmt.finalize();
      db.run("COMMIT", (err) => {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, count: data.length });
      });
    });
  });

  // 1. Ambil Total Performa Per Bulan (Global)
  app.get("/api/analytics/total/:type", (req, res) => {
    const { type } = req.params;
    const table = type === "edc" ? "edc" : "qris";
    const svField = type === "edc" ? "SALES_VOLUME" : "AKUMULASI_SV_TOTAL";
    const threshold = type === "edc" ? 15000000 : 50000;
    
    const query = `
      SELECT 
        PERIODE, 
        SUM(${svField}) as total_sv, 
        SUM(SALDO_POSISI) as total_casa, 
        COUNT(*) as total_unit,
        COUNT(CASE WHEN ${svField} > ${threshold} THEN 1 END) as total_prod
      FROM ${table} 
      GROUP BY PERIODE ORDER BY PERIODE ASC
    `;
    db.all(query, [], (err, rows) => res.json(rows || []));
  });

  // Ambil Histori Spesifik Per Merchant (Cari per ID)
  app.get("/api/analytics/merchant/:type/:id", (req, res) => {
    const { type, id } = req.params;
    const table = type === "edc" ? "edc" : "qris";
    const idField = type === "edc" ? "TID" : "STOREID";
    const svField = type === "edc" ? "SALES_VOLUME" : "AKUMULASI_SV_TOTAL";
    // QRIS pake AKUMULASI_TRX_TOTAL, EDC pake JML_TRANSAKSI
    const trxField = type === "edc" ? "JML_TRANSAKSI" : "AKUMULASI_TRX_TOTAL";

    // Gunakan LIKE ? dan params %id% agar spasi di DB tidak jadi masalah
    const query = `
      SELECT 
        PERIODE, 
        ${svField} as sv, 
        SALDO_POSISI as casa, 
        ${trxField} as trx, 
        NAMA_MERCHANT
      FROM ${table} 
      WHERE ${idField} LIKE ? 
      ORDER BY PERIODE ASC
    `;
    
    db.all(query, [`%${String(id).trim()}%`], (err, rows) => {
      if (err) return res.status(500).json([]);
      res.json(rows || []);
    });
  });

  // Rute untuk menghapus semua data (EDC atau QRIS)
  app.post("/api/clear-data", (req, res) => {
    const { type } = req.body; // 'edc' atau 'qris'
    const table = type === "edc" ? "edc" : "qris";

    // Perintah SQL untuk menghapus seluruh isi tabel
    const query = `DELETE FROM ${table}`;

    // Jika Anda menggunakan SQLite (db.run)
    db.run(query, (err) => {
      if (err) {
        console.error("Gagal hapus data:", err.message);
        return res.status(500).json({ success: false, message: err.message });
      }
      res.json({ success: true, message: `Data ${type} berhasil dikosongkan.` });
    });

    /* 
      CATATAN: Jika Anda sudah pakai MySQL, gunakan kodingan ini:
      db.query(query, (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
      });
    */
  });

  // Endpoint Khusus Hapus Data QRIS
  app.post("/api/clear-qris", (req, res) => {
    const query = `DELETE FROM qris`;

    // Pake db.run (kalau masih SQLite) atau db.query (kalau sudah MySQL)
    db.run(query, (err) => {
      if (err) {
        console.error("Gagal hapus data QRIS:", err.message);
        return res.status(500).json({ success: false, message: err.message });
      }
      console.log("Database QRIS dikosongkan");
      res.json({ success: true, message: "Data QRIS berhasil dikosongkan." });
    });
  });

  app.post("/api/save-qris", (req, res) => {
    const data = req.body;
    
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");
      
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO qris (
          PERIODE, POSISI, MBDESC, BRDESC, STOREID, NAMA_MERCHANT, 
          AKUMULASI_SV_TOTAL, SALDO_POSISI, RATAS_SALDO, AKUMULASI_TRX_TOTAL, PN_PEMRAKASA, STATUS
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
      `);
      
      const cleanNum = (v: any) => parseFloat(String(v || 0).replace(/[Rp.\s]/g, '').replace(',', '.')) || 0;
      const cleanInt = (v: any) => parseInt(String(v || 0).replace(/[.\s,]/g, '')) || 0;

      data.forEach((item: any) => {
        stmt.run(
          item.PERIODE, item.POSISI, item.MBDESC, item.BRDESC, item.STOREID, 
          item.NAMA_MERCHANT,
          cleanNum(item.AKUMULASI_SV_TOTAL),
          cleanNum(item.SALDO_POSISI),
          cleanNum(item.RATAS_SALDO),
          cleanInt(item.AKUMULASI_TRX_TOTAL),
          item.PN_PEMRAKASA,
          item.STATUS
        );
      });
      
      stmt.finalize();
      db.run("COMMIT", (err) => {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, count: data.length });
      });
    });
  });

  app.get("/api/filter-options/:type", (req, res) => {
    const { type } = req.params;
    const table = type === "edc" ? "edc" : "qris";
    
    // 1. Kolom Unit Kerja: QRIS pakai BRDESC biar muncul Unit Mertokondo dll.
    const unitField = type === "edc" ? "NAMA_UKER" : "BRDESC";
    
    // 2. Kolom Pemrakarsa
    const pmField = type === "edc" ? "NAMA_USER_PEMRAKARSA" : "PN_PEMRAKASA";
    
    const results = {};
    
    db.all(`SELECT DISTINCT ${unitField} as val FROM ${table} WHERE ${unitField} IS NOT NULL AND ${unitField} != ''`, (err, units) => {
      // Safety: Jika units undefined/null, kasih array kosong
      results.units = units ? units.map(u => u.val) : [];
      
      db.all(`SELECT DISTINCT ${pmField} as val FROM ${table} WHERE ${pmField} IS NOT NULL AND ${pmField} != ''`, (err, pms) => {
        
        // PENTING: Pakai nama 'pms', jangan 'pemrakarsas' supaya dibaca Frontend Dashboard
        results.pms = pms ? pms.map(p => p.val) : [];
        
        if (type === 'edc') {
          db.all(`SELECT DISTINCT VENDOR as val FROM edc WHERE VENDOR IS NOT NULL AND VENDOR != ''`, (err, vendors) => {
            results.vendors = vendors ? vendors.map(v => v.val) : [];
            res.json(results);
          });
        } else {
          // Tambahkan vendors kosong buat QRIS supaya tidak error di frontend
          results.vendors = []; 
          res.json(results);
        }
      });
    });
});

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
