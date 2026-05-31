import { Menu, User } from "lucide-react";

// 1. Tambahkan interface untuk menerima kiriman fungsi dari Layout.tsx
interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-2">
        
        {/* 2. TOMBOL HAMBURGER: Muncul hanya di layar kecil (lg:hidden) */}
        <button 
          onClick={onMenuClick} 
          className="lg:hidden p-2 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5 text-[#00529C]" />
        </button>

        <div className="flex items-center">
          {/* Garis pembatas: Sembunyikan di HP biar judul bisa mepet ke kiri */}
          <span className="h-6 w-[1.5px] bg-gray-200 mx-2 hidden lg:block"></span>
          
          {/* Judul: Pakai text-[10px] di HP agar tidak hancur/turun ke bawah */}
          <h2 className="text-[10px] sm:text-xs md:text-base font-black text-[#00529C] uppercase tracking-tighter md:tracking-tight">
            Dashboard <span className="hidden xs:inline">EDC BRI</span> KC KEBUMEN
          </h2>
        </div>
      </div>

      {/* Bagian User Profile */}
      <div className="flex items-center gap-3">
        <div className="text-right flex flex-col justify-center border-l border-gray-100 pl-3 md:pl-4">
          <div className="text-[9px] md:text-[11px] font-black flex items-center gap-1 justify-end uppercase tracking-wide text-gray-700">
            <User className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#00529C]" />
            <span className="hidden sm:inline">Selamat datang,</span> Admin
          </div>
          <div className="text-[7px] md:text-[9px] text-gray-400 font-bold uppercase tracking-widest">
            KC Kebumen (0032)
          </div>
        </div>
      </div>
    </header>
  );
}