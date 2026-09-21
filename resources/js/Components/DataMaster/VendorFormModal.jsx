import React from "react";
import { Building2, X, Edit, Loader2 } from "lucide-react";

export default function VendorFormModal({ isOpen, onClose, editingVendor, onSubmit, isSaving }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 relative overflow-hidden border border-gray-100">

        {/* HEADER MODAL */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0d5c3a] via-[#156e49] to-[#279969] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl border border-white/20">
              <Building2 className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight text-white">
                {editingVendor ? "Edit Data Vendor" : "Tambah Vendor Baru"}
              </h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Kelola data rekanan vendor, penanggung jawab, kontak, dan rekening.
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

        {/* FORM CONTAINER */}
        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          
          {/* KONTEN INPUT FORM (Scrollable) */}
          <div className="p-6 sm:p-7 flex flex-col gap-5 overflow-y-auto custom-scrollbar flex-1">
            
            {/* Field 1: Nama Perusahaan / PT * */}
            <div>
              <label className="block text-sm mb-1.5 font-semibold text-gray-800">
                Nama Perusahaan / PT <span className="text-rose-500">*</span>
              </label>
              <input
                name="nama"
                defaultValue={editingVendor?.nama || ""}
                required
                placeholder="PT. DANAKAR"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#1b7e47] focus:border-transparent text-sm text-gray-800 placeholder-gray-400 transition-all"
              />
            </div>

            {/* Field Row 2: Nama Pimpinan / Penanggung Jawab & Jabatan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1.5 font-semibold text-gray-800">
                  Nama Pimpinan / Penanggung Jawab
                </label>
                <input
                  name="pimpinan"
                  defaultValue={editingVendor?.pimpinan || ""}
                  placeholder="HUSEIN IZZATI"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#1b7e47] focus:border-transparent text-sm text-gray-800 placeholder-gray-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm mb-1.5 font-semibold text-gray-800">
                  Jabatan
                </label>
                <input
                  name="jabatan"
                  defaultValue={editingVendor?.jabatan || ""}
                  placeholder="Direktur"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#1b7e47] focus:border-transparent text-sm text-gray-800 placeholder-gray-400 transition-all"
                />
              </div>
            </div>

            {/* Field Row 3: Bidang Pekerjaan / Keterangan & Sertifikat DRM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1.5 font-semibold text-gray-800">
                  Bidang Pekerjaan / Keterangan
                </label>
                <input
                  name="bidang"
                  defaultValue={editingVendor?.bidang || ""}
                  placeholder="BANGUNAN"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#1b7e47] focus:border-transparent text-sm text-gray-800 placeholder-gray-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm mb-1.5 font-semibold text-gray-800">
                  Sertifikat DRM
                </label>
                <input
                  name="sertifikat_drm"
                  defaultValue={editingVendor?.sertifikat_drm || ""}
                  placeholder="001/DRM/2026"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#1b7e47] focus:border-transparent text-sm text-gray-800 placeholder-gray-400 transition-all"
                />
              </div>
            </div>

            {/* Field Row 4: Masa Berlaku Sertifikat DRM (Tanggal Awal & Tanggal Akhir) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1.5 font-semibold text-gray-800">
                  Masa Berlaku DRM (Tanggal Awal)
                </label>
                <input
                  type="date"
                  name="tgl_awal_drm"
                  defaultValue={editingVendor?.tgl_awal_drm ? editingVendor.tgl_awal_drm.slice(0, 10) : ""}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#1b7e47] focus:border-transparent text-sm text-gray-800 placeholder-gray-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm mb-1.5 font-semibold text-gray-800">
                  Masa Berlaku DRM (Tanggal Akhir)
                </label>
                <input
                  type="date"
                  name="tgl_akhir_drm"
                  defaultValue={editingVendor?.tgl_akhir_drm ? editingVendor.tgl_akhir_drm.slice(0, 10) : ""}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#1b7e47] focus:border-transparent text-sm text-gray-800 placeholder-gray-400 transition-all"
                />
              </div>
            </div>

            {/* Field Row 5: Kota Operasional & No. Telepon / WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1.5 font-semibold text-gray-800">
                  Kota Operasional
                </label>
                <input
                  name="kota"
                  defaultValue={editingVendor?.kota || ""}
                  placeholder="JAKARTA"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#1b7e47] focus:border-transparent text-sm text-gray-800 placeholder-gray-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm mb-1.5 font-semibold text-gray-800">
                  No. Telepon / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="no_telpon"
                  defaultValue={editingVendor?.no_telpon || ""}
                  required
                  placeholder="081297220944"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#1b7e47] focus:border-transparent text-sm text-gray-800 placeholder-gray-400 transition-all"
                />
              </div>
            </div>

            {/* Field Row 5: Alamat Perusahaan */}
            <div>
              <label className="block text-sm mb-1.5 font-semibold text-gray-800">
                Alamat Perusahaan
              </label>
              <textarea
                name="alamat"
                rows={3}
                defaultValue={editingVendor?.alamat || ""}
                placeholder="Jl. Otista Raya No. 68A, Bidara Cina, Jatinegara"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#1b7e47] focus:border-transparent text-sm text-gray-800 placeholder-gray-400 custom-scrollbar resize-none transition-all"
              />
            </div>
          </div>

          {/* FOOTER ACTION */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end items-center gap-3 shrink-0 rounded-b-2xl sm:rounded-b-3xl">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-200/70 transition-all border border-gray-200 bg-white cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#0d5c3a] hover:bg-[#156e49] shadow-md shadow-[#0d5c3a]/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan...
                </>
              ) : (
                editingVendor ? "Simpan Perubahan" : "Simpan Vendor"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
