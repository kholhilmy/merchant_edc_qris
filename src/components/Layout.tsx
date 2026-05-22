import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#F4F7FE] flex text-[#2D3748]">
      <Sidebar />
      <main className="flex-1 ml-64 min-w-0">
        <Header />
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
