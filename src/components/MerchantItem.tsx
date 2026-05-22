import React, { useState, useEffect } from "react";
import { EDCData, QRISData } from "../types";
import { DataService } from "../services/dataService";
import { motion } from "motion/react";

interface MerchantItemProps {
  index: number;
  item: EDCData | QRISData;
  type: "edc" | "qris";
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

export function MerchantItem({ index, item, type }: MerchantItemProps) {
  const [detail, setDetail] = useState<{ current: any, previous: any } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const id = (item as any).id;
    if (id) {
      DataService.getMerchantDetail(type, id).then(res => {
        if (isMounted) {
          setDetail(res);
          setLoading(false);
        }
      }).catch(() => {
        if (isMounted) setLoading(false);
      });
    } else {
      setLoading(false);
    }
    return () => { isMounted = false; };
  }, [type, (item as any).id]);

  const current = detail?.current || item;
  const previous = detail?.previous;

  const currentTRX = type === "edc" ? Number(current.JML_TRANSAKSI || 0) : Number(current.AKUMULASI_TRX_TOTAL || 0);
  const currentSV = type === "edc" ? Number(current.SALES_VOLUME || 0) : Number(current.AKUMULASI_SV_TOTAL || 0);
  const currentCASA = Number(current.SALDO_POSISI || 0);

  const prevTRX = previous ? (type === "edc" ? Number(previous.JML_TRANSAKSI || 0) : Number(previous.AKUMULASI_TRX_TOTAL || 0)) : 0;
  const prevSV = previous ? (type === "edc" ? Number(previous.SALES_VOLUME || 0) : Number(previous.AKUMULASI_SV_TOTAL || 0)) : 0;
  const prevCASA = previous ? Number(previous.SALDO_POSISI || 0) : 0;

  const isProductive = type === "edc" ? currentSV > 15000000 : currentSV > 50000;
  
  const vendor = type === "edc" ? (current as any).VENDOR : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
    >
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-[11px] font-black text-[#00529C] uppercase tracking-tight">
                {index}. {item.NAMA_MERCHANT}
              </div>
              <div className="bg-[#EBF4FF] text-[#00529C] px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight">
                {type === 'edc' ? `TID: ${item.TID}` : `StoreID: ${item.STOREID}`}
              </div>
              {vendor && (
                <div className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border border-orange-100">
                  {vendor}
                </div>
              )}
            </div>
            <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">
              Periode: {current.PERIODE || 'Unknown'}
            </div>
          </div>
          <div className={cn(
            "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest",
            isProductive ? "bg-[#E6FFFA] text-[#047481]" : "bg-[#FFF5F5] text-[#C53030]"
          )}>
            {isProductive ? 'Produktif' : 'Non-Produktif'}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-3 text-[9px] font-bold text-gray-400 bg-gray-50/50 p-2 rounded-lg border border-gray-50 uppercase tracking-wide">
          <div className="flex items-center gap-1.5 grayscale opacity-70">
            🏢 <span className="font-black text-gray-500">Uker:</span> {type === 'edc' ? (current as EDCData).NAMA_UKER : (current as QRISData).BRDESC}
          </div>
          <div className="flex items-center gap-1.5 grayscale opacity-70">
            👤 <span className="font-black text-gray-500">Pramerkasa:</span> {type === 'edc' ? (current as EDCData).NAMA_USER_PEMRAKARSA : (current as QRISData).PN_PEMRAKASA || '-'}
          </div>
        </div>

        <div className="border border-gray-100 rounded-xl overflow-hidden">
          {loading ? (
             <div className="p-4 text-center text-[10px] text-gray-300 font-bold uppercase animate-pulse">Menghitung MoM...</div>
          ) : (
            <table className="w-full text-[9px] text-left border-collapse">
              <thead className="bg-[#F7FAFC] border-b border-gray-100 uppercase tracking-widest text-[8px]">
                <tr>
                  <th className="px-3 py-2 border-r border-gray-100 font-black text-gray-400">Periode</th>
                  <th className="px-3 py-2 border-r border-gray-100 font-black text-gray-400 text-center">Transaksi</th>
                  <th className="px-3 py-2 border-r border-gray-100 font-black text-gray-400 text-center">Sales Volume</th>
                  <th className="px-3 py-2 font-black text-gray-400 text-center">CASA</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="px-3 py-1.5 border-r border-gray-50 font-black text-gray-400">{previous ? previous.PERIODE : 'BLN LALU'}</td>
                  <td className="px-3 py-1.5 border-r border-gray-50 text-center font-bold text-gray-500">{prevTRX.toLocaleString('id-ID')}</td>
                  <td className="px-3 py-1.5 border-r border-gray-50 text-center font-bold text-gray-500">Rp {prevSV.toLocaleString('id-ID')}</td>
                  <td className="px-3 py-1.5 text-center font-bold text-gray-500">Rp {prevCASA.toLocaleString('id-ID')}</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="px-3 py-1.5 border-r border-gray-50 font-black text-gray-700">{current.PERIODE} (INI)</td>
                  <td className="px-3 py-1.5 border-r border-gray-50 text-center font-black text-[#1A202C]">{currentTRX.toLocaleString('id-ID')}</td>
                  <td className="px-3 py-1.5 border-r border-gray-50 text-center font-black text-[#1A202C]">Rp {currentSV.toLocaleString('id-ID')}</td>
                  <td className="px-3 py-1.5 text-center font-black text-[#1A202C]">Rp {currentCASA.toLocaleString('id-ID')}</td>
                </tr>
                <tr className="bg-[#F7FAFC]/50">
                  <td className="px-3 py-1.5 border-r border-gray-100 font-black text-gray-400 italic">SELISIH (MoM)</td>
                  <td className={cn("px-3 py-1.5 border-r border-gray-100 text-center font-black", (currentTRX - prevTRX) >= 0 ? "text-green-500" : "text-red-500")}>
                    {(currentTRX - prevTRX) > 0 ? '+' : ''}{(currentTRX - prevTRX).toLocaleString('id-ID')}
                  </td>
                  <td className={cn("px-3 py-1.5 border-r border-gray-100 text-center font-black", (currentSV - prevSV) >= 0 ? "text-green-500" : "text-red-500")}>
                    {(currentSV - prevSV) > 0 ? '+' : ''}Rp {(currentSV - prevSV).toLocaleString('id-ID')}
                  </td>
                  <td className={cn("px-3 py-1.5 text-center font-black", (currentCASA - prevCASA) >= 0 ? "text-green-500" : "text-red-500")}>
                    {(currentCASA - prevCASA) > 0 ? '+' : ''}Rp {(currentCASA - prevCASA).toLocaleString('id-ID')}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.div>
  );
}
