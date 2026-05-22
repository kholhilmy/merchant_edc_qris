import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import DashboardEDC from "./pages/DashboardEDC";
import ReportEDC from "./pages/ReportEDC";
import DashboardQRIS from "./pages/DashboardQRIS";
import ReportQRIS from "./pages/ReportQRIS";
// 1. IMPORT PAGE ANALYTICS BARU
import Analytics from "./pages/Analytics"; 

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* 2. GANTI REDIRECT AWAL KE ANALYTICS (OPSIONAL) */}
          {/* Agar saat pertama buka aplikasi, langsung muncul grafik global */}
          <Route path="/" element={<Navigate to="/analytics" replace />} />
          
          {/* 3. TAMBAHKAN ROUTE ANALYTICS DI SINI */}
          <Route path="/analytics" element={<Analytics />} />
          
          <Route path="/edc/dashboard" element={<DashboardEDC />} />
          <Route path="/edc/report" element={<ReportEDC />} />
          <Route path="/qris/dashboard" element={<DashboardQRIS />} />
          <Route path="/qris/report" element={<ReportQRIS />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}