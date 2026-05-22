import { Menu, User } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          {/* <img 
            src="https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_Logo.svg" 
            alt="BRI Logo" 
            className="h-8" 
          /> */}
          <span className="h-6 w-[1.5px] bg-gray-300 mx-2 hidden sm:block"></span>
          <h2 className="text-base font-black text-[#00529C] hidden sm:block uppercase tracking-tight">Dashboard EDC BRI KC KEBUMEN</h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right flex flex-col justify-center">
          <div className="text-[11px] font-black flex items-center gap-1 justify-end uppercase tracking-wide">
            <User className="w-3.5 h-3.5 text-[#00529C]" />
            Selamat datang
          </div>
          <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Kantor Cabang Kebumen (0032) </div>
        </div>
      </div>
    </header>
  );
}
