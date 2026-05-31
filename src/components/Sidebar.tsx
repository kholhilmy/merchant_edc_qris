import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  ChevronRight,
  QrCode,
  BarChart3,
  TrendingUp, 
  HomeIcon,
  ShieldCheck,
  StoreIcon,
  X // Import ikon X untuk tombol close mobile
} from "lucide-react";

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

// Tambahkan props isOpen dan onClose agar bisa dikontrol dari Layout
export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const menuItems = [
    {
      title: "MONITORING GLOBAL",
      items: [
        { name: "Analisis Grafik", path: "/analytics", icon: TrendingUp },
      ]
    },
    {
      title: "LAYANAN EDC",
      items: [
        { name: "Dashboard EDC", path: "/edc/dashboard", icon: LayoutDashboard },
        { name: "Report Data EDC", path: "/edc/report", icon: FileText },
      ]
    },
    {
      title: "LAYANAN QRIS",
      items: [
        { name: "Dashboard QRIS", path: "/qris/dashboard", icon: QrCode },
        { name: "Report Data QRIS", path: "/qris/report", icon: FileText },
      ]
    }
  ];

  return (
    <aside className={cn(
      // 1. Logika Responsive: w-64 tetap, fixed h-screen. 
      // 2. Transisi: Geser ke kiri (-translate-x-full) secara default di mobile.
      // 3. lg:translate-x-0: Di desktop sidebar selalu muncul.
      "w-64 bg-[#00529C] text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-[70] transition-transform duration-300 ease-in-out",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      
      {/* TOMBOL CLOSE (Hanya muncul di Mobile saat sidebar terbuka) */}
      <button 
        onClick={onClose}
        className="lg:hidden absolute right-4 top-5 p-2 hover:bg-white/10 rounded-xl transition-colors"
      >
        <X className="w-5 h-5 text-white/70" />
      </button>

      <div className="p-6">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-sm font-black tracking-tight leading-none uppercase">
            Data EDC & QRIS <br /> <span className="text-white/60">BO Kebumen</span>
          </h2>
        </div>

        <nav className="space-y-8 overflow-y-auto max-h-[calc(100vh-320px)] no-scrollbar">
          {menuItems.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <h3 className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] px-2">
                {section.title}
              </h3>
              <div className="space-y-1.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    // Tambahkan onClose() agar sidebar otomatis nutup saat menu diklik di HP
                    onClick={() => { if(window.innerWidth < 1024) onClose(); }}
                    className={({ isActive }) => cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl transition-all group",
                      isActive 
                        ? "bg-[#00AEEF] text-white shadow-lg shadow-[#00AEEF]/20" 
                        : "hover:bg-white/10 text-white/70 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="w-4 h-4" />
                      <span className="text-[11px] font-bold">{item.name}</span>
                    </div>
                    <ChevronRight className={cn(
                      "w-3 h-3 transition-transform duration-200 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
                    )} />
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-3">
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white/80 hover:text-white group text-left">
            <StoreIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[11px] font-black uppercase tracking-widest">Monitoring Sistem</span>
          </button>
          
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center justify-between px-4 py-2">
              <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em]">Version 2.0 SQL</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Online</span>
              </div>
          </div>
        </div>

        <div className="px-2 space-y-3">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em] leading-tight">
            © 2026 Monitoring <br />
            EDC & QRIS BO Kebumen <br />
           - by IT Kebumen - 
          </p>
          
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-bold text-[#00AEEF] hover:underline cursor-pointer">
              itkebumen.my.id
            </span>
            <div className="flex items-center gap-1.5 text-white/20">
              <ShieldCheck className="w-2.5 h-2.5" />
              <span className="text-[7px] font-black uppercase tracking-[0.2em]">Internal Use Only</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}