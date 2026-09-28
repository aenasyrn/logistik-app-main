import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { usePage } from "@inertiajs/react";
import {
  FileText, ArrowLeft, ArrowRight, Plus, Trash2, AlertCircle, AlertTriangle,
  Package, PackageCheck, PackageMinus, User, Building2, Hash,
  MapPin, Calendar, ClipboardList, ChevronDown, Settings,
} from "lucide-react";
import CustomSelectDropdown from "./CustomSelectDropdown";
import LetterNumberSettingsModal from "./LetterNumberSettingsModal";
import axios from "axios";

const NOMOR_PATTERN = /^\d+\/[A-Za-z0-9._-]+\/04\/\d{4}$/;

const isNomorValid = (nomor) => {
  if (!nomor || !NOMOR_PATTERN.test(nomor)) return false;
  return !/^0+$/.test(nomor.split("/")[0]);
};

const getItemVendor = (item) => {
  if (typeof item?.vendor === "string") return item.vendor;
  return item?.vendor?.nama || item?.vendor?.name || item?.vendor_nama || item?.penyedia || "";
};

// ── Komponen input field kecil dengan label & icon ──
const Field = ({ label, icon: Icon, children, className = "" }) => (
  <div className={className}>
    {label && (
      <label className="flex items-center gap-1.5 text-xs font-extrabold text-gray-900 dark:text-slate-100 uppercase tracking-wider mb-1.5 h-5 leading-none">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-900 dark:text-slate-100" />}
        {typeof label === "string" && label.endsWith("*") ? (
          <>
            {label.slice(0, -1).trim()} <span className="text-red-500 font-black text-xs ml-0.5 leading-none">*</span>
          </>
        ) : (
          label
        )}
      </label>
    )}
    {children}
  </div>
);

// ── Dropdown Pilihan Outlet Master (Refactored using CustomSelectDropdown) ──
const OutletSelectDropdown = ({
  label,
  icon: Icon,
  value,
  onChange,
  onSelect,
  outlets = [],
  placeholder = "Pilih atau ketik outlet...",
  isTableCell = false,
  className = "",
  inputCls = "",
}) => (
  <CustomSelectDropdown
    label={label}
    icon={Icon}
    value={value}
    onChange={(eOrVal) => {
      const val = typeof eOrVal === "string" ? eOrVal : (eOrVal?.target?.value ?? eOrVal);
      if (onChange) onChange(val);
    }}
    onSelect={onSelect}
    options={(outlets || []).map((o) => {
      const kode = o.code || o.kode || o.kode_outlet || "";
      return {
        label: o.nama || "",
        value: o.nama || "",
        subtext: kode ? `Kode: ${kode}` : "",
        raw: o,
      };
    })}
    placeholder={placeholder}
    isTableCell={isTableCell}
    className={className}
    inputCls={inputCls}
    allowCustomInput={true}
  />
);

// ── Dropdown Pilihan Barang Master (Refactored using CustomSelectDropdown) ──
const BarangSelectDropdown = ({
  value,
  onChange,
  onSelect,
  inventory = [],
  masterMeubelairs = [],
  placeholder = "Ketik atau pilih barang...",
}) => {
  const options = useMemo(() => {
    const list = [];

    // 1. Master Barang Non Meubelair (Inventory)
    (inventory || []).forEach((i) => {
      const name = (i.nama || i.nama_barang || "").trim();
      if (!name) return;
      const qty = Number(i.kuantitas !== undefined ? i.kuantitas : i.stok) || 0;
      const satuan = i.satuan || "Pcs";
      const kategori = i.kategori || i.jenis_barang || "Non Meubelair";

      list.push({
        label: name,
        value: name,
        subtext: `Non Meubelair (${kategori}) • Stok: ${qty} ${satuan}`,
        raw: {
          ...i,
          nama: name,
          kuantitas: qty,
          satuan: satuan,
          isMeubelair: false,
          kategori: kategori,
        },
      });
    });

    // 2. Master Barang Meubelair (MasterMeubelair)
    (masterMeubelairs || []).forEach((mm) => {
      const name = (mm.nama_barang || mm.jenis || mm.nama || "").trim();
      if (!name) return;
      const qty = Number(mm.stok !== undefined ? mm.stok : mm.quantity) || 0;
      const satuan = mm.satuan || "Unit";
      const jenis = mm.jenis_barang || mm.kategori || "Meubelair";

      list.push({
        label: name,
        value: name,
        subtext: `Meubelair (${jenis}) • Stok: ${qty} ${satuan}`,
        raw: {
          ...mm,
          nama: name,
          kuantitas: qty,
          satuan: satuan,
          isMeubelair: true,
          kategori: jenis,
        },
      });
    });

    return list;
  }, [inventory, masterMeubelairs]);

  return (
    <CustomSelectDropdown
      value={value}
      onChange={(eOrVal) => {
        const val = typeof eOrVal === "string" ? eOrVal : (eOrVal?.target?.value ?? eOrVal);
        if (onChange) onChange(val);
      }}
      onSelect={onSelect}
      options={options}
      placeholder={placeholder}
      isTableCell={true}
      allowCustomInput={true}
    />
  );
};

