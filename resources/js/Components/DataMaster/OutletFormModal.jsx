// resources/js/Components/DataMaster/OutletFormModal.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { MapPin, X, Edit, Plus, Loader2, Settings, Building2 } from "lucide-react";
import { router } from "@inertiajs/react";
import CustomSelectDropdown from "../Form/CustomSelectDropdown";
import KelolaAreaCabangModal from "./KelolaAreaCabangModal";
import { fetchOutletAreas } from "../../services/outletAreaService";

const PREDEFINED_AREAS = [
  "AREA SENEN",
  "AREA KRAMAT JATI",
  "AREA JATIWARINGIN",
  "AREA BEKASI",
  "AREA BOGOR",
  "KANWIL JAKARTA 1",
];

const PREDEFINED_CABANGS = {
  "AREA SENEN": [
    "CP PETAMBURAN",
    "CP SALEMBA",
    "CP PASAR SENEN",
    "CP PASAR BARU",
    "CP KEMAYORAN",
    "CP KAMPUNG AMBON",
    "CP CEMPAKA PUTIH",
    "CP SUDIRMAN",
    "CP ITC CEMPAKA MAS",
    "CPS KRAMAT RAYA",
  ],
  "AREA KRAMAT JATI": [
    "CP JATINEGARA",
    "CP PENGGILINGAN",
    "CP KRAMAT JATI",
    "CP RAWAMANGUN",
    "CP CIBUBUR",
    "CP BUARAN",
    "CP KEBON NANAS",
    "CP KRANGGAN",
    "CP KOTA WISATA",
    "CP PONDOK KELAPA",
    "CPS DEWI SARTIKA",
  ],
  "AREA JATIWARINGIN": [
    "CP PONDOK MELATI",
    "CP PLAZA PONDOK GEDE",
    "CP PONDOK UNGU",
    "CP HARAPAN INDAH",
    "CP JATIWARINGIN",
    "CP PONDOK BAMBU",
    "CP PEKAYON",
    "CP KRANJI",
    "CP KEMANG PRATAMA",
    "CP GALAXI",
    "CPS PLAZA THB",
  ],
  "AREA BEKASI": [
    "CP BEKASI UTAMA",
    "CP KARAWANG",
    "CP RENGAS DENGKLOK",
    "CP KALIMALANG",
    "CP TAMBUN",
    "CP CIKARANG",
    "CP BEKASI TIMUR",
    "CP SETIA MEKAR",
    "CPS ISLAMIC CENTRE",
    "CPS METRO BOULEVARD CIKARANG",
  ],
  "AREA BOGOR": [
    "CP BOGOR",
    "CP DEPOK",
    "CP CIBINONG",
    "CP PASAR MAWAR",
    "CP PANCORAN MAS",
    "CP WARUNG JAMBU",
    "CP KELAPA DUA",
    "CP KEDUNGHALANG",
    "CP GUNUNG BATU",
    "CP BOJONGSARI",
    "CP CISALAK",
    "CPS MARGONDA",
    "CPS BOGOR BARU",
    "CP BOGOR 1",
    "CP BOGOR 2",
    "CP DEPOK 1",
    "CP DEPOK 2",
    "CPS METRO BOU CKR",
  ],
  "KANWIL JAKARTA 1": [
    "KANWIL JAKARTA 1",
  ],
};

