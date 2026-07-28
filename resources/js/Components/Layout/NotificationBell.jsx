// resources/js/Components/Layout/NotificationBell.jsx
"use client";

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
  buildingLands = [],
  buildingSewas = [],
  setView,
  isMobile = false,
}) {
  // Compute Alerts Count
  // 1. Sewa Printer
  const printerCount = printers
    .filter((p) => p.tanggalSelesai && p.status === "Sewa Berjalan")
    .map((p) => hitungSisaBulan(p.tanggalSelesai))
    .filter((m) => m !== null && m <= 3).length;

  // 2. Sewa Komputer
  const computerCount = computers
    .filter((c) => c.tanggalSelesai && c.status === "Sewa Berjalan")
    .map((c) => hitungSisaBulan(c.tanggalSelesai))
    .filter((m) => m !== null && m <= 3).length;

  // 3. Masa Berlaku SHGB Tanah
  const landCount = buildingLands
    .filter((item) => item.tgl_berakhir_shgb && item.status !== "Done")
    .map((item) => hitungSisaHari(item.tgl_berakhir_shgb))
    .filter((d) => d !== null && d <= 30).length;

  // 4. Masa Kontrak Sewa Bangunan
  const sewaCount = buildingSewas
    .filter((item) => (item.tgl_kontrak_berakhir || item.tanggal_kontrak_berakhir) && item.status !== "Done" && item.status !== "Selesai")
    .map((item) => {
      const tglAkhir = item.tgl_kontrak_berakhir || item.tanggal_kontrak_berakhir;
      return hitungSisaHari(tglAkhir);
    })
    .filter((d) => d !== null && d <= 30).length;

  const totalCount = printerCount + computerCount + landCount + sewaCount;

  return (
    <div className="relative">
      <button
        onClick={() => setView("notifikasi")}
        className="relative p-2 text-gray-500 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all border border-transparent hover:border-slate-100 flex items-center justify-center cursor-pointer"
        title="Notifikasi Peringatan"
      >
        <Bell className={isMobile ? "w-6 h-6" : "w-5 h-5"} />
        {totalCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {totalCount}
          </span>
        )}
      </button>
    </div>
  );
}
