// resources/js/Components/Inventaris/Meubelair/MeubelairModal.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Loader2, MapPin, Hash, CheckCircle, Info, Building2 } from "lucide-react";
import CustomSelectDropdown from "../../Form/CustomSelectDropdown";

export default function MeubelairModal({
  isOpen,
  onClose,
  editingItem = null,
  kategoriDefault = "Meja",
  outlets = [],
  onSave,
  isSaving = false,
  userRole = "user",
  jenisList = [],
}) {
  const [formData, setFormData] = useState({
    kategori: "Meja",
    jenis: "",
    quantity: "",
    outlet_id: null,
    lokasi: "",
    kondisi: "Baik",
    tanggal_register: "",
    keterangan: "",
  });

  const [errors, setErrors] = useState({});

  const jenisOptions = useMemo(() => {
    const list = (jenisList || []).map((j) => (typeof j === "string" ? j : j.nama || ""));
    const defaults = ["Meja", "Kursi", "Lemari", "Sofa", "AC"];
    return Array.from(new Set([...defaults, ...list].filter(Boolean)));
  }, [jenisList]);

  useEffect(() => {
    if (editingItem) {
      const normKondisi = editingItem.kondisi && editingItem.kondisi.toLowerCase().includes("kurang") 
        ? "Kurang Baik" 
        : "Baik";

      const currentOutletName = editingItem.lokasi || (editingItem.outlet_rel ? (editingItem.outlet_rel.nama || editingItem.outlet_rel.nama_outlet) : "");

      setFormData({
        kategori: editingItem.kategori || jenisOptions[0] || "Meja",
        jenis: editingItem.jenis || "",
        quantity: editingItem.quantity || 1,
        outlet_id: editingItem.outlet_id || null,
        lokasi: currentOutletName,
        kondisi: normKondisi,
        tanggal_register: editingItem.tanggal_register ? String(editingItem.tanggal_register).slice(0, 10) : "",
        keterangan: editingItem.keterangan || "",
      });
    } else {
      setFormData({
        kategori: kategoriDefault || jenisOptions[0] || "Meja",
        jenis: "",
        quantity: "",
        outlet_id: null,
        lokasi: "",
        kondisi: "Baik",
        tanggal_register: "",
        keterangan: "",
      });
    }
    setErrors({});
  }, [editingItem, isOpen, kategoriDefault, jenisOptions]);

  // Tutup modal jika tombol Escape ditekan
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isSaving) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  // Options untuk dropdown outlet persis seperti Data Komputer
  const outletOptions = useMemo(() => {
    return (outlets || []).map((o) => {
      const outletName = o.nama || o.nama_outlet || "";
      const outletCode = o.code || o.kode || o.kode_outlet || o.id || "-";
      return {
        id: o.id,
        value: outletName,
        label: outletName,
        nama: outletName,
        subtext: `Kode / ID: ${outletCode}`,
        raw: o,
      };
    });
  }, [outlets]);

  const handleOutletChange = (val) => {
    const rawVal = typeof val === "object" && val !== null 
      ? (val.nama || val.value || val.label || "") 
      : (val || "");

    const matchedOutlet = (outlets || []).find((o) => {
      const oName = o.nama || o.nama_outlet;
      return (
        (oName && String(oName).toLowerCase() === String(rawVal).toLowerCase()) ||
        String(o.id) === String(rawVal)
      );
    });

    if (matchedOutlet) {
      setFormData((prev) => ({
        ...prev,
        outlet_id: matchedOutlet.id,
        lokasi: matchedOutlet.nama || matchedOutlet.nama_outlet,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        outlet_id: null,
        lokasi: typeof rawVal === "string" ? rawVal : "",
      }));
    }
  };

  // Cari kode outlet terpilih untuk ditampilkan pada input otomatis
  const selectedOutletCode = useMemo(() => {
    const matched = (outlets || []).find((o) => 
      (formData.outlet_id && String(o.id) === String(formData.outlet_id)) ||
      (formData.lokasi && (o.nama === formData.lokasi || o.nama_outlet === formData.lokasi))
    );
    return matched?.code || matched?.kode || (formData.outlet_id ? String(formData.outlet_id) : "");
  }, [outlets, formData.outlet_id, formData.lokasi]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.kategori || !formData.kategori.trim()) {
      setErrors({ kategori: "Jenis barang wajib dipilih" });
      return;
    }
    if (!formData.jenis || !formData.jenis.trim()) {
      setErrors({ jenis: "Type barang wajib diisi" });
      return;
    }
    const parsedQty = formData.quantity === "" ? 1 : parseInt(formData.quantity, 10);
    if (isNaN(parsedQty) || parsedQty < 1) {
      setErrors({ quantity: "Quantity minimal 1" });
      return;
    }

    onSave({
      ...formData,
      kode_outlet: selectedOutletCode,
      quantity: parsedQty,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isSaving) onClose();
        }}
      >
        <div className="bg-white dark:bg-gradient-to-b dark:from-[#052819] dark:via-[#073622] dark:to-[#03140d] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
          {/* Header Modal */}
          <div className="px-6 py-5 bg-gradient-to-r from-[#0d5c3a] via-[#156e49] to-[#279969] text-white flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight text-white">
                {editingItem ? "Edit Data Meubelair" : "Tambah Data Meubelair"}
              </h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Kelola data inventaris perabot meubelair dan lokasi penempatannya.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              {/* Jenis Barang */}
              <div>
                <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1.5">
                  Jenis Barang <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.kategori}
                    onChange={(e) => {
                      setFormData({ ...formData, kategori: e.target.value });
                      if (errors.kategori) setErrors({ ...errors, kategori: null });
                    }}
                    disabled={isSaving}
                    aria-label="Pilih Jenis Barang"
                    style={{ WebkitAppearance: "none", MozAppearance: "none", appearance: "none", backgroundImage: "none" }}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-semibold text-gray-900 dark:text-white cursor-pointer transition-all appearance-none bg-none"
                  >
                    {Array.from(new Set([formData.kategori, ...jenisOptions].filter(Boolean))).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.kategori && <p className="text-xs text-red-500 mt-1">{errors.kategori}</p>}
              </div>

              {/* Input: Type Barang */}
              <div>
                <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1.5">
                  Type Barang <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.jenis}
                  onChange={(e) => {
                    setFormData({ ...formData, jenis: e.target.value });
                    if (errors.jenis) setErrors({ ...errors, jenis: null });
                  }}
                  disabled={isSaving}
                  placeholder="Contoh: Meja Kerja 1/2 Biro, Kursi Putar Staff, dsb."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                />
                {errors.jenis && <p className="text-xs text-red-500 mt-1">{errors.jenis}</p>}
              </div>

              {/* Grid 2 Kolom: Quantity & Tanggal Register */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Quantity */}
                <div>
                  <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1.5">
                    Quantity (Jumlah) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setFormData({ ...formData, quantity: "" });
                        return;
                      }
                      const num = parseInt(val, 10);
                      setFormData({ ...formData, quantity: isNaN(num) ? "" : num });
                      if (errors.quantity) setErrors({ ...errors, quantity: null });
                    }}
                    disabled={isSaving}
                    placeholder="1"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-semibold text-gray-900 dark:text-white transition-all"
                  />
                  {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
                </div>

                {/* Tanggal Register */}
                <div>
                  <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1.5">
                    Tanggal Registrasi
                  </label>
                  <input
                    type="date"
                    value={formData.tanggal_register || ""}
                    onChange={(e) => setFormData({ ...formData, tanggal_register: e.target.value })}
                    disabled={isSaving}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-semibold text-gray-900 dark:text-white cursor-pointer transition-all"
                  />
                </div>
              </div>

              {/* Grid 3 Kolom: Nama Outlet & ID Outlet (Persis Data Komputer) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <CustomSelectDropdown
                    label="Nama Outlet / Lokasi"
                    labelCls="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1.5"
                    inputCls="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                    value={formData.lokasi}
                    onChange={(e) => handleOutletChange(e.target ? e.target.value : e)}
                    onSelect={(o) => handleOutletChange(o.nama || o.value || o.label || o)}
                    options={outletOptions}
                    placeholder="Pilih atau cari outlet..."
                    disabled={isSaving}
                    allowCustomInput={true}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1.5">
                    Kode Outlet
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={selectedOutletCode || ""}
                    className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-[#14261c] border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    placeholder="Otomatis"
                  />
                </div>
              </div>

              {/* Input: Kondisi */}
              <div>
                <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1.5">
                  Kondisi Barang
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["Baik", "Kurang Baik"].map((k) => {
                    const isSelected = (formData.kondisi || "").toLowerCase() === k.toLowerCase();
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setFormData({ ...formData, kondisi: k })}
                        disabled={isSaving}
                        className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                          isSelected
                            ? k === "Baik"
                              ? "bg-emerald-50 text-[#0d5c3a] border-[#0d5c3a] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700 shadow-xs"
                              : "bg-amber-50 text-amber-700 border-amber-500 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700 shadow-xs"
                            : "bg-white dark:bg-[#14261c] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-[#1a2e22]"
                        }`}
                      >
                        {k}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input: Keterangan */}
              <div>
                <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1.5">
                  Keterangan Tambahan
                </label>
                <textarea
                  rows="2"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  disabled={isSaving}
                  placeholder="Catatan mengenai perabot (warna, merk, kode barang, nomor ruangan, dll)..."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none custom-scrollbar transition-all"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-[#03140d] border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-3 shrink-0 rounded-b-2xl sm:rounded-b-3xl">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-5 py-2.5 bg-white dark:bg-[#14261c] border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-[#1a2e22] rounded-full text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#0d5c3a] hover:bg-[#156e49] text-white rounded-full text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50 shadow-md shadow-[#0d5c3a]/25 cursor-pointer"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingItem ? "Simpan Perubahan" : "Tambah Data Meubelair"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
