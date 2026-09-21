"use client";
import React from "react";
import { Laptop, CheckCircle, AlertTriangle, Package } from "lucide-react";

export default function LaptopStats({ laptops = [], setView, setLaptopFilter }) {
  const laptopStats = { inventaris: 0, berjalan: 0, habis: 0 };
  const groupedLaptops = {};

  laptops.forEach((l) => {
    if (l.status === "Inventaris") laptopStats.inventaris++;
    else if (l.status === "Sewa Berjalan") laptopStats.berjalan++;
    else if (l.status === "Sewa Habis") laptopStats.habis++;
    else laptopStats.inventaris++; // Default fallback

    const nama = l.produk || "Tidak Diketahui";
    groupedLaptops[nama] = (groupedLaptops[nama] || 0) + 1;
  });

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3 pl-1">
        <Laptop className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <h3 className="text-sm font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wide">
          Data Laptop (Total: <span className="text-emerald-600 dark:text-emerald-400">{laptops.length} Unit</span>)
        </h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => {
              if (setLaptopFilter) setLaptopFilter("Sewa Berjalan");
              setView("perangkat_laptop");
            }}
            className="bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 dark:from-[#132c21] dark:via-[#0f1712] dark:to-[#0f1712] p-5 rounded-2xl shadow-sm border border-emerald-200/80 dark:border-emerald-900/60 flex items-center gap-4 cursor-pointer hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">Sewa Berjalan</p>
              <p className="text-2xl font-black text-gray-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
                {laptopStats.berjalan}
              </p>
            </div>
          </div>

          <div
            onClick={() => {
              if (setLaptopFilter) setLaptopFilter("Sewa Habis");
              setView("perangkat_laptop");
            }}
            className="bg-gradient-to-br from-red-50/80 via-white to-red-50/30 dark:from-[#2e1518] dark:via-[#0f1712] dark:to-[#0f1712] p-5 rounded-2xl shadow-sm border border-red-200/80 dark:border-red-900/60 flex items-center gap-4 cursor-pointer hover:border-red-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="bg-red-600 p-3 rounded-2xl text-white shadow-md shadow-red-500/30 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">Sewa Habis</p>
              <p className="text-2xl font-black text-gray-900 dark:text-slate-100 group-hover:text-red-600 transition-colors">
                {laptopStats.habis}
              </p>
            </div>
          </div>

          <div
            onClick={() => {
              if (setLaptopFilter) setLaptopFilter("Inventaris");
              setView("perangkat_laptop");
            }}
            className="bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 dark:from-[#13222e] dark:via-[#0f1712] dark:to-[#0f1712] p-5 rounded-2xl shadow-sm border border-blue-200/80 dark:border-blue-900/60 flex items-center gap-4 cursor-pointer hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-md shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">Inventaris Kantor</p>
              <p className="text-2xl font-black text-gray-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                {laptopStats.inventaris}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white dark:bg-[#0f1712] rounded-2xl shadow-sm border border-gray-200 dark:border-[#2b4533] p-4 flex flex-col">
          <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-2 border-b border-gray-100 dark:border-[#2b4533] pb-2">
            Rincian Model / Tipe
          </h4>
          <div className="overflow-y-auto custom-scrollbar flex-1 max-h-[88px] pr-1">
            {Object.keys(groupedLaptops).length === 0 ? (
              <p className="text-xs text-gray-400 italic">Belum ada data Laptop.</p>
            ) : (
              <ul className="space-y-1.5">
                {Object.entries(groupedLaptops)
                  .sort((a, b) => b[1] - a[1])
                  .map(([nama, jumlah]) => (
                    <li key={nama} className="flex justify-between items-center text-xs">
                      <span className="text-gray-700 dark:text-slate-300 truncate pr-2 font-medium" title={nama}>
                        {nama}
                      </span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/40 shrink-0">
                        {jumlah}
                      </span>
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
