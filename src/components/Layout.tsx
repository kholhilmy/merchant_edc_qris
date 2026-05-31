import { useState } from "react"; // Tambahkan useState
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { ShieldAlert, Server, Globe, X } from "lucide-react"; // Tambahkan ikon X

export default function Layout() {
  // State untuk mengontrol buka-tutup sidebar di Mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex text-[#2D3748] relative overflow-x-hidden">
      
      {/* 1. OVERLAY (Latar Belakang Gelap) 
          Muncul hanya di Mobile ketika sidebar terbuka */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. SIDEBAR 
          Kirim props isOpen dan onClose agar sidebar tahu kapan harus muncul */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* 3. AREA UTAMA
          Ganti ml-64 menjadi lg:ml-64 agar di HP tidak ada margin kiri kosong */}
      <main className="flex-1 lg:ml-64 min-w-0 flex flex-col min-h-screen w-full transition-all duration-300">
        
        {/* HEADER 
            Kirim fungsi onMenuClick untuk membuka sidebar via tombol hamburger */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        {/* KONTEN UTAMA 
            Pengecilan padding di mobile (p-4) dan normal di desktop (p-8) */}
        <div className="p-4 md:p-8 flex-1">
          <Outlet />
        </div>

        {/* 4. FOOTER BAWAH
            Dibuat responsive dengan flex-col di HP dan flex-row jika layar lebar */}
        <footer className="w-full px-4 md:px-8 pb-10 pt-4 mt-auto">
          <div className="border-t border-gray-200/60 pt-8 flex flex-col items-center text-center gap-4">
            
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <Server className="w-3 h-3 text-gray-400" />
                <span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  Infrastructure: <span className="text-gray-600">Our Server</span>
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-gray-400" />
                <span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  Domain: <span className="text-[#00529C]">itkebumen.my.id</span>
                </span>
              </div>
            </div>

            <div className="space-y-1 px-4">
              <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.1em] md:tracking-[0.2em]">
                © 2026 Monitoring EDC & QRIS — Kantor Cabang Kebumen
              </p>
              <p className="text-[7px] md:text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                Developed & Managed by IT BO Kebumen
              </p>
            </div>

            <div className="mt-2 mx-4 px-4 md:px-5 py-1.5 bg-white rounded-full flex items-center gap-2 border border-gray-200 shadow-sm">
              <ShieldAlert className="w-3 h-3 text-red-500 shrink-0" />
              <p className="text-[7px] md:text-[8px] font-black text-gray-400 uppercase tracking-tighter leading-tight">
                Rahasia Bank: Internal Unit Kerja. Dilarang mendistribusikan tanpa izin.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}