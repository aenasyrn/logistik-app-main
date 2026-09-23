import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { usePage } from "@inertiajs/react";
import {
  FileText, ArrowRight, Plus, Trash2, AlertCircle, AlertTriangle, Info,
  Package, PackageCheck, PackageMinus, User, Building2, Hash,
  MapPin, Calendar, ClipboardList, ChevronDown, Settings,
} from "lucide-react";
import CustomSelectDropdown from "./CustomSelectDropdown";
import VendorSelectDropdown from "./VendorSelectDropdown";
import LetterNumberSettingsModal from "./LetterNumberSettingsModal";
import WeekendWarningModal from "../Common/WeekendWarningModal";
import axios from "axios";

const NOMOR_PATTERN = /^\d+\/[A-Za-z0-9._-]+\/\d{2}\/\d{4}$/;

const isNomorValid = (nomor) => {
  if (!nomor || !NOMOR_PATTERN.test(nomor)) return false;
  return !/^0+$/.test(nomor.split("/")[0]);
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
  vendors = [],
  transactions = [],
  activeTransaction = null,
}) => {
  const [nomorUrut, setNomorUrut] = useState("");
  const [jenisTransaksi, setJenisTransaksi] = useState(
    formData.jenisTransaksi || "Barang Keluar"
  );
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [hasSubmittedValidation, setHasSubmittedValidation] = useState(false);
  const [vendorOption, setVendorOption] = useState("sama");

  const { auth } = usePage().props;
  const isAdmin = auth?.user?.role === "admin";
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showWeekendModal, setShowWeekendModal] = useState(false);
  const [slotError, setSlotError] = useState(null);
  const [letterNumberMode, setLetterNumberMode] = useState("otomatis");
  const isManualMode = letterNumberMode === "manual";

  const isKeluar = jenisTransaksi === "Barang Keluar";

  // Selected outlet name & object
  const currentOutletName = isKeluar
    ? formData.outletTujuan || ""
    : formData.outletAsal || "";

  const selectedOutletObj = (outlets || []).find((o) => o.nama === currentOutletName);

  const dateObj = formData.tanggal ? new Date(formData.tanggal) : new Date();
  const bulan = String(dateObj.getMonth() + 1).padStart(2, "0");
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

  const suffix = `/${kodeOutlet || "____"}/${bulan}/${tahun}`;

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
  }, [nomorUrut, kodeOutlet, bulan, tahun]);

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
        const targetBulan = dateParts.length === 3 ? dateParts[1] : String(new Date(qDate).getMonth() + 1).padStart(2, "0");
        const targetTahun = dateParts.length === 3 ? dateParts[0] : new Date(qDate).getFullYear();
        const currentTargetSuffix = `/${currentTargetKode || "____"}/${targetBulan}/${targetTahun}`;
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
  const itemsVendorValid = items.length > 0 && items.every((i) => Boolean(i.vendor && i.vendor.trim()));
  const itemsValid = itemsNamaValid && itemsOutletValid && itemsVendorValid;

  const isWeekend = (dateStr) => {
    if (!dateStr) return false;
    const parts = String(dateStr).split("T")[0].split("-");
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const day = d.getDay();
      return day === 0 || day === 6;
    }
    const d = new Date(dateStr);
    const day = d.getDay();
    return day === 0 || day === 6;
  };

  const tanggalIsWeekend = isWeekend(formData.tanggal);
  const nomorIsEmpty = !formData.nomorSurat;
  const nomorIs000 = formData.nomorSurat?.startsWith("000/");
  const nomorIsValid = isNomorValid(formData.nomorSurat) && !isDuplicateNomor;

  const canProceed = nomorIsValid && outletIsValid && pihakIsValid && itemsValid && !hasInvalidStock && !tanggalIsWeekend;

  const handleProceedToPreview = () => {
    if (tanggalIsWeekend) {
      setShowWeekendModal(true);
      return;
    }
    if (canProceed) {
      setView("preview");
    } else {
      setHasSubmittedValidation(true);
      setShowValidationModal(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-6 print:hidden pb-10 space-y-6">
      {/* ── TOP BAR ── */}
      <div className="bg-white dark:bg-gradient-to-br dark:from-[#052819] dark:via-[#073622] dark:to-[#03140d] rounded-3xl shadow-xl shadow-gray-200/60 dark:shadow-none border border-gray-200/90 dark:border-[#2b4533] px-6 py-5 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-600/30">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-slate-100 leading-tight tracking-tight">Buat Surat Serah Terima</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 font-medium">Isi semua data dengan benar sebelum lanjut ke preview</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasInvalidStock && (
            <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 shadow-2xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Stok barang tidak valid / tidak cukup
            </span>
          )}
          {hasSubmittedValidation && !canProceed && (
            <div className="flex items-center gap-2">
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
              ) : !itemsVendorValid ? (
                <span className="text-[11px] font-extrabold text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 px-3.5 py-1.5 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-1.5 shadow-2xs">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Vendor barang wajib diisi
                </span>
              ) : null}
            </div>
          )}
          <button
            type="button"
            onClick={handleProceedToPreview}
            className="bg-[#279969] hover:bg-[#1e7a53] active:scale-95 text-white px-7 py-3 rounded-full text-xs font-bold tracking-wide uppercase transition-all shadow-md shadow-[#279969]/30 cursor-pointer"
          >
            Lanjut ke Preview &gt;
          </button>
        </div>
      </div>

      {/* ── SECTION 1: Info Dokumen ── */}
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

          <div className="md:col-span-4">
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
                  className={`min-w-[4rem] w-auto h-full px-2.5 text-center font-mono font-black text-sm outline-none focus:outline-none focus:ring-0 focus:border-none border-none bg-transparent ${
                    isManualMode
                      ? "text-gray-900 dark:text-slate-100 cursor-text"
                      : "text-gray-600 dark:text-gray-400 cursor-not-allowed select-none"
                  }`}
                  title={!isManualMode ? `Nomor surat terisi otomatis (Mode ${letterNumberMode === "reset_manual" ? "Reset Manual" : "Otomatis"}). Ubah ke Mode Manual di Pengaturan Nomor Surat jika ingin mengubah nomor surat.` : ""}
                />
                <span className="flex-1 flex items-center justify-start px-2.5 text-gray-900 dark:text-emerald-400 font-mono text-xs border-l border-gray-200 dark:border-[#2b4533] bg-gray-50 dark:bg-[#1e3125] h-full select-none font-bold truncate">
                  {suffix}
                </span>
              </div>
              {slotError && !tanggalIsWeekend && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-1 font-bold flex items-center gap-1">
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

          <div className="md:col-span-4">
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
              {tanggalIsWeekend && (
                <span className="text-[10px] text-red-600 dark:text-red-400 block mt-1 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 shrink-0" /> Hari Sabtu & Minggu tidak dapat disubmit (hanya Senin s.d. Jumat).
                </span>
              )}
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

      {/* ── SECTION 2: Pihak yang Terlibat ── */}
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

      {/* ── SECTION 3: Daftar Barang ── */}
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
                  <th className="px-3 py-3.5 text-center font-extrabold text-gray-900 dark:text-slate-100 w-20">Qty</th>
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
                        onChange={(val) => handleItemChange(item.id, "nama", val)}
                        onSelect={(inv) => {
                          handleItemChange(item.id, "nama", inv.nama);
                          if (inv.satuan) handleItemChange(item.id, "satuan", inv.satuan);
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
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min="1"
                        value={item.kuantitas}
                        onChange={(e) => handleItemChange(item.id, "kuantitas", e.target.value)}
                        className="w-full text-xs text-center px-2 py-2 border border-transparent hover:border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-md bg-transparent focus:bg-white transition-all outline-none dark:focus:bg-[#0f1712] dark:hover:border-[#2b4533] dark:text-[#f1f5f3] dark:focus:text-white"
                      />
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

          {/* Sub-Section Vendor Barang (Sesuai Baris Barang) */}
          <div className="mt-7 pt-6 border-t border-gray-200 dark:border-[#2b4533] space-y-4 px-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
              <h4 className="text-xs font-black tracking-wider uppercase text-gray-900 dark:text-slate-100 flex items-center gap-1">
                Vendor Barang <span className="text-red-500 font-black text-xs ml-0.5">*</span>
              </h4>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs mr-1">
                <Info className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                Internal logistik (tidak tampil di preview cetak)
              </span>
            </div>

            {/* Opsi Pilihan Mode Vendor jika barang > 1 */}
            {items.length > 1 && (
              <div className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-100/90 dark:bg-[#142219] rounded-2xl border border-gray-200 dark:border-[#243a2b] max-w-fit">
                <button
                  type="button"
                  onClick={() => {
                    setVendorOption("sama");
                    const commonVendor = items[0]?.vendor || "";
                    items.forEach((i) => handleItemChange(i.id, "vendor", commonVendor));
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs flex items-center gap-2 ${
                    vendorOption === "sama"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "bg-white dark:bg-[#16231a] text-gray-600 dark:text-slate-300 hover:text-gray-900 border border-gray-200 dark:border-[#2b4533]"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${vendorOption === "sama" ? "bg-white animate-pulse" : "bg-gray-400"}`} />
                  Vendor Sama (Semua Barang)
                </button>
                <button
                  type="button"
                  onClick={() => setVendorOption("berbeda")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs flex items-center gap-2 ${
                    vendorOption === "berbeda"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "bg-white dark:bg-[#16231a] text-gray-600 dark:text-slate-300 hover:text-gray-900 border border-gray-200 dark:border-[#2b4533]"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${vendorOption === "berbeda" ? "bg-white animate-pulse" : "bg-gray-400"}`} />
                  Vendor Berbeda (Per Baris Barang)
                </button>
              </div>
            )}

            {/* Mode 1: Vendor Sama (Semua barang mengisi vendor yang sama) */}
            {items.length > 1 && vendorOption === "sama" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="bg-gray-50/80 dark:bg-[#16231a] p-3.5 rounded-2xl border border-gray-200/90 dark:border-[#2b4533] space-y-1.5 transition-all">
                  <label className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center justify-between">
                    <span>
                      Vendor Barang (Semua Barang) <span className="text-red-500 font-black text-xs ml-0.5">*</span>
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      ({items.length} Barang)
                    </span>
                  </label>
                  <VendorSelectDropdown
                    value={items[0]?.vendor || ""}
                    onChange={(val) => {
                      items.forEach((i) => handleItemChange(i.id, "vendor", val));
                    }}
                    onSelect={(v) => {
                      items.forEach((i) => handleItemChange(i.id, "vendor", v.nama));
                    }}
                    vendors={vendors}
                    placeholder="Pilih atau ketik nama vendor untuk semua barang..."
                    error={hasSubmittedValidation && !items[0]?.vendor?.trim()}
                    openUpward={true}
                  />
                  {hasSubmittedValidation && !items[0]?.vendor?.trim() && (
                    <span className="text-[10px] text-red-500 dark:text-red-400 block mt-1 font-semibold">
                      Wajib diisi <span className="text-red-500 font-black">*</span>
                    </span>
                  )}
                </div>
              </div>
            ) : (
              /* Mode 2: Vendor Berbeda per Baris Barang (atau barang hanya 1) */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {items.map((item, idx) => {
                  const vendorInvalid = hasSubmittedValidation && !item.vendor?.trim();
                  return (
                    <div
                      key={item.id}
                      className="bg-gray-50/80 dark:bg-[#16231a] p-3.5 rounded-2xl border border-gray-200/90 dark:border-[#2b4533] space-y-1.5 transition-all"
                    >
                      <label className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center justify-between">
                        <span>
                          Vendor Baris {idx + 1} <span className="text-red-500 font-black text-xs ml-0.5">*</span>
                        </span>
                        {item.nama ? (
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate max-w-[180px]">
                            ({item.nama})
                          </span>
                        ) : null}
                      </label>
                      <VendorSelectDropdown
                        value={item.vendor || ""}
                        onChange={(val) => handleItemChange(item.id, "vendor", val)}
                        onSelect={(v) => handleItemChange(item.id, "vendor", v.nama)}
                        vendors={vendors}
                        placeholder={`Pilih atau ketik vendor barang baris ${idx + 1}...`}
                        error={vendorInvalid}
                        openUpward={true}
                      />
                      {vendorInvalid && (
                        <span className="text-[10px] text-red-500 dark:text-red-400 block mt-1 font-semibold">
                          Wajib diisi <span className="text-red-500 font-black">*</span>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

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
              <h3 className="text-lg font-black text-gray-900 dark:text-slate-100 mb-2">Formulir Belum Lengkap</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6 font-medium">
                Harap lengkapi semua field input yang wajib diisi sebelum lanjut ke preview dokumen.
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

      {/* Pop Up Peringatan Hari Akhir Pekan (Tengah Halaman) */}
      <WeekendWarningModal
        isOpen={showWeekendModal}
        onClose={() => setShowWeekendModal(false)}
        title="Hari Akhir Pekan Terpilih"
        message="Hari Sabtu & Minggu tidak dapat digunakan untuk pembuatan surat. Harap pilih tanggal pada hari kerja (Senin s.d. Jumat)."
      />
    </div>
  );
};

export default FormView;