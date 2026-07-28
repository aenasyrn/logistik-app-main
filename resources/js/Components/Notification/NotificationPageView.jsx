// resources/js/Components/Notification/NotificationPageView.jsx
"use client";

import React, { useState } from "react";
import { Printer, Monitor, Map, Key, Clock, Check, Bell, ArrowRight, AlertTriangle, Loader2, CheckCircle } from "lucide-react";
import { router } from "@inertiajs/react";
import axios from "axios";

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

// Helper to format date dd/mm/yyyy
const formatDate = (dateStr) => {
  if (!dateStr || String(dateStr).trim() === "" || String(dateStr).trim() === "-") return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function NotificationPageView({
  printers = [],
  computers = [],
  buildingLands = [],
  buildingSewas = [],
  setView,
  setLandFilter,
  setSewaFilter,
  setPrinterFilter,
  setComputerFilter,
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [confirmItem, setConfirmItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Compute Alerts
  // 1. Sewa Printer
  const alertPrinters = printers
    .filter((p) => p.tanggalSelesai && p.status === "Sewa Berjalan")
    .map((p) => {
      const sisaBulan = hitungSisaBulan(p.tanggalSelesai);
      const sisaHari = hitungSisaHari(p.tanggalSelesai);
      return {
        id: `printer-${p.id}`,
        dbId: p.id,
        type: "printer",
        categoryName: "Sewa Printer",
        title: p.produk || "Printer",
        desc: `Sewa printer untuk instansi/outlet ${p.outlet || "Outlet"} (S/N: ${p.sn || "-"}) segera berakhir.`,
        date: p.tanggalSelesai,
        sisaBulan,
        sisaHari,
        targetView: "perangkat_printer",
        extraInfo: p.penyedia ? `Penyedia: ${p.penyedia}` : "",
      };
    })
    .filter((p) => p.sisaBulan !== null && p.sisaBulan <= 3);

  // 2. Sewa Komputer
  const alertComputers = computers
    .filter((c) => c.tanggalSelesai && c.status === "Sewa Berjalan")
    .map((c) => {
      const sisaBulan = hitungSisaBulan(c.tanggalSelesai);
      const sisaHari = hitungSisaHari(c.tanggalSelesai);
      return {
        id: `computer-${c.id}`,
        dbId: c.id,
        type: "komputer",
        categoryName: "Sewa Komputer",
        title: c.produk || "Komputer",
        desc: `Sewa komputer untuk instansi/outlet ${c.outlet || "Outlet"} (S/N: ${c.sn || "-"}) segera berakhir.`,
        date: c.tanggalSelesai,
        sisaBulan,
        sisaHari,
        targetView: "perangkat_komputer",
        extraInfo: c.ipAddress ? `IP: ${c.ipAddress}` : "",
      };
    })
    .filter((c) => c.sisaBulan !== null && c.sisaBulan <= 3);

  // 3. Masa Berlaku SHGB Tanah
  const alertLands = buildingLands
    .filter((item) => item.tgl_berakhir_shgb && item.status !== "Done")
    .map((item) => {
      const sisaHari = hitungSisaHari(item.tgl_berakhir_shgb);
      return {
        id: `land-${item.id}`,
        dbId: item.id,
        type: "tanah",
        categoryName: "SHGB Tanah",
        title: item.unit_kerja || "Aset Tanah",
        desc: `Masa berlaku SHGB (${item.no_shgb || "-"}) untuk peruntukan ${item.peruntukan || "Lainnya"} segera berakhir.`,
        date: item.tgl_berakhir_shgb,
        sisaHari,
        targetView: "bangunan_tanah",
        extraInfo: item.alamat ? `Alamat: ${item.alamat}` : "",
      };
    })
    .filter((item) => item.sisaHari !== null && item.sisaHari <= 30);

  // 4. Masa Kontrak Sewa Bangunan
  const alertSewas = buildingSewas
    .filter((item) => (item.tgl_kontrak_berakhir || item.tanggal_kontrak_berakhir) && item.status !== "Done" && item.status !== "Selesai")
    .map((item) => {
      const tglAkhir = item.tgl_kontrak_berakhir || item.tanggal_kontrak_berakhir;
      const sisaHari = hitungSisaHari(tglAkhir);
      return {
        id: `sewa-${item.id}`,
        dbId: item.id,
        type: "bangunan",
        categoryName: "Sewa Bangunan",
        title: item.nama_outlet || "Sewa Bangunan",
        desc: `Kontrak sewa bangunan tipe ${item.type_bangunan || "Lainnya"} dengan periode sewa ${item.periode_sewa || "-"} segera berakhir.`,
        date: tglAkhir,
        sisaHari,
        targetView: "bangunan_sewa",
        extraInfo: item.alamat ? `Alamat: ${item.alamat}` : "",
      };
    })
    .filter((item) => item.sisaHari !== null && item.sisaHari <= 30);

  // Combine and sort by urgency (lowest sisaHari first, expired first)
  const allAlerts = [...alertPrinters, ...alertComputers, ...alertLands, ...alertSewas].sort(
    (a, b) => {
      const dayA = a.sisaHari !== null ? a.sisaHari : (a.sisaBulan !== null ? a.sisaBulan * 30 : 9999);
      const dayB = b.sisaHari !== null ? b.sisaHari : (b.sisaBulan !== null ? b.sisaBulan * 30 : 9999);
      return dayA - dayB;
    }
  );

  // Filter alerts based on active tab
  const filteredAlerts = allAlerts.filter((alert) => {
    if (activeFilter === "all") return true;
    return alert.type === activeFilter;
  });

  const handleMarkAsDoneClick = (item) => {
    setConfirmItem(item);
  };

  const handleConfirmMarkAsDone = async () => {
    if (!confirmItem) return;
    setIsSaving(true);
    try {
      if (confirmItem.type === "tanah") {
        await axios.put(`/building-lands/${confirmItem.dbId}/status`, { status: "Done" });
        router.reload({ only: ["buildingLands"] });
      } else if (confirmItem.type === "bangunan") {
        await axios.put(`/building-sewas/${confirmItem.dbId}/status`, { status: "Done" });
        router.reload({ only: ["buildingSewas"] });
      }
      
      // Show success toast notification
      setToastMessage(`"${confirmItem.title}" berhasil ditandai selesai!`);
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 4000);
      
      setConfirmItem(null);
    } catch (error) {
      console.error("Gagal memperbarui status:", error);
      alert("Gagal memperbarui status");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKelola = (item) => {
    if (item.type === "printer" && setPrinterFilter) {
      setPrinterFilter("warning");
    } else if (item.type === "komputer" && setComputerFilter) {
      setComputerFilter("warning");
    } else if (item.type === "tanah" && setLandFilter) {
      setLandFilter("expired");
    } else if (item.type === "bangunan" && setSewaFilter) {
      setSewaFilter("expired");
    }
    setView(item.targetView);
  };

  // Icon maps
  const getIcon = (type) => {
    switch (type) {
      case "printer":
        return <Printer className="w-5 h-5 text-green-655 dark:text-emerald-400" />;
      case "komputer":
        return <Monitor className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />;
      case "tanah":
        return <Map className="w-5 h-5 text-rose-650 dark:text-rose-400" />;
      case "bangunan":
        return <Key className="w-5 h-5 text-amber-650 dark:text-amber-400" />;
      default:
        return <Bell className="w-5 h-5 text-blue-650 dark:text-blue-400" />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case "printer":
        return { bg: "bg-green-50 border-green-100 dark:bg-emerald-950/40 dark:border-emerald-900/50", label: "bg-green-100 text-green-800 dark:bg-emerald-950/60 dark:text-emerald-400" };
      case "komputer":
        return { bg: "bg-indigo-50 border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-900/50", label: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400" };
      case "tanah":
        return { bg: "bg-rose-50 border-rose-100 dark:bg-rose-950/40 dark:border-rose-900/50", label: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400" };
      case "bangunan":
        return { bg: "bg-amber-50 border-amber-100 dark:bg-amber-950/40 dark:border-amber-900/50", label: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-450" };
      default:
        return { bg: "bg-blue-50 border-blue-100 dark:bg-blue-950/40 dark:border-blue-900/50", label: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400" };
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300 relative">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-[999] flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-white bg-green-600 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Notifikasi Peringatan</h1>
            {allAlerts.length > 0 && (
              <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full animate-pulse">
                {allAlerts.length} Aktif
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Kontrak sewa dan masa berlaku dokumen penting yang akan berakhir
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-gray-100 custom-scrollbar-horizontal whitespace-nowrap">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === "all"
              ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Semua ({allAlerts.length})
        </button>
        <button
          onClick={() => setActiveFilter("printer")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === "printer"
              ? "bg-green-600 text-white shadow-md shadow-green-600/10"
              : "bg-slate-100 text-slate-600 hover:bg-slate-250"
          }`}
        >
          Sewa Printer ({alertPrinters.length})
        </button>
        <button
          onClick={() => setActiveFilter("komputer")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === "komputer"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "bg-slate-100 text-slate-600 hover:bg-slate-250"
          }`}
        >
          Sewa Komputer ({alertComputers.length})
        </button>
        <button
          onClick={() => setActiveFilter("tanah")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === "tanah"
              ? "bg-rose-600 text-white shadow-md shadow-rose-600/10"
              : "bg-slate-100 text-slate-600 hover:bg-slate-250"
          }`}
        >
          SHGB Tanah ({alertLands.length})
        </button>
        <button
          onClick={() => setActiveFilter("bangunan")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === "bangunan"
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/10"
              : "bg-slate-100 text-slate-600 hover:bg-slate-250"
          }`}
        >
          Sewa Bangunan ({alertSewas.length})
        </button>
      </div>

      {/* Main List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white border border-slate-150 rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-3xs">
            <div className="bg-slate-50 p-4 rounded-full border border-slate-100 mb-3">
              <Bell className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Tidak ada peringatan aktif</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              Seluruh aset printer, komputer, SHGB tanah, dan sewa bangunan saat ini berada dalam periode aman.
            </p>
          </div>
        ) : (
          filteredAlerts.map((item) => {
            const isExpired = item.sisaHari !== null ? item.sisaHari < 0 : (item.sisaBulan !== null ? item.sisaBulan < 0 : false);
            const isUrgent = item.sisaHari !== null ? item.sisaHari <= 30 : (item.sisaBulan !== null ? item.sisaBulan <= 1 : false);
            const colors = getColors(item.type);

            return (
              <div
                key={item.id}
                className={`bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-3xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all relative border-l-4 ${
                  isExpired
                    ? "border-l-red-500 bg-red-50/5"
                    : isUrgent
                    ? "border-l-orange-500 bg-orange-50/5"
                    : "border-l-slate-300"
                }`}
              >
                {/* Left: Icon & Details */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`p-3 rounded-xl border flex-shrink-0 ${colors.bg}`}>
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${colors.label}`}>
                        {item.categoryName}
                      </span>
                      {isExpired && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wide">
                          Expired
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-base text-slate-900 mt-1.5 leading-snug">
                      {item.title}
                    </h3>
                    
                    <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                    
                    {item.extraInfo && (
                      <p className="text-xs text-slate-400 font-medium mt-1 italic">
                        {item.extraInfo}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className="text-xs text-slate-400 font-semibold">
                        Tanggal Selesai: {formatDate(item.date)}
                      </span>
                      <span className="text-slate-200">|</span>
                      <span className="text-xs text-red-600 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-red-500" />
                        Sisa Waktu:{" "}
                        <span className="font-bold text-red-700">
                          {isExpired ? (
                            "Habis Masa Aktif"
                          ) : item.sisaHari !== null ? (
                            `${item.sisaHari} hari lagi`
                          ) : item.sisaBulan !== null && item.sisaBulan === 0 ? (
                            "kurang dari 1 bulan lagi"
                          ) : (
                            `${item.sisaBulan} bulan lagi`
                          )}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end border-t border-slate-100 md:border-0 pt-3 md:pt-0 shrink-0">
                  {(item.type === "tanah" || item.type === "bangunan") && (
                    <button
                      onClick={() => handleMarkAsDoneClick(item)}
                      className="px-3.5 py-2 border border-green-200 dark:border-emerald-800/80 hover:border-green-600 bg-green-50/50 dark:bg-emerald-950/40 hover:bg-green-600 dark:hover:bg-emerald-600 text-green-600 dark:text-emerald-450 hover:text-white dark:hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-3xs cursor-pointer"
                      title="Tandai Selesai"
                    >
                      <Check className="w-4 h-4" />
                      Tandai Selesai
                    </button>
                  )}
                  <button
                    onClick={() => handleKelola(item)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-blue-600/10 cursor-pointer"
                  >
                    Kelola
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {confirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Tandai Selesai</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin menandai <span className="font-semibold text-slate-800">"{confirmItem.title}"</span> sebagai selesai? Tindakan ini akan menghentikan peringatan.
              </p>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setConfirmItem(null)}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmMarkAsDone}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Ya, Selesai"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
