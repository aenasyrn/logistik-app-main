"use client";

import { MapPin, X, Edit, Plus, Loader2 } from "lucide-react";

export default function OutletFormModal({ isOpen, onClose, editingOutlet, onSubmit, isSaving }) {
  if (!isOpen) return null; // Jika state isOpen false, modal tidak dirender sama sekali

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-start sm:items-center justify-center p-4 pt-12 pb-12 sm:pt-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 relative">
        
        {/* HEADER MODAL */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-xl">
              {editingOutlet ? <Edit className="w-5 h-5 text-purple-600" /> : <MapPin className="w-5 h-5 text-purple-600" />}
            </div>
            <h3 className="font-bold text-lg text-gray-800">
              {editingOutlet ? "Edit Instansi" : "Tambah Instansi Baru"}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* KONTEN FORM */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm mb-1.5">Kode Outlet (Opsional)</label>
              <input 
                name="kode" 
                defaultValue={editingOutlet?.kode || ""} 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" 
              />
            </div>
            <div>
              <label className="block text-sm mb-1.5">Nama Outlet / Instansi *</label>
              <input 
                name="nama" 
                defaultValue={editingOutlet?.nama || ""} 
                required 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" 
              />
            </div>
            
            {/* TOMBOL AKSI */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2 border-t pt-5 shrink-0">
              <button 
                type="button" 
                onClick={onClose} 
                disabled={isSaving} 
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={isSaving} 
                className="px-6 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin"/> : <Plus className="w-5 h-5"/>} 
                {editingOutlet ? "Simpan Perubahan" : "Simpan Outlet"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}