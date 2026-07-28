import React, { useState, useEffect, useRef } from "react";
import { X, Loader2 } from "lucide-react";

const SearchableSelect = ({ label, value, onChange, options, placeholder, disabled, className, labelCls }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.nama?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative w-full text-left">
      <label className={labelCls}>{label}</label>
      <div 
        onClick={() => { if (!disabled) { setIsOpen(!isOpen); setSearch(""); } }}
        className={`w-full px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white cursor-pointer flex justify-between items-center text-xs ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <svg className="w-4 h-4 text-gray-400 shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto flex flex-col p-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari..."
            className="w-full px-2 py-1 mb-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
          <div className="overflow-y-auto max-h-48 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-xs text-gray-500 text-center">Tidak ada hasil</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange({ target: { value: opt.nama } });
                    setIsOpen(false);
                  }}
                  className="px-2.5 py-1.5 text-xs text-gray-700 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors text-left"
                >
                  {opt.nama}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function KomputerModal({
  isOpen,
  editingId,
  formData,
  setFormData,
  isSaving,
  outletsList,
  inventoryList,
  onClose,
  onSave,
  onOutletChange,
  onProdukChange,
  onDateChange,
}) {
  if (!isOpen) return null;

  const inputCls =
    "w-full px-2.5 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs";
  const inputPurple =
    "w-full px-2.5 py-1.5 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-xs";
  const labelCls = "block text-[11px] font-medium text-gray-600 mb-0.5";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col max-h-[95vh] sm:max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* ── HEADER ── */}
        <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0 rounded-t-2xl">
          <h3 className="font-bold text-sm text-gray-800">
            {editingId ? "Edit Data Komputer" : "Tambah PC Baru"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Tutup modal"
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSave} className="flex flex-col flex-1 overflow-hidden">

          {/* ── BODY ── */}
          <div className="p-3 sm:p-4 overflow-y-auto flex-1 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* ── KOLOM KIRI ── */}
              <div className="space-y-3">
                <h4 className="font-bold text-[11px] text-blue-600 border-b pb-1.5 uppercase tracking-wide">
                  Informasi Hardware & Lokasi
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Nama Outlet */}
                  <div className="sm:col-span-2">
                    <SearchableSelect
                      label="Nama Outlet"
                      value={formData.outlet}
                      onChange={onOutletChange}
                      options={outletsList}
                      placeholder="Pilih outlet..."
                      disabled={isSaving}
                      className={inputCls}
                      labelCls={labelCls}
                    />
                  </div>

                  {/* ID Outlet */}
                  <div>
                    <label className={labelCls}>ID Outlet</label>
                    <input
                      required type="text" readOnly value={formData.idOutlet}
                      className={`${inputCls} bg-gray-100 text-gray-500`}
                      placeholder="Otomatis"
                    />
                  </div>

                  {/* Produk */}
                  <div className="sm:col-span-2">
                    <SearchableSelect
                      label="Produk / Model PC"
                      value={formData.produk}
                      onChange={onProdukChange}
                      options={inventoryList}
                      placeholder="Pilih produk..."
                      disabled={isSaving}
                      className={inputCls}
                      labelCls={labelCls}
                    />
                  </div>

                  {/* Serial Number */}
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Serial Number (SN)</label>
                    <input
                      required type="text" value={formData.sn}
                      onChange={(e) => setFormData((p) => ({ ...p, sn: e.target.value }))}
                      disabled={isSaving}
                      className={`${inputCls} font-mono`} placeholder="Ketik SN..."
                    />
                  </div>

                  {/* Kondisi */}
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Kondisi</label>
                    <select
                      value={formData.kondisi}
                      onChange={(e) => setFormData((p) => ({ ...p, kondisi: e.target.value }))}
                      disabled={isSaving}
                      className={`${inputCls} bg-white`}
                    >
                      <option value="BAIK">BAIK</option>
                      <option value="KURANG BAIK">KURANG BAIK</option>
                      <option value="RUSAK">RUSAK</option>
                    </select>
                  </div>
                </div>

                {/* Vendor & Masa Sewa */}
                <h4 className="font-bold text-[11px] text-blue-600 border-b pb-1.5 pt-1 uppercase tracking-wide">
                  Vendor & Masa Sewa
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Penyedia / Vendor</label>
                    <input
                      required type="text" value={formData.penyedia}
                      onChange={(e) => setFormData((p) => ({ ...p, penyedia: e.target.value }))}
                      disabled={isSaving}
                      className={inputCls} placeholder="Otomatis atau isi manual..."
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Tgl Mulai Sewa</label>
                    <input
                      type="date" value={formData.tanggalMulai}
                      onChange={(e) => onDateChange("tanggalMulai", e.target.value)}
                      disabled={isSaving} className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Tgl Selesai Sewa</label>
                    <input
                      type="date" value={formData.tanggalSelesai}
                      onChange={(e) => onDateChange("tanggalSelesai", e.target.value)}
                      disabled={isSaving} className={inputCls}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Status (Otomatis)</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                      disabled={isSaving}
                      className={`${inputCls} bg-gray-100 font-medium`}
                    >
                      <option value="Inventaris">Inventaris</option>
                      <option value="Sewa Berjalan">Sewa Berjalan</option>
                      <option value="Sewa Habis">Sewa Habis</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── KOLOM KANAN ── */}
              <div className="space-y-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                <h4 className="font-bold text-[11px] text-purple-600 border-b border-purple-100 pb-1.5 uppercase tracking-wide">
                  Jaringan & Spesifikasi
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>IP Address</label>
                    <input
                      type="text" value={formData.ipAddress}
                      onChange={(e) => setFormData((p) => ({ ...p, ipAddress: e.target.value }))}
                      disabled={isSaving}
                      className={`${inputPurple} font-mono text-blue-700`}
                      placeholder="10.81..."
                    />
                  </div>
                  <div>
                    <label className={labelCls}>MAC Address</label>
                    <input
                      type="text" value={formData.macAddress}
                      onChange={(e) => setFormData((p) => ({ ...p, macAddress: e.target.value }))}
                      disabled={isSaving}
                      className={`${inputPurple} font-mono`}
                      placeholder="ac:b4:80..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Processor (CPU)</label>
                    <input
                      type="text" value={formData.cpu}
                      onChange={(e) => setFormData((p) => ({ ...p, cpu: e.target.value }))}
                      disabled={isSaving}
                      className={inputPurple} placeholder="Misal: Intel Core i5"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Kapasitas RAM</label>
                    <input
                      type="text" value={formData.ram}
                      onChange={(e) => setFormData((p) => ({ ...p, ram: e.target.value }))}
                      disabled={isSaving}
                      className={inputPurple} placeholder="Misal: 16 GB"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Storage / Disk</label>
                    <input
                      type="text" value={formData.storage}
                      onChange={(e) => setFormData((p) => ({ ...p, storage: e.target.value }))}
                      disabled={isSaving}
                      className={inputPurple} placeholder="Misal: 512GB SSD"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Operating System (OS)</label>
                    <input
                      type="text" value={formData.os}
                      onChange={(e) => setFormData((p) => ({ ...p, os: e.target.value }))}
                      disabled={isSaving}
                      className={inputPurple} placeholder="Ubuntu Pegadaian V.22..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Keterangan</label>
                    <textarea
                      rows="3" value={formData.keterangan || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, keterangan: e.target.value }))}
                      disabled={isSaving}
                      className={`${inputPurple} resize-none custom-scrollbar`}
                      placeholder="Isi jika ada kerusakan atau catatan..."
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── FOOTER ── */}
          <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-white shrink-0 rounded-b-2xl flex flex-col-reverse sm:flex-row justify-end gap-2">
            <button
              type="button" onClick={onClose} disabled={isSaving}
              className="w-full sm:w-auto px-5 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors disabled:opacity-50 text-center"
            >
              Batal
            </button>
            <button
              type="submit" disabled={isSaving}
              className="w-full sm:w-auto px-5 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition-colors flex items-center justify-center gap-2 disabled:bg-blue-400"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editingId ? "Simpan Perubahan" : "Tambahkan PC"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}