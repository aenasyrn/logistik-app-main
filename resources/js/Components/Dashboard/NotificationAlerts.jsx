import { useState } from "react";
import { AlertTriangle, ArrowRight, Clock3, Laptop, Monitor, Printer } from "lucide-react";

export default function NotificationAlerts({
  notifSewa = [],
  notifSewaKomputer = [],
  notifSewaLaptop = [],
  setView,
  setPrinterFilter,
  setComputerFilter,
  setLaptopFilter,
  setPrinterSearch,
  setComputerSearch,
  setLaptopSearch,
  setNotificationCategoryFilter,
}) {
  const deviceTabs = [
    { id: "printer", label: "Printer", icon: Printer, items: notifSewa, view: "perangkat_printer" },
    { id: "komputer", label: "PC", icon: Monitor, items: notifSewaKomputer, view: "perangkat_komputer" },
    { id: "laptop", label: "Laptop", icon: Laptop, items: notifSewaLaptop, view: "perangkat_laptop" },
  ];
  const totalAlerts = deviceTabs.reduce((total, tab) => total + tab.items.length, 0);
  const [activeTab, setActiveTab] = useState(() => {
    return deviceTabs.find((tab) => tab.items.length > 0)?.id || "printer";
  });
  const activeDeviceTab = deviceTabs.find((tab) => tab.id === activeTab) || deviceTabs[0];
  const visibleItems = activeDeviceTab.items.slice(0, 4);

  const openCategory = (category) => {
    setNotificationCategoryFilter?.(category);
    setView?.("notifikasi");
  };

  const manageDevice = (item) => {
    if (activeTab === "printer") {
      setPrinterSearch?.(item.sn || item.outlet || item.produk || "");
      setPrinterFilter?.("Semua");
    } else if (activeTab === "komputer") {
      setComputerSearch?.(item.ipAddress || item.sn || item.outlet || item.produk || "");
      setComputerFilter?.("Semua");
    } else {
      setLaptopSearch?.(item.sn || item.hostname || item.namaPengguna || item.nama_pengguna || item.produk || "");
      setLaptopFilter?.("Semua");
    }
    setView?.(activeDeviceTab.view);
  };

  if (totalAlerts === 0) return null;

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/60 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/30 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-300 bg-amber-100/70 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Monitoring Masa Sewa Perangkat TI</h2>
              <span className="rounded-full border border-rose-200 bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
                {totalAlerts.toLocaleString("id-ID")} Perlu Tindakan
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Perangkat TI yang masa sewanya telah habis atau mendekati jatuh tempo kontrak.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800" role="tablist" aria-label="Jenis perangkat">
            {deviceTabs.map(({ id, label, icon: Icon, items }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                onClick={() => setActiveTab(id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-bold transition sm:px-3 ${activeTab === id ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-emerald-300" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label} ({items.length})
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => openCategory(activeTab)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            Kelola <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-xs">
          <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-950/20 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3.5 sm:px-5">Nama Unit / Outlet</th>
              <th className="px-4 py-3.5 sm:px-5">Tipe Hardware</th>
              <th className="px-4 py-3.5 sm:px-5">Nomor Seri / IP</th>
              <th className="px-4 py-3.5 text-right sm:px-5">Status Masa Sewa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {visibleItems.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-5 py-8 text-center text-slate-500 dark:text-slate-400">Tidak ada perangkat pada kategori ini yang perlu tindakan.</td>
              </tr>
            ) : visibleItems.map((item) => {
              const unitName = activeTab === "laptop"
                ? (item.namaPengguna || item.nama_pengguna || item.outlet || "-")
                : (item.outlet || "-");
              const unitDetail = activeTab === "laptop" ? (item.departemen || item.jabatan || "") : "";
              const identifier = activeTab === "komputer"
                ? (item.ipAddress || item.sn || "-")
                : activeTab === "laptop"
                  ? (item.hostname || item.sn || "-")
                  : (item.sn || "-");
              const expired = item.sisaHari < 0;

              return (
                <tr key={`${activeTab}-${item.id}`} className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100 sm:px-5">
                    <div className="max-w-[260px] truncate" title={unitName}>{unitName}</div>
                    {unitDetail && <div className="mt-0.5 max-w-[260px] truncate text-[10px] font-medium text-slate-500 dark:text-slate-400">{unitDetail}</div>}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-slate-700 dark:text-slate-300 sm:px-5">{item.produk || (activeTab === "printer" ? "Printer" : activeTab === "komputer" ? "Komputer" : "Laptop")}</td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">{identifier}</td>
                  <td className="px-4 py-3.5 text-right sm:px-5">
                    <span className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${expired ? "border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300" : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"}`}>
                      <Clock3 className="h-3 w-3" />
                      {expired ? "Sewa Habis" : `${item.sisaHari} hari lagi`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-col gap-2 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <span>
          Menampilkan {visibleItems.length} dari {activeDeviceTab.items.length} perangkat {activeDeviceTab.label.toLowerCase()} yang perlu perpanjangan sewa.
        </span>
        <button type="button" onClick={() => openCategory("all")} className="inline-flex items-center gap-1 self-start font-bold text-emerald-700 transition hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 sm:self-auto">
          Lihat dan perpanjang semua perangkat <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </footer>
    </section>
  );
}