import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { CalendarX, Clock, X } from "lucide-react";

export default function WeekendWarningModal({
  isOpen,
  onClose,
  title = "Hari Tidak Diperbolehkan",
  message = "Hari Sabtu & Minggu tidak dapat digunakan untuk pembuatan surat. Harap pilih tanggal pada hari kerja (Senin s.d. Jumat).",
  letterType = null,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#16251c] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden text-center border border-gray-100 dark:border-[#263e2e] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Tutup X di pojok kanan atas */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#203728] transition-colors cursor-pointer"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7">
          {/* Alert Icon Badge */}
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/70 border-2 border-red-200 dark:border-red-800 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400 shadow-lg shadow-red-600/10">
            <CalendarX className="w-8 h-8" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 tracking-tight">
            {title}
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed font-medium mb-4">
            {message}
          </p>

          {/* Badge Info Jam Kerja */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-bold text-[#0d5c3a] dark:text-emerald-300">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Waktu Layanan: Senin – Jumat (Hari Kerja)</span>
          </div>
        </div>

        {/* Footer Action Button */}
        <div className="p-4 bg-gray-50 dark:bg-[#121f17] border-t border-gray-100 dark:border-[#243b2c]">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-[#0d5c3a] hover:bg-[#0a4228] active:scale-[0.98] text-white rounded-xl text-xs font-black transition-all shadow-md shadow-[#0d5c3a]/20 cursor-pointer uppercase tracking-wider"
          >
            OK, Mengerti
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
