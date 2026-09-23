// resources/js/Components/Layout/NotificationBell.jsx
import React from "react";
import { Bell } from "lucide-react";

// Helper to calculate months left for rental contracts
const hitungSisaBulan = (tanggalSelesai) => {
  if (!tanggalSelesai) return null;
  const hariIni = new Date();
  const tglSelesai = new Date(tanggalSelesai);
  if (isNaN(tglSelesai)) return null;
  return (
    (tglSelesai.getFullYear() - hariIni.getFullYear()) * 12 +
    (tglSelesai.getMonth() - hariIni.getMonth())
  );
};

// Helper to calculate days left
const hitungSisaHari = (tanggalSelesai) => {
  if (!tanggalSelesai) return null;
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);
  const tglSelesai = new Date(tanggalSelesai);
  tglSelesai.setHours(0, 0, 0, 0);

  const diffTime = tglSelesai.getTime() - hariIni.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function NotificationBell({
  printers = [],
  computers = [],
  laptops = [],
  notifSewa = null,
  notifSewaKomputer = null,
  notifSewaLaptop = null,
  buildingLands = [],
  buildingSewas = [],
  setView,
  activeTab = "",
  isMobile = false,
}) {
  const isActive = activeTab === "notifikasi";

  // Compute Alerts Count
  // 1. Sewa Printer
  const printerCount = notifSewa
    ? notifSewa.length
    : printers
        .filter((p) => p.tanggalSelesai && p.status !== "Inventaris")
        .map((p) => hitungSisaBulan(p.tanggalSelesai))
        .filter((m) => m !== null && m <= 3).length;

  // 2. Sewa Komputer
  const computerCount = notifSewaKomputer
    ? notifSewaKomputer.length
    : computers
        .filter((c) => c.tanggalSelesai && c.status !== "Inventaris")
        .map((c) => hitungSisaBulan(c.tanggalSelesai))
        .filter((m) => m !== null && m <= 3).length;

  // 3. Sewa Laptop
  const laptopCount = notifSewaLaptop
    ? notifSewaLaptop.length
    : laptops
        .filter((l) => l.tanggalSelesai && l.status !== "Inventaris")
        .map((l) => hitungSisaBulan(l.tanggalSelesai))
        .filter((m) => m !== null && m <= 3).length;

  // 4. Masa Berlaku SHGB Tanah
  const landCount = buildingLands
    .filter((item) => item.tgl_berakhir_shgb && item.status !== "Done")
    .map((item) => hitungSisaHari(item.tgl_berakhir_shgb))
    .filter((d) => d !== null && d <= 30).length;

  // 5. Masa Kontrak Sewa Bangunan
  const sewaCount = buildingSewas
    .filter((item) => (item.tgl_kontrak_berakhir || item.tanggal_kontrak_berakhir) && item.status !== "Done")
    .map((item) => {
      const tglAkhir = item.tgl_kontrak_berakhir || item.tanggal_kontrak_berakhir;
      return hitungSisaHari(tglAkhir);
    })
    .filter((d) => d !== null && d <= 30).length;

  const totalCount = printerCount + computerCount + laptopCount + landCount + sewaCount;

  return (
    <div className="relative">
      <button
        onClick={() => setView("notifikasi")}
        className={`relative p-2 rounded-xl transition-all border flex items-center justify-center cursor-pointer ${
          isActive
            ? "bg-emerald-100/80 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700/60 ring-2 ring-emerald-500/40 shadow-sm"
            : "text-gray-500 hover:bg-slate-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-[#1e3125] dark:hover:text-white border-slate-200/0 hover:border-slate-100 dark:hover:border-[#2b4533]"
        }`}
        title={isActive ? "Notifikasi (Sedang Diakses)" : "Notifikasi Peringatan"}
      >
        <Bell className={isMobile ? "w-6 h-6" : "w-5 h-5"} />
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white shadow-sm animate-pulse leading-none">
            {totalCount}
          </span>
        )}
        {isActive && (
          <span className="absolute -bottom-1 -left-1 flex h-3 w-3 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        )}
      </button>
    </div>
  );
}
