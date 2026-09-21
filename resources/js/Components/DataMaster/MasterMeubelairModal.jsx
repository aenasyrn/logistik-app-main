// resources/js/Components/DataMaster/MasterMeubelairModal.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Loader2, Plus, Package, ChevronDown, Settings } from "lucide-react";
import CustomSelectDropdown from "../Form/CustomSelectDropdown";
import VendorSelectDropdown from "../Form/VendorSelectDropdown";
import KelolaJenisBarangModal from "../Inventaris/Meubelair/KelolaJenisBarangModal";

export default function MasterMeubelairModal({
  isOpen,
  onClose,
  onSave,
  editingItem = null,
  isSaving = false,
  userRole = "user",
  jenisList = [],
  vendors = [],
  onRefreshJenis,
}) {
  const [formData, setFormData] = useState({
    nama_barang: "",
    jenis_barang: "",
    stok: "",
    tanggal_registrasi: new Date().toISOString().split("T")[0],
    vendor: "",
    harga_satuan: "",
    biaya: "",
    keterangan: "",
  });

  const [isKelolaJenisOpen, setIsKelolaJenisOpen] = useState(false);

  const jenisOptions = useMemo(() => {
    const list = (jenisList || []).map((j) => (typeof j === "string" ? j : j.nama || ""));
    const defaults = ["Meja", "Kursi", "Lemari", "Sofa", "AC"];
    const combined = Array.from(new Set([...defaults, ...list].filter(Boolean)));
    return combined;
  }, [jenisList]);

  useEffect(() => {
    if (editingItem) {
      const stokVal = editingItem.stok !== undefined ? editingItem.stok : 1;
      const hargaSatuanVal = editingItem.harga_satuan ? Number(editingItem.harga_satuan) : 0;
      let biayaVal = editingItem.biaya ? Number(editingItem.biaya) : 0;
      if (biayaVal === 0 && hargaSatuanVal > 0 && stokVal > 0) {
        biayaVal = hargaSatuanVal * stokVal;
      }

      setFormData({
        nama_barang: editingItem.nama_barang || "",
        jenis_barang: editingItem.jenis_barang || "",
        stok: stokVal,
        tanggal_registrasi: editingItem.tanggal_registrasi
          ? editingItem.tanggal_registrasi.split("T")[0]
          : "",
        vendor: editingItem.vendor || "",
        harga_satuan: hargaSatuanVal ? hargaSatuanVal.toLocaleString("id-ID") : "",
        biaya: biayaVal ? biayaVal.toLocaleString("id-ID") : "",
        keterangan: editingItem.keterangan || "",
      });
    } else {
      setFormData({
        nama_barang: "",
        jenis_barang: "",
        stok: "",
        tanggal_registrasi: new Date().toISOString().split("T")[0],
        vendor: "",
        harga_satuan: "",
        biaya: "",
        keterangan: "",
      });
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleHargaSatuanChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    if (!rawVal) {
      setFormData((prev) => ({ ...prev, harga_satuan: "", biaya: "" }));
      return;
    }
    const numHarga = parseInt(rawVal, 10);
    const stokNum = parseInt(formData.stok, 10) || 1;
    const totalBiaya = numHarga * stokNum;

    setFormData((prev) => ({
      ...prev,
      harga_satuan: numHarga.toLocaleString("id-ID"),
      biaya: totalBiaya.toLocaleString("id-ID"),
    }));
  };

  const handleStokChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setFormData((prev) => ({ ...prev, stok: "" }));
      return;
    }
    const numStok = parseInt(val, 10);
    const stokParsed = isNaN(numStok) ? "" : numStok;

    setFormData((prev) => {
      let nextBiaya = prev.biaya;
      const cleanHarga = prev.harga_satuan ? parseInt(prev.harga_satuan.replace(/\D/g, ""), 10) : 0;
      if (cleanHarga > 0 && typeof stokParsed === "number") {
        nextBiaya = (cleanHarga * stokParsed).toLocaleString("id-ID");
      }
      return {
        ...prev,
        stok: stokParsed,
        biaya: nextBiaya,
      };
    });
  };

  const handleBiayaChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    if (!rawVal) {
      setFormData((prev) => ({ ...prev, biaya: "" }));
      return;
    }
    const numVal = parseInt(rawVal, 10);
    setFormData((prev) => ({
      ...prev,
      biaya: numVal.toLocaleString("id-ID"),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nama_barang.trim()) return;

    const rawHarga = typeof formData.harga_satuan === "string"
      ? formData.harga_satuan.replace(/\./g, "").replace(/[^0-9]/g, "")
      : formData.harga_satuan;

    const rawBiaya = typeof formData.biaya === "string"
      ? formData.biaya.replace(/\./g, "").replace(/[^0-9]/g, "")
      : formData.biaya;

    const stokNum = formData.stok === "" ? 1 : (parseInt(formData.stok, 10) || 0);
    const hargaNum = rawHarga ? parseInt(rawHarga, 10) : 0;
    let biayaNum = rawBiaya ? parseInt(rawBiaya, 10) : 0;

    if (biayaNum === 0 && hargaNum > 0 && stokNum > 0) {
      biayaNum = hargaNum * stokNum;
    }

    onSave({
      ...formData,
      jenis_barang: formData.jenis_barang || "",
      vendor: formData.vendor ? formData.vendor.trim() : "",
      stok: stokNum,
      harga_satuan: hargaNum,
      biaya: biayaNum,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#101e16] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">

        {/* HEADER MODAL */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0d5c3a] via-[#156e49] to-[#279969] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl border border-white/20">
              <Package className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight text-white">
                {editingItem ? "Edit Data Barang Meubelair" : "Tambah Barang Meubelair Baru"}
              </h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Kelola informasi barang perabot meubelair, stok, dan biaya.
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

        {/* FORM WRAPPER */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5 bg-white dark:bg-[#101e16]">

            {/* Kelola Jenis Barang (Khusus Admin) - Hanya tampil saat Tambah Barang Baru, disembunyikan saat Edit */}
            {userRole === "admin" && !editingItem && (
              <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/40 border border-emerald-200/90 dark:border-emerald-800/60 rounded-2xl shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#0d5c3a] text-white rounded-xl shadow-xs">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">
                      Kelola Jenis Barang Meubelair
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      Tambah atau hapus opsi jenis barang untuk master & inventaris
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsKelolaJenisOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0d5c3a] hover:bg-[#094229] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Kelola Jenis</span>
                </button>
              </div>
            )}

            {/* Nama Barang */}
            <div>
              <label className="block text-sm mb-1.5 font-medium text-gray-700 dark:text-gray-300">
                Nama Barang *
              </label>
              <input
                type="text"
                required
                value={formData.nama_barang}
                onChange={(e) => setFormData({ ...formData, nama_barang: e.target.value })}
                disabled={isSaving}
                placeholder="Nama barang meubelair..."
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1a2d21] border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
              />
            </div>

            {/* Grid 1: Jenis Barang & Stok */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Jenis Barang */}
              <div>
                <label className="block text-sm mb-1.5 font-medium text-gray-700 dark:text-gray-300">
                  Jenis Barang *
                </label>
                <CustomSelectDropdown
                  placeholder="Pilih Jenis Barang..."
                  value={formData.jenis_barang}
                  onChange={(e) => {
                    const val = e.target ? e.target.value : e;
                    setFormData((prev) => ({ ...prev, jenis_barang: val }));
                  }}
                  onSelect={(opt) => {
                    const val = typeof opt === "string" ? opt : (opt?.value || opt?.label || opt);
                    setFormData((prev) => ({ ...prev, jenis_barang: val }));
                  }}
                  options={
                    formData.jenis_barang && !jenisOptions.includes(formData.jenis_barang)
                      ? [formData.jenis_barang, ...jenisOptions]
                      : jenisOptions
                  }
                  disabled={isSaving}
                  allowCustomInput={false}
                  inputCls="w-full pl-4 pr-9 py-2.5 bg-white dark:bg-[#1a2d21] border-2 border-[#1b7e47] dark:border-emerald-500 rounded-xl outline-none focus:ring-2 focus:ring-[#1b7e47]/30 focus:border-[#1b7e47] text-sm font-semibold text-gray-900 dark:text-white cursor-pointer shadow-xs transition-all"
                />
              </div>

              {/* Stok */}
              <div>
                <label className="block text-sm mb-1.5 font-medium text-gray-700 dark:text-gray-300">
                  Stok Unit *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stok}
                  onFocus={(e) => e.target.select()}
                  onChange={handleStokChange}
                  disabled={isSaving}
                  placeholder="1"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1a2d21] border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                />
              </div>
            </div>

            {/* Grid 2: Tanggal Registrasi & Vendor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tanggal Registrasi */}
              <div>
                <label className="block text-sm mb-1.5 font-medium text-gray-700 dark:text-gray-300">
                  Tanggal Registrasi
                </label>
                <input
                  type="date"
                  value={formData.tanggal_registrasi}
                  onChange={(e) => setFormData({ ...formData, tanggal_registrasi: e.target.value })}
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1a2d21] border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-gray-900 dark:text-white cursor-pointer transition-all"
                />
              </div>

              {/* Vendor */}
              <div>
                <label className="block text-sm mb-1.5 font-medium text-gray-700 dark:text-gray-300">
                  Vendor
                </label>
                <VendorSelectDropdown
                  value={formData.vendor}
                  onChange={(val) => setFormData((prev) => ({ ...prev, vendor: val }))}
                  onSelect={(v) => setFormData((prev) => ({ ...prev, vendor: v?.nama || "" }))}
                  vendors={vendors}
                  placeholder="Pilih atau ketik vendor..."
                  disabled={isSaving}
                  inputCls="w-full pl-4 pr-9 py-2.5 bg-gray-50 dark:bg-[#1a2d21] border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                />
              </div>
            </div>

            {/* Grid 3: Harga Satuan & Jumlah Biaya */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Harga Satuan */}
              <div>
                <label className="block text-sm mb-1.5 font-medium text-gray-700 dark:text-gray-300">
                  Harga Satuan (Rp)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.harga_satuan}
                  onChange={handleHargaSatuanChange}
                  disabled={isSaving}
                  placeholder="Contoh: 1.250.000"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1a2d21] border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                />
              </div>

              {/* Jumlah Biaya */}
              <div>
                <label className="block text-sm mb-1.5 font-medium text-gray-700 dark:text-gray-300">
                  Jumlah Biaya (Rp)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.biaya}
                  onChange={handleBiayaChange}
                  disabled={isSaving}
                  placeholder="Otomatis terhitung"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1a2d21] border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                />
              </div>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-sm mb-1.5 font-medium text-gray-700 dark:text-gray-300">
                Keterangan
              </label>
              <textarea
                rows="3"
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                disabled={isSaving}
                placeholder="Catatan spesifikasi, warna, bahan, merk, atau lokasi penempatan..."
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1a2d21] border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none transition-all"
              />
            </div>
          </div>

          {/* TOMBOL AKSI */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-[#0c1a12] border-t border-gray-100 dark:border-gray-800 flex justify-end items-center gap-3 shrink-0 rounded-b-2xl sm:rounded-b-3xl">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2d21] cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#0d5c3a] hover:bg-[#156e49] shadow-md shadow-[#0d5c3a]/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {editingItem ? "Simpan Perubahan" : "Simpan Barang"}
            </button>
          </div>
        </form>
      </div>

      {/* Admin Kelola Jenis Barang Modal */}
      {isKelolaJenisOpen && (
        <KelolaJenisBarangModal
          isOpen={isKelolaJenisOpen}
          onClose={() => setIsKelolaJenisOpen(false)}
          jenisList={jenisList}
          onJenisUpdated={(newJenisName) => {
            if (onRefreshJenis) onRefreshJenis();
            if (newJenisName && typeof newJenisName === "string") {
              setFormData((prev) => ({ ...prev, jenis_barang: newJenisName }));
            }
          }}
        />
      )}
    </div>
  );
}
