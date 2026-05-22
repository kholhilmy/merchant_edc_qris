import React, { useState } from "react";
import Papa from "papaparse";
import { DataService } from "../services/dataService";
import { Upload, Check, FileText, Trash2, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ReportQRIS() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus(null);
    }
  };

  const processFile = () => {
    if (!file) return;
    setUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: "|",
      complete: async (results) => {
        try {
          const res = await DataService.saveQRIS(results.data as any[]);
          if (res.success) {
            setStatus({ type: 'success', message: `Berhasil mengunggah ${res.count} data QRIS.` });
            setFile(null);
          } else {
            setStatus({ type: 'error', message: "Gagal menyimpan data ke database." });
          }
        } catch (err) {
          setStatus({ type: 'error', message: "Terjadi kesalahan saat memproses data." });
        } finally {
          setUploading(false);
        }
      },
      error: () => {
        setStatus({ type: 'error', message: "Gagal memparsing file CSV." });
        setUploading(false);
      }
    });
  };

  const clearData = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua data QRIS?")) {
      await DataService.clearData('qris');
      setStatus({ type: 'success', message: "Data QRIS telah dikosongkan." });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-center bg-white p-4 px-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-sm font-black text-[#00AEEF] uppercase tracking-widest">Manajemen Data QRIS</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">Upload & Pembersihan Database</p>
        </div>
        <button 
          onClick={clearData}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-[10px] font-black uppercase tracking-wider border border-red-100 shadow-sm shadow-red-100/50"
        >
          <Trash2 className="w-3.5 h-3.5" /> Hapus Semua
        </button>
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 bg-[#00AEEF]/5 rounded-2xl flex items-center justify-center">
          <Upload className="w-8 h-8 text-[#00AEEF]" />
        </div>
        
        <div>
          <h2 className="text-base font-black text-[#1A202C] uppercase tracking-tight">Upload CSV QRIS</h2>
          <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">Gunakan separator pipa (|)</p>
        </div>

        <div className="w-full relative">
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileUpload}
            className="hidden" 
            id="csv-upload-qris"
          />
          <label 
            htmlFor="csv-upload-qris"
            className="w-full h-24 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#00AEEF] hover:bg-[#00AEEF]/5 transition-all group"
          >
            {file ? (
              <div className="flex items-center gap-2 text-[#00AEEF] font-black text-xs">
                <FileText className="w-5 h-5" />
                <span className="truncate max-w-[200px]">{file.name}</span>
              </div>
            ) : (
              <>
                <Upload className="w-6 h-6 text-gray-300 group-hover:text-[#00AEEF]" />
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-[#00AEEF]">Klik untuk mencari file</span>
              </>
            )}
          </label>
        </div>

        <button 
          disabled={!file || uploading}
          onClick={processFile}
          className="w-full py-4 bg-[#00AEEF] text-white rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-[#00AEEF]/20 hover:bg-[#0096ce] disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : <Check className="w-5 h-5" />}
          {uploading ? 'MEMPROSES...' : 'MULAI IMPORT DATA'}
        </button>

        <AnimatePresence mode="wait">
          {status && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full p-3 rounded-xl text-[10px] font-black border uppercase tracking-wider ${
                status.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
              }`}
            >
              {status.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100">
            <Info className="w-4 h-4 text-[#00AEEF]" />
        </div>
        <div className="space-y-1">
          <h4 className="text-[10px] font-black text-[#00AEEF] uppercase tracking-widest leading-none">Petunjuk Penting</h4>
          <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed">
            Format file harus CSV dengan header standar. Gunakan simbol pipa | sebagai pemisah. 
            Pastikan kolom PERIODE, STOREID, dan NAMA_MERCHANT tersedia.
          </p>
        </div>
      </div>
    </div>
  );
}

function ChevronDown(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
