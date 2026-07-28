// resources/js/Components/Bangunan/Sewa/SewaModal.jsx
"use client";

import React from "react";
import { X, Loader2, Key, Plus, Edit } from "lucide-react";

export default function SewaModal({
  isOpen,
  editingId,
  formData,
  setFormData,
  isSaving,
  outletsList,
  onClose,
  onSave,
}) {
  if (!isOpen) return null;

  const handleOutletChange = (e) => {
    const val = e.target.value;
    const matched = outletsList.find((o) => o.nama.toLowerCase() === val.toLowerCase());
    setFormData((p) => ({
      ...p,
      nama_outlet: val,
      outlet: val,
      idOutlet: matched ? matched.id : "",
      outlet_id: matched ? matched.id : "",
      kode_outlet: matched ? (matched.code || String(matched.id)) : p.kode_outlet || "",
      alamat: matched ? (matched.alamat || "") : p.alamat || "",
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-gray-800">
              {editingId ? "Edit Sewa Bangunan" : "Tambah Sewa Bangunan Baru"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSave} className="flex flex-col flex-1 overflow-hidden">
          
          {/* Body */}
          <div className="p-5 overflow-y-auto flex-1 custom-scrollbar gap-4 flex flex-col">
            
            {/* Grid 1: Nama Outlet & Kode Outlet */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Outlet / Instansi *</label>
                <input
                  required
                  type="text"
                  list="outlets-suggestions"
                  value={formData.nama_outlet || formData.outlet || ""}
                  onChange={handleOutletChange}
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Cari atau ketik baru..."
                />
                <datalist id="outlets-suggestions">
                  {outletsList.map((o) => (
                    <option key={o.id} value={o.nama} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kode Outlet</label>
                <input
                  type="text"
                  value={formData.kode_outlet || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, kode_outlet: e.target.value }))}
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                  placeholder="Contoh: 10101"
                />
              </div>
            </div>

            {/* Grid 2: Type Outlet & Type Bangunan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Type Outlet</label>
                <select
                  value={formData.type_outlet || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, type_outlet: e.target.value }))}
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Pilih Type Outlet...</option>
                  {formData.type_outlet && !["Rencana Relokasi/Tutup", "Include UPC", "Induk Cluster", "Anggota Cluster", "Non Cluster", "Mandiri"].includes(formData.type_outlet) && (
                    <option value={formData.type_outlet}>{formData.type_outlet}</option>
                  )}
                  <option value="Rencana Relokasi/Tutup">Rencana Relokasi/Tutup</option>
                  <option value="Include UPC">Include UPC</option>
                  <option value="Induk Cluster">Induk Cluster</option>
                  <option value="Anggota Cluster">Anggota Cluster</option>
                  <option value="Non Cluster">Non Cluster</option>
                  <option value="Mandiri">Mandiri</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Type Bangunan</label>
                <select
                  value={formData.type_bangunan || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, type_bangunan: e.target.value }))}
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Pilih Type Bangunan...</option>
                  {formData.type_bangunan && !["Stand Alone", "Ruko Double", "Ruko Single", "Mall / Kios", "Pasar"].includes(formData.type_bangunan) && (
                    <option value={formData.type_bangunan}>{formData.type_bangunan}</option>
                  )}
                  <option value="Stand Alone">Stand Alone</option>
                  <option value="Ruko Double">Ruko Double</option>
                  <option value="Ruko Single">Ruko Single</option>
                  <option value="Mall / Kios">Mall / Kios</option>
                  <option value="Pasar">Pasar</option>
                </select>
              </div>
            </div>

            {/* Grid 3: Jenis STO & Status Gedung */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis STO</label>
                <input
                  type="text"
                  value={formData.jenis_sto || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, jenis_sto: e.target.value }))}
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Contoh: STO A / STO B"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status Gedung</label>
                <select
                  value={formData.status_gedung || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, status_gedung: e.target.value }))}
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Pilih Status Gedung...</option>
                  <option value="Sewa">Sewa</option>
                  <option value="Milik Sendiri">Milik Sendiri</option>
                </select>
              </div>
            </div>

            {/* Grid 4: Periode Sewa & Harga Sewa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Periode Sewa</label>
                <input
                  type="text"
                  value={formData.periode_sewa || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, periode_sewa: e.target.value }))}
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Contoh: 3 Tahun / 5 Tahun"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga Sewa (Rp/bulan) *</label>
                <input
                  required
                  type="text"
                  value={
                    formData.harga_sewa !== null && formData.harga_sewa !== undefined && formData.harga_sewa !== ""
                      ? Number(String(formData.harga_sewa).replace(/[^0-9]/g, "")).toLocaleString("id-ID")
                      : ""
                  }
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/[^0-9]/g, "");
                    setFormData((p) => ({ ...p, harga_sewa: rawValue }));
                  }}
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  placeholder="Contoh: 12.000.000"
                />
              </div>
            </div>

            {/* Grid 5: Tanggal Sewa & Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Kontrak Mulai *</label>
                <input
                  required
                  type="date"
                  value={formData.tgl_kontrak_mulai || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, tgl_kontrak_mulai: e.target.value }))}
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Kontrak Berakhir *</label>
                <input
                  required
                  type="date"
                  value={formData.tgl_kontrak_berakhir || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, tgl_kontrak_berakhir: e.target.value }))}
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status Kontrak</label>
                <select
                  value={formData.status || "Aktif"}
                  onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Sewa Habis">Sewa Habis</option>
                </select>
              </div>
            </div>

            {/* Alamat (Full Width) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat Lengkap</label>
              <textarea
                rows="2"
                value={formData.alamat || ""}
                onChange={(e) => setFormData((p) => ({ ...p, alamat: e.target.value }))}
                disabled={isSaving}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm custom-scrollbar"
                placeholder="Alamat lengkap gedung sewa..."
              />
            </div>

            {/* Grid 6: Kelurahan & Kecamatan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kelurahan</label>
                <input
                  type="text"
                  value={formData.kelurahan || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, kelurahan: e.target.value }))}
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Kelurahan..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kecamatan</label>
                <input
                  type="text"
                  value={formData.kecamatan || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, kecamatan: e.target.value }))}
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Kecamatan..."
                />
              </div>
            </div>

            {/* Grid 7: Kab/Kota & Provinsi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kab/Kota</label>
                <input
                  type="text"
                  value={formData.kab_kota || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, kab_kota: e.target.value }))}
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Kabupaten atau Kota..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Provinsi</label>
                <input
                  type="text"
                  value={formData.provinsi || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, provinsi: e.target.value }))}
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Provinsi..."
                />
              </div>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Keterangan / Catatan Tambahan</label>
              <textarea
                rows="2"
                value={formData.keterangan || ""}
                onChange={(e) => setFormData((p) => ({ ...p, keterangan: e.target.value }))}
                disabled={isSaving}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm custom-scrollbar"
                placeholder="Catatan tambahan sewa..."
              />
            </div>

          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 text-gray-600 dark:text-[#a4b4a9] hover:bg-gray-100 dark:hover:bg-[#243e2e] dark:hover:text-white rounded-xl font-medium transition-colors text-sm disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors text-sm"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingId ? "Simpan Perubahan" : "Simpan Sewa"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
