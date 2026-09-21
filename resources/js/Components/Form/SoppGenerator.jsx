import React, { useState, useEffect, useRef, useMemo } from "react";
import { flushSync, createPortal } from "react-dom";
import { ArrowLeft, Printer, Plus, Trash2, ClipboardList, ArrowUp, ArrowDown, GripVertical, Settings } from "lucide-react";
import { router, usePage } from "@inertiajs/react";
import axios from "axios";
import VendorSelectDropdown from "./VendorSelectDropdown";
import CustomSelectDropdown from "./CustomSelectDropdown";
import LetterNumberSettingsModal from "./LetterNumberSettingsModal";
import WeekendWarningModal from "../Common/WeekendWarningModal";

const SearchableSelect = ({ label, value, onChange, options, placeholder, disabled, className, labelCls }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.nama?.toLowerCase().includes(search.toLowerCase())
  );

  const exactMatch = options.some(opt => opt.nama?.toLowerCase() === search.toLowerCase());
  const showCustomOption = search.trim() !== "" && !exactMatch;

  return (
    <div ref={containerRef} className="relative w-full text-left font-sans">
      {label && <label className={labelCls}>{label}</label>}
      <div 
        onClick={() => { if (!disabled) { setIsOpen(!isOpen); setSearch(""); } }}
        className={`w-full px-3 py-2 bg-white dark:bg-[#0f1712] border border-gray-300 dark:border-[#2b4533] rounded-lg cursor-pointer flex justify-between items-center text-xs shadow-2xs ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        <span className={value ? "text-gray-800 dark:text-[#f1f5f3] font-medium" : "text-gray-400 dark:text-slate-500"}>
          {value || placeholder}
        </span>
        <svg className="w-4 h-4 text-gray-400 shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 bg-white dark:bg-[#16231a] border border-gray-200 dark:border-[#2b4533] rounded-xl shadow-lg max-h-60 overflow-y-auto flex flex-col p-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari..."
            className="w-full px-3 py-1.5 mb-1.5 text-xs border border-gray-200 dark:border-[#2b4533] rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
          <div className="overflow-y-auto max-h-48 custom-scrollbar">
            {showCustomOption && (
              <div
                onClick={() => {
                  onChange({ target: { value: search } });
                  setIsOpen(false);
                }}
                className="px-3 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-[#1f3326] rounded-lg cursor-pointer transition-colors font-medium text-left"
              >
                Gunakan: "{search}"
              </div>
            )}
            {filteredOptions.length === 0 && !showCustomOption ? (
              <div className="p-2 text-xs text-gray-500 text-center">Tidak ada hasil</div>
            ) : (
              filteredOptions.map((opt, idx) => (
                <div
                  key={opt.id || idx}
                  onClick={() => {
                    onChange({ target: { value: opt.nama } });
                    setIsOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs text-gray-700 dark:text-[#f1f5f3] hover:bg-emerald-50 dark:hover:bg-[#1f3326] rounded-lg cursor-pointer transition-colors text-left"
                >
                  {opt.nama}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Menerima parameter type untuk menentukan jenis SOPP (Pengadaan atau Sewa)
// serta setView untuk mengatur perpindahan halaman.
// Menentukan jenis SOPP berdasarkan props 'type'.
// Variabel ini digunakan sebagai acuan seluruh logika,
// seperti PPh, akun jurnal, warna header, dan judul dokumen. 
export default function SoppGenerator({ type, setView, activeTab, outlets = [], vendors = [], spkHistory = [] }) {
  const isPengadaan = type === "pengadaan";
  const loadedDataRef = useRef(null);
  const formScrollContainerRef = useRef(null);
  const previewScrollContainerRef = useRef(null);
  const previewScrollTopRef = useRef(0);

  // Scroll to top when this tab becomes active
  useEffect(() => {
    const activeTabId = type === "sewa" ? "sopp_sewa" : (type === "renovasi" ? "sopp_renovasi" : "sopp_pengadaan");
    const isActive = activeTab === activeTabId;
    if (isActive) {
      if (formScrollContainerRef.current) {
        formScrollContainerRef.current.scrollTop = 0;
      }
      previewScrollTopRef.current = 0;
      if (previewScrollContainerRef.current) {
        previewScrollContainerRef.current.scrollTop = 0;
      }
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [activeTab, type]);

  // Format Date to YYYY-MM-DD
  const getTodayISO = () => {
    return new Date().toISOString().split("T")[0];
  };

  // State Declarations
  const [loadedId, setLoadedId] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(0.8);
  const [tanggal, setTanggal] = useState(getTodayISO());
  const [namaOutlet, setNamaOutlet] = useState("");

  // Reset zoom level to 80% when returning to this tab or clicking this feature again
  useEffect(() => {
    const myTabId = type === "sewa" ? "sopp_sewa" : (type === "renovasi" ? "sopp_renovasi" : "sopp_pengadaan");
    if (activeTab === myTabId) {
      setZoomLevel(0.8);
    }
  }, [activeTab, type]);

  useEffect(() => {
    const myTabId = type === "sewa" ? "sopp_sewa" : (type === "renovasi" ? "sopp_renovasi" : "sopp_pengadaan");
    const handleViewSelected = (e) => {
      if (e.detail?.viewId === myTabId) {
        setZoomLevel(0.8);
      }
    };
    window.addEventListener("app-view-selected", handleViewSelected);
    return () => window.removeEventListener("app-view-selected", handleViewSelected);
  }, [type]);

  // Synchronize zoom to 1.0 when browser print triggers
  useEffect(() => {
    const handleBeforePrint = () => {
      const el = document.getElementById(`sopp-print-area-${type}`);
      if (el) {
        el.style.zoom = "1";
      }
    };
    const handleAfterPrint = () => {
      const el = document.getElementById(`sopp-print-area-${type}`);
      if (el) {
        el.style.zoom = zoomLevel.toString();
      }
    };

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [zoomLevel, type]);

  // Listen to direct print request from history (without tab switching)
  useEffect(() => {
    const handlePrintDirect = (e) => {
      const sopp = e.detail;
      if (!sopp) return;
      if (sopp.type !== type) return;

      loadedDataRef.current = {
        dasarPengenaan: sopp.dasarPengenaan !== undefined ? sopp.dasarPengenaan : "",
        nilaiPajak: sopp.nilaiPajak !== undefined ? sopp.nilaiPajak : "",
        jumlah: sopp.jumlah !== undefined ? sopp.jumlah : "",
        pajakAda: sopp.pajakAda !== undefined ? sopp.pajakAda : true,
        statusPkp: sopp.statusPkp !== undefined ? sopp.statusPkp : (sopp.isPkp !== undefined ? (sopp.isPkp ? "pkp" : "non_pkp") : "pkp"),
        pphPasal: sopp.pphPasal !== undefined ? sopp.pphPasal : ""
      };

      flushSync(() => {
        setLoadedId(sopp.id || sopp.loadedId || null);
        if (sopp.nomorUrut !== undefined) setNomorUrut(sopp.nomorUrut);
        if (sopp.nomorSpk !== undefined) setNomorSpk(sopp.nomorSpk);
        else if (sopp.nomor_spk !== undefined) setNomorSpk(sopp.nomor_spk);
        if (sopp.tanggal !== undefined) setTanggal(sopp.tanggal);
        if (sopp.unitKerja !== undefined) setUnitKerja(sopp.unitKerja);
        if (sopp.dibayarkanKepada !== undefined) setDibayarkanKepada(sopp.dibayarkanKepada);
        if (sopp.jumlah !== undefined) setJumlah(sopp.jumlah);
        if (sopp.via !== undefined) setVia(sopp.via);
        if (sopp.noRekening !== undefined) setNoRekening(sopp.noRekening);
        if (sopp.atasNama !== undefined) setAtasNama(sopp.atasNama);
        if (sopp.namaBank !== undefined) setNamaBank(sopp.namaBank);
        if (sopp.cabang !== undefined) setCabang(sopp.cabang);
        if (sopp.npwp !== undefined) setNpwp(sopp.npwp);
        if (sopp.pajakAda !== undefined) setPajakAda(sopp.pajakAda);
        if (sopp.dasarPengenaan !== undefined) setDasarPengenaan(sopp.dasarPengenaan);
        if (sopp.pphPasal !== undefined) setPphPasal(sopp.pphPasal);
        if (sopp.tarif !== undefined) setTarif(sopp.tarif);
        if (sopp.kualifikasiUsaha !== undefined) setKualifikasiUsaha(sopp.kualifikasiUsaha);
        if (sopp.termin !== undefined) setTermin(sopp.termin);
        if (sopp.nilaiPajak !== undefined) setNilaiPajak(sopp.nilaiPajak);
        if (sopp.rows !== undefined) setRows(sopp.rows);
        if (sopp.checklist !== undefined) setChecklist(sopp.checklist);
        if (sopp.dibuatNama !== undefined) setDibuatNama(sopp.dibuatNama);
        if (sopp.dibuatJabatan !== undefined) setDibuatJabatan(sopp.dibuatJabatan);
        if (sopp.diperiksaNama !== undefined) setDiperiksaNama(sopp.diperiksaNama);
        if (sopp.diperiksaJabatan !== undefined) setDiperiksaJabatan(sopp.diperiksaJabatan);
        if (sopp.disetujuiNama !== undefined) setDisetujuiNama(sopp.disetujuiNama);
        if (sopp.disetujuiJabatan !== undefined) setDisetujuiJabatan(sopp.disetujuiJabatan);
      });

      document.body.classList.add(`print-sopp-${type}-only`);
      setTimeout(() => {
        window.print();
        document.body.classList.remove(`print-sopp-${type}-only`);
      }, 1000);
    };

    window.addEventListener("print-sopp-direct", handlePrintDirect);
    return () => {
      window.removeEventListener("print-sopp-direct", handlePrintDirect);
    };
  }, [type]);

  const updateTerminInUraian = (text, terminVal) => {
    let base = (text || "Biaya Pekerjaan Renovasi")
      .replace(/\s*\((Termin\s*\d+|Pelunasan|Retensi\s*5%)\)/gi, "")
      .trim();

    if (terminVal === "Pelunasan" || terminVal === "Retensi 5%") {
      if (!base.toLowerCase().includes("biaya retensi")) {
        base = base.replace(/biaya pekerjaan renovasi/gi, "Biaya Retensi Pekerjaan Renovasi");
      }
      return base;
    } else {
      base = base.replace(/biaya retensi pekerjaan renovasi/gi, "Biaya Pekerjaan Renovasi");
      return terminVal ? `${base} (${terminVal})` : base;
    }
  };

  const resetForm = () => {
    setZoomLevel(0.8);
    if (formScrollContainerRef.current) {
      formScrollContainerRef.current.scrollTop = 0;
    }
    previewScrollTopRef.current = 0;
    if (previewScrollContainerRef.current) {
      previewScrollContainerRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    setLoadedId(null);
    setNomorUrut("");
    setNomorSpk("");
    setTanggal(getTodayISO());
    setNamaOutlet("");
    setUnitKerja("Logistik Kanwil VIII Jakarta");
    setDibayarkanKepada("");
    setJumlah("");
    setVia("");
    setNoRekening("");
    setAtasNama("");
    setNamaBank("");
    setCabang("");
    setNpwp("");
    setPajakAda(true);
    setStatusPkp("pkp");
    setDasarPengenaan("");
    setPphPasal(type === "renovasi" ? "Final" : (type === "sewa" ? "23" : ""));
    setTarif(type === "renovasi" ? "2.65" : (type === "sewa" ? "2" : ""));
    setKualifikasiUsaha(type === "renovasi" ? "Menengah/Besar" : "");
    setTermin(type === "renovasi" ? "Termin 1" : "");
    setNilaiPajak("");
    const isSewaType = type === "sewa";
    const isRenovasiType = type === "renovasi";
    setRows([
      { id: 1, kode: isSewaType ? "514.13.05" : (isRenovasiType ? "171.01.01" : "144.01.01"), uraian: isSewaType ? "Biaya Sewa" : (isRenovasiType ? "Biaya Pekerjaan Renovasi (Termin 1)" : "Pembelian"), debet: "", kredit: "" },
      ...(isRenovasiType ? [{ id: 5, kode: "", uraian: "Retensi 5%", debet: "", kredit: "" }] : []),
      { id: 2, kode: "214.02.02", uraian: isSewaType ? "Pajak PPN 11%" : (isRenovasiType ? "Pajak PPN" : "PPN 11%"), debet: "", kredit: "" },
      { id: 3, kode: isSewaType ? "214.02.03" : (isRenovasiType ? "214.02.03" : "214.01.08"), uraian: isSewaType ? "Pajak Pph 23" : (isRenovasiType ? "Pajak PPH" : "PPh 22"), debet: "", kredit: "" },
      { id: 4, kode: "112.01.03", uraian: isRenovasiType ? "Bank" : "Bank BRI", debet: "", kredit: "" }
    ]);
    setChecklist({
      tagihan: true,
      fakturPajak: true,
      suratJalan: false,
      spk: false,
      kwitansi: true,
      bast: true,
      sopp: true,
      bap: false,
      soa: true,
      foto: false,
      lainLain: false,
      lainLainText: ""
    });
    setDibuatNama("ZONI RAHMAWAN PUTRA");
    setDibuatJabatan("Kabag Pengadaan & Logistik");
    setDiperiksaNama("MAMAN SURATMAN");
    setDiperiksaJabatan("Kadept Logistik & Umum");
    setDisetujuiNama("PRABOWO JADI SUBROTO");
    setDisetujuiJabatan("Deputy Operasional");
    setErrors({});
    fetchNextSoppNumber();
  };

  const applySoppData = (sopp) => {
    if (!sopp) return;
    previewScrollTopRef.current = 0;
    if (previewScrollContainerRef.current) {
      previewScrollContainerRef.current.scrollTop = 0;
    }
    if (formScrollContainerRef.current) {
      formScrollContainerRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: "instant" });

    loadedDataRef.current = {
      dasarPengenaan: sopp.dasarPengenaan !== undefined ? sopp.dasarPengenaan : "",
      nilaiPajak: sopp.nilaiPajak !== undefined ? sopp.nilaiPajak : "",
      jumlah: sopp.jumlah !== undefined ? sopp.jumlah : "",
      pajakAda: sopp.pajakAda !== undefined ? sopp.pajakAda : true,
      statusPkp: sopp.statusPkp !== undefined ? sopp.statusPkp : (sopp.isPkp !== undefined ? (sopp.isPkp ? "pkp" : "non_pkp") : "pkp"),
      pphPasal: sopp.pphPasal !== undefined ? sopp.pphPasal : ""
    };

    setLoadedId(sopp.id || sopp.loadedId || null);
    if (sopp.nomorUrut !== undefined) setNomorUrut(sopp.nomorUrut);
    else if (sopp.nomor_urut !== undefined) setNomorUrut(sopp.nomor_urut);

    if (sopp.nomorSpk !== undefined) setNomorSpk(sopp.nomorSpk);
    else if (sopp.nomor_spk !== undefined) setNomorSpk(sopp.nomor_spk);
    else if (sopp.no_spk !== undefined) setNomorSpk(sopp.no_spk);

    if (sopp.tanggal !== undefined) setTanggal(sopp.tanggal);
    if (sopp.namaOutlet !== undefined) setNamaOutlet(sopp.namaOutlet);
    else if (sopp.nama_outlet !== undefined) setNamaOutlet(sopp.nama_outlet);

    if (sopp.unitKerja !== undefined) setUnitKerja(sopp.unitKerja);
    else if (sopp.unit_kerja !== undefined) setUnitKerja(sopp.unit_kerja);

    if (sopp.dibayarkanKepada !== undefined) setDibayarkanKepada(sopp.dibayarkanKepada);
    else if (sopp.dibayarkan_kepada !== undefined) setDibayarkanKepada(sopp.dibayarkan_kepada);

    if (sopp.jumlah !== undefined) setJumlah(sopp.jumlah);
    if (sopp.via !== undefined) setVia(sopp.via);

    if (sopp.noRekening !== undefined) setNoRekening(sopp.noRekening);
    else if (sopp.norek !== undefined) setNoRekening(sopp.norek);
    else if (sopp.no_rekening !== undefined) setNoRekening(sopp.no_rekening);

    if (sopp.atasNama !== undefined) setAtasNama(sopp.atasNama);
    else if (sopp.atas_nama !== undefined) setAtasNama(sopp.atas_nama);

    if (sopp.namaBank !== undefined) setNamaBank(sopp.namaBank);
    else if (sopp.bank !== undefined) setNamaBank(sopp.bank);

    if (sopp.cabang !== undefined) setCabang(sopp.cabang);
    if (sopp.npwp !== undefined) setNpwp(sopp.npwp);
    if (sopp.statusPkp !== undefined) setStatusPkp(sopp.statusPkp);
    else if (sopp.isPkp !== undefined) setStatusPkp(sopp.isPkp ? "pkp" : "non_pkp");
    if (sopp.pajakAda !== undefined) setPajakAda(Boolean(sopp.pajakAda));
    if (sopp.dasarPengenaan !== undefined) setDasarPengenaan(sopp.dasarPengenaan);
    if (sopp.pphPasal !== undefined) setPphPasal(sopp.pphPasal);
    if (sopp.tarif !== undefined) setTarif(sopp.tarif);
    if (sopp.kualifikasiUsaha !== undefined) setKualifikasiUsaha(sopp.kualifikasiUsaha);
    if (sopp.termin !== undefined) setTermin(sopp.termin);
    if (sopp.nilaiPajak !== undefined) setNilaiPajak(sopp.nilaiPajak);
    if (Array.isArray(sopp.rows) && sopp.rows.length > 0) setRows(sopp.rows);
    if (sopp.checklist !== undefined) setChecklist(sopp.checklist);
    if (sopp.dibuatNama !== undefined) setDibuatNama(sopp.dibuatNama);
    if (sopp.dibuatJabatan !== undefined) setDibuatJabatan(sopp.dibuatJabatan);
    if (sopp.diperiksaNama !== undefined) setDiperiksaNama(sopp.diperiksaNama);
    if (sopp.diperiksaJabatan !== undefined) setDiperiksaJabatan(sopp.diperiksaJabatan);
    if (sopp.disetujuiNama !== undefined) setDisetujuiNama(sopp.disetujuiNama);
    if (sopp.disetujuiJabatan !== undefined) setDisetujuiJabatan(sopp.disetujuiJabatan);
  };

  // Load selected SOPP from history if set
  const prevActiveTabRef = useRef(activeTab);
  useEffect(() => {
    const activeTabId = type === "sewa" ? "sopp_sewa" : (type === "renovasi" ? "sopp_renovasi" : "sopp_pengadaan");
    const isCurrentActive = activeTab === activeTabId;
    const wasActive = prevActiveTabRef.current === activeTabId;
    prevActiveTabRef.current = activeTab;

    if (!isCurrentActive) {
      if (wasActive) {
        resetForm();
      }
      return;
    }

    try {
      const dataStr = localStorage.getItem("selected_sopp_to_edit");
      if (dataStr) {
        if (dataStr === "NEW") {
          resetForm();
          localStorage.removeItem("selected_sopp_to_edit");
        } else {
          const sopp = JSON.parse(dataStr);
          applySoppData(sopp);
          localStorage.removeItem("selected_sopp_to_edit");

          // Check if print flag is active
          const shouldPrint = localStorage.getItem("selected_sopp_to_print");
          if (shouldPrint) {
            localStorage.removeItem("selected_sopp_to_print");
            document.body.classList.add(`print-sopp-${type}-only`);
            setTimeout(() => {
              window.print();
              document.body.classList.remove(`print-sopp-${type}-only`);
            }, 650);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load selected SOPP for editing:", e);
    }
  }, [activeTab, type]);

  // Listen to load document events for instant edits/resets
  useEffect(() => {
    const handleLoadEvent = (e) => {
      const data = e.detail;
      if (!data) return;

      if (data === "NEW") {
        resetForm();
      } else {
        const soppType = data.type || data.tipe_sopp || (type === "renovasi" ? "renovasi" : "");
        if (soppType === type) {
          applySoppData(data);
        }
      }
    };

    window.addEventListener("load-sopp-document", handleLoadEvent);
    return () => {
      window.removeEventListener("load-sopp-document", handleLoadEvent);
    };
  }, [type]);

  const capitalizeFirst = (val) => {
    if (!val) return "";
    return val.charAt(0).toUpperCase() + val.slice(1);
  };

  const { auth } = usePage().props;
  const isAdmin = auth?.user?.role === "admin";
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showWeekendModal, setShowWeekendModal] = useState(false);
  const [weekendModalMessage, setWeekendModalMessage] = useState("");
  const [letterNumberMode, setLetterNumberMode] = useState("otomatis");
  const isManualMode = letterNumberMode === "manual";
  const [nomorUrut, setNomorUrut] = useState("");
  const [nomorSpk, setNomorSpk] = useState("");
  const [unitKerja, setUnitKerja] = useState("Logistik Kanwil VIII Jakarta");

  const fetchNextSoppNumber = async () => {
    try {
      const res = await axios.get("/api/letter-numbers/next", {
        params: { letter_type: "sopp" }
      });
      if (res.data?.mode) {
        setLetterNumberMode(res.data.mode);
      }
      if (res.data?.success && (res.data.next_number || res.data.number)) {
        setNomorUrut(String(res.data.next_number || res.data.number));
      }
    } catch (err) {
      console.error("Gagal mengambil nomor surat SOPP berikutnya:", err);
    }
  };

  useEffect(() => {
    if (!loadedId && !nomorUrut) {
      fetchNextSoppNumber();
    }
  }, [loadedId]);

  const [dibayarkanKepada, setDibayarkanKepada] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [via, setVia] = useState(""); // Kas, Cek, BG

  // Bank Details
  const [noRekening, setNoRekening] = useState("");
  const [atasNama, setAtasNama] = useState("");
  const [namaBank, setNamaBank] = useState("");
  const [cabangBank, setCabangBank] = useState("");
  const [cabang, setCabang] = useState("");
  const [npwp, setNpwp] = useState("");

  // Dynamic Cabang options in exact order from Master Outlet
  const cabangListOptions = useMemo(() => {
    const list = [];
    const seen = new Set();

    const add = (val) => {
      if (!val) return;
      const trimmed = String(val).trim();
      if (trimmed && !seen.has(trimmed.toLowerCase())) {
        seen.add(trimmed.toLowerCase());
        list.push(trimmed);
      }
    };

    // Kanwil and Area Headers
    add("KANWIL VIII JAKARTA");
    add("DEP. LOGISTIK KANWIL VIII");
    add("DEP. SDM KANWIL VIII JAKARTA 1");
    add("DEPARTEMEN MANAJEMEN RISIKO");
    add("AREA SENEN");
    add("AREA KRAMAT JATI");
    add("AREA JATIWARINGIN");
    add("AREA BEKASI");
    add("AREA BOGOR");

    // CP units from outlets in exact sequence
    outlets.forEach(o => {
      const nama = o.nama ? String(o.nama).trim() : "";
      const cb = o.cabang ? String(o.cabang).trim() : "";
      if (/^(CP|CPS)\s/i.test(nama)) add(nama);
      if (cb && /^(CP|CPS)\s/i.test(cb)) add(cb);
    });

    return list.map((c, i) => ({ id: i, nama: c }));
  }, [outlets]);

  // Filter options for Nama Outlet based on selected Cabang (CP Block Slicing matching Master Outlet table)
  const filteredOutletOptions = useMemo(() => {
    if (!cabang || cabang.trim() === "") {
      return outlets.map(o => ({ id: o.id, nama: o.nama }));
    }
    const cleanCabang = cabang.trim().toLowerCase();

    // 1. Check if cabang matches an Area name (e.g. "AREA SENEN")
    const areaMatches = outlets.filter(o => (o.area || "").trim().toLowerCase() === cleanCabang);
    if (areaMatches.length > 0) {
      return areaMatches.map(o => ({ id: o.id, nama: o.nama }));
    }

    // 2. Find indices of all CP/CPS header outlets in outlets array
    const cpIndices = [];
    outlets.forEach((o, idx) => {
      const nama = (o.nama || "").trim().toLowerCase();
      if (/^(cp|cps)\s/i.test(nama)) {
        cpIndices.push({ index: idx, nama });
      }
    });

    // Find index of the selected target CP
    let targetIdx = -1;
    let nextCpIdx = outlets.length;

    for (let i = 0; i < cpIndices.length; i++) {
      if (cpIndices[i].nama === cleanCabang) {
        targetIdx = cpIndices[i].index;
        if (i + 1 < cpIndices.length) {
          nextCpIdx = cpIndices[i + 1].index;
        }
        break;
      }
    }

    const matched = [];
    const seenIds = new Set();

    if (targetIdx !== -1) {
      // Slice outlets from targetIdx up to nextCpIdx - 1 (the exact CP block in Master Outlet)
      for (let i = targetIdx; i < nextCpIdx; i++) {
        const o = outlets[i];
        matched.push(o);
        seenIds.add(o.id);
      }
    }

    // Also include any outlets whose o.cabang explicitly matches selected cabang
    outlets.forEach(o => {
      if (!seenIds.has(o.id)) {
        const oCabang = (o.cabang || "").trim().toLowerCase();
        if (oCabang === cleanCabang) {
          matched.push(o);
          seenIds.add(o.id);
        }
      }
    });

    if (matched.length > 0) {
      return matched.map(o => ({ id: o.id, nama: o.nama }));
    }

    return outlets.map(o => ({ id: o.id, nama: o.nama }));
  }, [cabang, outlets]);

  // Reset selected namaOutlet if current namaOutlet does not belong to the selected cabang
  useEffect(() => {
    if (!cabang || cabang.trim() === "" || !namaOutlet) return;
    const cleanCabang = cabang.trim().toLowerCase();
    const cleanOutlet = namaOutlet.trim().toLowerCase();

    const isMatch = outlets.some(o => {
      const oNama = (o.nama || "").trim().toLowerCase();
      const oCabang = (o.cabang || "").trim().toLowerCase();
      const oArea = (o.area || "").trim().toLowerCase();

      return oNama === cleanOutlet && (oCabang === cleanCabang || oNama === cleanCabang || oArea === cleanCabang);
    });

    if (!isMatch) {
      setNamaOutlet("");
    }
  }, [cabang]);

  // SPK options list for Renovasi SOPP
  const spkOptions = useMemo(() => {
    return (spkHistory || [])
      .filter((s) => {
        const t = (s.tipe_spk || s.type || "").toLowerCase();
        return type === "renovasi" ? (t === "renovasi" || !t) : true;
      })
      .map((s) => {
        const no = s.nomor_spk || s.nomorSpk || "";
        const per = s.perusahaan || s.kepadanya || "";
        const tgl = s.tanggal || s.tanggalSuratRaw || "";
        const ur = s.uraian || "";
        const subParts = [];
        if (tgl) subParts.push(`Tgl: ${tgl}`);
        if (per) subParts.push(`Pihak II: ${per}`);
        if (ur) subParts.push(`Pekerjaan: ${ur}`);
        return {
          id: s.id || no,
          value: no,
          label: no,
          subtext: subParts.join(" • ") || "Dokumen SPK",
          raw: s,
        };
      });
  }, [spkHistory, type]);

  const handleSelectSpk = (spkNo) => {
    const val = typeof spkNo === "string" ? spkNo : (spkNo?.value || spkNo?.label || "");
    setNomorSpk(val);
  };

  // Pajak & Dasar Pengenaan
  const [pajakAda, setPajakAda] = useState(true); // true = Ada, false = Tidak ada
  const [statusPkp, setStatusPkp] = useState("pkp"); // "pkp" | "non_pkp"
  const [dasarPengenaan, setDasarPengenaan] = useState("");
  const [pphPasal, setPphPasal] = useState(type === "renovasi" ? "Final" : (type === "sewa" ? "23" : ""));
  const [tarif, setTarif] = useState(type === "sewa" ? "2" : (type === "renovasi" ? "2.65" : ""));
  const [kualifikasiUsaha, setKualifikasiUsaha] = useState(type === "renovasi" ? "Menengah/Besar" : "");
  const [termin, setTermin] = useState(type === "renovasi" ? "Termin 1" : "");
  const [nilaiPajak, setNilaiPajak] = useState("");

  const [rows, setRows] = useState(() => {
    const isSewa = type === "sewa";
    const isRenovasi = type === "renovasi";
    return [
      { id: 1, kode: isSewa ? "514.13.05" : (isRenovasi ? "171.01.01" : "144.01.01"), uraian: isSewa ? "Biaya Sewa" : (isRenovasi ? "Biaya Pekerjaan Renovasi (Termin 1)" : "Pembelian"), debet: "", kredit: "" },
      ...(isRenovasi ? [{ id: 5, kode: "", uraian: "Retensi 5%", debet: "", kredit: "" }] : []),
      { id: 2, kode: "214.02.02", uraian: isSewa ? "Pajak PPN 11%" : (isRenovasi ? "Pajak PPN" : "PPN 11%"), debet: "", kredit: "" },
      { id: 3, kode: isSewa ? "214.02.03" : (isRenovasi ? "214.02.03" : "214.01.08"), uraian: isSewa ? "Pajak Pph 23" : (isRenovasi ? "Pajak PPH" : "PPh 22"), debet: "", kredit: "" },
      { id: 4, kode: "112.01.03", uraian: isRenovasi ? "Bank" : "Bank BRI", debet: "", kredit: "" }
    ];
  });

  // Menentukan jenis SOPP berdasarkan props 'type'.
  // Variabel ini digunakan sebagai acuan seluruh logika,
  // seperti PPh, akun jurnal, warna header, dan judul dokumen.
  const isSewa = type === "sewa";
  const isRenovasi = type === "renovasi";
  const headerBgColor = isSewa ? "#92d050" : (isRenovasi ? "#ffffff" : "#90c5e3");

  const getJumlahDisplay = () => {
    const bankRow = rows.find(r => r.uraian?.toLowerCase().includes("bank") || r.kode === "112.01.03");
    return bankRow ? bankRow.kredit : "";
  };

  useEffect(() => {
    if (loadedDataRef.current) {
      const cleanStateDP = String(dasarPengenaan || "").replace(/[^0-9]/g, "");
      const cleanRefDP = String(loadedDataRef.current.dasarPengenaan || "").replace(/[^0-9]/g, "");

      const cleanStateNP = String(nilaiPajak || "").replace(/[^0-9]/g, "");
      const cleanRefNP = String(loadedDataRef.current.nilaiPajak || "").replace(/[^0-9]/g, "");

      const cleanStateJml = String(jumlah || "").replace(/[^0-9]/g, "");
      const cleanRefJml = String(loadedDataRef.current.jumlah || "").replace(/[^0-9]/g, "");

      const isIdentical =
        cleanStateDP === cleanRefDP &&
        cleanStateNP === cleanRefNP &&
        cleanStateJml === cleanRefJml &&
        Boolean(pajakAda) === Boolean(loadedDataRef.current.pajakAda) &&
        String(statusPkp || "") === String(loadedDataRef.current.statusPkp || "") &&
        String(pphPasal || "") === String(loadedDataRef.current.pphPasal || "");

      if (isIdentical) {
        return;
      } else {
        loadedDataRef.current = null;
      }
    }

    const cleanDP = String(dasarPengenaan || "").replace(/[^0-9]/g, "");
    const cleanNP = String(nilaiPajak || "").replace(/[^0-9]/g, "");
    const cleanJml = String(jumlah || "").replace(/[^0-9]/g, "");

    const dp = parseFloat(cleanDP) || 0;
    const np = parseFloat(cleanNP) || 0;
    const jml = parseFloat(cleanJml) || 0;

    let ppnVal = 0;
    let retensiVal = 0;
    let bankVal = 0;
    let pphFinalVal = np;

    const isPelunasan = isRenovasi && (termin === "Pelunasan" || termin === "Retensi 5%");

    if (isRenovasi) {
      const nilaiKontrak = dp;
      if (isPelunasan) {
        ppnVal = 0;
        retensiVal = 0;
        pphFinalVal = 0;
        bankVal = nilaiKontrak || jml;
      } else if (pajakAda && nilaiKontrak > 0) {
        const nilaiDasarKontrak = Math.round(nilaiKontrak * (100 / 111));
        const dpp = Math.round(nilaiDasarKontrak * (11 / 12));
        const tarifNum = parseFloat(tarif) || (kualifikasiUsaha === "Menengah/Besar" ? 2.65 : 1.75);
        pphFinalVal = Math.round(nilaiDasarKontrak * (tarifNum / 100));
        ppnVal = Math.round(dpp * 0.12);
        retensiVal = Math.round(nilaiDasarKontrak * 0.05);
        bankVal = nilaiKontrak - pphFinalVal - retensiVal - ppnVal;
      } else {
        bankVal = nilaiKontrak || jml;
      }
    } else if (isSewa) {
      if (!pajakAda) {
        ppnVal = 0;
        pphFinalVal = 0;
        bankVal = dp || jml;
      } else {
        ppnVal = Math.round((dp * 11) / 111);
        const dppMurni = dp - ppnVal;
        const tarifNum = parseFloat(tarif) || 2;
        pphFinalVal = Math.round(dppMurni * (tarifNum / 100));
        bankVal = dp - ppnVal - pphFinalVal;
      }
    } else {
      // PENGADAAN (PEMBELIAN)
      const isPkp = statusPkp === "pkp";
      if (!pajakAda) {
        ppnVal = 0;
        pphFinalVal = 0;
        bankVal = dp || jml;
      } else if (isPkp) {
        // PKP: Dikenakan PPN 11% (asumsi nilai include PPN)
        ppnVal = Math.round((dp * 11) / 111);
        const dppMurni = dp - ppnVal;
        // Jika Diatas 10jt (DPP > 10.000.000 atau dp > 10.000.000) otomatis kena PPh 22 sebesar 1,5%
        const isDiatas10Jt = dppMurni > 10000000 || dp > 10000000;
        pphFinalVal = isDiatas10Jt ? Math.round(dppMurni * 0.015) : 0;
        bankVal = dp - ppnVal - pphFinalVal;
      } else {
        // NON PKP: TIDAK KENA PPN (PPN = 0)
        ppnVal = 0;
        const dppMurni = dp;
        // Jika Diatas 10jt otomatis kena PPh 22 sebesar 1,5%
        const isDiatas10Jt = dppMurni > 10000000;
        pphFinalVal = isDiatas10Jt ? Math.round(dppMurni * 0.015) : 0;
        bankVal = dp - pphFinalVal;
      }
    }

    // Automatically sync nilaiPajak & jumlah if pajakAda is true
    if (isRenovasi && isPelunasan) {
      if (nilaiPajak !== "0") setNilaiPajak("0");
      if (bankVal >= 0 && jumlah !== String(bankVal)) setJumlah(String(bankVal));
    } else {
      if (pajakAda && isRenovasi && pphFinalVal >= 0) {
        const pphStr = String(pphFinalVal);
        if (nilaiPajak !== pphStr && (dp > 0 || nilaiPajak !== "")) {
          setNilaiPajak(pphStr);
        }
      } else if (pajakAda && isSewa) {
        // SEWA: Auto update pphPasal ("23"), tarif ("2"), dan nilaiPajak (PPh 23)
        if (pphPasal !== "23" && (dp > 0 || !pphPasal)) setPphPasal("23");
        const currentTarif = tarif || "2";
        if (tarif !== currentTarif) setTarif(currentTarif);
        if (pphFinalVal >= 0) {
          const pphStr = String(pphFinalVal);
          if (nilaiPajak !== pphStr && (dp > 0 || nilaiPajak !== "")) {
            setNilaiPajak(pphStr);
          }
        }
      } else if (pajakAda && !isSewa && !isRenovasi) {
        // PENGADAAN: Auto update nilaiPajak, tarif, dan pphPasal
        const isPkp = statusPkp === "pkp";
        const dppMurni = isPkp ? (dp - ppnVal) : dp;
        const isDiatas10Jt = dppMurni > 10000000 || dp > 10000000;

        if (isDiatas10Jt) {
          if (pphPasal !== "22") setPphPasal("22");
          if (tarif !== "1.5") setTarif("1.5");
          const pphStr = String(pphFinalVal);
          if (nilaiPajak !== pphStr) {
            setNilaiPajak(pphStr);
          }
        } else if (dp > 0) {
          // Input > 0 dan <= 10 Juta: tidak dikenakan PPh 22 (baik PKP maupun Non PKP)
          if (pphPasal !== "") setPphPasal("");
          if (tarif !== "") setTarif("");
          if (nilaiPajak !== "") setNilaiPajak("");
        }
      }

      if (pajakAda && bankVal >= 0) {
        const bankValStr = String(bankVal);
        if (jumlah !== bankValStr && (dp > 0 || jumlah !== "")) {
          setJumlah(bankValStr);
        }
      }
    }

    setRows(prev => {
      const defaultR1Kode = isSewa ? "514.13.05" : (isRenovasi ? "171.01.01" : "144.01.01");
      const baseR1Uraian = isSewa ? "Biaya Sewa" : (isRenovasi ? (isPelunasan ? "Biaya Retensi Pekerjaan Renovasi" : "Biaya Pekerjaan Renovasi") : "Pembelian");
      const defaultR1Uraian = isRenovasi ? updateTerminInUraian(baseR1Uraian, termin) : baseR1Uraian;
      const defaultR2Uraian = isSewa ? "Pajak PPN 11%" : (isRenovasi ? "Pajak PPN" : "PPN 11%");
      const defaultR3Kode = isSewa ? "214.02.03" : (isRenovasi ? "214.02.03" : "214.01.08");
      const defaultR3Uraian = isSewa
        ? `Pajak Pph ${pphPasal || "23"}`
        : (isRenovasi ? "Pajak PPH" : `PPh ${pphPasal || "22"}`);
      const defaultR4Uraian = isRenovasi ? "Bank" : "Bank BRI";

      const r1 = prev.find(r => r.id === 1 || r.kode === defaultR1Kode) || { id: 1, kode: defaultR1Kode, uraian: defaultR1Uraian, debet: "", kredit: "" };
      const rRetensi = (isRenovasi && !isPelunasan) ? (prev.find(r => r.id === 5 || r.uraian?.toLowerCase().includes("retensi")) || { id: 5, kode: "", uraian: "Retensi 5%", debet: "", kredit: "" }) : null;
      const r2 = prev.find(r => r.id === 2 || r.kode === "214.02.02") || { id: 2, kode: "214.02.02", uraian: defaultR2Uraian, debet: "", kredit: "" };
      const r3 = prev.find(r => r.id === 3 || r.kode === defaultR3Kode) || { id: 3, kode: defaultR3Kode, uraian: defaultR3Uraian, debet: "", kredit: "" };
      const r4 = prev.find(r => r.id === 4 || r.kode === "112.01.03" || r.uraian?.toLowerCase().includes("bank")) || { id: 4, kode: "112.01.03", uraian: defaultR4Uraian, debet: "", kredit: "" };

      const customRows = prev.filter(r => r.id !== 1 && r.id !== 2 && r.id !== 3 && r.id !== 4 && r.id !== 5 && !r.uraian?.toLowerCase().includes("retensi"));

      let r1FinalUraian = r1.uraian || defaultR1Uraian;
      if (isRenovasi) {
        r1FinalUraian = updateTerminInUraian(r1FinalUraian, termin);
      }

      return [
        {
          ...r1,
          id: 1,
          kode: r1.kode || defaultR1Kode,
          uraian: r1FinalUraian,
          debet: (pajakAda || isPelunasan) ? (dp ? String(dp) : "") : (jml ? String(jml) : ""),
          kredit: ""
        },
        ...(isRenovasi && !isPelunasan && rRetensi ? [{
          ...rRetensi,
          id: 5,
          kode: rRetensi.kode || "",
          uraian: rRetensi.uraian || "Retensi 5%",
          debet: "",
          kredit: pajakAda ? (retensiVal ? String(retensiVal) : "") : ""
        }] : []),
        {
          ...r2,
          id: 2,
          kode: r2.kode || "214.02.02",
          uraian: isRenovasi ? (r2.uraian && r2.uraian !== "PPN 12%" && r2.uraian !== "PPN 11%" ? r2.uraian : "Pajak PPN") : (r2.uraian || defaultR2Uraian),
          debet: "",
          kredit: isPelunasan
            ? "0"
            : (pajakAda
                ? ((!isRenovasi && !isSewa && statusPkp === "non_pkp") ? "" : (ppnVal ? String(ppnVal) : ""))
                : "")
        },
        {
          ...r3,
          id: 3,
          kode: r3.kode || defaultR3Kode,
          uraian: isRenovasi ? (r3.uraian && r3.uraian !== "PPh Final" && r3.uraian !== "PPh 23" ? r3.uraian : "Pajak PPH") : (r3.uraian || defaultR3Uraian),
          debet: "",
          kredit: isPelunasan ? "0" : (pajakAda ? (pphFinalVal ? String(pphFinalVal) : "") : "")
        },
        ...customRows,
        {
          ...r4,
          id: 4,
          kode: r4.kode || "112.01.03",
          uraian: isRenovasi ? (r4.uraian && r4.uraian !== "Bank BRI" ? r4.uraian : "Bank") : (r4.uraian || defaultR4Uraian),
          debet: "",
          kredit: bankVal ? String(bankVal) : ""
        }
      ];
    });
  }, [dasarPengenaan, nilaiPajak, jumlah, pajakAda, pphPasal, dibayarkanKepada, isSewa, isRenovasi, tarif, kualifikasiUsaha, termin, statusPkp]);

  useEffect(() => {
    if (rows.length < 2) return;

    const pembelianRow = rows[0];
    const bankRow = rows[rows.length - 1];

    if (bankRow) {
      const cleanDebet = String(pembelianRow?.debet || "").replace(/[^0-9]/g, "");
      const debetPembelian = parseFloat(cleanDebet) || 0;

      let totalKreditPajak = 0;
      for (let i = 1; i < rows.length - 1; i++) {
        const cleanKredit = String(rows[i].kredit || "").replace(/[^0-9]/g, "");
        totalKreditPajak += parseFloat(cleanKredit) || 0;
      }

      const calculatedBankKredit = debetPembelian - totalKreditPajak;
      const cleanBankKredit = String(bankRow.kredit || "").replace(/[^0-9]/g, "");
      const currentBankKredit = parseFloat(cleanBankKredit) || 0;

      if (calculatedBankKredit !== currentBankKredit) {
        setRows(prev => prev.map((r, idx) => {
          if (idx === prev.length - 1) {
            return {
              ...r,
              kredit: calculatedBankKredit > 0 ? String(calculatedBankKredit) : ""
            };
          }
          return r;
        }));
      }
    }
  }, [rows]);

  const scrollToPreviewField = (selectorId) => {
    const container = document.getElementById(`sopp-preview-scroll-container-${type}`);
    const target = document.getElementById(`${selectorId}-${type}`);
    if (container && target) {
      const targetRect = target.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const relativeTop = targetRect.top - containerRect.top + container.scrollTop;
      container.scrollTo({
        top: relativeTop - containerRect.height / 3,
        behavior: "smooth"
      });
    }
  };

  // Document Checklist State
  const [checklist, setChecklist] = useState({
    tagihan: true,
    fakturPajak: true,
    suratJalan: false,
    spk: false,
    kwitansi: true,
    bast: true,
    sopp: true,
    bap: false,
    soa: true,
    foto: false,
    lainLain: false,
    lainLainText: ""
  });

  // Signature Block State
  const [dibuatNama, setDibuatNama] = useState("ZONI RAHMAWAN PUTRA");
  const [dibuatJabatan, setDibuatJabatan] = useState("Kabag Pengadaan & Logistik");
  const [diperiksaNama, setDiperiksaNama] = useState("MAMAN SURATMAN");
  const [diperiksaJabatan, setDiperiksaJabatan] = useState("Kadept Logistik & Umum");
  const [disetujuiNama, setDisetujuiNama] = useState("PRABOWO JADI SUBROTO");
  const [disetujuiJabatan, setDisetujuiJabatan] = useState("Deputy Operasional");

  // Format date to DD-MMM-YY (e.g. 08-Jul-26)
  const formatDatePreview = (dateStr) => {
    if (!dateStr) return "";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = months[d.getMonth()];
    const year = String(d.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  // Dynamic real-time calculation of Month (MM) and Year (YYYY) for suffix
  const getDynamicSuffix = (dateStr) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    if (isNaN(d.getTime())) return "/SOPP-00108.00/2026";
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `/SOPP-00108.${month}/${year}`;
  };

  // Helper to format currency
  const formatNumberDot = (numStr) => {
    const num = parseFloat(numStr);
    if (isNaN(num) || num === 0) return "";
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const formatRupiah = (numStr) => {
    const formatted = formatNumberDot(numStr);
    if (!formatted) return "";
    return `Rp${formatted}`;
  };

  const formatRibuan = (value) => {
    if (value === null || value === undefined) return "";
    const cleanVal = String(value).replace(/[^0-9]/g, "");
    if (!cleanVal) return "";
    return new Intl.NumberFormat("id-ID").format(parseFloat(cleanVal));
  };

  const parseRibuan = (formattedValue) => {
    return formattedValue.replace(/[^0-9]/g, "");
  };

  const handleRowChange = (id, field, value) => {
    let val = value;
    if (field === "uraian") {
      val = capitalizeFirst(value);
    }
    if (field === "debet" && id === 1) {
      setDasarPengenaan(val);
    }
    setRows(prev => {
      const next = prev.map(row => row.id === id ? { ...prev.find(r => r.id === id), [field]: val } : row);
      const bankRow = next.find(r => r.uraian?.toLowerCase().includes("bank bri") || r.kode === "112.01.03");
      const cleanKredit = String(bankRow?.kredit || "").replace(/[^0-9]/g, "");
      if (cleanKredit && parseFloat(cleanKredit) > 0) {
        setErrors(prevErr => {
          const nextErr = { ...prevErr };
          delete nextErr.jumlah;
          return nextErr;
        });
      }
      return next;
    });
  };

  const addRow = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    setRows(prev => [...prev, { id: newId, kode: "", uraian: "", debet: "", kredit: "" }]);
  };

  const removeRow = (id) => {
    setRows(prev => prev.filter(row => row.id !== id));
  };

  // Filter baris yang aktif/terlihat (memperhitungkan toggle pajakAda dan statusPkp)
  const visibleRows = useMemo(() => {
    const cleanDP = String(dasarPengenaan || rows.find(r => r.id === 1 || r.kode === "144.01.01")?.debet || "").replace(/[^0-9]/g, "");
    const dpVal = parseFloat(cleanDP) || 0;

    return rows.filter(row => {
      if (!pajakAda && (row.id === 2 || row.id === 3 || row.kode === "214.02.02" || row.kode === "214.01.08" || row.kode === "214.02.03")) {
        return false;
      }
      // Jika Non PKP pada pengadaan/pembelian, sembunyikan baris PPN
      if (!isSewa && !isRenovasi && statusPkp === "non_pkp" && (row.id === 2 || row.kode === "214.02.02")) {
        return false;
      }
      // Jika pengadaan/pembelian dan user menginput transaksi <= 10 Juta (kurang dari 10jt), sembunyikan baris PPh 22
      if (!isSewa && !isRenovasi && dpVal > 0 && dpVal <= 10000000 && (row.id === 3 || row.kode === "214.01.08")) {
        return false;
      }
      return true;
    });
  }, [rows, pajakAda, isSewa, isRenovasi, statusPkp, dasarPengenaan]);

  // Pindahkan baris ke atas atau ke bawah
  const moveRow = (rowId, direction) => {
    setRows(prevRows => {
      const cleanDP = String(dasarPengenaan || prevRows.find(r => r.id === 1 || r.kode === "144.01.01")?.debet || "").replace(/[^0-9]/g, "");
      const dpVal = parseFloat(cleanDP) || 0;

      const currentVisible = prevRows.filter(r => {
        if (!pajakAda && (r.id === 2 || r.id === 3 || r.kode === "214.02.02" || r.kode === "214.01.08" || r.kode === "214.02.03")) {
          return false;
        }
        if (!isSewa && !isRenovasi && statusPkp === "non_pkp" && (r.id === 2 || r.kode === "214.02.02")) {
          return false;
        }
        if (!isSewa && !isRenovasi && dpVal > 0 && dpVal <= 10000000 && (r.id === 3 || r.kode === "214.01.08")) {
          return false;
        }
        return true;
      });

      const visibleIdx = currentVisible.findIndex(r => r.id === rowId);
      if (visibleIdx === -1) return prevRows;

      const targetVisibleIdx = direction === "up" ? visibleIdx - 1 : visibleIdx + 1;
      if (targetVisibleIdx < 0 || targetVisibleIdx >= currentVisible.length) return prevRows;

      const targetRow = currentVisible[targetVisibleIdx];
      const currentActualIdx = prevRows.findIndex(r => r.id === rowId);
      const targetActualIdx = prevRows.findIndex(r => r.id === targetRow.id);

      if (currentActualIdx === -1 || targetActualIdx === -1) return prevRows;

      const newRows = [...prevRows];
      const [moved] = newRows.splice(currentActualIdx, 1);
      newRows.splice(targetActualIdx, 0, moved);
      return newRows;
    });
  };

  // Drag & drop state dan handler
  const [draggedRowId, setDraggedRowId] = useState(null);

  const handleDragStart = (e, rowId) => {
    setDraggedRowId(rowId);
    e.dataTransfer.setData("text/plain", String(rowId));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, targetRowId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetRowId) => {
    e.preventDefault();
    if (!draggedRowId || draggedRowId === targetRowId) {
      setDraggedRowId(null);
      return;
    }

    setRows(prevRows => {
      const currentIdx = prevRows.findIndex(r => r.id === draggedRowId);
      const targetIdx = prevRows.findIndex(r => r.id === targetRowId);
      if (currentIdx === -1 || targetIdx === -1) return prevRows;

      const newRows = [...prevRows];
      const [moved] = newRows.splice(currentIdx, 1);
      newRows.splice(targetIdx, 0, moved);
      return newRows;
    });
    setDraggedRowId(null);
  };

  const saveToHistory = (silent = false, onSuccessCallback = null) => {
    // Validation
    const nextErrors = {};
    if (!nomorUrut || !nomorUrut.trim()) nextErrors.nomorUrut = "Nomor Urut wajib diisi";
    if (!dibayarkanKepada || !dibayarkanKepada.trim()) nextErrors.dibayarkanKepada = "Dibayarkan Kepada wajib diisi";

    const calculatedJumlah = getJumlahDisplay();
    const cleanJml = String(calculatedJumlah || "").replace(/[^0-9]/g, "");
    if (!cleanJml || parseFloat(cleanJml) === 0) {
      nextErrors.jumlah = "Jumlah Pembayaran wajib diisi (rincian perkiraan Bank BRI harus memiliki nilai Kredit)";
    }

    if (!noRekening || !noRekening.trim()) nextErrors.noRekening = "Nomor Rekening wajib diisi";
    if (!atasNama || !atasNama.trim()) nextErrors.atasNama = "Atas Nama wajib diisi";
    if (!namaBank || !namaBank.trim()) nextErrors.namaBank = "Nama Bank wajib diisi";
    if (!cabangBank && !cabang) nextErrors.cabang = "Cabang Bank wajib diisi";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setIsSubmitting(false);

      // Auto-scroll and focus to the first unfilled field
      const firstErrorKey = Object.keys(nextErrors)[0];
      if (firstErrorKey) {
        let targetId = "";
        if (firstErrorKey === "nomorUrut") targetId = "input-nomor-urut";
        else if (firstErrorKey === "dibayarkanKepada") targetId = "input-dibayarkan-kepada";
        else if (firstErrorKey === "jumlah") {
          const bankRow = rows.find(r => r.uraian?.toLowerCase().includes("bank bri") || r.kode === "112.01.03");
          if (bankRow) {
            targetId = `input-row-kredit-${bankRow.id}`;
          }
        }
        else if (firstErrorKey === "noRekening") targetId = "input-nomor-rekening";
        else if (firstErrorKey === "atasNama") targetId = "input-atas-nama";
        else if (firstErrorKey === "namaBank") targetId = "input-nama-bank";
        else if (firstErrorKey === "cabang") targetId = "input-cabang";

        if (targetId) {
          setTimeout(() => {
            const el = document.getElementById(targetId);
            if (el) {
              el.focus();
              el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 100);
        }
      }

      setShowValidationModal(true);
      return;
    }

    // Pengecekan Hari Kerja (Senin - Jumat) untuk SOPP
    if (tanggal) {
      const parts = String(tanggal).split("T")[0].split("-");
      let day = -1;
      if (parts.length === 3) {
        day = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getDay();
      } else {
        day = new Date(tanggal).getDay();
      }
      if (day === 0 || day === 6) {
        const hariNama = day === 6 ? "Sabtu" : "Minggu";
        setWeekendModalMessage(`Hari ${hariNama} tidak dapat digunakan. Dokumen SOPP tidak dapat disubmit pada hari Sabtu dan Minggu (hanya Senin s.d. Jumat).`);
        setShowWeekendModal(true);
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(true);
    const startTime = Date.now();
    try {
      const currentNomor = nomorUrut ? `${nomorUrut}${getDynamicSuffix(tanggal)}` : `SOPP-DRAFT-${Date.now()}`;

      const newEntry = {
        id: loadedId || null,
        nomorSopp: currentNomor,
        nomorSpk,
        no_spk: nomorSpk,
        tanggal: tanggal,
        dibayarkanKepada: dibayarkanKepada || "Penerima/Rekanan",
        type: type, // "pengadaan" or "sewa"
        jumlah: getJumlahDisplay() || jumlah || "0",

        // Full state
        nomorUrut,
        unitKerja,
        namaOutlet,
        via,
        noRekening,
        atasNama,
        namaBank,
        cabang,
        npwp,
        pajakAda,
        statusPkp,
        dasarPengenaan,
        pphPasal,
        tarif,
        kualifikasiUsaha,
        termin,
        nilaiPajak,
        rows: visibleRows,
        checklist,
        dibuatNama,
        dibuatJabatan,
        diperiksaNama,
        diperiksaJabatan,
        disetujuiNama,
        disetujuiJabatan
      };

      axios.post('/sopp-histories', newEntry)
        .then((res) => {
          const savedId = res.data?.id || res.data?.data?.id;
          if (savedId) {
            setLoadedId(savedId);
            window.dispatchEvent(new CustomEvent("sopp-saved-to-db", { detail: savedId }));
          }
          router.reload({ only: ['buildingRenovations', 'soppHistory'] });

          setIsSubmitting(false);
          if (!silent) {
            alert("Dokumen SOPP berhasil disimpan ke riwayat.");
          }
          if (onSuccessCallback) {
            onSuccessCallback(res.data);
          }
        })
        .catch((err) => {
          setIsSubmitting(false);
          console.error("Failed to save SOPP to DB:", err);
          const errorMsg = err.response?.data?.message || "Gagal menyimpan dokumen SOPP ke riwayat.";
          if (!silent) {
            alert(errorMsg);
          }
        });
    } catch (e) {
      setIsSubmitting(false);
      console.error("Failed to save SOPP history:", e);
      if (!silent) {
        alert("Gagal menyimpan dokumen SOPP ke riwayat.");
      }
    }
  };

  const handleSubmitHistory = () => {
    localStorage.setItem("show_sopp_success_toast", "true");
    localStorage.setItem("riwayat_active_tab", "sopp");
    saveToHistory(true, (savedData) => {
      window.dispatchEvent(
        new CustomEvent("optimistic-sopp-added", {
          detail: savedData,
        })
      );

      if (setView) {
        setView("riwayat");
      }
    });
  };

  const handleSaveHistoryOnly = () => {
    saveToHistory(false);
  };

  const handlePrint = () => {
    saveToHistory(true, () => {
      document.body.classList.add(`print-sopp-${type}-only`);
      window.print();
      setTimeout(() => {
        document.body.classList.remove(`print-sopp-${type}-only`);
      }, 650);
    });
  };

  const totalDebet = rows.reduce((sum, r) => {
    const cleanVal = String(r.debet || "").replace(/[^0-9]/g, "");
    return sum + (parseFloat(cleanVal) || 0);
  }, 0);
  const totalKredit = rows.reduce((sum, r) => {
    const cleanVal = String(r.kredit || "").replace(/[^0-9]/g, "");
    return sum + (parseFloat(cleanVal) || 0);
  }, 0);

  const abs = (left, top, width, height) => ({
    position: "absolute",
    left: `${left}pt`,
    top: `${top}pt`,
    width: `${width}pt`,
    height: height != null ? `${height}pt` : undefined
  });

  const fieldBox = (left, top, width, height = 12, align = "center") => ({
    ...abs(left, top, width, height),
    border: "0.75pt solid #000",
    display: "flex",
    alignItems: "center",
    justifyContent: align === "center" ? "center" : "flex-start",
    paddingLeft: align === "center" ? 0 : "2pt",
    fontSize: "7.8pt",
    fontFamily: "inherit",
    boxSizing: "border-box",
    overflow: "hidden",
    whiteSpace: "nowrap"
  });

  const checkbox = (left, top, width, height = 12, checked) => (
    <div
      style={{
        ...abs(left, top, width, height),
        border: "0.75pt solid #000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "9pt",
        fontWeight: 700,
        boxSizing: "border-box"
      }}
    >
      {checked ? "X" : ""}
    </div>
  );

  const label = (left, top, width, text, bold = false, id = undefined) => (
    <div
      id={id ? `${id}-${type}` : undefined}
      style={{
        ...abs(left, top, width),
        fontSize: "7.8pt",
        fontWeight: bold ? 700 : 400,
        whiteSpace: "nowrap"
      }}
    >
      {text}
    </div>
  );

  const blackMark = (top) => (
    <div style={{ ...abs(26.3, top, 10.8, 12), background: "#000" }} />
  );

  // Kolom tabel jurnal (lebar exact dari PDF, total = 517.3pt)
  const TABLE_LEFT = 60.4;
  const TABLE_TOP = 313.3;
  const COL_NO = 21.9;
  const COL_KODE = 107.5;
  const COL_URAIAN = 257.2;
  const COL_DEBET = 62;
  const COL_KREDIT = 68.7;
  const HEADER_H = 12;
  const ROW_H = 11.3;

  // Dynamic shift ketika baris rincian bertambah melebihi 4 baris standar
  const BASE_ROWS = 4;
  const extraRows = Math.max(0, visibleRows.length - BASE_ROWS);
  const extraLineCount = visibleRows.reduce((acc, r) => {
    const len = (r.uraian || "").length;
    return acc + (len > 45 ? Math.floor((len - 1) / 45) : 0);
  }, 0);
  const dynamicShift = (extraRows + extraLineCount) * 14.5;

  // Checklist grid
  const CHK_ROW_H = 22.6;
  const CHK_TOP0 = 414.8;
  const chkCol1 = [
    { key: "tagihan", text: "Surat permohonan tagihan dari rekanan" },
    { key: "suratJalan", text: "Faktur surat jalan termasuk harga satuan" },
    { key: "kwitansi", text: "Kwitansi/Invoice bermeterai" },
    { key: "sopp", text: "SOPP" },
    { key: "soa", text: "SOA" }
  ];
  const chkCol2 = [
    { key: "fakturPajak", text: "Faktur Pajak" },
    { key: "spk", text: "Surat Perintah Kerja" },
    { key: "bast", text: "Berita Acara Serah Terima Barang/pekerjaan" },
    { key: "bap", text: "Berita Acara Pemeriksaan" },
    { key: "foto", text: "Foto pekerjaan" }
  ];

  // Pusat kolom tanda tangan (exact dari PDF, tidak sama lebar / tidak simetris grid 3 kolom biasa)
  const sigCols = [
    { center: 125.8, label: "Dibuat oleh", nama: dibuatNama, jabatan: dibuatJabatan },
    { center: 342.1, label: "Diperiksa oleh", nama: diperiksaNama, jabatan: diperiksaJabatan },
    { center: 505.0, label: "Disetujui (otorisator)", nama: disetujuiNama, jabatan: disetujuiJabatan }
  ];
  const SIG_COL_WIDTH = 170;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Stylesheet scoped to print target */}
      <style>{`
        @media print {
          @page { size: A4; margin: 0 !important; }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: 100% !important;
            max-height: 100% !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: #ffffff !important;
            background: #ffffff !important;
          }
          /* Hide other layout views to prevent blank page generation */
          #dashboard, #notifikasi, #riwayat, #form, #master_barang, #master_outlet, 
          #perangkat_printer, #perangkat_komputer, #log_aktivitas, 
          #bangunan_tanah, #bangunan_sewa, #bangunan_renovasi, #bangunan_sarana, 
          #bangunan_spk, [id^="sopp_"]:not(#sopp_${type}), .no-print, .print-hidden {
            display: none !important;
          }
          body.print-sopp-${type}-only * { 
            visibility: hidden !important; 
          }
          body.print-sopp-${type}-only #sopp_${type},
          body.print-sopp-${type}-only #sopp-preview-scroll-container-${type},
          body.print-sopp-${type}-only #sopp-print-area-${type} {
            display: block !important;
          }
          body.print-sopp-${type}-only #sopp-print-area-${type},
          body.print-sopp-${type}-only #sopp-print-area-${type} * { 
            visibility: visible !important; 
            color: #000000 !important; 
          }
          body.print-sopp-${type}-only #sopp-print-area-${type} {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 595pt !important;
            height: 842pt !important;
            min-height: 842pt !important;
            max-height: 842pt !important;
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            zoom: 1 !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            break-inside: avoid !important;
            break-after: avoid !important;
            break-before: avoid !important;
          }
        }
      `}</style>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

        {/* INPUT EDITOR (LEFT PANEL WITH CONTINUOUS OUTER BORDER) */}
        <div ref={formScrollContainerRef} className="xl:col-span-5 bg-[#ffffff] dark:bg-gradient-to-b dark:from-[#052819] dark:via-[#073622] dark:to-[#03140d] rounded-2xl border-2 border-gray-300 dark:border-[#2b4533] shadow-md p-4 space-y-5 max-h-[82vh] overflow-y-auto custom-scrollbar no-print sticky top-[108px]">

          {/* Panel Header (SPK Style) */}
          <div className="p-4 bg-gray-50/80 dark:bg-transparent rounded-xl border border-gray-200 dark:border-[#2b4533] flex items-center justify-between no-print">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#066027] text-white rounded-xl shadow-2xs">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-black text-black dark:text-white text-base leading-tight">
                  SOPP - Otorisasi Pembayaran
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                  Editor Surat SOPP {isSewa ? "Sewa" : "Pengadaan"}
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: Info Dokumen */}
          <div className="bg-gray-50/60 dark:bg-[#14261c] rounded-xl border border-gray-300 dark:border-[#2b4533] p-5 space-y-4 shadow-2xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#066027] dark:text-emerald-400 border-b-2 border-emerald-600/20 dark:border-[#213527] pb-2">
              Informasi Umum
            </h3>

            {/* Banner Pengaturan Nomor Surat (Khusus Admin) - Di Bagian Paling Atas Card Informasi Umum */}
            {isAdmin && (
              <div className="p-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/40 border border-emerald-200/90 dark:border-emerald-800/60 rounded-xl shadow-2xs">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[#0d5c3a] hover:bg-[#094229] text-white rounded-lg text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Pengaturan Nomor Surat</span>
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold text-black dark:text-white uppercase">
                    Nomor Urut <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  {!isManualMode && (
                    <span className="text-[9px] font-semibold text-gray-400 dark:text-gray-500">
                      🔒 Terkunci ({letterNumberMode === "reset_manual" ? "Reset Manual" : "Otomatis"})
                    </span>
                  )}
                </div>
                <input
                  id="input-nomor-urut"
                  type="text"
                  value={nomorUrut}
                  readOnly={!isManualMode}
                  onChange={isManualMode ? (e) => {
                    setNomorUrut(capitalizeFirst(e.target.value));
                    if (errors.nomorUrut) setErrors(prev => { const n = { ...prev }; delete n.nomorUrut; return n; });
                  } : undefined}
                  onFocus={() => scrollToPreviewField("pv-nomor-urut")}
                  className={`w-full px-3 py-2 text-xs border rounded-lg outline-none font-mono transition-colors ${
                    errors.nomorUrut
                      ? "border-red-500 focus:border-red-500"
                      : isManualMode
                      ? "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3] border-gray-300 dark:border-[#2b4533] focus:border-emerald-500 cursor-text"
                      : "bg-gray-100 dark:bg-[#15231a] text-gray-600 dark:text-slate-400 border-gray-200 dark:border-[#1e3325] cursor-not-allowed select-none font-bold"
                  }`}
                  title={!isManualMode ? `Nomor surat terisi otomatis (Mode ${letterNumberMode === "reset_manual" ? "Reset Manual" : "Otomatis"}). Ubah ke Mode Manual di Pengaturan Nomor Surat jika ingin mengubah nomor urut.` : ""}
                />
                {errors.nomorUrut && <p className="text-red-500 text-[9px] mt-1 font-semibold">{errors.nomorUrut}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-black dark:text-white uppercase mb-1">
                  Tanggal Dokumen
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  onFocus={() => scrollToPreviewField("pv-tanggal")}
                  className={`w-full px-3 py-2 text-xs border border-gray-300 dark:border-[#2b4533] rounded-lg outline-none focus:border-emerald-500 ${tanggal ? "bg-gray-100 dark:bg-[#1a2b20] text-gray-500 dark:text-slate-400 font-medium" : "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-black dark:text-white uppercase mb-1">
                Nama Unit Kerja / Divisi
              </label>
              <input
                type="text"
                value={unitKerja}
                onChange={(e) => setUnitKerja(capitalizeFirst(e.target.value))}
                onFocus={() => scrollToPreviewField("pv-unit-kerja")}
                className={`w-full px-3 py-2 text-xs border border-gray-300 dark:border-[#2b4533] rounded-lg outline-none focus:border-emerald-500 ${unitKerja ? "bg-gray-100 dark:bg-[#1a2b20] text-gray-500 dark:text-slate-400 font-medium" : "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"}`}
              />
            </div>

              <>
                <CustomSelectDropdown
                  label="CABANG"
                  labelCls="block text-[10px] font-bold text-black dark:text-white uppercase mb-1"
                  inputCls="w-full px-3 py-2 text-xs border border-gray-300 dark:border-[#2b4533] rounded-lg outline-none focus:border-emerald-500 font-medium bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"
                  value={cabang}
                  onChange={(e) => setCabang(e.target ? e.target.value : e)}
                  onSelect={(c) => setCabang(c.nama || c.value)}
                  options={cabangListOptions}
                  placeholder="Pilih atau ketik cabang..."
                  allowCustomInput={true}
                />

                <CustomSelectDropdown
                  label="NAMA OUTLET"
                  labelCls="block text-[10px] font-bold text-black dark:text-white uppercase mb-1"
                  inputCls="w-full px-3 py-2 text-xs border border-gray-300 dark:border-[#2b4533] rounded-lg outline-none focus:border-emerald-500 font-medium bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"
                  value={namaOutlet}
                  onChange={(e) => setNamaOutlet(e.target ? e.target.value : e)}
                  onSelect={(o) => setNamaOutlet(o.nama || o.value)}
                  options={filteredOutletOptions}
                  placeholder={cabang ? `Pilih atau ketik UPC/UPS di bawah ${cabang}...` : "Pilih atau ketik outlet..."}
                  allowCustomInput={true}
                />
              </>

            {isRenovasi && (
              <div>
                <CustomSelectDropdown
                  label="NOMOR SPK"
                  labelCls="block text-[10px] font-bold text-black dark:text-white uppercase mb-1"
                  inputCls="w-full px-3 py-2 text-xs border border-gray-300 dark:border-[#2b4533] rounded-lg outline-none focus:border-emerald-500 font-medium bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"
                  value={nomorSpk}
                  onChange={(e) => setNomorSpk(e.target ? e.target.value : e)}
                  onSelect={(s) => handleSelectSpk(s.value || s.label || s)}
                  options={spkOptions}
                  placeholder="Pilih dari Surat SPK atau ketik..."
                  allowCustomInput={true}
                />
              </div>
            )}
          </div>

          {/* Section 2: Pembayaran */}
          <div className="bg-gray-50/60 dark:bg-[#14261c] rounded-xl border border-gray-300 dark:border-[#2b4533] p-5 space-y-4 shadow-2xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#066027] dark:text-emerald-400 border-b-2 border-emerald-600/20 dark:border-[#213527] pb-2">
              Pembayaran & Rekening
            </h3>

            <div>
              <label className="block text-[10px] font-bold text-black dark:text-white uppercase mb-1">
                Dibayarkan Kepada <span className="text-red-500 font-bold ml-0.5">*</span>
              </label>
              <VendorSelectDropdown
                id="input-dibayarkan-kepada"
                value={dibayarkanKepada}
                onChange={(val) => {
                  setDibayarkanKepada(capitalizeFirst(val));
                  if (errors.dibayarkanKepada) setErrors(prev => { const n = { ...prev }; delete n.dibayarkanKepada; return n; });
                }}
                onSelect={(v) => {
                  setDibayarkanKepada(v.nama);
                  if (errors.dibayarkanKepada) setErrors(prev => { const n = { ...prev }; delete n.dibayarkanKepada; return n; });
                }}
                onFocus={() => scrollToPreviewField("pv-dibayarkan-kepada")}
                vendors={vendors}
                placeholder="Pilih atau ketik dibayarkan kepada..."
                inputCls={`w-full h-[50px] pl-3.5 pr-9 text-xs border rounded-2xl outline-none focus:outline-none focus:ring-2 focus:ring-[#1b7e47]/30 focus:border-[#1b7e47] ${dibayarkanKepada ? "bg-gray-100 dark:bg-[#1a2b20] text-gray-500 dark:text-slate-400 font-medium border-[#1b7e47] dark:border-emerald-500" : "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3] font-bold border-[#1b7e47] dark:border-emerald-500"}`}
                error={!!errors.dibayarkanKepada}
              />
              {errors.dibayarkanKepada && <p className="text-red-500 text-[9px] mt-1 font-semibold">{errors.dibayarkanKepada}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-black dark:text-white uppercase mb-1">
                Via Pembayaran
              </label>
              <CustomSelectDropdown
                value={via}
                onChange={(e) => setVia(e.target ? e.target.value : e)}
                options={[
                  { label: "Kas", value: "Kas" },
                  { label: "Cek", value: "Cek" },
                  { label: "BG (Bilyet Giro)", value: "BG" }
                ]}
                placeholder="Pilih Via Pembayaran..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-[#213527] pt-3">
              <div>
                <label className="block text-[10px] font-bold text-black dark:text-white uppercase mb-1">
                  Nomor Rekening <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <input
                  id="input-nomor-rekening"
                  type="text"
                  value={noRekening}
                  onChange={(e) => {
                    setNoRekening(capitalizeFirst(e.target.value));
                    if (errors.noRekening) setErrors(prev => { const n = { ...prev }; delete n.noRekening; return n; });
                  }}
                  onFocus={() => scrollToPreviewField("pv-nomor-rekening")}
                  className={`w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-emerald-500 ${noRekening ? "bg-gray-100 dark:bg-[#1a2b20] text-gray-500 dark:text-slate-400 font-medium" : "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"} ${errors.noRekening ? "border-red-500 focus:border-red-500" : "border-gray-300 dark:border-[#2b4533]"}`}
                />
                {errors.noRekening && <p className="text-red-500 text-[9px] mt-1 font-semibold">{errors.noRekening}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-black dark:text-white uppercase mb-1">
                  Atas Nama Rekening <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <input
                  id="input-atas-nama"
                  type="text"
                  value={atasNama}
                  onChange={(e) => {
                    setAtasNama(capitalizeFirst(e.target.value));
                    if (errors.atasNama) setErrors(prev => { const n = { ...prev }; delete n.atasNama; return n; });
                  }}
                  onFocus={() => scrollToPreviewField("pv-nomor-rekening")}
                  className={`w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-emerald-500 ${atasNama ? "bg-gray-100 dark:bg-[#1a2b20] text-gray-500 dark:text-slate-400 font-medium" : "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"} ${errors.atasNama ? "border-red-500 focus:border-red-500" : "border-gray-300 dark:border-[#2b4533]"}`}
                />
                {errors.atasNama && <p className="text-red-500 text-[9px] mt-1 font-semibold">{errors.atasNama}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-black dark:text-white uppercase mb-1">
                  Nama Bank <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <input
                  id="input-nama-bank"
                  type="text"
                  value={namaBank}
                  onChange={(e) => {
                    setNamaBank(capitalizeFirst(e.target.value));
                    if (errors.namaBank) setErrors(prev => { const n = { ...prev }; delete n.namaBank; return n; });
                  }}
                  onFocus={() => scrollToPreviewField("pv-nama-bank")}
                  className={`w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-emerald-500 ${namaBank ? "bg-gray-100 dark:bg-[#1a2b20] text-gray-500 dark:text-slate-400 font-medium" : "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"} ${errors.namaBank ? "border-red-500 focus:border-red-500" : "border-gray-300 dark:border-[#2b4533]"}`}
                />
                {errors.namaBank && <p className="text-red-500 text-[9px] mt-1 font-semibold">{errors.namaBank}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-black dark:text-white uppercase mb-1">
                  Cabang Bank <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <input
                  id="input-cabang"
                  type="text"
                  value={cabangBank}
                  onChange={(e) => {
                    setCabangBank(capitalizeFirst(e.target.value));
                    if (errors.cabang) setErrors(prev => { const n = { ...prev }; delete n.cabang; return n; });
                  }}
                  onFocus={() => scrollToPreviewField("pv-nama-bank")}
                  className={`w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-emerald-500 ${cabangBank ? "bg-gray-100 dark:bg-[#1a2b20] text-gray-500 dark:text-slate-400 font-medium" : "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"} ${errors.cabang ? "border-red-500 focus:border-red-500" : "border-gray-300 dark:border-[#2b4533]"}`}
                />
                {errors.cabang && <p className="text-red-500 text-[9px] mt-1 font-semibold">{errors.cabang}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-black dark:text-white uppercase mb-1">
                  NPWP (Bila Ada)
                </label>
                <input
                  type="text"
                  value={npwp}
                  onChange={(e) => setNpwp(capitalizeFirst(e.target.value))}
                  onFocus={() => scrollToPreviewField("pv-npwp")}
                  className={`w-full px-3 py-2 text-xs border border-gray-300 dark:border-[#2b4533] rounded-lg outline-none focus:border-emerald-500 ${npwp ? "bg-gray-100 dark:bg-[#1a2b20] text-gray-500 dark:text-slate-400 font-medium" : "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"}`}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Pajak & Dasar Pengenaan */}
          <div className="bg-gray-50/60 dark:bg-[#14261c] rounded-xl border border-gray-300 dark:border-[#2b4533] p-5 space-y-4 shadow-2xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#066027] dark:text-emerald-400 border-b-2 border-emerald-600/20 dark:border-[#213527] pb-2">
              Pajak & Dasar Pengenaan
            </h3>

            <div className="flex gap-4 items-center">
              <span className="text-xs text-black font-bold dark:text-white">Pajak:</span>
              <label className="flex items-center gap-1.5 text-xs text-black font-bold dark:text-white cursor-pointer">
                <input
                  type="radio"
                  name="pajakAda"
                  checked={pajakAda}
                  onChange={() => {
                    setPajakAda(true);
                    setChecklist(prev => ({ ...prev, fakturPajak: true }));
                  }}
                  onFocus={() => scrollToPreviewField("pv-dasar-pengenaan")}
                  className="rounded-full text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                Ada
              </label>
              <label className="flex items-center gap-1.5 text-xs text-black font-bold dark:text-white cursor-pointer">
                <input
                  type="radio"
                  name="pajakAda"
                  checked={!pajakAda}
                  onChange={() => {
                    setPajakAda(false);
                    setChecklist(prev => ({ ...prev, fakturPajak: false }));
                  }}
                  onFocus={() => scrollToPreviewField("pv-dasar-pengenaan")}
                  className="rounded-full text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                Tidak ada
              </label>
            </div>

            {pajakAda && (
              <div className="space-y-3 pt-2">
                {type === "renovasi" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-black dark:text-white uppercase mb-1">
                        Kualifikasi Usaha
                      </label>
                      <div className="flex items-center gap-3 py-1">
                        <label className="flex items-center gap-1 text-xs text-black font-bold dark:text-white cursor-pointer">
                          <input
                            type="radio"
                            name="kualifikasiUsaha"
                            value="Kecil"
                            checked={kualifikasiUsaha === "Kecil"}
                            onChange={() => {
                              setKualifikasiUsaha("Kecil");
                              setTarif("1.75");
                            }}
                            className="rounded-full text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          Kecil (1.75%)
                        </label>
                        <label className="flex items-center gap-1 text-xs text-black font-bold dark:text-white cursor-pointer">
                          <input
                            type="radio"
                            name="kualifikasiUsaha"
                            value="Menengah/Besar"
                            checked={kualifikasiUsaha === "Menengah/Besar"}
                            onChange={() => {
                              setKualifikasiUsaha("Menengah/Besar");
                              setTarif("2.65");
                            }}
                            className="rounded-full text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          Menengah/Besar (2.65%)
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-black dark:text-white uppercase mb-1">
                        Termin Pembayaran
                      </label>
                      <CustomSelectDropdown
                        value={termin}
                        onChange={(e) => setTermin(e.target ? e.target.value : e)}
                        options={[
                          { label: "Termin 1", value: "Termin 1" },
                          { label: "Termin 2", value: "Termin 2" },
                          { label: "Retensi 5%", value: "Retensi 5%" }
                        ]}
                        placeholder="Pilih Termin Pembayaran..."
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-black dark:text-white uppercase mb-1">
                      Dasar Pengenaan (Rp)
                    </label>
                    <input
                      type="text"
                      value={formatRibuan(dasarPengenaan)}
                      onChange={(e) => {
                        const newDpStr = parseRibuan(e.target.value);
                        setDasarPengenaan(newDpStr);
                        if (type === "renovasi" && tarif) {
                          const dp = parseFloat(newDpStr) || 0;
                          const ppn = Math.round((dp * 11) / 111);
                          const dppMurni = dp - ppn;
                          const tarifNum = parseFloat(tarif) || 0;
                          setNilaiPajak(String(Math.round((dppMurni * tarifNum) / 100)));
                        }
                      }}
                      onFocus={() => scrollToPreviewField("pv-dasar-pengenaan")}
                      className={`w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-[#2b4533] rounded-lg outline-none ${dasarPengenaan ? "bg-gray-100 dark:bg-[#1a2b20] text-gray-500 dark:text-slate-400 font-medium" : "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-black dark:text-white uppercase mb-1">
                      PPh Pasal
                    </label>
                    <input
                      type="text"
                      value={pphPasal}
                      onChange={(e) => setPphPasal(e.target.value)}
                      onFocus={() => scrollToPreviewField("pv-dasar-pengenaan")}
                      className={`w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-[#2b4533] rounded-lg outline-none ${pphPasal ? "bg-gray-100 dark:bg-[#1a2b20] text-gray-500 dark:text-slate-400 font-medium" : "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-black dark:text-white uppercase mb-1">
                      Tarif (%)
                    </label>
                    <input
                      type="text"
                      value={tarif}
                      onChange={(e) => {
                        const newTarif = e.target.value;
                        setTarif(newTarif);
                        if (type === "renovasi" && newTarif) {
                          const dp = parseFloat(String(dasarPengenaan).replace(/[^0-9]/g, "")) || 0;
                          const ppn = Math.round((dp * 11) / 111);
                          const dppMurni = dp - ppn;
                          const tarifNum = parseFloat(newTarif) || 0;
                          setNilaiPajak(String(Math.round((dppMurni * tarifNum) / 100)));
                        }
                      }}
                      onFocus={() => scrollToPreviewField("pv-dasar-pengenaan")}
                      className={`w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-[#2b4533] rounded-lg outline-none ${tarif ? "bg-gray-100 dark:bg-[#1a2b20] text-gray-500 dark:text-slate-400 font-medium" : "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-black dark:text-white uppercase mb-1">
                      Nilai Pajak (Rp)
                    </label>
                    <input
                      type="text"
                      value={formatRibuan(nilaiPajak)}
                      onChange={(e) => setNilaiPajak(parseRibuan(e.target.value))}
                      onFocus={() => scrollToPreviewField("pv-dasar-pengenaan")}
                      className={`w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-[#2b4533] rounded-lg outline-none ${nilaiPajak ? "bg-gray-100 dark:bg-[#1a2b20] text-gray-500 dark:text-slate-400 font-medium" : "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"}`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Tabel Rincian */}
          <div className="bg-gray-50/60 dark:bg-[#14261c] rounded-xl border border-gray-300 dark:border-[#2b4533] p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-emerald-600/20 dark:border-[#213527] pb-3">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#066027] dark:text-emerald-400">
                  Rincian Perkiraan
                </h3>

                {/* Pilihan PKP / Non PKP */}
                {!isSewa && !isRenovasi && (
                  <div className="inline-flex items-center bg-gray-200/80 dark:bg-[#1f3326] p-0.5 rounded-lg border border-gray-300/80 dark:border-[#2b4533]">
                    <button
                      type="button"
                      onClick={() => setStatusPkp("pkp")}
                      className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                        statusPkp === "pkp"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      PKP
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusPkp("non_pkp")}
                      className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                        statusPkp === "non_pkp"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      Non PKP
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addRow}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Baris
                </button>
              </div>
            </div>

            {/* Banner info perpajakan untuk pengadaan */}
            {!isSewa && !isRenovasi && (
              <div className="text-[11px] px-3.5 py-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-[#21432f] text-emerald-950 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    {statusPkp === "pkp" ? "✓ Vendor PKP (Dikenakan PPN 11%)" : "✓ Vendor Non PKP (Tanpa PPN)"}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    | Transaksi &gt; Rp 10 Juta otomatis dipotong PPh 22 (1,5%)
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {visibleRows.map((row, index) => (
                <div
                  key={row.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, row.id)}
                  onDragOver={(e) => handleDragOver(e, row.id)}
                  onDrop={(e) => handleDrop(e, row.id)}
                  className={`border border-gray-200 dark:border-[#213527] rounded-xl p-3 space-y-2 relative bg-white dark:bg-[#0f1712]/60 shadow-2xs transition-all duration-150 ${draggedRowId === row.id ? "opacity-40 border-dashed border-emerald-500 scale-[0.99]" : "hover:border-emerald-300 dark:hover:border-[#2f533b]"}`}
                >
                  {/* Header Card: Baris, Drag handle, dan Tombol Pindah / Hapus */}
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#1e3325] pb-2">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-0.5 rounded transition-colors"
                        title="Tahan & geser untuk mengubah letak baris"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="text-[10px] font-bold text-black dark:text-white flex items-center gap-1.5">
                        <span>Baris {index + 1}</span>
                        {row.uraian && (
                          <span className="text-[10px] font-normal text-gray-400 dark:text-gray-500 truncate max-w-[160px]">
                            ({row.uraian})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tombol Aksi: Ke Atas, Ke Bawah, Hapus */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveRow(row.id, "up")}
                        disabled={index === 0}
                        title="Pindahkan ke atas"
                        className="p-1 rounded text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-[#1a2b20] disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRow(row.id, "down")}
                        disabled={index === visibleRows.length - 1}
                        title="Pindahkan ke bawah"
                        className="p-1 rounded text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-[#1a2b20] disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        disabled={visibleRows.length <= 1}
                        title="Hapus baris"
                        className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-black dark:text-white uppercase">Kode Perkiraan</label>
                      <input
                        type="text"
                        value={row.kode}
                        onChange={(e) => handleRowChange(row.id, "kode", e.target.value)}
                        onFocus={() => scrollToPreviewField("pv-rincian-perkiraan")}
                        className={`w-full p-1.5 text-xs border border-gray-300 dark:border-[#2b4533] rounded-md font-mono ${row.kode ? "bg-gray-100 dark:bg-[#1a2b20] text-gray-500 dark:text-slate-400 font-medium" : "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"}`}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-black dark:text-white uppercase">Uraian</label>
                      <input
                        type="text"
                        value={row.uraian}
                        onChange={(e) => handleRowChange(row.id, "uraian", e.target.value)}
                        onFocus={() => scrollToPreviewField("pv-rincian-perkiraan")}
                        className={`w-full p-1.5 text-xs border border-gray-300 dark:border-[#2b4533] rounded-md ${row.uraian ? "bg-gray-100 dark:bg-[#1a2b20] text-gray-500 dark:text-slate-400 font-medium" : "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"}`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-black dark:text-white uppercase">Debet (Rp)</label>
                      <input
                        type="text"
                        value={formatRibuan(row.debet)}
                        onChange={(e) => handleRowChange(row.id, "debet", parseRibuan(e.target.value))}
                        onFocus={() => scrollToPreviewField("pv-rincian-perkiraan")}
                        className={`w-full p-1.5 text-xs border border-gray-300 dark:border-[#2b4533] rounded-md ${row.debet ? "bg-gray-100 dark:bg-[#1a2b20] text-gray-500 dark:text-slate-400 font-medium" : "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"}`}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-black dark:text-white uppercase">Kredit (Rp)</label>
                      <input
                        id={`input-row-kredit-${row.id}`}
                        type="text"
                        value={formatRibuan(row.kredit)}
                        onChange={(e) => {
                          handleRowChange(row.id, "kredit", parseRibuan(e.target.value));
                          const isBankBri = row.uraian?.toLowerCase().includes("bank bri") || row.kode === "112.01.03";
                          if (errors.jumlah && isBankBri) {
                            setErrors(prev => { const n = { ...prev }; delete n.jumlah; return n; });
                          }
                        }}
                        onFocus={() => scrollToPreviewField("pv-rincian-perkiraan")}
                        className={`w-full p-1.5 text-xs border rounded-md outline-none ${row.kredit ? "bg-gray-100 dark:bg-[#1a2b20] text-gray-500 dark:text-slate-400 font-medium" : "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"} ${(row.uraian?.toLowerCase().includes("bank bri") || row.kode === "112.01.03") && errors.jumlah ? "border-red-500 focus:border-red-500" : "border-gray-300 dark:border-[#2b4533]"}`}
                      />
                      {(row.uraian?.toLowerCase().includes("bank bri") || row.kode === "112.01.03") && errors.jumlah && (
                        <p className="text-red-500 text-[9px] mt-1 font-semibold">{errors.jumlah}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Kelengkapan Dokumen */}
          <div className="bg-gray-50/60 dark:bg-[#14261c] rounded-xl border border-gray-300 dark:border-[#2b4533] p-5 space-y-3 shadow-2xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#066027] dark:text-emerald-400 border-b-2 border-emerald-600/20 dark:border-[#213527] pb-2">
              Kelengkapan Dokumen (Checklist)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.keys(checklist).filter(key => key !== "lainLainText").map((key) => (
                <label key={key} className="flex items-center gap-2 text-xs text-black font-bold dark:text-white cursor-pointer p-1 rounded-md hover:bg-gray-100 dark:hover:bg-[#1a2b20]/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist[key]}
                    onChange={(e) => setChecklist(prev => ({ ...prev, [key]: e.target.checked }))}
                    onFocus={() => scrollToPreviewField("pv-kelengkapan-dokumen")}
                    className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="capitalize font-bold text-black dark:text-white">{
                    key === "tagihan" ? "Surat Permohonan Tagihan"
                      : key === "fakturPajak" ? "Faktur Pajak"
                        : key === "suratJalan" ? "Faktur Surat Jalan"
                          : key === "spk" ? "Surat Perintah Kerja (SPK)"
                            : key === "kwitansi" ? "Kwitansi / Invoice"
                              : key === "bast" ? "BAST Pekerjaan"
                                : key === "sopp" ? "SOPP"
                                  : key === "bap" ? "BAP Pemeriksaan"
                                    : key === "soa" ? "SOA"
                                      : key === "foto" ? "Foto Pekerjaan"
                                        : "Lain-lain"
                  }</span>
                </label>
              ))}
            </div>

            {checklist.lainLain && (
              <div className="pt-2">
                <label className="block text-[9px] font-bold text-black dark:text-white uppercase mb-1">
                  Nama Dokumen Lainnya
                </label>
                <input
                  type="text"
                  value={checklist.lainLainText}
                  onChange={(e) => setChecklist(prev => ({ ...prev, lainLainText: capitalizeFirst(e.target.value) }))}
                  onFocus={() => scrollToPreviewField("pv-kelengkapan-dokumen")}
                  className={`w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-[#2b4533] rounded-lg outline-none ${checklist.lainLainText ? "bg-gray-100 dark:bg-[#1a2b20] text-gray-500 dark:text-slate-400 font-medium" : "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"}`}
                  placeholder="Sebutkan..."
                />
              </div>
            )}
          </div>

          {/* Section 6: Penandatangan */}
          <div className="bg-gray-50/60 dark:bg-[#14261c] rounded-xl border border-gray-300 dark:border-[#2b4533] p-5 space-y-4 shadow-2xs pb-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#066027] dark:text-emerald-400 border-b-2 border-emerald-600/20 dark:border-[#213527] pb-2">
              Penandatangan Dokumen
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-black dark:text-white uppercase mb-1">Dibuat Oleh</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={dibuatNama} onChange={(e) => setDibuatNama(capitalizeFirst(e.target.value))} onFocus={() => scrollToPreviewField("pv-tanda-tangan")} placeholder="Nama" className={`w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-[#2b4533] rounded-lg ${dibuatNama ? "bg-gray-100 dark:bg-[#1a2b20] text-gray-500 dark:text-slate-400 font-medium" : "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"}`} />
                  <input type="text" value={dibuatJabatan} onChange={(e) => setDibuatJabatan(capitalizeFirst(e.target.value))} onFocus={() => scrollToPreviewField("pv-tanda-tangan")} placeholder="Jabatan" className={`w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-[#2b4533] rounded-lg ${dibuatJabatan ? "bg-gray-100 dark:bg-[#1a2b20] text-gray-500 dark:text-slate-400 font-medium" : "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"}`} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-black dark:text-white uppercase mb-1">Diperiksa Oleh</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={diperiksaNama} onChange={(e) => setDiperiksaNama(capitalizeFirst(e.target.value))} onFocus={() => scrollToPreviewField("pv-tanda-tangan")} placeholder="Nama" className={`w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-[#2b4533] rounded-lg ${diperiksaNama ? "bg-gray-100 dark:bg-[#1a2b20] text-gray-500 dark:text-slate-400 font-medium" : "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"}`} />
                  <input type="text" value={diperiksaJabatan} onChange={(e) => setDiperiksaJabatan(capitalizeFirst(e.target.value))} onFocus={() => scrollToPreviewField("pv-tanda-tangan")} placeholder="Jabatan" className={`w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-[#2b4533] rounded-lg ${diperiksaJabatan ? "bg-gray-100 dark:bg-[#1a2b20] text-gray-500 dark:text-slate-400 font-medium" : "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"}`} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-black dark:text-white uppercase mb-1">Disetujui Oleh</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={disetujuiNama} onChange={(e) => setDisetujuiNama(capitalizeFirst(e.target.value))} onFocus={() => scrollToPreviewField("pv-tanda-tangan")} placeholder="Nama" className={`w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-[#2b4533] rounded-lg ${disetujuiNama ? "bg-gray-100 dark:bg-[#1a2b20] text-gray-500 dark:text-slate-400 font-medium" : "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"}`} />
                  <input type="text" value={disetujuiJabatan} onChange={(e) => setDisetujuiJabatan(capitalizeFirst(e.target.value))} onFocus={() => scrollToPreviewField("pv-tanda-tangan")} placeholder="Jabatan" className={`w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-[#2b4533] rounded-lg ${disetujuiJabatan ? "bg-gray-100 dark:bg-[#1a2b20] text-gray-500 dark:text-slate-400 font-medium" : "bg-white dark:bg-[#0f1712] text-gray-800 dark:text-[#f1f5f3]"}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action Button at bottom of Left Panel */}
          <div className="pt-2 pb-4">
            <button
              type="button"
              onClick={handleSubmitHistory}
              disabled={isSubmitting}
              className="w-full bg-[#066027] hover:bg-[#04481d] text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-colors text-sm cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                "Submit & Simpan SOPP"
              )}
            </button>
          </div>

        </div>

        {/* PRINTABLE PREVIEW PANEL (RIGHT PANEL) */}
        <div
          ref={previewScrollContainerRef}
          onScroll={(e) => {
            const activeTabId = type === "sewa" ? "sopp_sewa" : (type === "renovasi" ? "sopp_renovasi" : "sopp_pengadaan");
            if (activeTab === activeTabId) {
              previewScrollTopRef.current = e.currentTarget.scrollTop;
            }
          }}
          id={`sopp-preview-scroll-container-${type}`}
          className="xl:col-span-7 flex flex-col items-center overflow-y-auto overflow-x-auto w-full px-4 pt-4 pb-6 max-h-[90vh] print:h-auto print:overflow-visible bg-slate-100/80 dark:bg-[#0c1410] border border-gray-200/80 dark:border-[#213527] rounded-2xl"
        >
          {/* Yellow Helper Banner with Zoom Controls (Same as SPK) */}
          <div className="w-full max-w-[595pt] bg-[#fff9db] border-2 border-amber-400/80 p-3 rounded-xl mb-4 flex flex-col sm:flex-row items-center justify-between no-print shadow-xs text-amber-950 text-xs gap-3 shrink-0 overflow-hidden bg-clip-padding">
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-base">💡</span>
              <span>Anda dapat mengedit langsung pada pratinjau A4.</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 bg-white border border-amber-400/80 px-2 py-1 rounded-lg select-none shadow-2xs">
              <span className="text-gray-500 font-semibold mr-1">🔎</span>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(0.5, Math.round((prev - 0.05) * 100) / 100))}
                className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded text-gray-700 font-bold transition-colors text-xs cursor-pointer"
                title="Perkecil (-5%)"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(0.8)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${Math.round(zoomLevel * 100) !== 100 ? "bg-amber-200 text-amber-900 font-bold border border-amber-300/80" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                title="Reset ke 80%"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1.0)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${Math.round(zoomLevel * 100) === 100 ? "bg-amber-200 text-amber-900 font-bold border border-amber-300/80" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                title="Ukuran 100%"
              >
                100%
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(1.5, Math.round((prev + 0.05) * 100) / 100))}
                className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded text-gray-700 font-bold transition-colors text-xs cursor-pointer"
                title="Perbesar (+5%)"
              >
                +
              </button>
            </div>
          </div>

          {/* The Document Paper (Aligned with Yellow Banner) */}
            <div 
              className="w-full flex justify-center print:h-auto print:overflow-visible shrink-0 py-2" 
              style={{ minHeight: `${(842 + Math.max(0, dynamicShift - 80)) * zoomLevel + 24}pt` }}
            >
              <div
                id={`sopp-print-area-${type}`}
                style={{
                  width: "595pt",
                  height: dynamicShift > 80 ? `${842 + dynamicShift - 80}pt` : "842pt",
                  minHeight: "842pt",
                  position: "relative",
                  fontFamily: "'Arial Narrow', 'Arial', sans-serif",
                  zoom: zoomLevel,
                  boxSizing: "border-box"
                }}
                className="bg-white border-2 border-gray-400 dark:border-gray-500 shadow-2xl ring-1 ring-black/10 rounded-xs text-black select-none shrink-0 print:border-none print:shadow-none print:ring-0 origin-top"
              >
            {/* Tanda registrasi hitam (persis posisi PDF asli) */}
            {blackMark(144.1)}
            {blackMark(166.7)}
            {blackMark(189.2)}
            {blackMark(245.6)}
            {blackMark(268.2)}

            {/* JUDUL DOKUMEN */}
            <div style={{ ...abs(0, 55.8, 595), textAlign: "center", fontSize: "8.6pt", fontWeight: 800, letterSpacing: "0.3pt" }}>
              SURAT OTORISASI PERMINTAAN PEMBAYARAN
            </div>
            <div style={{ ...abs(0, 67.1, 595), textAlign: "center", fontSize: "7.8pt", fontWeight: 400, color: "#000000" }}>
              (Otorisasi Pembayaran)
            </div>
            <div id={`pv-nomor-urut-${type}`} style={{ ...abs(0, 78.4, 595), textAlign: "center", fontSize: "7.8pt", fontWeight: 400 }}>
              Nomor : {nomorUrut}{getDynamicSuffix(tanggal)}
            </div>

            {/* Tanggal */}
            {label(62.2, 101.6, 85, "Tanggal", false, "pv-tanggal")}
            {label(148.9, 101.6, 10, ":")}
            {label(191.6, 101.6, 200, formatDatePreview(tanggal), false)}

            {/* Nama Unit Kerja/Divisi */}
            {label(62.2, 124.2, 85, "Nama Unit Kerja/Divisi", false, "pv-unit-kerja")}
            {label(148.9, 124.2, 10, ":")}
            {label(191.6, 124.2, 380, unitKerja, false)}

            {/* Dibayarkan kepada */}
            {blackMark(144.1)}
            {label(62.2, 146.7, 85, "Dibayarkan kepada", false, "pv-dibayarkan-kepada")}
            <div style={fieldBox(147.1, 144.1, 147.9, 12, "center")}>
              <span>{dibayarkanKepada}</span>
            </div>

            {/* Jumlah + Via */}
            {blackMark(166.7)}
            {label(62.2, 169.3, 85, "Jumlah", false, "pv-jumlah")}
            <div style={fieldBox(147.1, 166.7, 147.9, 12, "center")}>
              <span>{formatRupiah(getJumlahDisplay()) || "Rp"}</span>
            </div>
            {label(360.8, 169.3, 30, "Via:")}
            {label(449.1, 169.3, 25, "Kas")}
            {checkbox(461.4, 166.7, 15.1, 12, via === "Kas")}
            {label(496.5, 169.3, 25, "Cek")}
            {checkbox(509.0, 166.7, 16.8, 12, via === "Cek")}
            {label(551.5, 169.3, 20, "BG")}
            {checkbox(561.8, 166.7, 15.9, 12, via === "BG")}

            {/* Kelengkapan data via BG */}
            {blackMark(189.2)}
            {label(62.2, 191.8, 200, "Kelengkapan data via BG", false, "pv-kelengkapan-bg")}

            {/* Nomor Rekening / Atas Nama */}
            {label(62.2, 203.1, 85, "Nomor Rekening", false, "pv-nomor-rekening")}
            <div style={fieldBox(147.1, 200.5, 130.2, 12, "center")}>
              <span style={{ fontFamily: "monospace" }}>{noRekening}</span>
            </div>
            {label(360.8, 203.1, 60, "Atas Nama:", false, "pv-atas-nama")}
            <div style={fieldBox(447.0, 200.5, 130.7, 12, "left")}>
              <span>{atasNama}</span>
            </div>

            {/* Nama Bank / Cabang */}
            {label(62.2, 225.7, 85, "Nama Bank", false, "pv-nama-bank")}
            <div style={fieldBox(147.1, 223.1, 130.2, 12, "center")}>
              <span style={{ textTransform: "uppercase" }}>{namaBank}</span>
            </div>
            {label(360.8, 225.7, 60, "Cabang:")}
            <div style={fieldBox(447.0, 223.1, 130.7, 12, "left")}>
              <span>{cabangBank}</span>
            </div>

            {/* NPWP (bila ada) */}
            {blackMark(245.6)}
            {label(62.2, 248.2, 85, "NPWP (bila ada)", false, "pv-npwp")}
            <div style={fieldBox(147.1, 245.6, 130.2, 12, "center")}>
              <span style={{ fontFamily: "monospace" }}>{npwp || "-"}</span>
            </div>

            {/* Pajak: Ada / Tidak ada */}
            {blackMark(268.2)}
            {label(62.2, 270.8, 85, "Pajak: Ada", false, "pv-pajak-ada")}
            {checkbox(147.1, 268.2, 35.1, 12, pajakAda)}
            {label(196.2, 270.8, 85, "Tidak ada")}
            {checkbox(242.2, 268.2, 35.1, 12, !pajakAda)}

            {/* Dasar Pengenaan / Pph Pasal / Tarif / Pajak */}
            {label(62.2, 293.4, 85, "Dasar Pengenaan", false, "pv-dasar-pengenaan")}
            <div style={fieldBox(147.1, 290.8, 130.2, 12, "center")}>
              <span style={{ fontFamily: "monospace" }}></span>
            </div>
            {label(290.8, 293.4, 60, "Pph Pasal")}
            <div style={fieldBox(334.8, 290.8, 30.5, 12, "center")}>
              <span style={{ fontFamily: "monospace" }}></span>
            </div>
            {label(380.2, 293.4, 60, "Tarif")}
            <div style={fieldBox(402.2, 290.8, 15.5, 12, "center")}>
              <span style={{ fontFamily: "monospace" }}></span>
            </div>
            {label(430.8, 293.4, 60, "Pajak")}
            <div style={fieldBox(460.8, 290.8, 60.5, 12, "center")}>
              <span style={{ fontFamily: "monospace" }}></span>
            </div>

            {/* ============================ TABEL JURNAL ============================ */}
            <div id={`pv-rincian-perkiraan-${type}`} style={{ ...abs(TABLE_LEFT, TABLE_TOP, 517.3), fontSize: "7.8pt", fontFamily: "inherit" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", border: "0.75pt solid #000" }}>
                <thead>
                  <tr style={{ height: `${HEADER_H}pt`, backgroundColor: headerBgColor }}>
                    <th style={{ border: "0.75pt solid #000", textAlign: "center", fontWeight: 700, width: `${COL_NO}pt` }}>No.</th>
                    <th style={{ border: "0.75pt solid #000", textAlign: "center", fontWeight: 700, width: `${COL_KODE}pt` }}>Kode Perkiraan</th>
                    <th style={{ border: "0.75pt solid #000", textAlign: "center", fontWeight: 700 }}>Uraian</th>
                    <th style={{ border: "0.75pt solid #000", textAlign: "center", fontWeight: 700, width: `${COL_DEBET}pt` }}>Debet</th>
                    <th style={{ border: "0.75pt solid #000", textAlign: "center", fontWeight: 700, width: `${COL_KREDIT}pt` }}>Kredit</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let currentNo = 0;
                    return visibleRows.map((row, idx) => {
                      const isRetensiRow = isRenovasi && (row.id === 5 || row.uraian?.toLowerCase().includes("retensi") || (!row.kode && idx === 1));
                      let noDisplay = "";
                      if (!isRetensiRow) {
                        currentNo += 1;
                        noDisplay = currentNo;
                      }
                      return (
                        <tr key={row.id} style={{ height: `${ROW_H}pt` }}>
                          <td style={{ borderLeft: "0.75pt solid #000", borderRight: "0.75pt solid #000", textAlign: "center" }}>
                            {noDisplay}
                          </td>
                          <td style={{ borderLeft: "0.75pt solid #000", borderRight: "0.75pt solid #000", textAlign: "left", paddingLeft: "3pt", fontFamily: "monospace" }}>{row.kode}</td>
                          <td style={{ borderLeft: "0.75pt solid #000", borderRight: "0.75pt solid #000", textAlign: "left", paddingLeft: "3pt" }}>{row.uraian}</td>
                          <td style={{ borderLeft: "0.75pt solid #000", borderRight: "0.75pt solid #000", textAlign: "right", paddingRight: "3pt", fontFamily: "monospace" }}>
                            {parseFloat(row.debet) > 0 ? formatRupiah(row.debet) : ""}
                          </td>
                          <td style={{ borderLeft: "0.75pt solid #000", borderRight: "0.75pt solid #000", textAlign: "right", paddingRight: "3pt", fontFamily: "monospace" }}>
                            {parseFloat(row.kredit) > 0 ? formatRupiah(row.kredit) : ""}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                  <tr style={{ height: `${ROW_H}pt` }}>
                    <td colSpan={5} style={{ border: "0.75pt solid #000" }}></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ============================ CHECKLIST ============================ */}
            {blackMark(392.3 + dynamicShift)}
            <div id={`pv-kelengkapan-dokumen-${type}`} style={{ ...abs(62.2, 394.9 + dynamicShift, 300), fontSize: "7.8pt", fontWeight: 400 }}>
              Kelengkapan Dokumen
            </div>

            {chkCol1.map((item, i) => (
              <React.Fragment key={item.key}>
                {checkbox(TABLE_LEFT + 0.7, CHK_TOP0 + dynamicShift + i * CHK_ROW_H, 22, 12, checklist[item.key])}
                {label(84.1, CHK_TOP0 + dynamicShift + i * CHK_ROW_H + 2.6, 210, item.text)}
              </React.Fragment>
            ))}

            {chkCol2.map((item, i) => (
              <React.Fragment key={item.key}>
                {checkbox(295.0, CHK_TOP0 + dynamicShift + i * CHK_ROW_H, 25.2, 12, checklist[item.key])}
                {label(321.1, CHK_TOP0 + dynamicShift + i * CHK_ROW_H + 2.6, 260, item.text)}
              </React.Fragment>
            ))}

            {/* Lain-lain (baris ke-6, hanya kolom kiri) */}
            {checkbox(TABLE_LEFT + 0.7, CHK_TOP0 + dynamicShift + 5 * CHK_ROW_H, 22, 12, checklist.lainLain)}
            <div style={{ ...abs(84.1, CHK_TOP0 + dynamicShift + 5 * CHK_ROW_H + 2.6, 460), fontSize: "7.8pt", display: "flex", alignItems: "baseline", gap: "4pt" }}>
              <span>Lain-lain : {checklist.lainLain ? checklist.lainLainText : ""}</span>
            </div>

            {/* ============================ TANDA TANGAN ============================ */}
            <div id={`pv-tanda-tangan-${type}`}>
              {sigCols.map((col, i) => (
                <div
                  key={i}
                  style={{
                    ...abs(col.center - SIG_COL_WIDTH / 2, 563.9 + dynamicShift, SIG_COL_WIDTH),
                    textAlign: "center",
                    fontSize: "7.8pt"
                  }}
                >
                  <div>{col.label}</div>
                  <div style={{ height: "37pt" }} />
                  <div style={{ fontWeight: 700, textTransform: "uppercase", textDecoration: "underline", lineHeight: 1.2 }}>
                    {col.nama || "...................................."}
                  </div>
                  <div style={{ fontSize: "7pt", color: "#333", textTransform: "uppercase", marginTop: "3pt" }}>
                    {col.jabatan}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Custom Validation Error Modal */}
      {showValidationModal && typeof document !== "undefined" && createPortal(
        <div 
          onClick={() => setShowValidationModal(false)}
          className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm no-print animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1a2b20] border border-gray-200 dark:border-[#2b4533] rounded-2xl max-w-md w-full shadow-2xl p-6 transition-all duration-200 transform scale-100 animate-scale-up"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 mb-2">Formulir Belum Lengkap</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                Harap lengkapi semua field input yang wajib diisi sebelum menyimpan dokumen SOPP ke riwayat.
              </p>
              <button
                type="button"
                onClick={() => setShowValidationModal(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all text-xs cursor-pointer focus:ring-2 focus:ring-emerald-500/20 outline-none"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Letter Number Settings Modal (Admin Only) */}
      {isAdmin && (
        <LetterNumberSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          letterType="sopp"
          title="Pengaturan Nomor Surat SOPP"
          onSettingsSaved={(data) => {
            if (data?.setting?.mode) setLetterNumberMode(data.setting.mode);
            fetchNextSoppNumber();
          }}
        />
      )}

      {/* Pop Up Peringatan Hari Akhir Pekan (Tengah Halaman) */}
      <WeekendWarningModal
        isOpen={showWeekendModal}
        onClose={() => setShowWeekendModal(false)}
        title="Hari Akhir Pekan Terpilih"
        message={weekendModalMessage || "Hari Sabtu & Minggu tidak dapat digunakan untuk pembuatan surat. Harap pilih tanggal pada hari kerja (Senin s.d. Jumat)."}
      />
    </div>
  );
}
