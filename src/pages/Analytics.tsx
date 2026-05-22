import React, { useEffect, useState } from 'react';
import { DataService } from '../services/dataService';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar 
} from 'recharts';
import { Search, TrendingUp, Wallet, QrCode, CreditCard, CheckCircle } from 'lucide-react';

export default function Analytics() {
  const [edcTotal, setEdcTotal] = useState([]);
  const [qrisTotal, setQrisTotal] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [searchType, setSearchType] = useState<'edc' | 'qris'>('edc');
  const [merchantHistory, setMerchantHistory] = useState([]);
  const [merchantName, setMerchantName] = useState("");

  useEffect(() => {
    DataService.getGlobalTrend('edc').then(setEdcTotal);
    DataService.getGlobalTrend('qris').then(setQrisTotal);
  }, []);

  const handleSearch = async () => {
    const cleanId = searchId.trim();
    if (!cleanId) return;

    try {
      const res = await DataService.getMerchantTrend(searchType, cleanId);
      if (res && res.length > 0) {
        setMerchantHistory(res);
        setMerchantName(res[0].NAMA_MERCHANT);
      } else {
        setMerchantHistory([]);
        setMerchantName("");
        alert("ID Merchant Tidak Ditemukan!");
      }
    } catch (error) {
      console.error("Gagal cari merchant", error);
    }
  };

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      
      {/* SECTION 1: GLOBAL EDC PERFORMANCE */}
      <section className="space-y-6">
        <header className="flex items-center gap-3 px-2">
          <div className="p-2 bg-[#00529C] rounded-lg shadow-lg shadow-blue-900/20">
            <CreditCard className="text-white w-5 h-5"/>
          </div>
          <h2 className="text-lg font-black text-[#00529C] uppercase tracking-tighter">Total Performa Global EDC</h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniChart title="Sales Volume" data={edcTotal} dataKey="total_sv" color="#00529C" isMoney />
          <MiniChart title="Total CASA" data={edcTotal} dataKey="total_casa" color="#3b82f6" isMoney />
          <MiniChart title="Total Unit" data={edcTotal} dataKey="total_unit" color="#10b981" />
          <MiniChart title="Produktif" data={edcTotal} dataKey="total_prod" color="#f59e0b" />
        </div>
      </section>

      {/* SECTION 2: GLOBAL QRIS PERFORMANCE */}
      <section className="space-y-6">
        <header className="flex items-center gap-3 px-2">
          <div className="p-2 bg-[#00AEEF] rounded-lg shadow-lg shadow-sky-400/20">
            <QrCode className="text-white w-5 h-5"/>
          </div>
          <h2 className="text-lg font-black text-[#00AEEF] uppercase tracking-tighter">Total Performa Global QRIS</h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniChart title="Sales Volume" data={qrisTotal} dataKey="total_sv" color="#00AEEF" isMoney />
          <MiniChart title="Total CASA" data={qrisTotal} dataKey="total_casa" color="#0ea5e9" isMoney />
          <MiniChart title="Total Unit" data={qrisTotal} dataKey="total_unit" color="#10b981" />
          <MiniChart title="Produktif" data={qrisTotal} dataKey="total_prod" color="#8b5cf6" />
        </div>
      </section>

      {/* SECTION 3: SEARCH MERCHANT */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-[#1A202C] uppercase tracking-tight">Cari Histori Merchant Per ID</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Gunakan TID untuk EDC atau StoreID untuk QRIS</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
            <select 
              value={searchType} 
              onChange={(e) => setSearchType(e.target.value as any)} 
              className="bg-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-none focus:ring-0 cursor-pointer"
            >
              <option value="edc">EDC (TID)</option>
              <option value="qris">QRIS (StoreID)</option>
            </select>
            <input 
              type="text" 
              placeholder="Masukkan ID..." 
              className="bg-transparent text-[11px] font-bold w-32 focus:ring-0 border-none" 
              value={searchId} 
              onChange={(e) => setSearchId(e.target.value)} 
            />
            <button 
              onClick={handleSearch} 
              className="p-2 bg-[#00529C] text-white rounded-xl hover:bg-blue-800 transition-all"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {merchantHistory.length > 0 ? (
          <div className="space-y-6 pt-4">
            {/* INFO MERCHANT BOX */}
            <div className={`p-5 rounded-3xl border flex items-center justify-between ${
              searchType === 'edc' ? 'bg-blue-50 border-blue-100' : 'bg-sky-50 border-sky-100'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${searchType === 'edc' ? 'bg-[#00529C]' : 'bg-[#00AEEF]'} text-white`}>
                  {searchType === 'edc' ? <CreditCard className="w-5 h-5"/> : <QrCode className="w-5 h-5"/>}
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detail Performa Merchant:</span>
                  <h3 className={`text-lg font-black uppercase leading-tight ${
                    searchType === 'edc' ? 'text-blue-900' : 'text-sky-900'
                  }`}>
                    {merchantName} 
                    <span className="ml-2 px-3 py-1 bg-white/50 rounded-lg text-[11px] border border-white/20">
                      ID: {searchId}
                    </span>
                  </h3>
                </div>
              </div>
              <div className="hidden md:block text-right">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-green-600 bg-green-100 px-3 py-1 rounded-full uppercase">
                  <CheckCircle className="w-3 h-3"/> Terkoneksi SQL
                </div>
              </div>
            </div>

            {/* GRAFIK PER MERCHANT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChart title="Histori Sales Volume" data={merchantHistory} dataKey="sv" color={searchType === 'edc' ? "#00529C" : "#00AEEF"} />
              <TrendChart title="Histori Saldo CASA" data={merchantHistory} dataKey="casa" color="#e91e63" />
            </div>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl text-gray-300 text-[10px] font-black uppercase">
            Hasil Pencarian Akan Muncul di Sini
          </div>
        )}
      </section>
    </div>
  );
}

// HELPER COMPONENTS

function MiniChart({ title, data, dataKey, color, isMoney }: any) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">{title}</h4>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f9fafb" />
          <XAxis dataKey="PERIODE" hide />
          <YAxis hide />
          <Tooltip 
            formatter={(v: any) => isMoney ? `Rp ${v.toLocaleString()}` : v.toLocaleString()}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
          />
          <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.1} strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function TrendChart({ title, data, dataKey, color }: any) {
  return (
    <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
        <TrendingUp className="w-4 h-4" /> {title}
      </h4>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="PERIODE" fontSize={10} fontWeight="bold" />
          <YAxis fontSize={10} hide />
          <Tooltip formatter={(v: any) => `Rp ${v.toLocaleString()}`} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={4} dot={{ r: 5, fill: color, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}