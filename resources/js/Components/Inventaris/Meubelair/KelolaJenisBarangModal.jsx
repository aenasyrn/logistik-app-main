// resources/js/Components/Inventaris/Meubelair/KelolaJenisBarangModal.jsx
import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Tag, Loader2, AlertCircle } from "lucide-react";
import { addJenisMeubelair, deleteJenisMeubelair } from "../../../services/meubelairService";

export default function KelolaJenisBarangModal({
  isOpen,
  onClose,
  jenisList = [],
  onJenisUpdated,
}) {
  const [newJenis, setNewJenis] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [items, setItems] = useState(() => (Array.isArray(jenisList) ? jenisList : []));

  useEffect(() => {
    if (Array.isArray(jenisList)) {
      setItems(jenisList);
    }
  }, [jenisList]);

  if (!isOpen) return null;

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmed = newJenis.trim();
    if (!trimmed) return;

    // Check duplicate locally first
    const exists = items.some(
      (j) => (typeof j === "string" ? j : j.nama || "").toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setErrorMsg(`Jenis barang "${trimmed}" sudah ada.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const created = await addJenisMeubelair(trimmed);
      setNewJenis("");
      if (created && created.id) {
        setItems((prev) => [...prev, created]);
      }
      if (onJenisUpdated) {
        await onJenisUpdated(trimmed);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Gagal menambahkan jenis barang.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Yakin ingin menghapus jenis barang "${item.nama}"?`)) return;

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await deleteJenisMeubelair(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      if (onJenisUpdated) {
        await onJenisUpdated();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Gagal menghapus jenis barang.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100000] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#101e16] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh] overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#0d5c3a] to-[#279969] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <Tag className="w-5 h-5 text-emerald-200" />
            <h3 className="font-bold text-base text-white">Kelola Jenis Barang</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Add Form */}
          <form onSubmit={handleAdd} className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Tambah Jenis Barang Baru (Khusus Admin)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newJenis}
                onChange={(e) => {
                  setNewJenis(e.target.value);
                  setErrorMsg("");
                }}
                placeholder="Contoh: Partisi, Brankas, dll"
                disabled={isSubmitting}
                className="flex-1 px-3.5 py-2 text-xs bg-gray-50 dark:bg-[#16251c] border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#0d5c3a] dark:text-white outline-none"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newJenis.trim()}
                className="px-4 py-2 bg-[#0d5c3a] hover:bg-[#094229] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Tambah
              </button>
            </div>
            {errorMsg && (
              <div className="flex items-center gap-1.5 text-red-500 text-xs mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </form>

          {/* List of existing Jenis Barang */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              Daftar Jenis Barang Aktif ({items.length})
            </label>
            <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden max-h-56 overflow-y-auto custom-scrollbar">
              {items.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">
                  Belum ada jenis barang.
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id || item.nama}
                    className="flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-[#142319] hover:bg-gray-50 dark:hover:bg-[#1a2c20] transition-colors text-xs"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {item.nama}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={isSubmitting}
                      className="p-1.5 text-red-500 hover:text-red-700 bg-red-50/60 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 rounded-lg transition-colors cursor-pointer"
                      title={`Hapus ${item.nama}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-gray-50 dark:bg-[#142319] border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
