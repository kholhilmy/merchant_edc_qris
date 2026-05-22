import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  LogOut,
  ChevronRight,
  QrCode,
  BarChart3,
  TrendingUp 
} from "lucide-react";

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

export default function Sidebar() {
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
    <aside className="w-64 bg-[#00529C] text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-sm font-black tracking-tight leading-none uppercase">
            Data EDC & QRIS <br /> <span className="text-white/60">BO Kebumen</span>
          </h2>
        </div>

        <nav className="space-y-8">
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

      <div className="mt-auto p-6 space-y-4">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white/80 hover:text-white group">
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-widest">Log Out Sistem</span>
        </button>
        
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em]">Version 2.0 SQL</span>
        </div>
      </div>
    </aside>
  );
}