export default function OutletFormModal({
  isOpen,
  onClose,
  editingOutlet,
  onSubmit,
  isSaving,
  outlets = [],
  userRole = "user",
  outletAreas = [],
}) {
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedCabang, setSelectedCabang] = useState("");
  const [isKelolaOpen, setIsKelolaOpen] = useState(false);
  const [kelolaInitialTab, setKelolaInitialTab] = useState("area");
  const [localAreas, setLocalAreas] = useState(outletAreas || []);

  useEffect(() => {
    if (outletAreas && outletAreas.length > 0) {
      setLocalAreas(outletAreas);
    } else if (isOpen) {
      fetchOutletAreas().then((res) => {
        if (res && res.length > 0) setLocalAreas(res);
      }).catch(() => {});
    }
  }, [outletAreas, isOpen]);

  // Compute all available unique Areas (predefined + database outletAreas + existing in outlets)
  const availableAreas = useMemo(() => {
    const set = new Set(PREDEFINED_AREAS);
    const all = (localAreas && localAreas.length > 0) ? localAreas : (outletAreas || []);
    all.forEach((a) => {
      if (a.nama) set.add(String(a.nama).trim().toUpperCase());
    });
    (outlets || []).forEach((o) => {
      if (o.area && String(o.area).trim()) {
        set.add(String(o.area).trim().toUpperCase());
      }
    });
    return Array.from(set).sort();
  }, [localAreas, outletAreas, outlets]);

  // Compute Cabangs for selected Area
  const availableCabangs = useMemo(() => {
    if (!selectedArea) return [];
    const set = new Set();
    const activeUpper = selectedArea.trim().toUpperCase();

    // 1. Predefined standard cabangs
    if (PREDEFINED_CABANGS[activeUpper]) {
      PREDEFINED_CABANGS[activeUpper].forEach((c) => set.add(c.toUpperCase()));
    }

    // 2. From DB localAreas / outletAreas
    const all = (localAreas && localAreas.length > 0) ? localAreas : (outletAreas || []);
    const matchedArea = all.find(
      (a) => a.nama && a.nama.toUpperCase() === activeUpper
    );
    if (matchedArea && matchedArea.cabangs) {
      matchedArea.cabangs.forEach((c) => {
        if (c.nama) set.add(String(c.nama).trim().toUpperCase());
      });
    }

    // 3. From existing outlets with same area
    (outlets || []).forEach((o) => {
      const oArea = o.area ? String(o.area).trim().toUpperCase() : "";
      const nama = o.nama ? String(o.nama).trim() : "";
      const cabang = o.cabang ? String(o.cabang).trim() : "";

      if (oArea === activeUpper) {
        if (/^CP\s|^CPS\s/i.test(nama)) set.add(nama.toUpperCase());
        if (/^CP\s|^CPS\s/i.test(cabang)) set.add(cabang.toUpperCase());
        else if (cabang && !/^UPC\s|^UPS\s/i.test(cabang)) set.add(cabang.toUpperCase());
      }
    });

    const currentCabang = editingOutlet?.cabang ? String(editingOutlet.cabang).trim() : "";
    if (currentCabang && !/^UPC\s|^UPS\s/i.test(currentCabang)) {
      set.add(currentCabang.toUpperCase());
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [selectedArea, localAreas, outletAreas, outlets, editingOutlet]);

  useEffect(() => {
    if (!isOpen) return;

    const currentArea = editingOutlet?.area ? String(editingOutlet.area).trim().toUpperCase() : "";
    setSelectedArea(currentArea);

    const currentCabang = editingOutlet?.cabang ? String(editingOutlet.cabang).trim().toUpperCase() : "";
    setSelectedCabang(currentCabang);
  }, [editingOutlet, isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">

          {/* HEADER MODAL */}
          <div className="px-6 py-5 bg-gradient-to-r from-[#0d5c3a] via-[#156e49] to-[#279969] text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/15 rounded-xl border border-white/20">
                <MapPin className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg leading-tight text-white">
                  {editingOutlet ? "Edit Data Outlet" : "Tambah Outlet Baru"}
                </h3>
                <p className="text-xs text-emerald-100/90 mt-0.5">
                  Kelola informasi unit kerja, kode outlet, alamat, dan wilayah.
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

          {/* FORM WRAPPER */}
          <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

                {/* Banner Kelola Area & Cabang (Khusus Admin) - Di Atas Form */}
                {userRole === "admin" && (
                  <div className="md:col-span-12 flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/40 border border-emerald-200/90 dark:border-emerald-800/60 rounded-2xl shadow-2xs gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-[#0d5c3a] text-white rounded-xl shadow-xs">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 dark:text-white block">
                          Kelola Kantor Area & Cabang
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                          Tambah atau hapus pilihan kantor area dan kantor cabang untuk master outlet
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setKelolaInitialTab("area");
                        setIsKelolaOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0d5c3a] hover:bg-[#094229] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Kelola Area & Cabang</span>
                    </button>
                  </div>
                )}
                
                {/* Row 1 */}
                <div className="md:col-span-4">
                  <label className="block text-sm mb-1.5 font-medium text-gray-700">Kode Outlet (Opsional)</label>
                  <input
                    name="kode"
                    defaultValue={editingOutlet?.code || ""}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
                <div className="md:col-span-8">
                  <label className="block text-sm mb-1.5 font-medium text-gray-700">Nama Outlet / Instansi *</label>
                  <input
                    name="nama"
                    defaultValue={editingOutlet?.nama || ""}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>

                {/* Row Area & Cabang (Wajib) */}
                <div className="md:col-span-6">
                  <label className="block text-sm mb-1.5 font-medium text-gray-700">
                    Kantor Area *
                  </label>
                  <CustomSelectDropdown
                    name="area"
                    value={selectedArea}
                    onChange={(e) => {
                      const val = typeof e === "string" ? e : (e?.target?.value ?? e);
                      setSelectedArea(val);
                      setSelectedCabang("");
                    }}
                    options={availableAreas}
                    placeholder="Pilih atau ketik kantor area..."
                    allowCustomInput={true}
                    required
                  />
                </div>

                <div className="md:col-span-6">
                  <label className="block text-sm mb-1.5 font-medium text-gray-700">
                    Kantor Cabang *
                  </label>
                  <CustomSelectDropdown
                    name="cabang"
                    value={selectedCabang}
                    onChange={(e) => {
                      const val = typeof e === "string" ? e : (e?.target?.value ?? e);
                      setSelectedCabang(val);
                    }}
                    options={availableCabangs}
                    disabled={!selectedArea}
                    placeholder={
                      !selectedArea
                        ? "Pilih Kantor Area Terlebih Dahulu..."
                        : availableCabangs.length === 0
                        ? "Belum ada pilihan cabang..."
                        : "Pilih atau ketik kantor cabang (CP)..."
                    }
                    allowCustomInput={true}
                    required
                  />
                </div>

                {/* Row 2 */}
                <div className="md:col-span-4">
                  <label className="block text-sm mb-1.5 font-medium text-gray-700">Tipe Outlet</label>
                  <CustomSelectDropdown
                    name="type_outlet"
                    defaultValue={editingOutlet?.type_outlet || "ANGGOTA CLUSTER"}
                    options={[
                      "ANGGOTA CLUSTER",
                      "CLUSTER",
                      "NON CLUSTER",
                      "GUDANG PENGADAAN",
                      "GUDANG RETUR"
                    ]}
                    placeholder="Pilih atau ketik tipe outlet..."
                    allowCustomInput={true}
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-sm mb-1.5 font-medium text-gray-700">Tipe Bangunan</label>
                  <CustomSelectDropdown
                    name="type_bangunan"
                    defaultValue={editingOutlet?.type_bangunan || "RUKO SINGLE"}
                    options={[
                      "RUKO SINGLE",
                      "RUKO DOUBLE",
                      "RUKO TRIPLE",
                      "MALL",
                      "PASAR",
                      "STAND ALONE",
                      "RUMAH TINGGAL",
                      "KANTOR",
                      "GUDANG"
                    ]}
                    placeholder="Pilih atau ketik tipe bangunan..."
                    allowCustomInput={true}
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-sm mb-1.5 font-medium text-gray-700">Status Gedung</label>
                  <CustomSelectDropdown
                    name="status_gedung"
                    defaultValue={editingOutlet?.status_gedung || "SEWA"}
                    options={[
                      "MILIK SENDIRI",
                      "SEWA",
                      "PINJAM PAKAI"
                    ]}
                    placeholder="Pilih atau ketik status gedung..."
                    allowCustomInput={true}
                  />
                </div>

                {/* Row 3 - Full width Alamat */}
                <div className="md:col-span-12">
                  <label className="block text-sm mb-1.5 font-medium text-gray-700">Alamat Lengkap</label>
                  <textarea
                    name="alamat"
                    rows="2"
                    defaultValue={editingOutlet?.alamat || ""}
                    placeholder="Masukkan alamat lengkap..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  ></textarea>
                </div>

                {/* Administrative Areas Grid */}
                <div className="md:col-span-6">
                  <label className="block text-sm mb-1.5 font-medium text-gray-700">Kelurahan</label>
                  <input
                    name="kelurahan"
                    defaultValue={editingOutlet?.kelurahan || ""}
                    placeholder="Nama kelurahan..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>

                <div className="md:col-span-6">
                  <label className="block text-sm mb-1.5 font-medium text-gray-700">Kecamatan</label>
                  <input
                    name="kecamatan"
                    defaultValue={editingOutlet?.kecamatan || ""}
                    placeholder="Nama kecamatan..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>

                <div className="md:col-span-6">
                  <label className="block text-sm mb-1.5 font-medium text-gray-700">Kab/Kota</label>
                  <input
                    name="kab_kota"
                    defaultValue={editingOutlet?.kab_kota || ""}
                    placeholder="Kabupaten/Kota..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>

                <div className="md:col-span-6">
                  <label className="block text-sm mb-1.5 font-medium text-gray-700">Provinsi</label>
                  <input
                    name="provinsi"
                    defaultValue={editingOutlet?.provinsi || ""}
                    placeholder="Nama provinsi..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>

              </div>
            </div>

            {/* FOOTER MODAL */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-[#0d5c3a] hover:bg-[#156e49] text-white rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {editingOutlet ? "Simpan Perubahan" : "Simpan Outlet"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Admin Kelola Area & Cabang Modal */}
      {userRole === "admin" && (
        <KelolaAreaCabangModal
          isOpen={isKelolaOpen}
          onClose={() => setIsKelolaOpen(false)}
          initialTab={kelolaInitialTab}
          initialAreas={localAreas.length > 0 ? localAreas : outletAreas}
          onAreasUpdated={() => {
            fetchOutletAreas().then((res) => {
              if (res && res.length > 0) setLocalAreas(res);
            }).catch(() => {});
            router.reload({ only: ["outletAreas"] });
          }}
        />
      )}
    </>
  );
}