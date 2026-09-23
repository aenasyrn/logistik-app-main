// resources/js/Components/DataMaster/KelolaAreaCabangModal.jsx
import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, MapPin, Building2, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import {
  fetchOutletAreas,
  addOutletArea,
  deleteOutletArea,
  addOutletCabang,
  deleteOutletCabang,
} from "../../services/outletAreaService";

const DEFAULT_AREAS = [
  { id: 1, nama: "AREA SENEN", cabangs: [] },
  { id: 2, nama: "AREA KRAMAT JATI", cabangs: [] },
  { id: 3, nama: "AREA JATIWARINGIN", cabangs: [] },
  { id: 4, nama: "AREA BEKASI", cabangs: [] },
  { id: 5, nama: "AREA BOGOR", cabangs: [] },
  { id: 6, nama: "KANWIL JAKARTA 1", cabangs: [] },
];

export default function KelolaAreaCabangModal({
  isOpen,
  onClose,
  initialTab = "area",
  initialAreas = [],
  onAreasUpdated,
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // "area" | "cabang"
  const [areas, setAreas] = useState(() => (initialAreas && initialAreas.length > 0 ? initialAreas : DEFAULT_AREAS));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Area Form State
  const [newAreaName, setNewAreaName] = useState("");

  // Cabang Form State
  const [selectedAreaForCabang, setSelectedAreaForCabang] = useState(() => {
    if (initialAreas && initialAreas.length > 0) return initialAreas[0].nama;
    return DEFAULT_AREAS[0].nama;
  });
  const [newCabangName, setNewCabangName] = useState("");

  useEffect(() => {
    if (initialAreas && initialAreas.length > 0) {
      setAreas(initialAreas);
      if (!selectedAreaForCabang) {
        setSelectedAreaForCabang(initialAreas[0].nama);
      }
    }
  }, [initialAreas]);

  useEffect(() => {
    if (isOpen) {
      loadData();
      setErrorMsg("");
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const data = await fetchOutletAreas();
      if (data && data.length > 0) {
        setAreas(data);
        if (!selectedAreaForCabang) {
          setSelectedAreaForCabang(data[0].nama);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  // Handler: Add Area
  const handleAddArea = async (e) => {
    e.preventDefault();
    const trimmed = newAreaName.trim().toUpperCase();
    if (!trimmed) return;

    if (areas.some((a) => a.nama.toUpperCase() === trimmed)) {
      setErrorMsg(`Area "${trimmed}" sudah terdaftar.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await addOutletArea(trimmed);
      setNewAreaName("");
      await loadData();
      if (onAreasUpdated) onAreasUpdated();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Gagal menambahkan area.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Delete Area
  const handleDeleteArea = async (areaItem) => {
    if (!window.confirm(`Yakin ingin menghapus area "${areaItem.nama}" beserta seluruh cabangnya?`)) return;

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await deleteOutletArea(areaItem.id);
      await loadData();
      if (selectedAreaForCabang === areaItem.nama) {
        setSelectedAreaForCabang(areas[0]?.nama || "");
      }
      if (onAreasUpdated) onAreasUpdated();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Gagal menghapus area.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Add Cabang
  const handleAddCabang = async (e) => {
    e.preventDefault();
    if (!selectedAreaForCabang) {
      setErrorMsg("Pilih area terlebih dahulu.");
      return;
    }
    const trimmed = newCabangName.trim().toUpperCase();
    if (!trimmed) return;

    const currentAreaObj = areas.find((a) => a.nama === selectedAreaForCabang);
    const existingCabangs = currentAreaObj?.cabangs || [];
    if (existingCabangs.some((c) => c.nama.toUpperCase() === trimmed)) {
      setErrorMsg(`Cabang "${trimmed}" sudah ada di ${selectedAreaForCabang}.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await addOutletCabang(selectedAreaForCabang, trimmed);
      setNewCabangName("");
      await loadData();
      if (onAreasUpdated) onAreasUpdated();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Gagal menambahkan cabang.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Delete Cabang
  const handleDeleteCabang = async (cabangItem) => {
    if (!window.confirm(`Yakin ingin menghapus cabang "${cabangItem.nama}"?`)) return;

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await deleteOutletCabang(cabangItem.id);
      await loadData();
      if (onAreasUpdated) onAreasUpdated();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Gagal menghapus cabang.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentAreaCabangs = areas.find((a) => a.nama === selectedAreaForCabang)?.cabangs || [];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100000] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#101e16] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[88vh] overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0d5c3a] via-[#156e49] to-[#279969] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 rounded-xl border border-white/20">
              <Building2 className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                Kelola Kantor Area & Cabang
              </h3>
              <p className="text-[11px] text-emerald-100/90 mt-0.5">
                Pengaturan khusus admin untuk wilayah outlet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-[#132219]">
          <button
            type="button"
            onClick={() => {
              setActiveTab("area");
              setErrorMsg("");
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "area"
                ? "border-[#0d5c3a] text-[#0d5c3a] dark:text-emerald-400 bg-white dark:bg-[#101e16]"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Kantor Area ({areas.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("cabang");
              setErrorMsg("");
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "cabang"
                ? "border-[#0d5c3a] text-[#0d5c3a] dark:text-emerald-400 bg-white dark:bg-[#101e16]"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Kantor Cabang (CP/CPS)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl dark:bg-red-950/40 dark:border-red-800 dark:text-red-300 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: KANTOR AREA */}
          {activeTab === "area" && (
            <div className="space-y-4">
              {/* Form Tambah Area */}
              <form onSubmit={handleAddArea} className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Tambah Kantor Area Baru
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAreaName}
                    onChange={(e) => {
                      setNewAreaName(e.target.value);
                      setErrorMsg("");
                    }}
                    placeholder="Contoh: AREA JAKARTA PUSAT"
                    disabled={isSubmitting}
                    className="flex-1 px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-[#16251c] border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#0d5c3a] dark:text-white outline-none font-semibold uppercase"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !newAreaName.trim()}
                    className="px-4 py-2.5 bg-[#0d5c3a] hover:bg-[#094229] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>Tambah</span>
                  </button>
                </div>
              </form>

              {/* List Area */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Daftar Kantor Area Aktif ({areas.length})
                </label>
                <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                  {areas.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">
                      Belum ada kantor area.
                    </div>
                  ) : (
                    areas.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#142319] hover:bg-gray-50 dark:hover:bg-[#1a2c20] transition-colors text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#0d5c3a] dark:text-emerald-400" />
                          <span className="font-bold text-gray-800 dark:text-gray-200">
                            {item.nama}
                          </span>
                          <span className="text-[10px] text-gray-400 font-normal">
                            ({(item.cabangs || []).length} cabang)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteArea(item)}
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
          )}

          {/* TAB 2: KANTOR CABANG */}
          {activeTab === "cabang" && (
            <div className="space-y-4">
              {/* Pilih Area Induk */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Pilih Area Induk
                </label>
                <div className="relative">
                  <select
                    value={selectedAreaForCabang}
                    onChange={(e) => {
                      setSelectedAreaForCabang(e.target.value);
                      setErrorMsg("");
                    }}
                    style={{ WebkitAppearance: "none", MozAppearance: "none", appearance: "none", backgroundImage: "none" }}
                    className="w-full px-3.5 pr-10 py-2.5 bg-gray-50 dark:bg-[#16251c] border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#0d5c3a] focus:border-[#0d5c3a] dark:text-white outline-none font-bold text-xs cursor-pointer shadow-2xs appearance-none bg-none"
                  >
                    {areas.map((a) => (
                      <option key={a.id || a.nama} value={a.nama}>
                        {a.nama}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#0d5c3a] dark:text-emerald-400">
                    <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
              </div>

              {/* Form Tambah Cabang */}
              <form onSubmit={handleAddCabang} className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Tambah Cabang Baru di {selectedAreaForCabang || "Area"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCabangName}
                    onChange={(e) => {
                      setNewCabangName(e.target.value);
                      setErrorMsg("");
                    }}
                    placeholder="Contoh: CP MENTENG"
                    disabled={isSubmitting || !selectedAreaForCabang}
                    className="flex-1 px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-[#16251c] border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#0d5c3a] dark:text-white outline-none font-semibold uppercase"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !newCabangName.trim() || !selectedAreaForCabang}
                    className="px-4 py-2.5 bg-[#0d5c3a] hover:bg-[#094229] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>Tambah</span>
                  </button>
                </div>
              </form>

              {/* List Cabang */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Daftar Cabang di {selectedAreaForCabang} ({currentAreaCabangs.length})
                </label>
                <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                  {currentAreaCabangs.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">
                      Belum ada cabang di area ini.
                    </div>
                  ) : (
                    currentAreaCabangs.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#142319] hover:bg-gray-50 dark:hover:bg-[#1a2c20] transition-colors text-xs"
                      >
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {item.nama}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteCabang(item)}
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
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 dark:bg-[#142319] border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-[#0d5c3a] hover:bg-[#0a462c] text-white rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
