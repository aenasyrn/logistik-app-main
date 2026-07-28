// src/components/DataMaster/BarangFormModal.jsx
"use client";

import { X, Edit, Database, Plus, Loader2 } from "lucide-react";

export default function BarangFormModal({
  isOpen,
  editingInv,
  isSaving,
  calculatedStatus,
  onClose,
  onSubmit,
  onDateChange,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-start sm:items-center justify-center p-4 pt-12 pb-12 sm:pt-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 relative">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-xl">
              {editingInv
                ? <Edit className="w-5 h-5 text-blue-600" />
                : <Database className="w-5 h-5 text-blue-600" />}
            </div>
            <h3 className="font-bold text-lg text-gray-800">
              {editingInv ? "Edit Data Barang" : "Tambah Master Barang"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="formBarang" onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

              <div className="md:col-span-2">
                <label className="block text-sm mb-1.5 font-medium text-gray-700">Nama Barang *</label>
                <input
                  name="nama"
                  defaultValue={editingInv?.nama || ""}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-1.5 font-medium text-gray-700">Stok *</label>
                <input
                  name="kuantitas"
                  type="number"
                  defaultValue={editingInv?.kuantitas !== undefined ? editingInv.kuantitas : (editingInv?.stok || 0)}
                  min="0"
                  required
                  onFocus={(e) => {
                    if (e.target.value === "0") {
                      e.target.value = "";
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === "") {
                      e.target.value = "0";
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-1.5 font-medium text-gray-700">Satuan *</label>
                <select
                  name="satuan"
                  defaultValue={editingInv?.satuan || "Pcs"}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Pcs</option>
                  <option>Unit</option>
                  <option>Box</option>
                  <option>Set</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm mb-1.5 font-medium text-gray-700">Nama Vendor</label>
                <input
                  name="vendor_nama"
                  defaultValue={editingInv?.vendor_nama || ""}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-1.5 font-medium text-gray-700">No. SPK</label>
                <input
                  name="no_spk"
                  defaultValue={editingInv?.no_spk || ""}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-1.5 font-medium text-gray-700">No. PKS</label>
                <input
                  name="no_pks"
                  defaultValue={editingInv?.no_pks || ""}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-1.5 font-medium text-gray-700">Tgl Mulai</label>
                <input
                  name="tanggal_mulai"
                  type="date"
                  defaultValue={editingInv?.tanggal_mulai || ""}
                  onChange={onDateChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-1.5 font-medium text-gray-700">Tgl Selesai</label>
                <input
                  name="tanggal_selesai"
                  type="date"
                  defaultValue={editingInv?.tanggal_selesai || ""}
                  onChange={onDateChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-1.5 font-medium text-gray-700">Status</label>
                <input type="hidden" name="status" value={calculatedStatus} />
                <input
                  type="text"
                  readOnly
                  value={calculatedStatus}
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm mb-1.5 font-medium text-gray-700">Masa Sewa (Bln)</label>
                <input
                  name="masa_sewa_bulan"
                  type="number"
                  min="0"
                  defaultValue={editingInv?.masa_sewa_bulan || ""}
                  readOnly
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
              </div>
              {/* Footer tombol */}
              <div className="md:col-span-4 flex justify-end gap-3 mt-4 border-t pt-6 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 disabled:bg-blue-400"
                >
                  {isSaving
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : <Plus className="w-5 h-5" />}
                  {editingInv ? "Simpan Perubahan" : "Simpan Barang"}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}