// src/components/DataPerangkat/DataPrinter/PrinterModal.jsx
"use client";

import React from "react";
import { X, Loader2 } from "lucide-react";

export default function PrinterModal({
  isOpen,
  editingId,
  formData,
  setFormData,
  isSaving,
  outletsList,
  inventoryList,
  snList,
  onClose,
  onSave,
  onOutletChange,
  onProdukChange,
  onDateChange,
}) {
  if (!isOpen) return null;

  return (
    // 1. Overlay penuh dengan padding agar tidak menempel di tepi layar HP
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
      
      {/* 2. Container dibatasi max-height agar tidak menabrak batas layar */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* ── HEADER: Tetap menempel di atas (shrink-0) ── */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <h3 className="font-bold text-lg text-gray-800">
            {editingId ? "Edit Data Printer" : "Tambah Printer Baru"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Tutup modal"
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form membungkus Body dan Footer */}
        <form onSubmit={onSave} className="flex flex-col flex-1 overflow-hidden">
          
          {/* ── BODY: Area form yang bisa di-scroll (overflow-y-auto) ── */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              
              {/* Nama Outlet */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Outlet</label>
                <input
                  required
                  type="text"
                  list="outlets-suggestions"
                  value={formData.outlet}
                  onChange={onOutletChange}
                  disabled={isSaving}
                  className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 text-sm"
                  placeholder="Ketik untuk mencari outlet..."
                />
                <datalist id="outlets-suggestions">
                  {outletsList.map((o) => (
                    <option key={o.id} value={o.nama} />
                  ))}
                </datalist>
              </div>

              {/* ID Outlet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Outlet (Kode)</label>
                <input
                  required
                  type="text"
                  readOnly
                  value={formData.idOutlet}
                  className="w-full px-3 py-2.5 border rounded-lg bg-gray-100 text-gray-500 outline-none cursor-not-allowed text-sm"
                  placeholder="Otomatis terisi..."
                />
              </div>

              {/* Produk */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produk Hardware</label>
                <input
                  required
                  type="text"
                  list="produk-suggestions"
                  value={formData.produk}
                  onChange={onProdukChange}
                  disabled={isSaving}
                  className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 text-sm"
                  placeholder="Ketik untuk mencari produk..."
                />
                <datalist id="produk-suggestions">
                  {inventoryList.map((inv) => (
                    <option key={inv.id} value={inv.nama} />
                  ))}
                </datalist>
              </div>

              {/* Serial Number */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number (SN)</label>
                <input
                  required
                  type="text"
                  list="sn-suggestions"
                  value={formData.sn}
                  onChange={(e) => setFormData((p) => ({ ...p, sn: e.target.value }))}
                  disabled={isSaving}
                  className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 text-sm font-mono"
                  placeholder="Ketik atau pilih SN..."
                />
                <datalist id="sn-suggestions">
                  {snList.map((sn, idx) => (
                    <option key={idx} value={sn} />
                  ))}
                </datalist>
              </div>

              {/* Penyedia */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Penyedia</label>
                <input
                  required
                  type="text"
                  value={formData.penyedia}
                  onChange={(e) => setFormData((p) => ({ ...p, penyedia: e.target.value }))}
                  disabled={isSaving}
                  className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 text-sm"
                  placeholder="Otomatis terisi jika ada..."
                />
              </div>

              {/* Tgl Mulai */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tgl Mulai Sewa</label>
                <input
                  type="date"
                  value={formData.tanggalMulai}
                  onChange={(e) => onDateChange("tanggalMulai", e.target.value)}
                  disabled={isSaving}
                  className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 text-sm"
                />
              </div>

              {/* Tgl Selesai */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tgl Selesai Sewa</label>
                <input
                  type="date"
                  value={formData.tanggalSelesai}
                  onChange={(e) => onDateChange("tanggalSelesai", e.target.value)}
                  disabled={isSaving}
                  className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 text-sm"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status (Otomatis)</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                  disabled={isSaving}
                  className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100 font-medium text-sm"
                >
                  <option value="Inventaris">Inventaris</option>
                  <option value="Sewa Berjalan">Sewa Berjalan</option>
                  <option value="Sewa Habis">Sewa Habis</option>
                </select>
              </div>

              {/* Kondisi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi</label>
                <select
                  value={formData.kondisi}
                  onChange={(e) => setFormData((p) => ({ ...p, kondisi: e.target.value }))}
                  disabled={isSaving}
                  className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100 text-sm"
                >
                  <option value="BAIK">BAIK</option>
                  <option value="KURANG BAIK">KURANG BAIK</option>
                  <option value="RUSAK">RUSAK</option>
                </select>
              </div>

              {/* Deskripsi */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Tambahan</label>
                <textarea
                  rows="2"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData((p) => ({ ...p, deskripsi: e.target.value }))}
                  disabled={isSaving}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 text-sm custom-scrollbar"
                  placeholder="Isi jika ada catatan tambahan..."
                />
              </div>
            </div>
          </div>

          {/* ── FOOTER: Tetap menempel di bawah (shrink-0) ── */}
          <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-white shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="w-full sm:w-auto px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50 text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center gap-2 disabled:bg-blue-400"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId ? "Simpan Perubahan" : "Simpan Printer"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}