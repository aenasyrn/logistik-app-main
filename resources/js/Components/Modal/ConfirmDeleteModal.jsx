// src/components/shared/ConfirmDeleteModal.jsx
"use client";

import { Loader2, AlertTriangle } from "lucide-react";

/**
 * Modal konfirmasi hapus yang bisa dipakai di seluruh halaman.
 *
 * @param {boolean}  show        — tampilkan modal atau tidak
 * @param {string}   name        — nama item yang akan dihapus
 * @param {boolean}  isSaving    — status loading saat proses hapus
 * @param {function} onConfirm   — callback saat tombol "YA, HAPUS" diklik
 * @param {function} onCancel    — callback saat tombol "BATAL" diklik
 */
export default function ConfirmDeleteModal({ show, name, isSaving, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">Konfirmasi Hapus</h3>
          <p className="text-sm text-gray-500">
            Yakin hapus <span className="font-bold text-gray-800">{name}</span>?
          </p>
        </div>
        <div className="flex border-t border-gray-100">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 px-4 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50 border-r border-gray-100 disabled:opacity-50"
          >
            BATAL
          </button>
          <button
            onClick={onConfirm}
            disabled={isSaving}
            className="flex-1 px-4 py-4 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "YA, HAPUS"}
          </button>
        </div>
      </div>
    </div>
  );
}