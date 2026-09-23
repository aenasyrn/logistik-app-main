// resources/js/Components/DataMaster/PerpanjangSewaModal.jsx
import { useState, useEffect } from "react";
import { X, CalendarPlus, Clock, History, AlertCircle, Sparkles, Loader2, FileText, CheckCircle2 } from "lucide-react";
import VendorSelectDropdown from "../Form/VendorSelectDropdown";

export default function PerpanjangSewaModal({
  isOpen,
  item,
  vendors = [],
  isSaving,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState({
    no_spk: "",
    no_pks: "",
    vendor_nama: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    masa_sewa_bulan: 0,
    biaya_sewa: "",
    status: "Sewa Berjalan",
    deskripsi: "",
  });

  useEffect(() => {
    if (item && isOpen) {
      // Hitung rekomendasi tanggal mulai baru (misal: 1 hari setelah tanggal selesai lama)
      let recommendedStart = "";
      if (item.tanggal_selesai) {
        const oldEnd = new Date(item.tanggal_selesai);
        if (!isNaN(oldEnd.getTime())) {
          oldEnd.setDate(oldEnd.getDate() + 1);
          recommendedStart = oldEnd.toISOString().split("T")[0];
        }
      }

      setFormData({
        no_spk: "",
        no_pks: "",
        vendor_nama: item.vendor_nama || "",
        tanggal_mulai: recommendedStart || "",
        tanggal_selesai: "",
        masa_sewa_bulan: 0,
        biaya_sewa: item.biaya_sewa ? Number(item.biaya_sewa).toLocaleString("id-ID") : "",
        status: "Sewa Berjalan",
        deskripsi: `Perpanjangan sewa kontrak ${item.nama}`,
      });
    }
  }, [item, isOpen]);

  // Recalculate duration & auto-status when dates change
  const handleDateChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      const start = updated.tanggal_mulai;
      const end = updated.tanggal_selesai;

      if (start && end) {
        const d1 = new Date(start);
        const d2 = new Date(end);
        let months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        updated.masa_sewa_bulan = months > 0 ? months : 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        updated.status = new Date(end) >= today ? "Sewa Berjalan" : "Sewa Habis";
      } else {
        updated.masa_sewa_bulan = 0;
        updated.status = "Sewa Berjalan";
      }

      return updated;
    });
  };

  const handleCurrencyChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({
      ...prev,
      biaya_sewa: rawValue ? Number(rawValue).toLocaleString("id-ID") : "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.tanggal_mulai || !formData.tanggal_selesai) {
      alert("Tanggal mulai dan tanggal selesai perpanjangan wajib diisi.");
      return;
    }

    const payload = {
      ...formData,
      nama: item.nama,
      jenis_barang: item.jenis_barang || "Komputer",
      kuantitas: item.kuantitas !== undefined ? item.kuantitas : (item.stok || 0),
      satuan: item.satuan || "Pcs",
      biaya_sewa: formData.biaya_sewa ? Number(formData.biaya_sewa.replace(/\./g, "")) : 0,
      mode_edit: "perpanjang",
    };

    onSubmit(payload);
  };

  if (!isOpen || !item) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[110] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1a2b20] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-[#263e2f]">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0d5c3a] via-[#156e49] to-[#279969] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl border border-white/20">
              <CalendarPlus className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight text-white flex items-center gap-2">
                Perpanjang Masa Sewa Barang
              </h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                {item.nama} • <span className="font-semibold">{item.jenis_barang || "Perangkat"}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Tutup modal"
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white/80 hover:text-white disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-5">

            {/* Current Period Summary Card */}
            <div className="bg-slate-50 dark:bg-[#15231a] rounded-2xl p-4 border border-slate-200/80 dark:border-[#263e2f]">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-[#263e2f]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0d5c3a] dark:text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Periode Kontrak Saat Ini (Akan Diarsipkan)
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  item.status === "Sewa Berjalan"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}>
                  {item.status || "Inventaris"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Masa Sewa</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {formatDate(item.tanggal_mulai)} s/d {formatDate(item.tanggal_selesai)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Durasi</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {item.masa_sewa_bulan ? `${item.masa_sewa_bulan} Bulan` : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Vendor Saat Ini</span>
                  <span className="font-semibold text-blue-800 dark:text-emerald-400 truncate block" title={item.vendor_nama}>
                    {item.vendor_nama || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">No. SPK / Dokumen</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 truncate block font-mono" title={item.no_spk || item.no_pks}>
                    {item.no_spk || item.no_pks || "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Sync Notice Alert */}
            <div className="bg-emerald-50 dark:bg-[#14261c] border border-emerald-200 dark:border-emerald-800 rounded-2xl p-3.5 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                <strong className="block font-bold mb-0.5">Sinkronisasi Otomatis Terpusat:</strong>
                Menyimpan perpanjangan sewa di sini akan <strong>mengarsipkan periode lama ke Riwayat Perpanjangan Sewa</strong> dan otomatis <strong>memperbarui masa sewa, status, dan vendor</strong> pada seluruh perangkat komputer / printer terkait.
              </div>
            </div>

            {/* New Contract Period Form Fields */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-gray-100 dark:border-[#263e2f]">
                <FileText className="w-4 h-4 text-[#0d5c3a] dark:text-emerald-400" /> Detail Perpanjangan Kontrak Baru
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* No SPK Baru */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    No. SPK Perpanjangan
                  </label>
                  <input
                    type="text"
                    value={formData.no_spk}
                    onChange={(e) => setFormData((p) => ({ ...p, no_spk: e.target.value }))}
                    placeholder="Contoh: SPK/LOG/2026/001..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#15231a] border border-gray-200 dark:border-[#263e2f] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono text-gray-800 dark:text-gray-100"
                  />
                </div>

                {/* No PKS Baru */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    No. PKS Perpanjangan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.no_pks}
                    onChange={(e) => setFormData((p) => ({ ...p, no_pks: e.target.value }))}
                    placeholder="Contoh: PKS/05/2026..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#15231a] border border-gray-200 dark:border-[#263e2f] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono text-gray-800 dark:text-gray-100"
                  />
                </div>

                {/* Vendor Baru / Tetap */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Vendor / Penyedia
                  </label>
                  <VendorSelectDropdown
                    value={formData.vendor_nama}
                    onChange={(val) => setFormData((p) => ({ ...p, vendor_nama: val }))}
                    onSelect={(v) => setFormData((p) => ({ ...p, vendor_nama: v.nama }))}
                    vendors={vendors}
                    placeholder="Pilih atau ketik vendor..."
                    inputCls="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#15231a] border border-gray-200 dark:border-[#263e2f] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium text-gray-800 dark:text-gray-100"
                  />
                </div>

                {/* Tanggal Mulai Baru */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Tanggal Mulai Baru <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal_mulai}
                    onChange={(e) => handleDateChange("tanggal_mulai", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#15231a] border border-gray-200 dark:border-[#263e2f] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium text-gray-800 dark:text-gray-100"
                  />
                </div>

                {/* Tanggal Selesai Baru */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Tanggal Selesai Baru <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal_selesai}
                    onChange={(e) => handleDateChange("tanggal_selesai", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#15231a] border border-gray-200 dark:border-[#263e2f] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium text-gray-800 dark:text-gray-100"
                  />
                </div>

                {/* Durasi Bulan */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Durasi Sewa (Bulan)
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={formData.masa_sewa_bulan}
                    className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-[#121c15] border border-gray-200 dark:border-[#263e2f] rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 cursor-not-allowed"
                  />
                </div>

                {/* Biaya Sewa */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Biaya Sewa Perpanjangan (Rp)
                  </label>
                  <input
                    type="text"
                    value={formData.biaya_sewa}
                    onChange={handleCurrencyChange}
                    placeholder="Contoh: 15.000.000"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#15231a] border border-gray-200 dark:border-[#263e2f] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium text-gray-800 dark:text-gray-100"
                  />
                </div>

                {/* Status */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Status Sewa Otomatis
                  </label>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                      formData.status === "Sewa Berjalan"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300"
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {formData.status}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      (Dihitung otomatis berdasarkan tanggal selesai yang Anda masukkan)
                    </span>
                  </div>
                </div>

                {/* Catatan / Keterangan */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Catatan Perpanjangan Sewa
                  </label>
                  <textarea
                    rows="2"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData((p) => ({ ...p, deskripsi: e.target.value }))}
                    placeholder="Catatan tambahan seperti nomor adendum, ketentuan baru, dsb..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#15231a] border border-gray-200 dark:border-[#263e2f] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium text-gray-800 dark:text-gray-100 resize-none custom-scrollbar"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-[#15231a] border-t border-gray-100 dark:border-[#263e2f] flex justify-end items-center gap-3 shrink-0 rounded-b-2xl sm:rounded-b-3xl">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-[#263e2f] transition-all border border-gray-200 dark:border-[#263e2f] bg-white dark:bg-[#1a2b20] cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#0d5c3a] hover:bg-[#156e49] shadow-md shadow-[#0d5c3a]/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CalendarPlus className="w-3.5 h-3.5" />
              )}
              Simpan Perpanjangan Sewa
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
