"use client";
import { Monitor, CheckCircle, AlertTriangle, Package } from "lucide-react";

export default function ComputerStats({ computers = [], setView }) {
  const computerStats = { inventaris: 0, berjalan: 0, habis: 0 };
  const groupedComputers = {}; 
  
  computers.forEach((c) => {
    if (c.status === "Inventaris") computerStats.inventaris++;
    else if (c.status === "Sewa Berjalan") computerStats.berjalan++;
    else if (c.status === "Sewa Habis") computerStats.habis++;

    const nama = c.produk || "Tidak Diketahui";
    groupedComputers[nama] = (groupedComputers[nama] || 0) + 1;
  });

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3 pl-1">
        <Monitor className="w-4 h-4 text-blue-500" />
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Data PC & Komputer (Total: <span className="text-blue-600">{computers.length} Unit</span>)</h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div onClick={() => setView("perangkat_komputer")} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:border-green-300 hover:shadow-md transition-all group">
            <div className="bg-green-100 p-3 rounded-xl group-hover:bg-green-200 transition-colors"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-xs text-gray-500 font-medium">Sewa Berjalan</p><p className="text-xl font-bold text-gray-800">{computerStats.berjalan}</p></div>
          </div>
          <div onClick={() => setView("perangkat_komputer")} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:border-red-300 hover:shadow-md transition-all group">
            <div className="bg-red-100 p-3 rounded-xl group-hover:bg-red-200 transition-colors"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
            <div><p className="text-xs text-gray-500 font-medium">Sewa Habis</p><p className="text-xl font-bold text-gray-800">{computerStats.habis}</p></div>
          </div>
          <div onClick={() => setView("perangkat_komputer")} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors"><Package className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-xs text-gray-500 font-medium">Inventaris Gudang</p><p className="text-xl font-bold text-gray-800">{computerStats.inventaris}</p></div>
          </div>
        </div>
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col">
          <h4 className="text-xs font-bold text-gray-500 mb-2 border-b border-gray-100 pb-2">Rincian Model / Hardware</h4>
          <div className="overflow-y-auto custom-scrollbar flex-1 max-h-[88px] pr-1">
            {Object.keys(groupedComputers).length === 0 ? (
              <p className="text-xs text-gray-400 italic">Belum ada data PC.</p>
            ) : (
              <ul className="space-y-1.5">
                {Object.entries(groupedComputers).sort((a,b) => b[1] - a[1]).map(([nama, jumlah]) => (
                  <li key={nama} className="flex justify-between items-center text-xs">
                    <span className="text-gray-700 truncate pr-2 font-medium" title={nama}>{nama}</span>
                    <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 shrink-0">{jumlah}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}