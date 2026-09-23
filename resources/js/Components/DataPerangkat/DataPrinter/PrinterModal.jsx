// src/components/DataPerangkat/DataPrinter/PrinterModal.jsx
import React, { useMemo } from "react";
import { X, Loader2, Sparkles, Printer, Box, Building2 } from "lucide-react";
import VendorSelectDropdown from "../../Form/VendorSelectDropdown";
import CustomSelectDropdown from "../../Form/CustomSelectDropdown";

export default function PrinterModal({
  isOpen,
  editingId,
  formData,
  setFormData,
  isSaving,
  outletsList = [],
  inventoryList = [],
  snList = [],
  vendors = [],
  onClose,
  onSave,
  onOutletChange,
  onProdukChange,
  onDateChange,
}) {
  if (!isOpen) return null;

  const labelCls = "block text-xs font-bold text-gray-900 dark:text-white mb-1.5";
  const inputCls =
    "w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] outline-none text-xs text-gray-900 dark:text-white bg-white dark:bg-[#1a2e22] placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all";

  // Prepare rich option objects for Master Barang
  const inventoryOptions = useMemo(() => {
    return (inventoryList || []).map((inv) => {
      const subParts = [];
      if (inv.vendor_nama || inv.vendor) subParts.push(`Vendor: ${inv.vendor_nama || inv.vendor}`);
      if (inv.status) subParts.push(`Status: ${inv.status}`);
      if (inv.tanggal_mulai && inv.tanggal_selesai) {
        subParts.push(`Periode: ${inv.tanggal_mulai} s/d ${inv.tanggal_selesai}`);
      }
      if (inv.kuantitas !== undefined && inv.kuantitas !== null && inv.kuantitas > 0) {
        subParts.push(`Stok: ${inv.kuantitas} ${inv.satuan || "Unit"}`);
      }
      return {
        id: inv.id,
        value: inv.nama,
        label: inv.nama,
        subtext: subParts.join(" • ") || "Master Barang",
        raw: inv,
      };
    });
  }, [inventoryList]);

  // Prepare rich option objects for Outlets
  const outletOptions = useMemo(() => {
    return (outletsList || []).map((o) => ({
      id: o.id,
      value: o.nama,
      label: o.nama,
      subtext: `Kode / ID: ${o.id || o.code || "-"}`,
      raw: o,
    }));
  }, [outletsList]);

  // Check if current selected product is from Master Barang
  const matchedMaster = useMemo(() => {
    if (!formData.produk) return null;
    const cleanProd = String(formData.produk).trim().toLowerCase();
    return (inventoryList || []).find((inv) => inv.nama && inv.nama.toLowerCase() === cleanProd);
  }, [formData.produk, inventoryList]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-gradient-to-b dark:from-[#052819] dark:via-[#073622] dark:to-[#03140d] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
        
        {/* ── HEADER ── */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0d5c3a] via-[#156e49] to-[#279969] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl border border-white/20">
              <Printer className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight text-white">
                {editingId ? "Edit Data Printer" : "Tambah Data Printer Baru"}
              </h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                {editingId ? "Perbarui detail spesifikasi, lokasi, atau kondisi perangkat." : "Pilih dari Master Data Barang untuk mengisi detail sewa & vendor secara otomatis."}
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

        {/* Form membungkus Body dan Footer */}
        <form onSubmit={onSave} className="flex flex-col flex-1 overflow-hidden">
          
          {/* ── BODY ── */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 custom-scrollbar space-y-4">

            <div className="space-y-4">
              
              {/* Bagian 1: Lokasi & Master Barang */}
              <div className="space-y-3 bg-white dark:bg-[#14261c] p-3.5 rounded-xl border border-slate-200/80 dark:border-gray-700 shadow-xs">
                <h4 className="font-bold text-[11px] text-[#0d5c3a] dark:text-emerald-400 pb-1 uppercase tracking-wide flex items-center gap-1.5 border-b border-emerald-100 dark:border-white/10">
                  <Building2 className="w-3.5 h-3.5" /> Informasi Lokasi & Master Barang
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-start">
                  {/* Nama Outlet */}
                  <div className="sm:col-span-2">
                    <CustomSelectDropdown
                      label="Nama Outlet"
                      labelCls={labelCls}
                      value={formData.outlet}
                      onChange={(e) => onOutletChange(e.target ? e.target.value : e)}
                      onSelect={(o) => onOutletChange(o.nama || o.value || o)}
                      options={outletOptions}
                      placeholder="Pilih atau cari outlet..."
                      disabled={isSaving}
                      inputCls={inputCls}
                      allowCustomInput={true}
                    />
                  </div>

                  {/* ID Outlet */}
                  <div className="sm:col-span-1">
                    <label className={labelCls}>ID Outlet</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.idOutlet || ""}
                      className={`${inputCls} bg-gray-100 dark:bg-[#14261c] text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700 cursor-not-allowed font-medium`}
                      placeholder="Otomatis"
                    />
                  </div>

                  {/* Produk Hardware (dari Master Barang) */}
                  <div className="sm:col-span-3">
                    <CustomSelectDropdown
                      label="Produk Hardware Printer (Master Data Barang)"
                      labelCls={labelCls}
                      value={formData.produk}
                      onChange={(e) => onProdukChange(e.target ? e.target.value : e)}
                      onSelect={(p) => onProdukChange(p.nama || p.value || p)}
                      options={inventoryOptions}
                      placeholder="Pilih dari Master Barang atau ketik..."
                      disabled={isSaving}
                      inputCls={`${inputCls} font-medium`}
                      allowCustomInput={true}
                    />
                  </div>

                  {/* Indicator jika terhubung dengan Master Barang */}
                  {matchedMaster && (
                    <div className="sm:col-span-3 bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] p-2 rounded-xl flex items-center justify-between gap-2 animate-in fade-in duration-200">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>
                          Terhubung Master Barang: <strong>{matchedMaster.nama}</strong>
                        </span>
                      </div>
                      {matchedMaster.status && (
                        <span className="text-[10px] bg-white dark:bg-[#1a2e22] text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                          {matchedMaster.status}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Serial Number */}
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Serial Number (SN)</label>
                    <input
                      type="text"
                      value={formData.sn || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, sn: e.target.value }))}
                      disabled={isSaving}
                      className={`${inputCls} font-mono`}
                      placeholder="Masukkan Serial Number (SN)..."
                      autoComplete="off"
                    />
                  </div>

                  {/* Kondisi */}
                  <div className="sm:col-span-1">
                    <CustomSelectDropdown
                      label="Kondisi"
                      labelCls={labelCls}
                      value={formData.kondisi || "BAIK"}
                      onChange={(e) => setFormData((p) => ({ ...p, kondisi: e.target.value }))}
                      onSelect={(k) => setFormData((p) => ({ ...p, kondisi: k.value || k }))}
                      options={["BAIK", "KURANG BAIK", "RUSAK"]}
                      placeholder="Pilih kondisi..."
                      disabled={isSaving}
                      inputCls={`${inputCls} font-bold`}
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 2: Vendor & Masa Sewa */}
              <div className="space-y-3 bg-white dark:bg-[#14261c] p-3.5 rounded-xl border border-slate-200/80 dark:border-gray-700 shadow-xs">
                <h4 className="font-bold text-[11px] text-blue-700 dark:text-emerald-400 pb-1 uppercase tracking-wide flex items-center gap-1.5 border-b border-blue-100 dark:border-white/10">
                  <Box className="w-3.5 h-3.5" /> Vendor & Masa Sewa
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Vendor / Penyedia</label>
                    <VendorSelectDropdown
                      value={formData.vendor || ""}
                      onChange={(val) => setFormData((p) => ({ ...p, vendor: val }))}
                      onSelect={(v) => setFormData((p) => ({ ...p, vendor: v.nama }))}
                      vendors={vendors}
                      disabled={isSaving}
                      placeholder="Pilih atau ketik vendor..."
                      inputCls={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Tgl Mulai Sewa</label>
                    <input
                      type="date"
                      value={formData.tanggalMulai || ""}
                      onChange={(e) => onDateChange("tanggalMulai", e.target.value)}
                      disabled={isSaving}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Tgl Selesai Sewa</label>
                    <input
                      type="date"
                      value={formData.tanggalSelesai || ""}
                      onChange={(e) => onDateChange("tanggalSelesai", e.target.value)}
                      disabled={isSaving}
                      className={inputCls}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <CustomSelectDropdown
                      label="Status Perangkat"
                      value={formData.status || "Inventaris"}
                      onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                      onSelect={(s) => setFormData((p) => ({ ...p, status: s.value || s }))}
                      options={["Inventaris", "Sewa Berjalan", "Sewa Habis"]}
                      placeholder="Pilih status..."
                      disabled={isSaving}
                      inputCls={`${inputCls} font-medium`}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Keterangan / Catatan</label>
                    <textarea
                      rows="2"
                      value={formData.keterangan || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, keterangan: e.target.value }))}
                      disabled={isSaving}
                      className={`${inputCls} resize-none custom-scrollbar`}
                      placeholder="Isi catatan kondisi, kelengkapan, atau riwayat perbaikan..."
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── FOOTER ── */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-[#03140d] border-t border-gray-100 dark:border-white/10 flex justify-end items-center gap-3 shrink-0 rounded-b-2xl sm:rounded-b-3xl">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-[#1a2e22] transition-all border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#14261c] cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#0d5c3a] hover:bg-[#156e49] shadow-md shadow-[#0d5c3a]/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editingId ? "Simpan Perubahan" : "Tambah Printer"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}