import { useState, useEffect } from "react";
import { X, Database, Plus, Loader2, CalendarPlus, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import VendorSelectDropdown from "../Form/VendorSelectDropdown";
import CustomSelectDropdown from "../Form/CustomSelectDropdown";

export default function BarangFormModal({
  isOpen,
  editingInv,
  isSaving,
  calculatedStatus: propCalculatedStatus,
  vendors = [],
  initialModeEdit = "koreksi",
  onClose,
  onSubmit,
  onDateChange,
}) {
  const [vendorNama, setVendorNama] = useState(editingInv?.vendor_nama || "");
  const [modeEdit, setModeEdit] = useState(initialModeEdit || "koreksi");
  const [kuantitas, setKuantitas] = useState(0);
  const [hargaSatuan, setHargaSatuan] = useState("");
  const [biayaSewa, setBiayaSewa] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [masaSewaBulan, setMasaSewaBulan] = useState(0);
  const [statusVal, setStatusVal] = useState("Inventaris");

  const isEditingInventaris = Boolean(
    editingInv && (
      editingInv.status === "Inventaris" ||
      (!editingInv.tanggal_mulai && !editingInv.tanggal_selesai)
    )
  );

  useEffect(() => {
    if (isOpen) {
      setVendorNama(editingInv?.vendor_nama || "");
      setModeEdit(isEditingInventaris ? "koreksi" : (initialModeEdit || "koreksi"));
      
      const qty = editingInv?.kuantitas !== undefined ? editingInv.kuantitas : (editingInv?.stok || 0);
      setKuantitas(qty);

      const hs = editingInv?.harga_satuan !== null && editingInv?.harga_satuan !== undefined && editingInv?.harga_satuan !== ""
        ? Number(String(editingInv.harga_satuan).replace(/[^0-9]/g, "")).toLocaleString("id-ID")
        : "";
      setHargaSatuan(hs);

      const bs = editingInv?.biaya_sewa !== null && editingInv?.biaya_sewa !== undefined && editingInv?.biaya_sewa !== ""
        ? Number(String(editingInv.biaya_sewa).replace(/[^0-9]/g, "")).toLocaleString("id-ID")
        : "";
      setBiayaSewa(bs);

      let tStart = editingInv?.tanggal_mulai || "";
      let tEnd = editingInv?.tanggal_selesai || "";

      // Jika membuka langsung dengan mode perpanjang dan ada tanggal selesai lama
      if (initialModeEdit === "perpanjang" && editingInv?.tanggal_selesai) {
        const oldEnd = new Date(editingInv.tanggal_selesai);
        if (!isNaN(oldEnd.getTime())) {
          oldEnd.setDate(oldEnd.getDate() + 1);
          tStart = oldEnd.toISOString().split("T")[0];
          tEnd = "";
        }
      }

      setTanggalMulai(tStart);
      setTanggalSelesai(tEnd);
      recalcDurationAndStatus(tStart, tEnd);
    }
  }, [editingInv, isOpen, initialModeEdit]);

  const recalcDurationAndStatus = (start, end) => {
    if (start && end) {
      const d1 = new Date(start);
      const d2 = new Date(end);
      let months = (d2.getFullYear() - d1.getFullYear()) * 12;
      months -= d1.getMonth();
      months += d2.getMonth();
      const finalMonths = months > 0 ? months : 0;
      setMasaSewaBulan(finalMonths);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setStatusVal(new Date(end) >= today ? "Sewa Berjalan" : "Sewa Habis");
    } else {
      setMasaSewaBulan(editingInv?.masa_sewa_bulan || 0);
      setStatusVal("Inventaris");
    }
  };

  const handleModeChange = (mode) => {
    if (isEditingInventaris && mode === "perpanjang") return;
    setModeEdit(mode);
    if (mode === "perpanjang" && editingInv?.tanggal_selesai) {
      const oldEnd = new Date(editingInv.tanggal_selesai);
      if (!isNaN(oldEnd.getTime())) {
        oldEnd.setDate(oldEnd.getDate() + 1);
        const nextStart = oldEnd.toISOString().split("T")[0];
        setTanggalMulai(nextStart);
        setTanggalSelesai("");
        recalcDurationAndStatus(nextStart, "");
      }
    } else if (mode === "koreksi") {
      setTanggalMulai(editingInv?.tanggal_mulai || "");
      setTanggalSelesai(editingInv?.tanggal_selesai || "");
      recalcDurationAndStatus(editingInv?.tanggal_mulai || "", editingInv?.tanggal_selesai || "");
    }
  };

  const handleKuantitasChange = (e) => {
    const val = Number(e.target.value) || 0;
    setKuantitas(val);
  };

  const handleHargaSatuanChange = (e) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, "");
    const numVal = rawVal ? Number(rawVal) : 0;
    setHargaSatuan(numVal ? numVal.toLocaleString("id-ID") : "");
  };

  const handleBiayaSewaChange = (e) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, "");
    const numVal = rawVal ? Number(rawVal) : 0;
    setBiayaSewa(numVal ? numVal.toLocaleString("id-ID") : "");
  };

  const handleDateInput = (field, val) => {
    if (field === "tanggal_mulai") {
      setTanggalMulai(val);
      recalcDurationAndStatus(val, tanggalSelesai);
    } else {
      setTanggalSelesai(val);
      recalcDurationAndStatus(tanggalMulai, val);
    }
    if (onDateChange) onDateChange({ target: { name: field, value: val } });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">

        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0d5c3a] via-[#156e49] to-[#279969] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl border border-white/20">
              <Database className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight text-white">
                {editingInv ? "Edit Data Barang" : "Tambah Master Barang Baru"}
              </h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Kelola data spesifikasi, harga sewa, dan vendor barang inventaris.
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

        {/* Form Container */}
        <form id="formBarang" onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 sm:p-7 overflow-y-auto flex-1 custom-scrollbar space-y-5">

            {/* Mode Edit Choice (Hanya saat mengedit barang sewa) */}
            {editingInv && !isEditingInventaris && (
              <div className="bg-blue-50/70 dark:bg-[#14261c] border border-blue-200 dark:border-gray-700 rounded-2xl p-3.5 shadow-2xs">
                <label className="block text-xs font-bold text-blue-900 dark:text-emerald-100 mb-2">
                  Tujuan Pengubahan Data:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${modeEdit === 'koreksi' ? 'bg-white dark:bg-[#1a2e22] border-blue-500 font-bold text-blue-900 shadow-xs' : 'bg-white/60 hover:bg-white border-gray-200 text-gray-600'}`}>
                    <input
                      type="radio"
                      name="mode_edit"
                      value="koreksi"
                      checked={modeEdit === 'koreksi'}
                      onChange={() => handleModeChange('koreksi')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="block font-bold text-gray-900">Koreksi / Perbaiki Data</span>
                      <span className="block text-[11px] text-gray-500 font-normal mt-0.5">Mengedit kesalahan data spesifikasi (tanpa simpan riwayat)</span>
                    </div>
                  </label>

                  <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${modeEdit === 'perpanjang' ? 'bg-white dark:bg-[#1a2e22] border-emerald-500 font-bold text-emerald-900 shadow-xs ring-1 ring-emerald-400' : 'bg-white/60 hover:bg-white border-gray-200 text-gray-600'}`}>
                    <input
                      type="radio"
                      name="mode_edit"
                      value="perpanjang"
                      checked={modeEdit === 'perpanjang'}
                      onChange={() => handleModeChange('perpanjang')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="block font-bold text-emerald-700">Perpanjang Masa Sewa</span>
                      <span className="block text-[11px] text-gray-500 font-normal mt-0.5">Memperpanjang periode sewa (simpan riwayat lama & sinkronkan perangkat)</span>
                    </div>
                  </label>
                </div>

                {modeEdit === 'perpanjang' && (
                  <div className="mt-3 p-2.5 bg-emerald-100/70 rounded-xl border border-emerald-300/60 text-emerald-900 text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Mode Perpanjangan Aktif: Riwayat kontrak sebelumnya akan tersimpan secara otomatis, dan data masa sewa pada Komputer / Printer terkait akan langsung tersinkronisasi.</span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-5 gap-y-5">

              {/* Nama Barang */}
              <div className="md:col-span-6">
                <label className="block text-sm mb-2 font-medium text-gray-700">
                  Nama Barang <span className="text-red-500">*</span>
                </label>
                <input
                  name="nama"
                  defaultValue={editingInv?.nama || ""}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium"
                  placeholder="Contoh: PC Desktop i5 / Printer Epson..."
                />
              </div>

              {/* Jenis Barang */}
              <div className="md:col-span-6">
                <label className="block text-sm mb-2 font-medium text-gray-700">
                  Jenis Barang <span className="text-red-500">*</span>
                </label>
                <CustomSelectDropdown
                  name="jenis_barang"
                  defaultValue={editingInv?.jenis_barang || "Komputer"}
                  options={["Komputer", "Printer", "Laptop"]}
                  placeholder="Pilih Jenis Barang..."
                  required
                />
              </div>

              {/* Stok / Kuantitas */}
              <div className="md:col-span-3">
                <label className="block text-sm mb-2 font-medium text-gray-700">
                  Stok / Kuantitas <span className="text-red-500">*</span>
                </label>
                <input
                  name="kuantitas"
                  type="number"
                  value={kuantitas}
                  onChange={handleKuantitasChange}
                  min="0"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-semibold"
                />
              </div>

              {/* Satuan */}
              <div className="md:col-span-3">
                <label className="block text-sm mb-2 font-medium text-gray-700">
                  Satuan <span className="text-red-500">*</span>
                </label>
                <CustomSelectDropdown
                  name="satuan"
                  defaultValue={editingInv?.satuan || "Unit"}
                  options={["Unit", "Pcs", "Box", "Set"]}
                  placeholder="Pilih Satuan..."
                  required
                />
              </div>

              {/* Nama Vendor */}
              <div className="md:col-span-6">
                <label className="block text-sm mb-2 font-medium text-gray-700">
                  Nama Vendor
                </label>
                <VendorSelectDropdown
                  name="vendor_nama"
                  value={vendorNama}
                  onChange={(val) => setVendorNama(val)}
                  onSelect={(v) => setVendorNama(v.nama)}
                  vendors={vendors}
                  placeholder="Pilih atau ketik nama vendor..."
                  inputCls="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-gray-900"
                />
              </div>

              {/* No SPK */}
              <div className="md:col-span-6">
                <label className="block text-sm mb-2 font-medium text-gray-700">
                  No. SPK
                </label>
                <input
                  name="no_spk"
                  defaultValue={editingInv?.no_spk || ""}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  placeholder="Contoh: SPK/2026/01/..."
                />
              </div>

              {/* No PKS */}
              <div className="md:col-span-6">
                <label className="block text-sm mb-2 font-medium text-gray-700">
                  No. PKS
                </label>
                <input
                  name="no_pks"
                  defaultValue={editingInv?.no_pks || ""}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  placeholder="Contoh: PKS/LOG/..."
                />
              </div>

              {/* Tanggal Mulai */}
              <div className="md:col-span-6">
                <label className="block text-sm mb-2 font-medium text-gray-700">
                  Tgl Mulai Kontrak
                </label>
                <input
                  name="tanggal_mulai"
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => handleDateInput("tanggal_mulai", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              {/* Tanggal Selesai */}
              <div className="md:col-span-6">
                <label className="block text-sm mb-2 font-medium text-gray-700">
                  Tgl Berakhir Kontrak
                </label>
                <input
                  name="tanggal_selesai"
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => handleDateInput("tanggal_selesai", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              {/* Status */}
              <div className="md:col-span-3">
                <label className="block text-sm mb-2 font-medium text-gray-700">
                  Status
                </label>
                <input type="hidden" name="status" value={statusVal} />
                <input
                  type="text"
                  readOnly
                  value={statusVal}
                  className={`w-full px-3 py-2.5 border rounded-xl font-bold text-xs cursor-not-allowed text-center ${
                    statusVal === "Inventaris"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : statusVal === "Sewa Berjalan"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                />
              </div>

              {/* Masa Sewa */}
              <div className="md:col-span-3">
                <label className="block text-sm mb-2 font-medium text-gray-700">
                  Masa Sewa (Bln)
                </label>
                <input
                  name="masa_sewa_bulan"
                  type="number"
                  min="0"
                  value={masaSewaBulan}
                  readOnly
                  className="w-full px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 font-semibold text-center cursor-not-allowed text-sm"
                />
              </div>

              {/* Kolom Harga Satuan (Di Sebelah Kiri Kolom Biaya Sewa) */}
              <div className="md:col-span-3">
                <label className="block text-sm mb-2 font-medium text-gray-700">
                  Harga Satuan (Rp)
                </label>
                <input
                  name="harga_satuan"
                  type="text"
                  value={hargaSatuan}
                  onChange={handleHargaSatuanChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-semibold text-gray-900"
                  placeholder="Contoh: 1.200.000"
                />
              </div>

              {/* Kolom Biaya Sewa (Total Biaya Sewa) */}
              <div className="md:col-span-3">
                <label className="block text-sm mb-2 font-medium text-gray-700">
                  Biaya Sewa (Rp)
                </label>
                <input
                  name="biaya_sewa"
                  type="text"
                  value={biayaSewa}
                  onChange={handleBiayaSewaChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold text-emerald-700"
                  placeholder="Contoh: 12.000.000"
                />
              </div>

              {/* Deskripsi Catatan */}
              <div className="md:col-span-12">
                <label className="block text-sm mb-2 font-medium text-gray-700">
                  Keterangan Catatan
                </label>
                <textarea
                  name="deskripsi"
                  defaultValue={editingInv?.deskripsi || ""}
                  rows="2"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  placeholder="Catatan perpanjangan atau keterangan spesifikasi barang..."
                />
              </div>

            </div>
          </div>

          {/* Footer Tombol */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end items-center gap-3 shrink-0 rounded-b-2xl sm:rounded-b-3xl">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-200/70 transition-all border border-gray-200 bg-white cursor-pointer disabled:opacity-50"
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
                <Plus className="w-3.5 h-3.5" />
              )}
              {editingInv
                ? (modeEdit === "perpanjang" ? "Simpan Perpanjangan Sewa" : "Simpan Perubahan")
                : "Simpan Barang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}