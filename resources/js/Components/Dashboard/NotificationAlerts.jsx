"use client";
import { Printer, Monitor, Clock } from "lucide-react";

export default function NotificationAlerts({ notifSewa = [], notifSewaKomputer = [], setView }) {
  return (
    <>
      {notifSewa && notifSewa.length > 0 && (
        <div className="bg-red-50/80 rounded-xl shadow-sm border border-red-100 overflow-hidden mb-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="px-5 py-3 border-b border-red-100/50 flex justify-between items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="bg-red-100 p-1.5 rounded-full animate-pulse"><Printer className="w-4 h-4 text-red-600" /></div>
              <div>
                <h3 className="font-bold text-sm text-red-800">Perhatian: Masa Sewa Printer Segera Habis!</h3>
                <p className="text-xs text-red-600 font-medium">Terdapat {notifSewa.length} perangkat printer yang memerlukan perpanjangan kontrak.</p>
              </div>
            </div>
            <button onClick={() => setView("perangkat_printer")} className="hidden sm:block text-xs font-bold text-red-600 hover:text-red-800 transition-colors bg-white/60 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-white">
              Kelola &rarr;
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="text-red-700 bg-red-100/30 font-medium">
                <tr>
                  <th className="px-5 py-2.5">Outlet</th><th className="px-5 py-2.5">Hardware</th><th className="px-5 py-2.5">Serial Number</th><th className="px-5 py-2.5 text-right">Sisa Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100/50">
                {notifSewa.slice(0, 3).map((item) => ( 
                  <tr key={item.id} className="hover:bg-red-50/50 transition-colors">
                    <td className="px-5 py-2.5 font-semibold text-red-900">{item.outlet}</td>
                    <td className="px-5 py-2.5 text-red-800">{item.produk}</td>
                    <td className="px-5 py-2.5 text-red-800 font-mono">{item.sn}</td>
                    <td className="px-5 py-2.5 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded font-bold text-[10px]">
                        <Clock className="w-3 h-3" />{item.sisaBulan === 0 ? "< 1 bln" : `${item.sisaBulan} bln`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {notifSewa.length > 3 && (
            <div className="text-center py-2 bg-red-50 text-xs text-red-600 font-medium border-t border-red-100/50 cursor-pointer hover:bg-red-100 transition-colors" onClick={() => setView("perangkat_printer")}>
              Lihat {notifSewa.length - 3} perangkat printer lainnya...
            </div>
          )}
        </div>
      )}

      {notifSewaKomputer && notifSewaKomputer.length > 0 && (
        <div className="bg-indigo-50/80 rounded-xl shadow-sm border border-indigo-100 overflow-hidden mb-6 animate-in slide-in-from-bottom-4 duration-700">
          <div className="px-5 py-3 border-b border-indigo-100/50 flex justify-between items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="bg-indigo-100 p-1.5 rounded-full animate-pulse"><Monitor className="w-4 h-4 text-indigo-600" /></div>
              <div>
                <h3 className="font-bold text-sm text-indigo-800">Perhatian: Masa Sewa Komputer Segera Habis!</h3>
                <p className="text-xs text-indigo-600 font-medium">Terdapat {notifSewaKomputer.length} PC/Laptop yang memerlukan perpanjangan kontrak.</p>
              </div>
            </div>
            <button onClick={() => setView("perangkat_komputer")} className="hidden sm:block text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-white/60 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-white">
              Kelola &rarr;
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="text-indigo-700 bg-indigo-100/30 font-medium">
                <tr>
                  <th className="px-5 py-2.5">Outlet</th><th className="px-5 py-2.5">Hardware</th><th className="px-5 py-2.5">IP / Serial Number</th><th className="px-5 py-2.5 text-right">Sisa Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100/50">
                {notifSewaKomputer.slice(0, 3).map((item) => ( 
                  <tr key={item.id} className="hover:bg-indigo-50/50 transition-colors">
                    <td className="px-5 py-2.5 font-semibold text-indigo-900">{item.outlet}</td>
                    <td className="px-5 py-2.5 text-indigo-800">{item.produk}</td>
                    <td className="px-5 py-2.5 text-indigo-800 font-mono">{item.ipAddress || item.sn}</td>
                    <td className="px-5 py-2.5 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded font-bold text-[10px]">
                        <Clock className="w-3 h-3" />{item.sisaBulan === 0 ? "< 1 bln" : `${item.sisaBulan} bln`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {notifSewaKomputer.length > 3 && (
            <div className="text-center py-2 bg-indigo-50 text-xs text-indigo-600 font-medium border-t border-indigo-100/50 cursor-pointer hover:bg-indigo-100 transition-colors" onClick={() => setView("perangkat_komputer")}>
              Lihat {notifSewaKomputer.length - 3} perangkat komputer lainnya...
            </div>
          )}
        </div>
      )}
    </>
  );
}