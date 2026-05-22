import React, { useState, useEffect, useCallback } from "react";
import { DataService, ListResponse, StatsResponse } from "../services/dataService";
import { QRISData } from "../types";
import { 
  TrendingUp, 
  Home, 
  CheckCircle, 
  XCircle,
  Search,
  ChevronDown,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  QrCode
} from "lucide-react";
import { MerchantItem } from "../components/MerchantItem";

export default function DashboardQRIS() {
  const [listData, setListData] = useState<ListResponse<QRISData>>({ data: [], total: 0, page: 1, totalPages: 0 });
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [unit, setUnit] = useState("Semua Unit Kerja");
  const [pemrakarsa, setPemrakarsa] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sort, setSort] = useState("NAMA_MERCHANT");
  const [order, setOrder] = useState("ASC");
  const [page, setPage] = useState(1);
  const [filterOptions, setFilterOptions] = useState<{ units: string[], pms: string[] }>({ units: [], pms: [] });

  const fetchStats = useCallback(async () => {
    try {
      const res = await DataService.getStats("qris");
      setStats(res);
    } catch (e) {
      console.error("Gagal ambil stats QRIS:", e);
    }
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await DataService.getList<QRISData>("qris", {
        page,
        limit: 5,
        search,
        unit,
        pemrakarsa,
        sort,
        order,
        filterType
      });
      // Safety Check: Pastikan struktur data valid
      setListData(res || { data: [], total: 0, page: 1, totalPages: 0 });
    } catch (e) {
      console.error("Gagal ambil list QRIS:", e);
    }
    setLoading(false);
  }, [page, search, unit, pemrakarsa, sort, order, filterType]);

  useEffect(() => {
    fetchStats();
    DataService.getFilterOptions("qris").then(res => {
      if (res) setFilterOptions(res as any);
    });
  }, [fetchStats]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Handle Loading awal
  if (!stats && loading) return <div className="flex items-center justify-center h-64 font-bold text-[#00AEEF]">Memuat data QRIS...</div>;

  // Safety values agar tidak NaN (Sama seperti EDC)
  const current = {
    total: Number(stats?.current?.total) || 0,
    sales_vol: Number(stats?.current?.sales_vol) || 0,
    casa: Number(stats?.current?.casa) || 0,
    productive: Number(stats?.current?.productive) || 0,
  };

  const prev = {
    total: Number(stats?.previous?.total) || 0,
    sales_vol: Number(stats?.previous?.sales_vol) || 0,
    casa: Number(stats?.previous?.casa) || 0,
    productive: Number(stats?.previous?.productive) || 0,
  };

  const getDiff = (curr: number, p: number) => {
    const diff = curr - p;
    return (diff >= 0 ? "+" : "") + diff.toLocaleString('id-ID');
  };

  const getSVPDiff = (curr: number, p: number) => {
    const diff = curr - p;
    return (diff >= 0 ? "+" : "-") + "Rp " + Math.abs(diff).toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl font-extrabold text-[#1A202C] tracking-tight uppercase flex items-center gap-3">
            <div className="bg-[#00AEEF] w-1.5 h-6 rounded-full"></div>
            MONITORING QRIS 
          </h1>
          <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Terakhir Update: {stats?.lastUpdate ? new Date(stats.lastUpdate).toLocaleString('id-ID') : '30/04/2026 00:00'}
          </p>
        </div>
      </div>

      {/* Stat Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <StatCard 
          label="TOTAL QRIS" 
          value={current.total} 
          diff={getDiff(current.total, prev.total)} 
          icon={<QrCode className="w-6 h-6 text-blue-600" />}
        />
        <StatCard 
          label="SALES VOL" 
          value={`Rp ${current.sales_vol.toLocaleString('id-ID')}`} 
          diff={getSVPDiff(current.sales_vol, prev.sales_vol)} 
          icon={<TrendingUp className="w-6 h-6 text-red-600" />}
        />
        <StatCard 
          label="TOTAL CASA" 
          value={`Rp ${current.casa.toLocaleString('id-ID')}`} 
          diff={getSVPDiff(current.casa, prev.casa)} 
          icon={<Home className="w-6 h-6 text-pink-600" />}
        />
        <StatCard 
          label="PRODUKTIF" 
          value={current.productive} 
          diff={getDiff(current.productive, prev.productive)} 
          icon={<CheckCircle className="w-6 h-6 text-green-500" />}
        />
        <StatCard 
          label="NON PRODUKTIF" 
          value={current.total - current.productive} 
          diff={getDiff(current.total - current.productive, prev.total - prev.productive)} 
          icon={<XCircle className="w-6 h-6 text-red-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Filter Section */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <h3 className="font-bold text-[#00529C] text-xs flex items-center gap-2 uppercase tracking-wide border-b border-gray-50 pb-3">
              <Search className="w-4 h-4" /> Filter QRIS
            </h3>
            
            <div className="space-y-3">
              <FilterField label="Unit Kerja">
                <select 
                  value={unit}
                  onChange={(e) => { setUnit(e.target.value); setPage(1); }}
                  className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-xl appearance-none focus:outline-none focus:ring-1 focus:ring-[#00529C] transition-all text-[11px] font-bold uppercase"
                >
                  <option value="Semua Unit Kerja">Semua Unit Kerja</option>
                  {filterOptions?.units?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </FilterField>

              {/* <FilterField label="Nama Pemrakarsa">
                <select 
                  value={pemrakarsa}
                  onChange={(e) => { setPemrakarsa(e.target.value); setPage(1); }}
                  className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-xl appearance-none focus:outline-none focus:ring-1 focus:ring-[#00529C] transition-all text-[11px] font-bold uppercase"
                >
                  <option value="">Semua Pemrakarsa</option>
                  {filterOptions?.pms?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </FilterField> */}

              <FilterField label="Status Produktivitas">
                <select 
                  value={filterType}
                  onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                  className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-xl appearance-none focus:outline-none focus:ring-1 focus:ring-[#00529C] transition-all text-[11px] font-bold uppercase"
                >
                  <option value="all">Semua Status</option>
                  <option value="produktif">Produktif (&gt;50rb)</option>
                  <option value="non-produktif">Non-Produktif</option>
                </select>
              </FilterField>

              <FilterField label="Urutkan Berdasarkan">
                <div className="flex gap-2">
                  <select 
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); setPage(1); }}
                    className="flex-1 pl-3 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-xl appearance-none focus:outline-none focus:ring-1 focus:ring-[#00529C] transition-all text-[11px] font-bold uppercase"
                  >
                    <option value="NAMA_MERCHANT">Nama Merchant</option>
                    <option value="casa">CASA (Saldo)</option>
                    <option value="sales">Sales Volume</option>
                    <option value="trx">Jumlah Transaksi</option>
                  </select>
                  <button 
                    onClick={() => setOrder(order === "ASC" ? "DESC" : "ASC")}
                    className="p-2 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <ArrowUpDown className="w-4 h-4 text-[#00529C]" />
                  </button>
                </div>
              </FilterField>
            </div>

            <button 
              onClick={() => { setPage(1); fetchList(); }}
              className="w-full py-3 bg-[#00529C] text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-[#00427D] shadow-sm active:scale-95 transition-all outline-none"
            >
              Terapkan Filter
            </button>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between bg-white p-3 px-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-[#1A202C] text-xs flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#00529C]" /> Performa Merchant QRIS
            </h3>
            <div className="relative w-48">
              <input 
                type="text" 
                placeholder="Cari StoreID / Nama..."
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00529C] transition-all text-[10px] font-medium"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="bg-white p-12 rounded-2xl text-center italic text-gray-400 text-xs">Memuat data...</div>
            ) : (!listData?.data || listData.data.length === 0) ? (
              <div className="bg-white p-12 rounded-2xl text-center space-y-2 border-2 border-dashed border-gray-100 italic text-gray-400 text-xs">
                <Search className="w-8 h-8 mx-auto text-gray-100 mb-2" />
                Data Tidak Ditemukan
              </div>
            ) : (
              <>
                {listData.data.map((item, idx) => (
                  <MerchantItem 
                    key={item.id || idx} 
                    index={(listData.page - 1) * 5 + idx + 1} 
                    item={item} 
                    type="qris" 
                  />
                ))}
                
                {/* Pagination */}
                <div className="flex items-center justify-between pt-4 px-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Showing {(listData.page - 1) * 5 + 1} - {Math.min(listData.page * 5, listData.total)} of {listData.total}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="p-2 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 text-[#00529C]" />
                    </button>
                    <div className="flex items-center px-4 bg-white border border-gray-100 rounded-lg text-xs font-bold text-[#00529C]">
                      {page} / {listData.totalPages || 1}
                    </div>
                    <button 
                      disabled={page >= listData.totalPages}
                      onClick={() => setPage(page + 1)}
                      className="p-2 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4 text-[#00529C]" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, diff, icon }: any) {
  const isLoss = String(diff).startsWith('-');
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center text-center">
        <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2">{label}</h4>
        <div className="mb-2 scale-90">{icon}</div>
        <div className="text-xs font-black text-[#1A202C] truncate max-w-full">{value}</div>
        <div className={cn("text-[9px] font-black mt-1", isLoss ? "text-red-500" : "text-green-500")}>
          {diff} <span className="text-gray-400 font-medium">vs Bln Lalu</span>
        </div>
      </div>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        {children}
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}