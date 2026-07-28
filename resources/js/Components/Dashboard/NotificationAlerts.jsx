"use client";
import { Printer, Monitor, Clock } from "lucide-react";

export default function NotificationAlerts({ notifSewa = [], notifSewaKomputer = [], setView, setPrinterFilter, setComputerFilter }) {
  return (
    <>
      {notifSewa && notifSewa.length > 0 && (
        <div className="bg-red-50/80 alert-card rounded-xl shadow-sm border border-red-100 overflow-hidden mb-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="px-5 py-3 border-b border-red-100/50 alert-card-header flex justify-between items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="bg-red-100 dark:bg-red-950/40 p-1.5 rounded-full animate-pulse">
                <Printer className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-red-800 dark:text-red-400">Perhatian: Masa Sewa Printer Segera Habis!</h3>
                <p className="text-xs text-red-600 dark:text-red-300/80 font-medium">Terdapat {notifSewa.length} perangkat printer yang memerlukan perpanjangan kontrak.</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (setPrinterFilter) setPrinterFilter("warning");
                setView("perangkat_printer");
              }}
              className="hidden sm:block text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors bg-white/60 dark:bg-[#2d0f0f]/50 px-3 py-1.5 rounded-lg border border-red-100 dark:border-[#380d0d] hover:bg-white dark:hover:bg-[#2d0f0f]"
            >
              Kelola &rarr;
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap alert-table">
              <thead className="text-red-700 dark:text-red-400 bg-red-100/30 dark:bg-[#2b0b0b] font-medium">
                <tr className="dark:border-b dark:border-[#380d0d]">
                  <th className="px-5 py-2.5">Outlet</th>
                  <th className="px-5 py-2.5">Hardware</th>
                  <th className="px-5 py-2.5">Serial Number</th>
                  <th className="px-5 py-2.5 text-right">Sisa Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100/50 dark:divide-[#380d0d]">
                {notifSewa.slice(0, 3).map((item) => (
                  <tr key={item.id} className="hover:bg-red-50/50 dark:hover:bg-[#2b0b0b] transition-colors">
                    <td className="px-5 py-2.5 font-semibold text-red-900 dark:text-red-200">{item.outlet}</td>
                    <td className="px-5 py-2.5 text-red-800 dark:text-red-300">{item.produk}</td>
                    <td className="px-5 py-2.5 text-red-800 dark:text-red-300 font-mono">{item.sn}</td>
                    <td className="px-5 py-2.5 text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] ${
                        item.sisaHari < 0
                          ? "bg-red-200 text-red-800 dark:bg-red-950/60 dark:text-red-400 border border-red-300"
                          : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200"
                      }`}>
                        <Clock className="w-3 h-3" />
                        {item.sisaHari < 0 ? "Sewa Habis" : `${item.sisaHari} hari`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {notifSewa.length > 3 && (
            <div
              className="text-center py-2 bg-red-50 alert-card-footer text-xs text-red-600 dark:text-red-400 font-medium border-t border-red-100/50 dark:border-[#380d0d] cursor-pointer hover:bg-red-100 dark:hover:bg-[#260a0a] transition-colors"
              onClick={() => {
                if (setPrinterFilter) setPrinterFilter("warning");
                setView("perangkat_printer");
              }}
            >
              Lihat {notifSewa.length - 3} perangkat printer lainnya...
            </div>
          )}
        </div>
      )}

      {notifSewaKomputer && notifSewaKomputer.length > 0 && (
        <div className="bg-red-50/80 alert-card rounded-xl shadow-sm border border-red-100 overflow-hidden mb-6 animate-in slide-in-from-bottom-4 duration-700">
          <div className="px-5 py-3 border-b border-red-100/50 alert-card-header flex justify-between items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="bg-red-100 dark:bg-red-950/40 p-1.5 rounded-full animate-pulse">
                <Monitor className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-red-800 dark:text-red-400">Perhatian: Masa Sewa Komputer Segera Habis!</h3>
                <p className="text-xs text-red-600 dark:text-red-300/80 font-medium">Terdapat {notifSewaKomputer.length} PC/Laptop yang memerlukan perpanjangan kontrak.</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (setComputerFilter) setComputerFilter("warning");
                setView("perangkat_komputer");
              }}
              className="hidden sm:block text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors bg-white/60 dark:bg-[#2d0f0f]/50 px-3 py-1.5 rounded-lg border border-red-100 dark:border-[#380d0d] hover:bg-white dark:hover:bg-[#2d0f0f]"
            >
              Kelola &rarr;
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap alert-table">
              <thead className="text-red-700 dark:text-red-400 bg-red-100/30 dark:bg-[#2b0b0b] font-medium">
                <tr className="dark:border-b dark:border-[#380d0d]">
                  <th className="px-5 py-2.5">Outlet</th>
                  <th className="px-5 py-2.5">Hardware</th>
                  <th className="px-5 py-2.5">IP / Serial Number</th>
                  <th className="px-5 py-2.5 text-right">Sisa Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100/50 dark:divide-[#380d0d]">
                {notifSewaKomputer.slice(0, 3).map((item) => (
                  <tr key={item.id} className="hover:bg-red-50/50 dark:hover:bg-[#2b0b0b] transition-colors">
                    <td className="px-5 py-2.5 font-semibold text-red-900 dark:text-red-200">{item.outlet}</td>
                    <td className="px-5 py-2.5 text-red-800 dark:text-red-300">{item.produk}</td>
                    <td className="px-5 py-2.5 text-red-800 dark:text-red-300 font-mono">{item.ipAddress || item.sn}</td>
                    <td className="px-5 py-2.5 text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] ${
                        item.sisaHari < 0
                          ? "bg-red-200 text-red-800 dark:bg-red-950/60 dark:text-red-400 border border-red-300"
                          : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200"
                      }`}>
                        <Clock className="w-3 h-3" />
                        {item.sisaHari < 0 ? "Sewa Habis" : `${item.sisaHari} hari`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {notifSewaKomputer.length > 3 && (
            <div
              className="text-center py-2 bg-red-50 alert-card-footer text-xs text-red-600 dark:text-red-400 font-medium border-t border-red-100/50 dark:border-[#380d0d] cursor-pointer hover:bg-red-100 dark:hover:bg-[#260a0a] transition-colors"
              onClick={() => {
                if (setComputerFilter) setComputerFilter("warning");
                setView("perangkat_komputer");
              }}
            >
              Lihat {notifSewaKomputer.length - 3} perangkat komputer lainnya...
            </div>
          )}
        </div>
      )}
    </>
  );
}