"use client";
import { History, Plus, ArrowLeft, Activity, Layers } from "lucide-react";

export default function TransactionActivity({ transactions = [], setView }) {
  const stats = { masuk: 0, keluar: 0, total: transactions.length };
  transactions.forEach((trx) => {
    const jenis = String(trx.jenisTransaksi).trim().toLowerCase();
    if (jenis === "barang masuk") stats.masuk++;
    else if (jenis === "barang keluar") stats.keluar++;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg"><Activity className="w-4 h-4 text-blue-600" /></div>
            <h3 className="font-bold text-sm text-gray-800">Aktivitas Transaksi Terbaru</h3>
          </div>
          {transactions.length > 0 && (
            <button
              onClick={() => {
                localStorage.setItem("riwayat_active_tab", "serah_terima");
                setView("riwayat");
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-[#48a359] dark:hover:text-[#3e8c4c] transition-colors cursor-pointer"
            >
              Lihat Semua &rarr;
            </button>
          )}
        </div>
        <div className="p-0 flex-1 overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-450 text-sm">Belum ada aktivitas.</div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-[#2b4533] flex flex-col">
              {transactions.slice(0, 4).map((trx) => (
                <div key={trx.id} className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-[#273f2f] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm text-gray-800 dark:text-slate-100 leading-none mb-1.5">{trx.nomorSurat}</p>
                    <div className="text-xs text-gray-500 dark:text-slate-405 flex items-center gap-1.5">
                      <span className="bg-gray-100 dark:bg-[#0f1712] px-1.5 py-0.5 rounded text-gray-650 dark:text-slate-300">{trx.tanggal}</span>
                      <span className="truncate max-w-[200px] sm:max-w-[300px] text-gray-500 dark:text-slate-400">{trx.pengirimNama} ➔ {trx.penerimaNama}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide border ${trx.jenisTransaksi === "Barang Masuk" ? "bg-green-50 text-green-700 border-green-100 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900" : "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900"}`}>
                      {trx.jenisTransaksi === "Barang Masuk" ? "MASUK" : "KELUAR"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-indigo-100 dark:bg-indigo-950/40 p-2 rounded-lg"><History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /></div>
          <h3 className="font-bold text-sm text-gray-800">Total Transaksi (All Time)</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#0f1712] rounded-lg border border-gray-100 dark:border-[#2b4533]">
            <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-gray-550 dark:text-slate-400" /> <span className="text-sm font-medium text-gray-600 dark:text-slate-300">Keseluruhan</span></div>
            <span className="text-lg font-bold text-gray-800">{stats.total}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-100/50 dark:border-green-900/50">
            <div className="flex items-center gap-2"><Plus className="w-4 h-4 text-green-600 dark:text-green-400" /> <span className="text-sm font-medium text-green-705 dark:text-green-400">Barang Masuk</span></div>
            <span className="text-lg font-bold text-green-700 dark:text-green-400">{stats.masuk}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-orange-50/50 dark:bg-orange-950/20 rounded-lg border border-orange-100/50 dark:border-orange-900/50">
            <div className="flex items-center gap-2"><ArrowLeft className="w-4 h-4 text-orange-600 dark:text-orange-400 transform rotate-180" /> <span className="text-sm font-medium text-orange-705 dark:text-orange-400">Barang Keluar</span></div>
            <span className="text-lg font-bold text-orange-700 dark:text-orange-400">{stats.keluar}</span>
          </div>
        </div>
      </div>
    </div>
  );
}