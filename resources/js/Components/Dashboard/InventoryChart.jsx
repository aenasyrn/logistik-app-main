import { BarChart3, Package } from "lucide-react";

export default function InventoryChart({ inventory = [] }) {
  const chartData = [...inventory].sort((a, b) => {
    const bStok = b.kuantitas !== undefined ? b.kuantitas : (b.stok || 0);
    const aStok = a.kuantitas !== undefined ? a.kuantitas : (a.stok || 0);
    return Number(bStok) - Number(aStok);
  });
  const maxStok = chartData.length > 0 ? Math.max(...chartData.map((i) => {
    const s = i.kuantitas !== undefined ? i.kuantitas : (i.stok || 0);
    return Number(s);
  })) : 1;

  return (
    <div className="bg-white dark:bg-[#1a2b20] rounded-xl shadow-xs border border-gray-300 dark:border-[#2b4533] flex flex-col">
      <div className="px-5 py-4 border-b border-gray-300 dark:border-[#2b4533] bg-gray-50/50 dark:bg-[#132219] flex items-center gap-3 shrink-0">
        <div className="bg-purple-100 p-2 rounded-lg">
          <BarChart3 className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-gray-800 dark:text-slate-100">Visualisasi Stok Master Barang (Top Item)</h3>
        </div>
      </div>
      
      <div className="p-5 flex flex-col justify-end">
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-gray-400">
            <Package className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">Belum ada data stok.</p>
          </div>
        ) : (
          <div className="h-56 relative pt-8 pb-2">
            {/* Bars container */}
            <div className="w-full h-[176px] overflow-x-auto custom-scrollbar relative -mt-8 pt-8 px-1">
              <div className="flex items-end gap-3 h-full pb-1 relative">
                {chartData.slice(0, 15).map((item) => { 
                  const stokValue = Number(item.kuantitas !== undefined ? item.kuantitas : (item.stok || 0));
                  const heightPct = maxStok > 0 ? (stokValue / maxStok) * 100 : 0;
                  return (
                    <div key={item.id} className="flex flex-col items-center shrink-0 w-20 group h-full z-10">
                      <div className="w-full h-[136px] flex flex-col justify-end relative">
                        <div 
                          className="w-full bg-gradient-to-t from-purple-500 to-purple-400 hover:from-purple-400 hover:to-purple-300 rounded-t-md transition-all relative flex flex-col justify-end shadow-sm cursor-pointer"
                          style={{ height: `${heightPct}%`, minHeight: '4px' }}
                          title={`${item.nama} \nStok: ${stokValue} ${item.satuan || ''}`}
                        >
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] font-extrabold text-gray-750 dark:text-gray-200 bg-white dark:bg-[#1a2b20] border border-gray-150 dark:border-[#2b4533] px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-15 whitespace-nowrap pointer-events-none">
                            {stokValue}
                          </span>
                        </div>
                      </div>
                      <div className="h-8 mt-2 w-full flex justify-center items-start">
                        <span className="text-[10px] text-gray-500 dark:text-[#ffffff] text-center line-clamp-2 leading-tight px-1 font-semibold" title={item.nama}>
                          {item.nama}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}