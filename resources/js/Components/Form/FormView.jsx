"use client";
import { useState } from "react";
import {
  FileText, ArrowRight, Plus, Trash2, AlertCircle,
  PackageCheck, PackageMinus, User, Building2, Hash,
  MapPin, Calendar, ClipboardList, ChevronDown,
} from "lucide-react";

const NOMOR_PATTERN = /^\d{3}\/\d{5}\.\d{2}\/\d{2}\/\d{4}$/;

const isNomorValid = (nomor) => {
  if (!nomor || !NOMOR_PATTERN.test(nomor)) return false;
  return nomor.split("/")[0] !== "000";
};

// ── Komponen input field kecil dengan label & icon ──
const Field = ({ label, icon: Icon, children, className = "" }) => (
  <div className={className}>
    {label && (
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </label>
    )}
    {children}
  </div>
);

const inputCls =
  "w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-50 placeholder:text-gray-300";

const FormView = ({
  formData,
  handleInputChange,
  items,
  handleItemChange,
  addItem,
  removeItem,
  setView,
  inventory,
  outlets,
}) => {
  const [nomorUrut, setNomorUrut] = useState("");
  const [jenisTransaksi, setJenisTransaksi] = useState(
    formData.jenisTransaksi || "Barang Keluar"
  );

  const tahun = new Date().getFullYear();
  const suffix = `/00108.00/04/${tahun}`;

  const handleNomorChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 3);
    setNomorUrut(raw);
    if (!raw || ["0", "00", "000"].includes(raw)) {
      handleInputChange({ target: { name: "nomorSurat", value: "" } });
    } else {
      handleInputChange({
        target: { name: "nomorSurat", value: `${raw.padStart(3, "0")}${suffix}` },
      });
    }
  };

  const handleJenisChange = (jenis) => {
    setJenisTransaksi(jenis);
    handleInputChange({ target: { name: "jenisTransaksi", value: jenis } });
  };

  const nomorIsEmpty = !formData.nomorSurat;
  const nomorIs000 = formData.nomorSurat?.startsWith("000/");
  const nomorIsValid = isNomorValid(formData.nomorSurat);
  const canProceed = nomorIsValid;

  const isKeluar = jenisTransaksi === "Barang Keluar";

  return (
    <div className="max-w-6xl mx-auto mt-6 print:hidden">
      {/* ── TOP BAR ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">Buat Surat Serah Terima</h2>
            <p className="text-xs text-gray-400 mt-0.5">Isi semua data dengan benar sebelum lanjut ke preview</p>
          </div>
        </div>
        <button
          onClick={() => canProceed && setView("preview")}
          disabled={!canProceed}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
        >
          Lanjut ke Preview <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── SECTION 1: Info Dokumen ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 p-6">
        <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-400 mb-4">
          Informasi Dokumen
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Jenis Transaksi — toggle pill */}
          <div className="md:col-span-3">
            <Field label="Jenis Transaksi">
              <div className="flex gap-2 mt-0.5">
                <button
                  onClick={() => handleJenisChange("Barang Keluar")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    isKeluar
                      ? "bg-red-50 border-red-300 text-red-700"
                      : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                  }`}
                >
                  <PackageMinus className="w-3.5 h-3.5" /> Keluar
                </button>
                <button
                  onClick={() => handleJenisChange("Barang Masuk")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    !isKeluar
                      ? "bg-green-50 border-green-300 text-green-700"
                      : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                  }`}
                >
                  <PackageCheck className="w-3.5 h-3.5" /> Masuk
                </button>
              </div>
            </Field>
          </div>

          {/* Nomor Surat */}
          <div className="md:col-span-5">
            <Field label="Nomor Surat" icon={Hash}>
              <div
                className={`flex items-center rounded-lg border overflow-hidden transition-all ${
                  nomorIsValid
                    ? "border-green-400 bg-green-50 ring-2 ring-green-50"
                    : nomorIs000
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={3}
                  placeholder="000"
                  value={nomorUrut}
                  onChange={handleNomorChange}
                  className="w-16 py-2 pl-3 text-center font-mono font-bold text-base outline-none bg-transparent text-gray-900"
                />
                <span className="text-gray-400 font-mono text-xs px-2 border-l border-gray-200 bg-gray-50/80 py-2 select-none">
                  {suffix}
                </span>
              </div>
              {nomorIs000 && (
                <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1.5">
                  <AlertCircle className="w-3 h-3" /> Nomor tidak boleh 000
                </p>
              )}
              {!nomorIsEmpty && nomorIsValid && (
                <p className="text-[11px] text-green-600 mt-1.5 font-mono">
                  ✓ {formData.nomorSurat}
                </p>
              )}
            </Field>
          </div>

          {/* Tanggal */}
          <div className="md:col-span-2">
            <Field label="Tanggal" icon={Calendar}>
              <input
                type="date"
                name="tanggal"
                value={formData.tanggal}
                onChange={handleInputChange}
                className={inputCls}
              />
            </Field>
          </div>

          {/* Lokasi */}
          <div className="md:col-span-2">
            <Field label="Lokasi" icon={MapPin}>
              <input
                type="text"
                name="lokasi"
                value={formData.lokasi}
                onChange={handleInputChange}
                placeholder="Contoh: Gudang Pusat"
                className={inputCls}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Pihak yang Terlibat ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 p-6">
        <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-400 mb-4">
          Pihak yang Terlibat
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Yang Menyerahkan */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">1</div>
              <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Yang Menyerahkan</p>
            </div>
            <div className="space-y-2">
              <input name="pengirimNama" value={formData.pengirimNama} onChange={handleInputChange}
                placeholder="Nama lengkap" className={inputCls} />
              <input name="pengirimJabatan" value={formData.pengirimJabatan} onChange={handleInputChange}
                placeholder="Jabatan" className={inputCls} />
              <input list="db-instansi" name="pengirimInstansi" value={formData.pengirimInstansi} onChange={handleInputChange}
                placeholder="Instansi / Area" className={inputCls} />
            </div>
          </div>

          {/* Mengetahui */}
          <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-[10px] font-bold">2</div>
              <p className="text-xs font-bold text-purple-800 uppercase tracking-wider">Mengetahui</p>
            </div>
            <div className="space-y-2">
              <input name="mengetahuiNama" value={formData.mengetahuiNama} onChange={handleInputChange}
                placeholder="Nama lengkap" className={inputCls} />
              <input name="mengetahuiJabatan" value={formData.mengetahuiJabatan} onChange={handleInputChange}
                placeholder="Jabatan" className={inputCls} />
            </div>
          </div>

          {/* Yang Menerima */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold">3</div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Yang Menerima</p>
            </div>
            <div className="space-y-2">
              <input name="penerimaNama" value={formData.penerimaNama} onChange={handleInputChange}
                placeholder="Nama lengkap" className={inputCls} />
              <input name="penerimaJabatan" value={formData.penerimaJabatan} onChange={handleInputChange}
                placeholder="Jabatan" className={inputCls} />
              <input list="db-instansi" name="penerimaInstansi" value={formData.penerimaInstansi} onChange={handleInputChange}
                placeholder="Instansi / Area" className={inputCls} />
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Daftar Barang ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-gray-400" />
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-400">
              Daftar Barang
            </p>
            <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {items.length} baris
            </span>
          </div>
          <button
            onClick={addItem}
            className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3.5 py-2 rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Baris
          </button>
        </div>

        <datalist id="db-barang">
          {inventory.map((i) => (
            <option key={i.id} value={i.nama} />
          ))}
        </datalist>
        <datalist id="db-instansi">
          {outlets?.map((out) => (
            <option key={out.id} value={out.nama} />
          ))}
        </datalist>

        {/* Container tabel digabung dengan Footer Ringkasan */}
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-3 py-3 text-center w-12">No</th>
                  <th className="px-3 py-3 w-[25%]">Nama Barang</th>
                  <th className="px-3 py-3 w-[15%]">S/N</th>
                  <th className="px-3 py-3 text-center w-20">Qty</th>
                  <th className="px-3 py-3 w-28">Satuan</th>
                  <th className="px-3 py-3 w-[20%]">Outlet Tujuan</th>
                  <th className="px-3 py-3 min-w-[150px]">Keterangan</th>
                  <th className="px-3 py-3 w-12 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-3 py-2 text-center text-xs font-mono text-gray-400 font-semibold">
                      {String(idx + 1).padStart(2, "0")}
                    </td>
                    <td className="px-2 py-2">
                      <input
                        list="db-barang"
                        value={item.nama}
                        onChange={(e) => handleItemChange(item.id, "nama", e.target.value)}
                        className="w-full text-xs px-2 py-2 border border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md bg-transparent focus:bg-white transition-all outline-none"
                        placeholder="Ketik atau pilih..."
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        value={item.sn}
                        onChange={(e) => handleItemChange(item.id, "sn", e.target.value)}
                        className="w-full text-xs font-mono px-2 py-2 border border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md bg-transparent focus:bg-white transition-all outline-none"
                        placeholder="Serial number"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min="1"
                        value={item.kuantitas}
                        onChange={(e) => handleItemChange(item.id, "kuantitas", e.target.value)}
                        className="w-full text-xs text-center px-2 py-2 border border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md bg-transparent focus:bg-white transition-all outline-none"
                      />
                    </td>
                    <td className="px-2 py-2 relative">
                      <select
                        value={item.satuan}
                        onChange={(e) => handleItemChange(item.id, "satuan", e.target.value)}
                        className="w-full text-xs appearance-none px-2 py-2 border border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md bg-transparent focus:bg-white transition-all outline-none pr-7 cursor-pointer"
                      >
                        <option>Pcs</option>
                        <option>Unit</option>
                        <option>Box</option>
                        <option>Set</option>
                        <option>Lembar</option>
                      </select>
                      <ChevronDown className="w-3 h-3 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-gray-600 transition-colors" />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        list="db-instansi"
                        value={item.outlet || ""}
                        onChange={(e) => handleItemChange(item.id, "outlet", e.target.value)}
                        className="w-full text-xs px-2 py-2 border border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md bg-transparent focus:bg-white transition-all outline-none"
                        placeholder="Pilih outlet..."
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        value={item.keterangan}
                        onChange={(e) => handleItemChange(item.id, "keterangan", e.target.value)}
                        className="w-full text-xs px-2 py-2 border border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md bg-transparent focus:bg-white transition-all outline-none"
                        placeholder="Catatan..."
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="w-7 h-7 mx-auto flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer ringkasan sekarang dibungkus rapi di dalam container tabel */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-t border-gray-200">
            <p className="text-[11px] text-gray-400">
              {items.filter(i => i.nama).length} barang diisi
            </p>
            <p className="text-[11px] font-semibold text-gray-600">
              Total:{" "}
              <span className="font-mono text-gray-900">
                {items.reduce((s, i) => s + Number(i.kuantitas || 0), 0)}
              </span>{" "}
              unit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormView;