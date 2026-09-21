// resources/js/Components/DataPerangkat/DataLaptop/LaptopModal.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Loader2, Laptop, User, Box, Sparkles } from "lucide-react";
import { calculateAutoStatus } from "../../../utils/deviceUtils";
import VendorSelectDropdown from "../../Form/VendorSelectDropdown";
import CustomSelectDropdown from "../../Form/CustomSelectDropdown";

const DEFAULT_DEPARTEMEN = [
  "Departemen Logistik & Umum",
  "Departemen Keuangan & Akuntansi",
  "Departemen Teknologi Informasi (TI)",
  "Departemen Operasional",
  "Departemen Sumber Daya Manusia (SDM)",
  "Departemen Bisnis & Pemasaran",
  "Departemen Audit Internal & Kepatuhan",
  "Sekretariat Perusahaan",
  "Direksi / Manajemen",
];

const OS_OPTIONS = ["Windows", "MacOS", "Linux", "ChromeOS", "Lainnya"];
const KONDISI_OPTIONS = ["BAIK", "KURANG BAIK", "RUSAK"];

export default function LaptopModal({
  isOpen,
  onClose,
  onSave,
  editingItem = null,
  isSaving = false,
  inventoryList = [],
  vendors = [],
}) {
  if (!isOpen) return null;

  const labelCls = "block text-xs font-bold text-gray-900 dark:text-white mb-1.5";
  const inputCls =
    "w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] outline-none text-xs text-gray-900 dark:text-white bg-white dark:bg-[#1a2e22] placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all";

  const [formData, setFormData] = useState({
    nikPegawai: "",
    namaPengguna: "",
    jabatan: "",
    departemen: "",
    produk: "",
    hostname: "NB-00108-",
    sn: "",
    os: "Windows",
    kondisi: "BAIK",
    penyedia: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    masaSewaBulan: "",
    status: "Inventaris",
    inventory_id: null,
    keterangan: "",
  });

  // Recalculate duration & status helper
  const calculateDurationAndStatus = (start, end) => {
    if (start && end) {
      const d1 = new Date(start);
      const d2 = new Date(end);
      let months = (d2.getFullYear() - d1.getFullYear()) * 12;
      months -= d1.getMonth();
      months += d2.getMonth();
      const finalMonths = months > 0 ? months : 0;
      const autoStatus = calculateAutoStatus(start, end);
      return { months: finalMonths, status: autoStatus };
    }
    return { months: "", status: "Inventaris" };
  };

  useEffect(() => {
    if (editingItem) {
      const start = editingItem.tanggal_mulai || editingItem.tanggalMulai || "";
      const end = editingItem.tanggal_selesai || editingItem.tanggalSelesai || "";
      const { months, status } = calculateDurationAndStatus(start, end);

      setFormData({
        nikPegawai: editingItem.nik_pegawai || editingItem.nikPegawai || "",
        namaPengguna: editingItem.nama_pengguna || editingItem.namaPengguna || "",
        jabatan: editingItem.jabatan || "",
        departemen: editingItem.departemen || "",
        produk: editingItem.produk || "",
        hostname: editingItem.hostname || "NB-00108-",
        sn: editingItem.sn || "",
        os: editingItem.os || "Windows",
        kondisi: editingItem.kondisi || "BAIK",
        penyedia: editingItem.penyedia || editingItem.vendor || "",
        tanggalMulai: start,
        tanggalSelesai: end,
        masaSewaBulan: editingItem.masa_sewa_bulan || editingItem.masaSewaBulan || months,
        status: editingItem.status || status,
        inventory_id: editingItem.inventory_id || null,
        keterangan: editingItem.keterangan || "",
      });
    } else {
      setFormData({
        nikPegawai: "",
        namaPengguna: "",
        jabatan: "",
        departemen: "",
        produk: "",
        hostname: "NB-00108-",
        sn: "",
        os: "Windows",
        kondisi: "BAIK",
        penyedia: "",
        tanggalMulai: "",
        tanggalSelesai: "",
        masaSewaBulan: "",
        status: "Inventaris",
        inventory_id: null,
        keterangan: "",
      });
    }
  }, [editingItem, isOpen]);

  // Handle date change
  const handleDateChange = (field, val) => {
    setFormData((prev) => {
      const newStart = field === "tanggalMulai" ? val : prev.tanggalMulai;
      const newEnd = field === "tanggalSelesai" ? val : prev.tanggalSelesai;
      const { months, status } = calculateDurationAndStatus(newStart, newEnd);
      return {
        ...prev,
        [field]: val,
        masaSewaBulan: months,
        status: status,
      };
    });
  };

  // Prepare rich option objects for Master Data Barang
  const inventoryOptions = useMemo(() => {
    return (inventoryList || [])
      .filter((inv) => {
        const jenis = (inv.jenis_barang || "").toLowerCase();
        return (
          jenis.includes("laptop") ||
          jenis.includes("komputer") ||
          jenis.includes("non meubelair") ||
          !jenis
        );
      })
      .map((inv) => {
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

  // Check if current selected product is matched from Master Barang
  const matchedMaster = useMemo(() => {
    if (!formData.produk) return null;
    const cleanProd = String(formData.produk).trim().toLowerCase();
    return (inventoryList || []).find(
      (inv) => inv.nama && inv.nama.toLowerCase() === cleanProd
    );
  }, [formData.produk, inventoryList]);

  const selectProduct = (inv) => {
    if (!inv) return;
    const invData = inv.raw || inv;
    const start = invData.tanggal_mulai || formData.tanggalMulai;
    const end = invData.tanggal_selesai || formData.tanggalSelesai;
    const { months, status } = calculateDurationAndStatus(start, end);

    setFormData((prev) => ({
      ...prev,
      produk: invData.nama || prev.produk,
      inventory_id: invData.id || prev.inventory_id,
      penyedia: invData.vendor_nama || invData.vendor || prev.penyedia,
      tanggalMulai: start,
      tanggalSelesai: end,
      masaSewaBulan: months,
      status: status,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-gradient-to-b dark:from-[#052819] dark:via-[#073622] dark:to-[#03140d] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
        
        {/* ── HEADER ── */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0d5c3a] via-[#156e49] to-[#279969] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl border border-white/20">
              <Laptop className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight text-white">
                {editingItem ? "Edit Data Laptop" : "Tambah Laptop Baru"}
              </h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                {editingItem
                  ? "Perbarui detail spesifikasi, pengguna, atau vendor laptop."
                  : "Pilih dari Master Data Barang untuk mengisi detail sewa & vendor secara otomatis."}
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

        {/* ── FORM CONTENT ── */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          
          {/* ── BODY ── */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 custom-scrollbar space-y-4">
            
            {/* Bagian 1: Informasi Pengguna & Jabatan */}
            <div className="space-y-3 bg-white dark:bg-[#14261c] p-3.5 rounded-xl border border-slate-200/80 dark:border-gray-700 shadow-xs">
              <h4 className="font-bold text-[11px] text-[#0d5c3a] dark:text-emerald-400 pb-1 uppercase tracking-wide flex items-center gap-1.5 border-b border-emerald-100 dark:border-white/10">
                <User className="w-3.5 h-3.5" /> Informasi Pengguna & Jabatan
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-start">
                {/* NIK Pegawai */}
                <div>
                  <label className={labelCls}>NIK Pegawai</label>
                  <input
                    type="text"
                    value={formData.nikPegawai}
                    onChange={(e) => setFormData((p) => ({ ...p, nikPegawai: e.target.value }))}
                    placeholder="Masukkan NIK Pegawai..."
                    disabled={isSaving}
                    className={inputCls}
                  />
                </div>

                {/* Nama Pengguna */}
                <div>
                  <label className={labelCls}>Nama Pengguna</label>
                  <input
                    type="text"
                    value={formData.namaPengguna}
                    onChange={(e) => setFormData((p) => ({ ...p, namaPengguna: e.target.value }))}
                    placeholder="Masukkan Nama Pengguna..."
                    disabled={isSaving}
                    className={inputCls}
                  />
                </div>

                {/* Nama Jabatan */}
                <div>
                  <label className={labelCls}>Nama Jabatan</label>
                  <input
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) => setFormData((p) => ({ ...p, jabatan: e.target.value }))}
                    placeholder="Masukkan Nama Jabatan..."
                    disabled={isSaving}
                    className={inputCls}
                  />
                </div>

                {/* Departemen */}
                <div>
                  <CustomSelectDropdown
                    label="Departemen"
                    labelCls={labelCls}
                    value={formData.departemen}
                    onChange={(e) => {
                      const val = e.target ? e.target.value : e;
                      setFormData((p) => ({ ...p, departemen: val }));
                    }}
                    onSelect={(d) => {
                      const val = typeof d === "string" ? d : d.value || d.nama || d;
                      setFormData((p) => ({ ...p, departemen: val }));
                    }}
                    options={DEFAULT_DEPARTEMEN}
                    placeholder="Pilih atau ketik departemen..."
                    disabled={isSaving}
                    inputCls={inputCls}
                    allowCustomInput={true}
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2: Spesifikasi Laptop & Jaringan */}
            <div className="space-y-3 bg-white dark:bg-[#14261c] p-3.5 rounded-xl border border-slate-200/80 dark:border-gray-700 shadow-xs">
              <h4 className="font-bold text-[11px] text-[#0d5c3a] dark:text-emerald-400 pb-1 uppercase tracking-wide flex items-center gap-1.5 border-b border-emerald-100 dark:border-white/10">
                <Laptop className="w-3.5 h-3.5" /> Spesifikasi Laptop & Jaringan
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-start">
                {/* Produk / Model Laptop */}
                <div className="sm:col-span-2">
                  <CustomSelectDropdown
                    label="Produk / Model Laptop"
                    labelCls={labelCls}
                    value={formData.produk}
                    onChange={(e) => {
                      const val = e.target ? e.target.value : e;
                      setFormData((p) => ({ ...p, produk: val }));
                    }}
                    onSelect={selectProduct}
                    options={inventoryOptions}
                    placeholder="Pilih atau ketik model laptop..."
                    disabled={isSaving}
                    inputCls={`${inputCls} font-medium`}
                    allowCustomInput={true}
                  />
                </div>

                {/* Indicator jika terhubung dengan Master Barang */}
                {matchedMaster && (
                  <div className="sm:col-span-2 bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] p-2 rounded-xl flex items-center justify-between gap-2 animate-in fade-in duration-200">
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

                {/* Hostname / Device Name */}
                <div>
                  <label className={labelCls}>Hostname / Device Name</label>
                  <input
                    type="text"
                    value={formData.hostname}
                    onChange={(e) => setFormData((p) => ({ ...p, hostname: e.target.value }))}
                    placeholder="NB-00108-"
                    disabled={isSaving}
                    className={inputCls}
                  />
                </div>

                {/* Serial Number (SN) */}
                <div>
                  <label className={labelCls}>Serial Number (SN)</label>
                  <input
                    type="text"
                    value={formData.sn}
                    onChange={(e) => setFormData((p) => ({ ...p, sn: e.target.value }))}
                    placeholder="Masukkan Serial Number (SN)..."
                    disabled={isSaving}
                    className={`${inputCls} font-mono`}
                  />
                </div>

                {/* Operating System (OS) */}
                <div>
                  <CustomSelectDropdown
                    label="Operating System (OS)"
                    labelCls={labelCls}
                    value={formData.os}
                    onChange={(e) => {
                      const val = e.target ? e.target.value : e;
                      setFormData((p) => ({ ...p, os: val }));
                    }}
                    onSelect={(o) => {
                      const val = typeof o === "string" ? o : o.value || o;
                      setFormData((p) => ({ ...p, os: val }));
                    }}
                    options={OS_OPTIONS}
                    placeholder="Masukkan Operating System (OS)..."
                    disabled={isSaving}
                    inputCls={inputCls}
                    allowCustomInput={true}
                  />
                </div>

                {/* Kondisi Laptop */}
                <div>
                  <CustomSelectDropdown
                    label="Kondisi Laptop"
                    labelCls={labelCls}
                    value={formData.kondisi || "BAIK"}
                    onChange={(e) => {
                      const val = e.target ? e.target.value : e;
                      setFormData((p) => ({ ...p, kondisi: val }));
                    }}
                    onSelect={(k) => {
                      const val = typeof k === "string" ? k : k.value || k;
                      setFormData((p) => ({ ...p, kondisi: val }));
                    }}
                    options={KONDISI_OPTIONS}
                    placeholder="Pilih kondisi..."
                    disabled={isSaving}
                    inputCls={`${inputCls} font-bold`}
                  />
                </div>
              </div>
            </div>

            {/* Bagian 3: Vendor & Masa Sewa */}
            <div className="space-y-3 bg-white dark:bg-[#14261c] p-3.5 rounded-xl border border-slate-200/80 dark:border-gray-700 shadow-xs">
              <h4 className="font-bold text-[11px] text-blue-700 dark:text-blue-400 pb-1 uppercase tracking-wide flex items-center gap-1.5 border-b border-blue-100 dark:border-white/10">
                <Box className="w-3.5 h-3.5" /> Vendor & Masa Sewa
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-start">
                {/* Penyedia / Vendor */}
                <div className="sm:col-span-2">
                  <label className={labelCls}>Penyedia / Vendor</label>
                  <VendorSelectDropdown
                    value={formData.penyedia || ""}
                    onChange={(val) => setFormData((p) => ({ ...p, penyedia: val }))}
                    onSelect={(v) => setFormData((p) => ({ ...p, penyedia: v.nama }))}
                    vendors={vendors}
                    disabled={isSaving}
                    placeholder="Pilih atau ketik vendor..."
                    inputCls={inputCls}
                  />
                </div>

                {/* Tgl Mulai Sewa */}
                <div>
                  <label className={labelCls}>Tgl Mulai Sewa</label>
                  <input
                    type="date"
                    value={formData.tanggalMulai || ""}
                    onChange={(e) => handleDateChange("tanggalMulai", e.target.value)}
                    disabled={isSaving}
                    className={inputCls}
                  />
                </div>

                {/* Tgl Selesai Sewa */}
                <div>
                  <label className={labelCls}>Tgl Selesai Sewa</label>
                  <input
                    type="date"
                    value={formData.tanggalSelesai || ""}
                    onChange={(e) => handleDateChange("tanggalSelesai", e.target.value)}
                    disabled={isSaving}
                    className={inputCls}
                  />
                </div>

                {/* Status Perangkat */}
                <div>
                  <CustomSelectDropdown
                    label="Status Perangkat"
                    labelCls={labelCls}
                    value={formData.status || "Inventaris"}
                    onChange={(e) => {
                      const val = e.target ? e.target.value : e;
                      setFormData((p) => ({ ...p, status: val }));
                    }}
                    onSelect={(s) => {
                      const val = typeof s === "string" ? s : s.value || s;
                      setFormData((p) => ({ ...p, status: val }));
                    }}
                    options={["Inventaris", "Sewa Berjalan", "Sewa Habis"]}
                    placeholder="Pilih status..."
                    disabled={isSaving}
                    inputCls={`${inputCls} font-medium`}
                  />
                </div>

                {/* Masa Sewa (Bln) */}
                <div>
                  <label className={labelCls}>Masa Sewa (Bln)</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.masaSewaBulan ? `${formData.masaSewaBulan} Bulan` : "-"}
                    className={`${inputCls} bg-gray-100 dark:bg-[#14261c] text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700 cursor-not-allowed font-medium`}
                    placeholder="Otomatis"
                  />
                </div>

                {/* Keterangan / Catatan */}
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

          {/* ── FOOTER ACTIONS ── */}
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
              <span>{editingItem ? "Simpan Perubahan" : "Simpan Data Laptop"}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
