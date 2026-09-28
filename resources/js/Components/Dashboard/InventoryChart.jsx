import { useState } from "react";
import { ArrowUpRight, BarChart3, Package } from "lucide-react";

export default function InventoryChart({ inventory = [], setView }) {
  const [displayCount, setDisplayCount] = useState(10);
  const sortedItems = [...inventory].sort((first, second) => {
    const firstStock = Number(first.kuantitas ?? first.stok ?? 0);
    const secondStock = Number(second.kuantitas ?? second.stok ?? 0);
    return secondStock - firstStock;
  });
  const displayedItems = sortedItems.slice(0, displayCount);
  const maxStock = Math.max(1, ...displayedItems.map((item) => Number(item.kuantitas ?? item.stok ?? 0)));

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
            <BarChart3 className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">Ketersediaan Stok Barang</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Peringkat barang berdasarkan jumlah stok.</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <div className="flex items-center rounded-lg bg-slate-200/70 p-0.5 text-xs dark:bg-slate-800" aria-label="Jumlah barang ditampilkan">
            {[10, 15].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setDisplayCount(count)}
                aria-pressed={displayCount === count}
                className={`rounded-md px-2.5 py-1.5 font-semibold transition ${displayCount === count ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-emerald-300" : "text-slate-600 dark:text-slate-400"}`}
              >
                Top {count}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setView?.("master_barang")} className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300">
            Semua barang <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <div className="flex-1 p-4 sm:p-5">
        {displayedItems.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center text-slate-400">
            <Package className="mb-2 h-9 w-9 opacity-50" />
            <p className="text-sm">Belum ada data stok.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {displayedItems.map((item, index) => {
              const stock = Number(item.kuantitas ?? item.stok ?? 0);
              const percentage = Math.max(3, Math.round((stock / maxStock) * 100));

              return (
                <div key={item.id ?? `${item.nama}-${index}`} className="group space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${index === 0 ? "bg-amber-300 text-amber-950" : index === 1 ? "bg-slate-300 text-slate-800" : index === 2 ? "bg-amber-700 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                        {index + 1}
                      </span>
                      <span className="truncate font-semibold text-slate-800 transition-colors group-hover:text-emerald-700 dark:text-slate-200 dark:group-hover:text-emerald-400" title={item.nama || item.namaBarang}>
                        {item.nama || item.namaBarang || "Barang"}
                      </span>
                    </div>
                    <span className="shrink-0 font-bold text-slate-800 dark:text-slate-100">
                      {stock.toLocaleString("id-ID")} <span className="font-medium text-slate-400">{item.satuan || "Unit"}</span>
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className={`h-full rounded-full transition-all duration-500 ${index < 3 ? "bg-gradient-to-r from-emerald-700 to-emerald-400" : "bg-gradient-to-r from-teal-600 to-emerald-400"}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}