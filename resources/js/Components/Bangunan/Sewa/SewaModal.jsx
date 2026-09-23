// resources/js/Components/Bangunan/Sewa/SewaModal.jsx
import React, { useMemo, useEffect } from "react";
import { X, Loader2, Key, Sparkles, Building2, Calendar, MapPin, DollarSign, Edit, Plus } from "lucide-react";
import CustomSelectDropdown from "../../Form/CustomSelectDropdown";

const calculatePeriod = (start, end) => {
  if (!start || !end) return "";
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return "";

  // Add 1 day to end date to handle inclusive date ranges (e.g., 2026-07-30 to 2027-07-29 is 1 year)
  endDate.setDate(endDate.getDate() + 1);

  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();
  let days = endDate.getDate() - startDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const result = [];
  if (years > 0) result.push(`${years} Thn`);
  if (months > 0) result.push(`${months} Bln`);
  if (days > 0 && result.length === 0) result.push(`${days} Hari`);
  return result.join(" ");
};

export default function SewaModal({
  isOpen,
  editingId,
  formData,
  setFormData,
  isSaving,
  outletsList = [],
  onClose,
  onSave,
}) {
  if (!isOpen) return null;

  const inputCls =
    "w-full px-3.5 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all";
  const labelCls = "block text-[11px] font-bold text-gray-900 dark:text-white mb-1";

  // Prepare rich option objects for Master Outlets
  const outletOptions = useMemo(() => {
    return (outletsList || []).map((o) => {
      const subParts = [];
      if (o.code || o.id) subParts.push(`Kode: ${o.code || o.id}`);
      if (o.kab_kota || o.cabang) subParts.push(o.kab_kota || o.cabang);
      if (o.provinsi) subParts.push(o.provinsi);
      return {
        id: o.id,
        value: o.nama,
        label: o.nama,
        subtext: subParts.join(" • ") || "Master Outlet",
        raw: o,
      };
    });
  }, [outletsList]);

  // Check matched outlet
  const matchedOutlet = useMemo(() => {
    const curName = (formData.nama_outlet || formData.outlet || "").trim().toLowerCase();
    const curCode = (formData.kode_outlet || "").trim().toLowerCase();
    if (!curName && !curCode) return null;
    return (outletsList || []).find(
      (o) =>
        (curName && o.nama && o.nama.toLowerCase() === curName) ||
        (curCode && o.code && String(o.code).toLowerCase() === curCode) ||
        (curCode && String(o.id) === curCode)
    );
  }, [formData.nama_outlet, formData.outlet, formData.kode_outlet, outletsList]);

  // Handle outlet change with full auto-fill
  const handleOutletChange = (e) => {
    const val = (typeof e === "object" && e !== null && e.target)
      ? e.target.value
      : (typeof e === "object" && e !== null ? (e.nama || e.value || e.label || "") : (e || ""));

    const strVal = String(val).trim();
    const matched = outletsList.find(
      (o) => (o.nama && o.nama.toLowerCase() === strVal.toLowerCase()) || String(o.id) === strVal
    );

    setFormData((p) => {
      const updated = {
        ...p,
        nama_outlet: matched ? matched.nama : strVal,
        outlet: matched ? matched.nama : strVal,
        idOutlet: matched ? matched.id : p.idOutlet,
        outlet_id: matched ? matched.id : p.outlet_id,
        kode_outlet: matched ? (matched.code || matched.kode || String(matched.id)) : p.kode_outlet,
        alamat: matched ? (matched.alamat || p.alamat || "") : p.alamat,
        kelurahan: matched ? (matched.kelurahan || p.kelurahan || "") : p.kelurahan,
        kecamatan: matched ? (matched.kecamatan || p.kecamatan || "") : p.kecamatan,
        kab_kota: matched ? (matched.kab_kota || matched.kabKota || p.kab_kota || "") : p.kab_kota,
        provinsi: matched ? (matched.provinsi || p.provinsi || "") : p.provinsi,
      };

      if (matched) {
        if (matched.type_outlet && !p.type_outlet) updated.type_outlet = matched.type_outlet;
        if (matched.type_bangunan && !p.type_bangunan) updated.type_bangunan = matched.type_bangunan;
        if (matched.status_gedung && !p.status_gedung) updated.status_gedung = matched.status_gedung;
      }
      return updated;
    });
  };

  // Handle manual code change
  const handleKodeOutletChange = (e) => {
    const val = e.target.value;
    const strVal = String(val).trim().toLowerCase();
    const matched = outletsList.find(
      (o) => (o.code && String(o.code).toLowerCase() === strVal) || String(o.id) === strVal
    );

    setFormData((p) => {
      const updated = {
        ...p,
        kode_outlet: val,
      };
      if (matched) {
        updated.nama_outlet = matched.nama || p.nama_outlet;
        updated.outlet = matched.nama || p.outlet;
        updated.idOutlet = matched.id;
        updated.outlet_id = matched.id;
        if (matched.alamat) updated.alamat = matched.alamat;
        if (matched.kelurahan) updated.kelurahan = matched.kelurahan;
        if (matched.kecamatan) updated.kecamatan = matched.kecamatan;
        if (matched.kab_kota || matched.kabKota) updated.kab_kota = matched.kab_kota || matched.kabKota;
        if (matched.provinsi) updated.provinsi = matched.provinsi;
        if (matched.type_outlet && !p.type_outlet) updated.type_outlet = matched.type_outlet;
        if (matched.type_bangunan && !p.type_bangunan) updated.type_bangunan = matched.type_bangunan;
        if (matched.status_gedung && !p.status_gedung) updated.status_gedung = matched.status_gedung;
      }
      return updated;
    });
  };

  // Auto-calculate period
  useEffect(() => {
    const start = formData.tgl_kontrak_mulai;
    const end = formData.tgl_kontrak_berakhir;
    if (start && end) {
      const calculated = calculatePeriod(start, end);
      if (calculated && calculated !== formData.periode_sewa) {
        setFormData((p) => ({ ...p, periode_sewa: calculated }));
      }
    }
  }, [formData.tgl_kontrak_mulai, formData.tgl_kontrak_berakhir]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-gradient-to-b dark:from-[#052819] dark:via-[#073622] dark:to-[#03140d] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0d5c3a] via-[#156e49] to-[#279969] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl border border-white/20">
              <Key className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight text-white">
                {editingId ? "Edit Sewa Bangunan" : "Tambah Sewa Bangunan Baru"}
              </h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                {editingId ? "Perbarui informasi kontrak atau perpanjangan sewa gedung." : "Pilih outlet dari Master Outlet untuk mengisi alamat dan wilayah secara otomatis."}
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

        {/* Form */}
        <form onSubmit={onSave} className="flex flex-col flex-1 overflow-hidden">
          
          {/* Body */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 custom-scrollbar space-y-4">
            
            {/* Mode Edit Choice (Only when editing) */}
            {editingId && (
              <div className="bg-blue-50/70 dark:bg-[#14261c] border border-blue-200 dark:border-gray-700 rounded-xl p-3">
                <label className="block text-xs font-bold text-blue-900 dark:text-white mb-1.5">
                  Tujuan Pengubahan Data:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className={`flex items-start gap-2 p-2 rounded-xl border cursor-pointer transition-colors ${formData.mode_edit === 'koreksi' || !formData.mode_edit ? 'bg-white dark:bg-[#1a2e22] border-blue-500 dark:border-blue-400 font-semibold text-blue-900 dark:text-blue-300 shadow-2xs' : 'bg-white/50 dark:bg-[#1a2e22]/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#1a2e22]'}`}>
                    <input
                      type="radio"
                      name="mode_edit"
                      value="koreksi"
                      checked={formData.mode_edit === 'koreksi' || !formData.mode_edit}
                      onChange={() => setFormData(p => ({ ...p, mode_edit: 'koreksi' }))}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="block font-semibold">Koreksi / Perbaiki Data</span>
                      <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-normal">Mengedit kesalahan data (tanpa simpan riwayat)</span>
                    </div>
                  </label>

                  <label className={`flex items-start gap-2 p-2 rounded-xl border cursor-pointer transition-colors ${formData.mode_edit === 'perpanjang' ? 'bg-white dark:bg-[#1a2e22] border-emerald-500 dark:border-emerald-400 font-semibold text-emerald-900 dark:text-emerald-300 shadow-2xs' : 'bg-white/50 dark:bg-[#1a2e22]/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#1a2e22]'}`}>
                    <input
                      type="radio"
                      name="mode_edit"
                      value="perpanjang"
                      checked={formData.mode_edit === 'perpanjang'}
                      onChange={() => setFormData(p => ({ ...p, mode_edit: 'perpanjang' }))}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="block font-semibold text-emerald-700 dark:text-emerald-400">Perpanjang Masa Sewa</span>
                      <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-normal">Memperpanjang periode (simpan riwayat lama)</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            <div className="space-y-4">
              
              {/* Bagian 1: Informasi Outlet & Bangunan */}
              <div className="space-y-3 bg-white dark:bg-[#14261c] p-3.5 rounded-xl border border-slate-200/80 dark:border-gray-700 shadow-xs">
                <h4 className="font-bold text-[11px] text-[#0d5c3a] dark:text-emerald-400 pb-1 uppercase tracking-wide flex items-center gap-1.5 border-b border-emerald-100 dark:border-white/10">
                  <Building2 className="w-3.5 h-3.5" /> Informasi Outlet & Bangunan
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Nama Outlet */}
                  <div className="sm:col-span-2">
                    <CustomSelectDropdown
                      label="Nama Outlet / Instansi *"
                      value={formData.nama_outlet || formData.outlet || ""}
                      onChange={(e) => handleOutletChange(e.target ? e.target.value : e)}
                      onSelect={(o) => handleOutletChange(o.nama || o.value || o)}
                      options={outletOptions}
                      placeholder="Cari atau ketik outlet..."
                      disabled={isSaving}
                      inputCls={inputCls}
                      allowCustomInput={true}
                    />
                  </div>

                  {/* Kode Outlet */}
                  <div>
                    <label className={labelCls}>Kode Outlet</label>
                    <input
                      type="text"
                      value={formData.kode_outlet || ""}
                      onChange={handleKodeOutletChange}
                      disabled={isSaving}
                      className={`${inputCls} font-mono`}
                      placeholder="Contoh: 10101"
                    />
                  </div>

                  {/* Type Outlet */}
                  <div>
                    <CustomSelectDropdown
                      label="Type Outlet"
                      value={formData.type_outlet || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, type_outlet: e.target ? e.target.value : e }))}
                      onSelect={(t) => setFormData((p) => ({ ...p, type_outlet: t.value || t }))}
                      disabled={isSaving}
                      options={[
                        { label: "Rencana Relokasi/Tutup", value: "Rencana Relokasi/Tutup" },
                        { label: "Include UPC", value: "Include UPC" },
                        { label: "Induk Cluster", value: "Induk Cluster" },
                        { label: "Anggota Cluster", value: "Anggota Cluster" },
                        { label: "Non Cluster", value: "Non Cluster" },
                        { label: "Mandiri", value: "Mandiri" }
                      ]}
                      placeholder="Pilih Type Outlet..."
                      inputCls={inputCls}
                    />
                  </div>

                  {/* Type Bangunan */}
                  <div>
                    <CustomSelectDropdown
                      label="Type Bangunan"
                      value={formData.type_bangunan || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, type_bangunan: e.target ? e.target.value : e }))}
                      onSelect={(t) => setFormData((p) => ({ ...p, type_bangunan: t.value || t }))}
                      disabled={isSaving}
                      options={[
                        { label: "Stand Alone", value: "Stand Alone" },
                        { label: "Ruko Double", value: "Ruko Double" },
                        { label: "Ruko Single", value: "Ruko Single" },
                        { label: "Mall / Kios", value: "Mall / Kios" },
                        { label: "Pasar", value: "Pasar" }
                      ]}
                      placeholder="Pilih Type Bangunan..."
                      inputCls={inputCls}
                    />
                  </div>

                  {/* Status Gedung */}
                  <div>
                    <CustomSelectDropdown
                      label="Status Gedung"
                      value={formData.status_gedung || "Sewa"}
                      onChange={(e) => setFormData((p) => ({ ...p, status_gedung: e.target ? e.target.value : e }))}
                      onSelect={(s) => setFormData((p) => ({ ...p, status_gedung: s.value || s }))}
                      disabled={isSaving}
                      options={[
                        { label: "Sewa", value: "Sewa" },
                        { label: "Milik Sendiri", value: "Milik Sendiri" }
                      ]}
                      placeholder="Pilih Status Gedung..."
                      inputCls={inputCls}
                    />
                  </div>

                  {/* Jenis STO */}
                  <div className="sm:col-span-3">
                    <label className={labelCls}>Jenis STO</label>
                    <input
                      type="text"
                      value={formData.jenis_sto || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, jenis_sto: e.target.value }))}
                      disabled={isSaving}
                      className={inputCls}
                      placeholder="Contoh: STO A / STO B..."
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 2: Kontrak & Biaya Sewa */}
              <div className="space-y-3 bg-white dark:bg-[#14261c] p-3.5 rounded-xl border border-slate-200/80 dark:border-gray-700 shadow-xs">
                <h4 className="font-bold text-[11px] text-blue-700 dark:text-emerald-400 pb-1 uppercase tracking-wide flex items-center gap-1.5 border-b border-blue-100 dark:border-white/10">
                  <Calendar className="w-3.5 h-3.5" /> Masa Sewa & Nilai Kontrak
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Awal Kontrak */}
                  <div>
                    <label className={labelCls}>Awal Kontrak</label>
                    <input
                      type="date"
                      value={formData.tgl_kontrak_mulai || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, tgl_kontrak_mulai: e.target.value }))}
                      disabled={isSaving}
                      className={inputCls}
                    />
                  </div>

                  {/* Akhir Kontrak */}
                  <div>
                    <label className={labelCls}>Akhir Kontrak</label>
                    <input
                      type="date"
                      value={formData.tgl_kontrak_berakhir || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, tgl_kontrak_berakhir: e.target.value }))}
                      disabled={isSaving}
                      className={inputCls}
                    />
                  </div>

                  {/* Periode Sewa */}
                  <div>
                    <label className={labelCls}>Periode Sewa (Otomatis / Input)</label>
                    <input
                      type="text"
                      value={formData.periode_sewa || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, periode_sewa: e.target.value }))}
                      disabled={isSaving}
                      className={`${inputCls} font-medium`}
                      placeholder="Contoh: 1 Thn / 2 Thn..."
                    />
                  </div>

                  {/* Harga Sewa */}
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Harga Sewa (Rp)</label>
                    <input
                      type="text"
                      value={formData.harga_sewa !== null && formData.harga_sewa !== undefined && formData.harga_sewa !== ""
                        ? (typeof formData.harga_sewa === "number" ? formData.harga_sewa.toLocaleString("id-ID") : formData.harga_sewa)
                        : ""}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, "");
                        setFormData((p) => ({ ...p, harga_sewa: raw ? Number(raw) : "" }));
                      }}
                      disabled={isSaving}
                      className={`${inputCls} font-medium`}
                      placeholder="Contoh: 50.000.000"
                    />
                  </div>

                  {/* Status Kontrak */}
                  <div>
                    <CustomSelectDropdown
                      label="Status Kontrak"
                      value={formData.status || "Aktif"}
                      onChange={(e) => setFormData((p) => ({ ...p, status: e.target ? e.target.value : e }))}
                      onSelect={(s) => setFormData((p) => ({ ...p, status: s.value || s }))}
                      disabled={isSaving}
                      options={[
                        { label: "Aktif", value: "Aktif" },
                        { label: "Selesai", value: "Selesai" },
                        { label: "Sewa Habis", value: "Sewa Habis" }
                      ]}
                      placeholder="Pilih Status..."
                      inputCls={`${inputCls} font-medium`}
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 3: Lokasi & Wilayah */}
              <div className="space-y-3 bg-white dark:bg-[#14261c] p-3.5 rounded-xl border border-slate-200/80 dark:border-gray-700 shadow-xs">
                <h4 className="font-bold text-[11px] text-emerald-800 dark:text-emerald-400 pb-1 uppercase tracking-wide flex items-center gap-1.5 border-b border-emerald-100 dark:border-white/10">
                  <MapPin className="w-3.5 h-3.5" /> Lokasi & Wilayah
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Alamat Lengkap */}
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Alamat Lengkap</label>
                    <textarea
                      rows="2"
                      value={formData.alamat || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, alamat: e.target.value }))}
                      disabled={isSaving}
                      className={`${inputCls} resize-none custom-scrollbar`}
                      placeholder="Alamat lengkap gedung sewa..."
                    />
                  </div>

                  {/* Kelurahan */}
                  <div>
                    <label className={labelCls}>Kelurahan</label>
                    <input
                      type="text"
                      value={formData.kelurahan || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, kelurahan: e.target.value }))}
                      disabled={isSaving}
                      className={inputCls}
                      placeholder="Kelurahan..."
                    />
                  </div>

                  {/* Kecamatan */}
                  <div>
                    <label className={labelCls}>Kecamatan</label>
                    <input
                      type="text"
                      value={formData.kecamatan || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, kecamatan: e.target.value }))}
                      disabled={isSaving}
                      className={inputCls}
                      placeholder="Kecamatan..."
                    />
                  </div>

                  {/* Kab/Kota */}
                  <div>
                    <label className={labelCls}>Kab/Kota</label>
                    <input
                      type="text"
                      value={formData.kab_kota || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, kab_kota: e.target.value }))}
                      disabled={isSaving}
                      className={inputCls}
                      placeholder="Kabupaten atau Kota..."
                    />
                  </div>

                  {/* Provinsi */}
                  <div>
                    <label className={labelCls}>Provinsi</label>
                    <input
                      type="text"
                      value={formData.provinsi || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, provinsi: e.target.value }))}
                      disabled={isSaving}
                      className={inputCls}
                      placeholder="Provinsi..."
                    />
                  </div>
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className={labelCls}>Keterangan / Catatan Tambahan</label>
                <textarea
                  rows="2"
                  value={formData.keterangan || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, keterangan: e.target.value }))}
                  disabled={isSaving}
                  className={`${inputCls} resize-none custom-scrollbar`}
                  placeholder="Catatan tambahan sewa..."
                />
              </div>

            </div>

          </div>

          {/* Footer */}
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
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : editingId ? (
                <Edit className="w-3.5 h-3.5" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              {editingId ? "Simpan Perubahan" : "Simpan Sewa"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

