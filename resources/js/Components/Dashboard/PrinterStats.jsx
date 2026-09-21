"use client";
import { Printer, CheckCircle, AlertTriangle, Package } from "lucide-react";

export default function PrinterStats({ printers = [], setView, setPrinterFilter }) {
  const printerStats = { inventaris: 0, berjalan: 0, habis: 0 };
  const groupedPrinters = {}; 
  
  printers.forEach((p) => {
    if (p.status === "Inventaris") printerStats.inventaris++;
    else if (p.status === "Sewa Berjalan") printerStats.berjalan++;
    else if (p.status === "Sewa Habis") printerStats.habis++;

    const nama = p.produk || "Tidak Diketahui";
    groupedPrinters[nama] = (groupedPrinters[nama] || 0) + 1;
  });

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3 pl-1">
        <Printer className="w-4 h-4 text-purple-500" />
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Data Printer (Total: <span className="text-purple-600">{printers.length} Unit</span>)</h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div 
            onClick={() => {
              if (setPrinterFilter) setPrinterFilter("Sewa Berjalan");
              setView("perangkat_printer");
            }} 
            className="bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 dark:from-[#132c21] dark:via-[#0f1712] dark:to-[#0f1712] p-5 rounded-2xl shadow-sm border border-emerald-200/80 dark:border-emerald-900/60 flex items-center gap-4 cursor-pointer hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform"><CheckCircle className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">Sewa Berjalan</p>
              <p className="text-2xl font-black text-gray-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">{printerStats.berjalan}</p>
            </div>
          </div>
          <div 
            onClick={() => {
              if (setPrinterFilter) setPrinterFilter("Sewa Habis");
              setView("perangkat_printer");
            }} 
            className="bg-gradient-to-br from-red-50/80 via-white to-red-50/30 dark:from-[#2e1518] dark:via-[#0f1712] dark:to-[#0f1712] p-5 rounded-2xl shadow-sm border border-red-200/80 dark:border-red-900/60 flex items-center gap-4 cursor-pointer hover:border-red-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="bg-red-600 p-3 rounded-2xl text-white shadow-md shadow-red-500/30 group-hover:scale-110 transition-transform"><AlertTriangle className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">Sewa Habis</p>
              <p className="text-2xl font-black text-gray-900 dark:text-slate-100 group-hover:text-red-600 transition-colors">{printerStats.habis}</p>
            </div>
          </div>
          <div 
            onClick={() => {
              if (setPrinterFilter) setPrinterFilter("Inventaris");
              setView("perangkat_printer");
            }} 
            className="bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 dark:from-[#13222e] dark:via-[#0f1712] dark:to-[#0f1712] p-5 rounded-2xl shadow-sm border border-blue-200/80 dark:border-blue-900/60 flex items-center gap-4 cursor-pointer hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-md shadow-blue-500/30 group-hover:scale-110 transition-transform"><Package className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">Inventaris Gudang</p>
              <p className="text-2xl font-black text-gray-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">{printerStats.inventaris}</p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1 bg-white dark:bg-[#0f1712] rounded-2xl shadow-sm border border-gray-200 dark:border-[#2b4533] p-4 flex flex-col">
          <h4 className="text-xs font-bold text-gray-500 mb-2 border-b border-gray-100 pb-2">Rincian Model / Hardware</h4>
          <div className="overflow-y-auto custom-scrollbar flex-1 max-h-[88px] pr-1">
            {Object.keys(groupedPrinters).length === 0 ? (
              <p className="text-xs text-gray-400 italic">Belum ada data Printer.</p>
            ) : (
              <ul className="space-y-1.5">
                {Object.entries(groupedPrinters).sort((a,b) => b[1] - a[1]).map(([nama, jumlah]) => (
                  <li key={nama} className="flex justify-between items-center text-xs">
                    <span className="text-gray-700 truncate pr-2 font-medium" title={nama}>{nama}</span>
                    <span className="font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100 shrink-0">{jumlah}</span>
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