const inputCls =
  "w-full px-3.5 py-2.5 bg-white dark:bg-[#16231a] border border-gray-300 dark:border-[#2b4533] rounded-xl text-sm font-semibold text-gray-900 dark:text-slate-100 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 placeholder:text-gray-400 shadow-2xs";

const FormView = ({
  formData,
  handleInputChange,
  items,
  handleItemChange,
  addItem,
  removeItem,
  setView,
  inventory,
  masterMeubelairs = [],
  outlets = [],
  transactions = [],
  activeTransaction = null,
  onValidityChange = () => {},
}) => {
  const [nomorUrut, setNomorUrut] = useState("");
  const [jenisTransaksi, setJenisTransaksi] = useState(
    formData.jenisTransaksi || "Barang Keluar"
  );
  const [showValidationModal, setShowValidationModal] = useState(false);
  const hasSubmittedValidation = false;

  const { auth } = usePage().props;
  const isAdmin = auth?.user?.role === "admin";
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [slotError, setSlotError] = useState(null);
  const [letterNumberMode, setLetterNumberMode] = useState("otomatis");
  const [activeFormTab, setActiveFormTab] = useState("kop");
  const isManualMode = letterNumberMode === "manual";

  const isKeluar = jenisTransaksi === "Barang Keluar";

  // Selected outlet name & object
  const currentOutletName = isKeluar
    ? formData.outletTujuan || ""
    : formData.outletAsal || "";

  const selectedOutletObj = (outlets || []).find((o) => o.nama === currentOutletName);

  const dateObj = formData.tanggal ? new Date(formData.tanggal) : new Date();
  const tahun = dateObj.getFullYear();

  // Outlet code for Nomor Surat:
  // Untuk transaksi Barang Keluar, nomor surat selalu memakai kode unit pengirim (00108.00)
  // dan TIDAK boleh berubah saat memilih outlet tujuan.
  const defaultKode = "00108.00";
  const kodeOutlet = isKeluar
    ? defaultKode
    : (selectedOutletObj
        ? selectedOutletObj.code || selectedOutletObj.kode || selectedOutletObj.kode_outlet || defaultKode
        : defaultKode);

  const suffix = `/${kodeOutlet || "____"}/04/${tahun}`;

  // Sync local states with loaded transaction data when editing or starting new
  useEffect(() => {
    if (formData.nomorSurat) {
      const match = formData.nomorSurat.match(/^(\d+)/);
      if (match) {
        const paddedLocal = (nomorUrut || "").padStart(3, "0");
        if (match[1] !== paddedLocal && match[1] !== nomorUrut) {
          setNomorUrut(match[1]);
        }
      } else {
        setNomorUrut("");
      }
    } else {
      setNomorUrut("");
    }
  }, [formData.nomorSurat]);

  useEffect(() => {
    if (formData.jenisTransaksi) {
      setJenisTransaksi(formData.jenisTransaksi);
    } else {
      setJenisTransaksi("Barang Keluar");
    }
  }, [formData.jenisTransaksi]);

  useEffect(() => {
    if (nomorUrut) {
      const fullNo = `${nomorUrut.padStart(3, "0")}${suffix}`;
      handleInputChange({ target: { name: "nomorSurat", value: fullNo } });
    }
  }, [nomorUrut, kodeOutlet, tahun]);

  const fetchNextNumber = async (selectedDate = formData.tanggal, selectedJenis = jenisTransaksi) => {
    if (activeTransaction) return;
    try {
      const typeKey = selectedJenis === "Barang Masuk" ? "serah_terima_masuk" : "serah_terima_keluar";
      const qDate = selectedDate || new Date().toISOString().split("T")[0];
      const res = await axios.get(`/api/letter-numbers/next?letter_type=${typeKey}&tanggal=${qDate}`);
      const data = res.data;
      if (data.mode) {
        setLetterNumberMode(data.mode);
      }
      if (data.success && (data.formatted_number || data.number)) {
        const nextNum = data.formatted_number ? String(data.formatted_number) : String(data.number);
        setNomorUrut(nextNum);
        const isTargetKeluar = selectedJenis !== "Barang Masuk";
        const currentTargetKode = isTargetKeluar
          ? defaultKode
          : (selectedOutletObj ? selectedOutletObj.code || selectedOutletObj.kode || selectedOutletObj.kode_outlet || defaultKode : defaultKode);
        const dateParts = String(qDate).split("T")[0].split("-");
        const targetTahun = dateParts.length === 3 ? dateParts[0] : new Date(qDate).getFullYear();
        const currentTargetSuffix = `/${currentTargetKode || "____"}/04/${targetTahun}`;
        handleInputChange({
          target: { name: "nomorSurat", value: `${nextNum.padStart(3, "0")}${currentTargetSuffix}` },
        });
        setSlotError(null);
      } else if (data.message && !data.is_weekend) {
        setSlotError(data.message);
      } else {
        setSlotError(null);
      }
    } catch (err) {
      console.error("Gagal mengambil nomor surat otomatis:", err);
    }
  };

  useEffect(() => {
    if (!activeTransaction && (!formData.nomorSurat || !nomorUrut)) {
      fetchNextNumber(formData.tanggal || new Date().toISOString().split("T")[0], jenisTransaksi);
    }
  }, [activeTransaction]);

  const handleNomorChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 6);
    setNomorUrut(raw);
    if (!raw || /^0+$/.test(raw)) {
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

    if (jenis === "Barang Masuk") {
      // Auto set penerimaInstansi to LOGISTIK KANWIL VIII for Barang Masuk
      handleInputChange({ target: { name: "penerimaInstansi", value: "LOGISTIK KANWIL VIII" } });
    } else {
      // Reset penerimaInstansi to outletTujuan for Barang Keluar
      handleInputChange({ target: { name: "penerimaInstansi", value: formData.outletTujuan || "" } });
    }

    // Ambil nomor surat berikutnya secara independen untuk jenis transaksi yang baru
    if (!activeTransaction) {
      fetchNextNumber(formData.tanggal, jenis);
    }
  };

  const handleOutletSelect = (outObj) => {
    const outletNama = outObj ? outObj.nama : "";

    if (isKeluar) {
      handleInputChange({ target: { name: "outletTujuan", value: outletNama } });
      handleInputChange({ target: { name: "penerimaInstansi", value: outletNama } });
    } else {
      handleInputChange({ target: { name: "outletAsal", value: outletNama } });
      handleInputChange({ target: { name: "pengirimInstansi", value: outletNama } });
      handleInputChange({ target: { name: "penerimaInstansi", value: "LOGISTIK KANWIL VIII" } });
    }
  };

  // Combined master barang map for stock validation and quick lookup
  const masterBarangMap = useMemo(() => {
    const map = new Map();
    (inventory || []).forEach((i) => {
      const name = (i.nama || i.nama_barang || "").trim();
      if (name) {
        map.set(name.toLowerCase(), {
          nama: name,
          kuantitas: Number(i.kuantitas !== undefined ? i.kuantitas : i.stok) || 0,
          satuan: i.satuan || "Pcs",
          kategori: i.kategori || i.jenis_barang || "Non Meubelair",
          isMeubelair: false,
          raw: i,
        });
      }
    });
    (masterMeubelairs || []).forEach((mm) => {
      const name = (mm.nama_barang || mm.jenis || mm.nama || "").trim();
      if (name) {
        map.set(name.toLowerCase(), {
          nama: name,
          kuantitas: Number(mm.stok !== undefined ? mm.stok : mm.quantity) || 0,
          satuan: mm.satuan || "Unit",
          kategori: mm.jenis_barang || mm.kategori || "Meubelair",
          isMeubelair: true,
          raw: mm,
        });
      }
    });
    return map;
  }, [inventory, masterMeubelairs]);

  // Check if any items have invalid stock for Barang Keluar
  const hasInvalidStock = isKeluar && items.some(item => {
    if (!item.nama) return false;
    const masterItem = masterBarangMap.get(item.nama.trim().toLowerCase());
    if (!masterItem) return true;
    return masterItem.kuantitas <= 0 || Number(item.kuantitas) > masterItem.kuantitas;
  });

  // Pengecekan Duplikat Nomor Surat (independen per jenis transaksi)
  const isDuplicateNomor = Boolean(
    formData.nomorSurat &&
      (transactions || []).some(
        (t) =>
          ((t.jenis_transaksi || t.jenisTransaksi) === jenisTransaksi) &&
          (t.nomor_surat || t.nomorSurat)?.trim().toLowerCase() === formData.nomorSurat?.trim().toLowerCase() &&
          t.id !== activeTransaction?.id
      )
  );

  // Validation Outlet Utama (Tujuan / Asal)
  const outletIsValid = Boolean(currentOutletName && currentOutletName.trim());

  // Validation Pihak yang Terlibat (Semua 6 kolom wajib diisi)
  const pengirimNamaValid = Boolean(formData.pengirimNama && formData.pengirimNama.trim());
  const pengirimJabatanValid = Boolean(formData.pengirimJabatan && formData.pengirimJabatan.trim());
  const mengetahuiNamaValid = Boolean(formData.mengetahuiNama && formData.mengetahuiNama.trim());
  const mengetahuiJabatanValid = Boolean(formData.mengetahuiJabatan && formData.mengetahuiJabatan.trim());
  const penerimaNamaValid = Boolean(formData.penerimaNama && formData.penerimaNama.trim());
  const penerimaJabatanValid = Boolean(formData.penerimaJabatan && formData.penerimaJabatan.trim());

  const pihakIsValid =
    pengirimNamaValid &&
    pengirimJabatanValid &&
    mengetahuiNamaValid &&
    mengetahuiJabatanValid &&
    penerimaNamaValid &&
    penerimaJabatanValid;

  // Validation Daftar Barang (Nama Barang & Outlet Tujuan/Asal wajib diisi per baris)
  const itemsNamaValid = items.length > 0 && items.every((i) => Boolean(i.nama && i.nama.trim()));
  const itemsOutletValid = items.length > 0 && items.every((i) => Boolean(i.outlet && i.outlet.trim()));
  const itemsQuantityValid = items.length > 0 && items.every((i) => Number.isInteger(Number(i.kuantitas)) && Number(i.kuantitas) >= 1);
  const itemsValid = itemsNamaValid && itemsOutletValid && itemsQuantityValid;

  const nomorIsEmpty = !formData.nomorSurat;
  const nomorIs000 = formData.nomorSurat?.startsWith("000/");
  const nomorIsValid = isNomorValid(formData.nomorSurat) && !isDuplicateNomor;

  const canProceed = nomorIsValid;
  const formValidationMessage = nomorIsValid
    ? ""
    : "Nomor surat belum diisi! Harap masukkan nomor surat terlebih dahulu untuk mencetak atau menyimpan transaksi.";

  useEffect(() => {
    onValidityChange({ canProceed, message: formValidationMessage });
  }, [canProceed, formValidationMessage, onValidityChange]);

  const handleProceedToPreview = () => {
    if (!nomorIsValid) {
      setShowValidationModal(true);
      return;
    }
    setView("preview");
  };

  return (
    <div className="w-full max-w-none space-y-4 pb-6 print:hidden">
      {/* ── TOP BAR ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 px-4 py-4 sm:px-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center flex-shrink-0 text-white">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gray-900 dark:text-slate-100 leading-tight">{activeTransaction ? "Edit Berita Acara (BAST)" : "Buat Berita Acara (BAST)"}</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Editor Berita Acara Serah Terima Barang</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasSubmittedValidation && !canProceed && (
            <div className="hidden xl:flex items-center gap-2">
              {isDuplicateNomor ? (
                <span className="text-[11px] font-extrabold text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 px-3.5 py-1.5 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-1.5 shadow-2xs">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Nomor surat sudah digunakan!
                </span>
              ) : !nomorIsValid ? (
                <span className="text-[11px] font-extrabold text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 px-3.5 py-1.5 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-1.5 shadow-2xs">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Nomor surat wajib diisi & valid
                </span>
              ) : !outletIsValid ? (
                <span className="text-[11px] font-extrabold text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 px-3.5 py-1.5 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-1.5 shadow-2xs">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Outlet {isKeluar ? "tujuan" : "asal"} wajib diisi
                </span>
              ) : !pihakIsValid ? (
                <span className="text-[11px] font-extrabold text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 px-3.5 py-1.5 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-1.5 shadow-2xs">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Semua nama & jabatan wajib diisi
                </span>
              ) : !itemsNamaValid ? (
                <span className="text-[11px] font-extrabold text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 px-3.5 py-1.5 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-1.5 shadow-2xs">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Nama barang pada daftar barang wajib diisi
                </span>
              ) : !itemsOutletValid ? (
                <span className="text-[11px] font-extrabold text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 px-3.5 py-1.5 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-1.5 shadow-2xs">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Outlet {isKeluar ? "tujuan" : "asal"} pada daftar barang wajib diisi
                </span>
              ) : !itemsQuantityValid ? (
                <span className="text-[11px] font-extrabold text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 px-3.5 py-1.5 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-1.5 shadow-2xs">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> QTY setiap barang minimal 1
                </span>
              ) : null}
            </div>
          )}
          <button
            type="button"
            onClick={handleProceedToPreview}
            className="lg:hidden inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Preview <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 rounded-xl bg-emerald-800 p-1 text-center text-[11px] font-bold shadow-sm sm:text-xs" role="tablist" aria-label="Tahapan formulir BAST">
        {[
          { id: "kop", label: "Kop & Pihak" },
          { id: "pihak", label: "Pihak Terlibat" },
          { id: "barang", label: `Daftar Barang (${items.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeFormTab === tab.id}
            onClick={() => setActiveFormTab(tab.id)}
            className={`min-h-10 rounded-lg px-1.5 py-2 transition-colors sm:px-3 ${activeFormTab === tab.id ? "bg-white text-emerald-800 shadow-sm" : "text-emerald-50 hover:bg-emerald-700"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── SECTION 1: Info Dokumen ── */}
      {activeFormTab === "kop" && (
        <>
      <div className="bg-white dark:bg-gradient-to-br dark:from-[#052819] dark:via-[#073622] dark:to-[#03140d] rounded-3xl shadow-xl shadow-gray-200/60 dark:shadow-none border border-gray-200/90 dark:border-[#2b4533] p-6 sm:p-7 transition-all">
        <h3 className="text-sm sm:text-base font-black tracking-wide uppercase text-emerald-600 dark:text-emerald-400 mb-5 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          Informasi Dokumen
        </h3>

        {/* Banner Pengaturan Nomor Surat (Khusus Admin) - Di Bagian Paling Atas Card Informasi Dokumen */}
        {isAdmin && (
          <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/40 border border-emerald-200/90 dark:border-emerald-800/60 rounded-2xl shadow-2xs gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#0d5c3a] text-white rounded-xl shadow-xs">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 dark:text-white block">
                  Pengaturan Nomor Surat
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  Kelola mode penomoran otomatis, reset nomor, dan nomor manual surat serah terima barang
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0d5c3a] hover:bg-[#094229] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Pengaturan Nomor Surat</span>
            </button>
          </div>
        )}

        {/* Baris 1: Jenis Transaksi, Nomor Surat, Tanggal */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-4">
            <Field label="Jenis Transaksi">
              <div className="flex gap-2 h-[42px]">
                <button
                  type="button"
                  onClick={() => handleJenisChange("Barang Keluar")}
                  className={`flex-1 flex items-center justify-center gap-1.5 h-full rounded-xl border text-xs font-extrabold transition-all cursor-pointer shadow-2xs ${
                    isKeluar
                      ? "bg-red-50 border-red-300 text-red-700 dark:bg-red-950/50 dark:border-red-800 dark:text-red-300"
                      : "bg-white dark:bg-[#16231a] border-gray-300 dark:border-[#2b4533] text-gray-500 dark:text-slate-400 hover:border-gray-400"
                  }`}
                >
                  <PackageMinus className="w-3.5 h-3.5" /> Keluar
                </button>
                <button
                  type="button"
                  onClick={() => handleJenisChange("Barang Masuk")}
                  className={`flex-1 flex items-center justify-center gap-1.5 h-full rounded-xl border text-xs font-extrabold transition-all cursor-pointer shadow-2xs ${
                    !isKeluar
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300"
                      : "bg-white dark:bg-[#16231a] border-gray-300 dark:border-[#2b4533] text-gray-500 dark:text-slate-400 hover:border-gray-400"
                  }`}
                >
                  <PackageCheck className="w-3.5 h-3.5" /> Masuk
                </button>
              </div>
            </Field>
          </div>

          <div className="md:col-span-5 min-w-0">
            <div>
              <div className="flex items-center justify-between mb-1.5 h-5 leading-none">
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
                  Nomor Surat <span className="text-red-500 font-black text-xs ml-0.5 leading-none">*</span>
                </label>
                {!isManualMode && (
                  <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                    🔒 Terkunci ({letterNumberMode === "reset_manual" ? "Reset Manual" : "Otomatis"})
                  </span>
                )}
              </div>
              <div
                className={`flex items-center rounded-xl border overflow-hidden transition-all shadow-2xs h-[42px] ${
                  isDuplicateNomor || nomorIs000 || (hasSubmittedValidation && !nomorIsValid)
                    ? "border-red-500 bg-red-50/80 dark:bg-red-950/40 ring-2 ring-red-100 dark:ring-red-900/40"
                    : nomorIsValid
                    ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-100 dark:ring-emerald-900/30"
                    : "border-gray-300 dark:border-[#2b4533] bg-white dark:bg-[#16231a]"
                }`}
              >
                <input
                  type="text"
                  inputMode={isManualMode ? "numeric" : "none"}
                  maxLength={6}
                  placeholder="000"
                  value={nomorUrut}
                  readOnly={!isManualMode}
                  onChange={isManualMode ? handleNomorChange : undefined}
                  className={`w-[3.75rem] min-w-[3.75rem] shrink-0 h-full px-1 text-center font-mono font-black text-sm outline-none focus:outline-none focus:ring-0 focus:border-none border-none bg-transparent ${
                    isManualMode
                      ? "text-gray-900 dark:text-slate-100 cursor-text"
                      : "text-gray-600 dark:text-gray-400 cursor-not-allowed select-none"
                  }`}
                  title={!isManualMode ? `Nomor surat terisi otomatis (Mode ${letterNumberMode === "reset_manual" ? "Reset Manual" : "Otomatis"}). Ubah ke Mode Manual di Pengaturan Nomor Surat jika ingin mengubah nomor surat.` : ""}
                />
                <span className="min-w-0 flex-1 flex items-center justify-start px-1 text-gray-900 dark:text-emerald-400 font-mono text-[9px] border-l border-gray-200 dark:border-[#2b4533] bg-gray-50 dark:bg-[#1e3125] h-full select-none font-bold truncate">
                  {suffix}
                </span>
              </div>
              {slotError && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-1 font-bold items-center gap-1">
                  <AlertTriangle className="w-3 h-3 shrink-0" /> {slotError}
                </span>
              )}
              {isDuplicateNomor && (
                <span className="text-[10px] text-red-600 dark:text-red-400 block mt-1 font-bold">
                  Nomor surat "{formData.nomorSurat}" sudah digunakan!
                </span>
              )}
              {nomorIs000 && !isDuplicateNomor && (
                <span className="text-[10px] text-red-500 dark:text-red-400 block mt-1 font-bold">
                  Nomor surat tidak boleh 000
                </span>
              )}
              {hasSubmittedValidation && nomorIsEmpty && (
                <span className="text-[10px] text-red-500 dark:text-red-400 block mt-1 font-semibold">
                  Wajib diisi <span className="text-red-500 font-black">*</span>
                </span>
              )}
              {!nomorIsEmpty && nomorIsValid && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 font-mono font-bold">
                  ✓ {formData.nomorSurat}
                </p>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            <Field label="Tanggal *">
              <input
                type="date"
                name="tanggal"
                value={formData.tanggal}
                onChange={(e) => {
                  handleInputChange(e);
                  if (!activeTransaction) {
                    fetchNextNumber(e.target.value, jenisTransaksi);
                  }
                }}
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        {/* Baris 2: Lokasi & Outlet Tujuan / Outlet Asal */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-5 pt-4 border-t border-slate-100 dark:border-[#1e3125]">
          <div className="md:col-span-6">
            <Field label="Lokasi">
              <input
                type="text"
                name="lokasi"
                value={formData.lokasi}
                onChange={handleInputChange}
                placeholder="Contoh: Gudang Logistik Kanwil VIII"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="md:col-span-6">
            <Field label={isKeluar ? "Outlet Tujuan *" : "Outlet Asal *"}>
              <OutletSelectDropdown
                value={isKeluar ? formData.outletTujuan || "" : formData.outletAsal || ""}
                onChange={(val) => {
                  if (isKeluar) {
                    handleInputChange({ target: { name: "outletTujuan", value: val } });
                    handleInputChange({ target: { name: "penerimaInstansi", value: val } });
                  } else {
                    handleInputChange({ target: { name: "outletAsal", value: val } });
                    handleInputChange({ target: { name: "pengirimInstansi", value: val } });
                  }
                }}
                onSelect={handleOutletSelect}
                outlets={outlets}
                placeholder={isKeluar ? "Pilih atau ketik outlet tujuan..." : "Pilih atau ketik outlet asal..."}
              />
            </Field>
            {hasSubmittedValidation && !outletIsValid && (
              <span className="text-[10px] text-red-500 dark:text-red-400 block mt-1 font-semibold">
                Wajib diisi <span className="text-red-500 font-black">*</span>
              </span>
            )}
          </div>
        </div>
      </div>
          <div className="flex justify-end">
            <button type="button" onClick={() => setActiveFormTab("pihak")} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800">
              Lanjut: Pihak Terlibat <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}

      {/* ── SECTION 2: Pihak yang Terlibat ── */}
      {activeFormTab === "pihak" && (
        <>
      <div className="bg-white dark:bg-gradient-to-br dark:from-[#052819] dark:via-[#073622] dark:to-[#03140d] rounded-3xl shadow-xl shadow-gray-200/60 dark:shadow-none border border-gray-200/90 dark:border-[#2b4533] p-6 sm:p-7 transition-all">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm sm:text-base font-black tracking-wide uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Pihak yang Terlibat
          </h3>
          {hasSubmittedValidation && !pihakIsValid && (
            <span className="text-[11px] font-extrabold text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 px-3 py-1 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Semua nama & jabatan wajib diisi
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Yang Menyerahkan */}
          <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/50 dark:bg-[#14261c] p-4 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-black">1</div>
              <label className="text-xs font-black text-gray-900 dark:text-slate-100 uppercase tracking-wider">
                Yang Menyerahkan <span className="text-red-500 font-black text-sm ml-0.5">*</span>
              </label>
            </div>
            <div className="space-y-2">
              <input
                name="pengirimNama"
                value={formData.pengirimNama}
                onChange={handleInputChange}
                placeholder="Nama lengkap *"
                className={`${inputCls} ${hasSubmittedValidation && !pengirimNamaValid ? "border-red-500 focus:border-red-500 ring-2 ring-red-100 dark:ring-red-900/40" : ""}`}
              />
              <input
                name="pengirimJabatan"
                value={formData.pengirimJabatan}
                onChange={handleInputChange}
                placeholder="Jabatan *"
                className={`${inputCls} ${hasSubmittedValidation && !pengirimJabatanValid ? "border-red-500 focus:border-red-500 ring-2 ring-red-100 dark:ring-red-900/40" : ""}`}
              />
            </div>
          </div>

          {/* Mengetahui */}
          <div className="rounded-2xl border border-purple-200/80 dark:border-purple-900/60 bg-purple-50/50 dark:bg-[#14261c] p-4 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-[11px] font-black">2</div>
              <label className="text-xs font-black text-gray-900 dark:text-slate-100 uppercase tracking-wider">
                Mengetahui <span className="text-red-500 font-black text-sm ml-0.5">*</span>
              </label>
            </div>
            <div className="space-y-2">
              <input
                name="mengetahuiNama"
                value={formData.mengetahuiNama}
                onChange={handleInputChange}
                placeholder="Nama lengkap *"
                className={`${inputCls} ${hasSubmittedValidation && !mengetahuiNamaValid ? "border-red-500 focus:border-red-500 ring-2 ring-red-100 dark:ring-red-900/40" : ""}`}
              />
              <input
                name="mengetahuiJabatan"
                value={formData.mengetahuiJabatan}
                onChange={handleInputChange}
                placeholder="Jabatan *"
                className={`${inputCls} ${hasSubmittedValidation && !mengetahuiJabatanValid ? "border-red-500 focus:border-red-500 ring-2 ring-red-100 dark:ring-red-900/40" : ""}`}
              />
            </div>
          </div>

          {/* Yang Menerima */}
          <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-[#14261c] p-4 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[11px] font-black">3</div>
              <label className="text-xs font-black text-gray-900 dark:text-slate-100 uppercase tracking-wider">
                Yang Menerima <span className="text-red-500 font-black text-sm ml-0.5">*</span>
              </label>
            </div>
            <div className="space-y-2">
              <input
                name="penerimaNama"
                value={formData.penerimaNama}
                onChange={handleInputChange}
                placeholder="Nama lengkap *"
                className={`${inputCls} ${hasSubmittedValidation && !penerimaNamaValid ? "border-red-500 focus:border-red-500 ring-2 ring-red-100 dark:ring-red-900/40" : ""}`}
              />
              <input
                name="penerimaJabatan"
                value={formData.penerimaJabatan}
                onChange={handleInputChange}
                placeholder="Jabatan *"
                className={`${inputCls} ${hasSubmittedValidation && !penerimaJabatanValid ? "border-red-500 focus:border-red-500 ring-2 ring-red-100 dark:ring-red-900/40" : ""}`}
              />
            </div>
          </div>
        </div>
      </div>
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => setActiveFormTab("kop")} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              <ArrowLeft className="h-3.5 w-3.5" /> Kembali: Kop
            </button>
            <button type="button" onClick={() => setActiveFormTab("barang")} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800">
              Lanjut: Daftar Barang <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}

      {/* ── SECTION 3: Daftar Barang ── */}
      {activeFormTab === "barang" && (
        <>
      <div className="bg-white dark:bg-gradient-to-br dark:from-[#052819] dark:via-[#073622] dark:to-[#03140d] rounded-3xl shadow-xl shadow-gray-200/60 dark:shadow-none border border-gray-200/90 dark:border-[#2b4533] p-6 sm:p-7 transition-all">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm sm:text-base font-black tracking-wide uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Daftar Barang
            </h3>
            <span className="text-[11px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              {items.length} baris
            </span>
          </div>
          <button
            onClick={addItem}
            className="flex items-center gap-1.5 text-xs font-bold bg-[#279969] hover:bg-[#1e7a53] active:scale-95 text-white px-5 py-2.5 rounded-full transition-all shadow-md shadow-[#279969]/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Baris
          </button>
        </div>

        <datalist id="db-barang">
          {(inventory || []).map((i) => (
            <option key={i.id} value={i.nama} />
          ))}
          {(masterMeubelairs || []).map((mm) => (
            <option key={`mm-${mm.id}`} value={mm.nama_barang || mm.jenis || mm.nama} />
          ))}
        </datalist>

        {/* Container tabel digabung dengan Footer Ringkasan */}
        <div className="rounded-2xl border border-gray-200 dark:border-[#2b4533] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
              <thead className="bg-gray-100 dark:bg-[#16231a] border-b border-gray-200 dark:border-[#2b4533] text-xs font-black uppercase tracking-wider text-gray-900 dark:text-slate-100">
                <tr>
                  <th className="px-3 py-3.5 text-center font-extrabold text-gray-900 dark:text-slate-100 w-12">No</th>
                  <th className="px-3 py-3.5 font-extrabold text-gray-900 dark:text-slate-100 w-[25%]">
                    Nama Barang <span className="text-red-500 font-black text-sm ml-0.5">*</span>
                  </th>
                  <th className="px-3 py-3.5 font-extrabold text-gray-900 dark:text-slate-100 w-[15%]">S/N</th>
                  <th className="px-3 py-3.5 text-center font-extrabold text-gray-900 dark:text-slate-100 w-24 min-w-[6rem]">Qty</th>
                  <th className="px-3 py-3.5 font-extrabold text-gray-900 dark:text-slate-100 w-28">Satuan</th>
                  <th className="px-3 py-3.5 font-extrabold text-gray-900 dark:text-slate-100 w-[20%]">
                    {isKeluar ? "Outlet Tujuan" : "Outlet Asal"} <span className="text-red-500 font-black text-sm ml-0.5">*</span>
                  </th>
                  <th className="px-3 py-3.5 font-extrabold text-gray-900 dark:text-slate-100 min-w-[150px]">Keterangan</th>
                  <th className="px-3 py-3.5 text-center font-extrabold text-gray-900 dark:text-slate-100 w-12">Aksi</th>
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
                      <BarangSelectDropdown
                        value={item.nama || ""}
                        onChange={(val) => {
                          const normalizedName = val.trim().toLowerCase();
                          const masterItem = [...(inventory || []), ...(masterMeubelairs || [])].find((entry) =>
                            (entry.nama || entry.nama_barang || entry.jenis || "").trim().toLowerCase() === normalizedName
                          );
                          handleItemChange(item.id, {
                            nama: val,
                            vendor: masterItem ? getItemVendor(masterItem) : "",
                          });
                        }}
                        onSelect={(inv) => {
                          handleItemChange(item.id, {
                            nama: inv.nama,
                            satuan: inv.satuan || item.satuan,
                            vendor: getItemVendor(inv),
                          });
                        }}
                        inventory={inventory}
                        masterMeubelairs={masterMeubelairs}
                        placeholder="Ketik atau pilih barang..."
                      />
                      {hasSubmittedValidation && !item.nama ? (
                        <span className="text-[10px] text-red-500 dark:text-red-400 block mt-0.5 font-semibold">
                          Wajib diisi <span className="text-red-500 font-black">*</span>
                        </span>
                      ) : isKeluar && item.nama && (() => {
                        const masterItem = masterBarangMap.get(item.nama.trim().toLowerCase());
                        if (!masterItem) {
                          return (
                            <span className="text-[10px] text-amber-600 block mt-0.5 font-medium">
                              Barang tidak terdaftar di master
                            </span>
                          );
                        }
                        if (masterItem.kuantitas <= 0) {
                          return (
                            <span className="text-[10px] text-red-500 block mt-0.5 font-semibold">
                              Stok habis!
                            </span>
                          );
                        }
                        return (
                          <span className="text-[10px] text-gray-500 dark:text-slate-400 block mt-0.5 font-medium">
                            Tersedia: {masterItem.kuantitas} {masterItem.satuan} ({masterItem.isMeubelair ? "Meubelair" : "Non Meubelair"})
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-2 py-2">
                      <input
                        value={item.sn}
                        onChange={(e) => handleItemChange(item.id, "sn", e.target.value)}
                        className="w-full text-xs font-mono px-2 py-2 border border-transparent hover:border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-md bg-transparent focus:bg-white transition-all outline-none dark:focus:bg-[#0f1712] dark:hover:border-[#2b4533] dark:text-[#f1f5f3] dark:focus:text-white"
                        placeholder="Serial number"
                      />
                    </td>
                    <td className="w-24 min-w-[6rem] px-2 py-2">
                      <input
                        type="number"
                        min="1"
                        value={item.kuantitas}
                        onChange={(e) => handleItemChange(item.id, "kuantitas", e.target.value)}
                        className={`w-full min-w-[4.5rem] text-sm text-center px-2 py-2 border rounded-md bg-white transition-all outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:bg-[#0f1712] dark:text-[#f1f5f3] dark:focus:text-white ${hasSubmittedValidation && (!Number.isInteger(Number(item.kuantitas)) || Number(item.kuantitas) < 1) ? "border-red-500" : "border-gray-200 dark:border-[#2b4533]"}`}
                      />
                      {hasSubmittedValidation && (!Number.isInteger(Number(item.kuantitas)) || Number(item.kuantitas) < 1) && (
                        <span className="mt-1 block text-center text-[10px] font-semibold text-red-500">Min. 1</span>
                      )}
                      {isKeluar && item.nama && (() => {
                        const invItem = inventory.find(i => i.nama === item.nama);
                        if (invItem && invItem.kuantitas > 0 && Number(item.kuantitas) > invItem.kuantitas) {
                          return (
                            <span className="text-[10px] text-red-500 block mt-0.5 text-center font-medium">
                              Stok kurang
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </td>
                    <td className="px-2 py-2 relative">
                      <select
                        value={item.satuan}
                        onChange={(e) => handleItemChange(item.id, "satuan", e.target.value)}
                        className="w-full text-xs appearance-none bg-none px-2 py-2 border border-[#1b7e47] dark:border-emerald-500 focus:border-[#1b7e47] focus:ring-1 focus:ring-[#1b7e47] rounded-xl bg-white focus:bg-white transition-all outline-none pr-7 cursor-pointer dark:bg-[#0f1712] dark:text-[#f1f5f3] shadow-2xs font-semibold"
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
                      <OutletSelectDropdown
                        isTableCell={true}
                        value={item.outlet || ""}
                        onChange={(val) => {
                          const matched = (outlets || []).find(o => o.nama?.toLowerCase() === val?.toLowerCase());
                          handleItemChange(item.id, {
                            outlet: val,
                            outlet_id: matched ? matched.id : null,
                          });
                        }}
                        onSelect={(out) => {
                          handleItemChange(item.id, {
                            outlet: out?.nama || out?.value || "",
                            outlet_id: out?.id || null,
                          });
                        }}
                        outlets={outlets}
                        placeholder="Pilih atau ketik..."
                      />
                      {hasSubmittedValidation && !item.outlet && (
                        <span className="text-[10px] text-red-500 dark:text-red-400 block mt-0.5 font-semibold">
                          Wajib diisi <span className="text-red-500 font-black">*</span>
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2">
                      <input
                        value={item.keterangan}
                        onChange={(e) => handleItemChange(item.id, "keterangan", e.target.value)}
                        className="w-full text-xs px-2 py-2 border border-transparent hover:border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-md bg-transparent focus:bg-white transition-all outline-none dark:focus:bg-[#0f1712] dark:hover:border-[#2b4533] dark:text-[#f1f5f3] dark:focus:text-white"
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
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => setActiveFormTab("pihak")} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              <ArrowLeft className="h-3.5 w-3.5" /> Kembali: Pihak
            </button>
            <button type="button" onClick={handleProceedToPreview} className="lg:hidden inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800">
              Lihat Preview <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}

      {/* Custom Validation Error Modal (Pop Up Formulir Belum Lengkap) */}
      {showValidationModal && typeof document !== "undefined" && createPortal(
        <div 
          onClick={() => setShowValidationModal(false)}
          className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm print:hidden animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1a2b20] border border-gray-200 dark:border-[#2b4533] rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-7 transition-all duration-200 transform scale-100 animate-scale-up"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4 border border-red-100 dark:border-red-900/40">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-slate-100 mb-2">Nomor Surat Belum Valid</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6 font-medium">
                Harap isi nomor surat yang valid sebelum lanjut ke preview dokumen.
              </p>
              <button
                type="button"
                onClick={() => setShowValidationModal(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black py-3 px-4 rounded-2xl shadow-md transition-all text-xs cursor-pointer focus:ring-2 focus:ring-emerald-500/20 outline-none tracking-wide uppercase"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Pengaturan Nomor Surat Khusus Admin */}
      {isAdmin && (
        <LetterNumberSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          letterType={isKeluar ? "serah_terima_keluar" : "serah_terima_masuk"}
          title="Pengaturan Nomor Surat Serah Terima Barang"
          activeTanggal={formData.tanggal}
          jenisTransaksi={jenisTransaksi}
          onSettingsSaved={(data) => {
            if (data?.setting?.mode) setLetterNumberMode(data.setting.mode);
            fetchNextNumber(formData.tanggal, jenisTransaksi);
          }}
        />
      )}

    </div>
  );
};

export default FormView;