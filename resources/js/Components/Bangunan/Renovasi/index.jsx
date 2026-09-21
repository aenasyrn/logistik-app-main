// resources/js/Components/Bangunan/Renovasi/index.jsx
"use client";

import React, { useState, useRef } from "react";
import { Hammer, Search, Plus, FileSpreadsheet, Edit, Trash2, X, Loader2, Key, Upload } from "lucide-react";
import axios from "axios";
import { router } from "@inertiajs/react";
import * as XLSX from "xlsx";
import { parseExcelFile } from "../../../utils/excelHelper";

import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";
import ToastNotif from "../../Modal/ToastNotif";
import { importRenovationCSV, downloadRenovationTemplate } from "../../../services/renovationService";
import CustomSelectDropdown from "../../Form/CustomSelectDropdown";

const getDateSearchStrings = (dateString) => {
  if (!dateString) return [];
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return [];

  const day = String(date.getDate()).padStart(2, "0");
  const monthNum = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const slashDate = `${day}/${monthNum}/${year}`;
  const isoDate = dateString.substring(0, 10);

  const monthsIndo = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const monthIndo = monthsIndo[date.getMonth()];
  const indoDate = `${date.getDate()} ${monthIndo} ${year}`;

  return [slashDate.toLowerCase(), isoDate.toLowerCase(), indoDate.toLowerCase(), monthIndo.toLowerCase()];
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date)) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatBiaya = (biaya) => {
  if (biaya === null || biaya === undefined || Number(biaya) === 0) return "—";
  const rounded = Math.round(Number(biaya));
  return `Rp\u00A0${rounded.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const formatDesimal = (val) => {
  if (val === null || val === undefined || val === "" || Number(val) === 0) return "—";
  return Number(val).toLocaleString("id-ID");
};

const formatPajakPphKualifikasi = (val) => {
  if (val === null || val === undefined || val === "") return "—";
  const str = String(val).trim();
  const num = parseFloat(str);

  if (str.toLowerCase().includes("kecil") || num === 1.75) {
    return "1.75%";
  }
  if (str.toLowerCase().includes("menengah") || str.toLowerCase().includes("besar") || num === 2.65) {
    return "2.65%";
  }
  if (!isNaN(num) && num > 0) {
    return `${Number(num).toLocaleString("id-ID")}%`;
  }
  return str.endsWith("%") ? str : `${str}%`;
};

// Nilai disimpan di database sebagai desimal (contoh: 0.95 = 95%)
const formatPersentase = (nilai) => {
  if (nilai === null || nilai === undefined || nilai === "" || Number(nilai) === 0) return "—";
  const num = Number(nilai) * 100;
  // Hindari angka desimal panjang akibat floating point (contoh: 94.99999999%)
  const rounded = Math.round(num * 100) / 100;
  return `${rounded.toLocaleString("id-ID")}%`;
};

const SearchableSelect = ({ label, value, onChange, options, placeholder, disabled, className, labelCls }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  React.useEffect(() => {
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
      <label className={labelCls}>{label}</label>
      <div 
        onClick={() => { if (!disabled) { setIsOpen(!isOpen); setSearch(""); } }}
        className={`w-full px-3 py-2 bg-white border border-gray-200 rounded-lg cursor-pointer flex justify-between items-center text-xs shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <svg className="w-4 h-4 text-gray-400 shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto flex flex-col p-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari..."
            className="w-full px-3 py-1.5 mb-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                className="px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors font-medium text-left"
              >
                Gunakan: "{search}"
              </div>
            )}
            {filteredOptions.length === 0 && !showCustomOption ? (
              <div className="p-2 text-xs text-gray-500 text-center">Tidak ada hasil</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange({ target: { value: opt.nama } });
                    setIsOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors text-left"
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

export default function Renovasi({ userRole, renovations = [], outlets = [], vendors = [], renovationFilter = "", setRenovationFilter, spkHistory = [], soppHistory = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const searchTimeoutRef = useRef(null);

  React.useEffect(() => {
    if (renovationFilter === "") {
      setSearchQuery("");
      setInputValue("");
      setStatusGedungFilter("");
    }
  }, [renovationFilter]);

  React.useEffect(() => {
    const handleReset = () => {
      setSearchQuery("");
      setInputValue("");
      setStatusGedungFilter("");
      setCurrentPage(1);
      setSelectedId(null);
      setHoveredId(null);
    };
    window.addEventListener("reset-all-filters", handleReset);
    return () => window.removeEventListener("reset-all-filters", handleReset);
  }, []);

  const handleSearchChange = (val) => {
    setInputValue(val);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (val === "") {
      setSearchQuery("");
      setCurrentPage(1);
    } else {
      searchTimeoutRef.current = setTimeout(() => {
        setSearchQuery(val);
        setCurrentPage(1);
      }, 300);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [statusGedungFilter, setStatusGedungFilter] = useState("");

  const [formData, setFormData] = useState({
    outlet_id: "",
    no_memo: "",
    tgl_memo: "",
    nama_pekerjaan: "",
    nilai_pembayaran: "95",
    nama_outlet: "",
    cabang: "",
    norek: "",
    bank: "",
    pelaksana_pekerjaan: "",
    tgl_tagihan: "",
    nilai_spk_pelaksanaan: "",
    nilai_addendum_spk: "",
    tgl_spk: "",
    no_spk: "",
    pajak_pph: "2.65",
    tgl_bap_bast: "",

    tagihan_nilai: "",
    tagihan_dpp: "",
    tagihan_ppn: "",
    tagihan_pph: "",
    tagihan_retensi: "",
    tagihan_transfer: "",

    retensi_nilai: "",
    retensi_dpp: "",
    retensi_ppn: "",
    retensi_pph: "",
    retensi_transfer: "",

    status_gedung: "",
  });

  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: "" });
  const [notif, setNotif] = useState({ show: false, message: "", type: "success", onOk: null });

  const showNotif = (message, type = "success", onOk = null) => {
    setNotif({ show: true, message, type, onOk });
  };

  // Prepare rich option objects for Master Outlets
  const outletOptions = React.useMemo(() => {
    return (outlets || []).map((o) => {
      const subParts = [];
      if (o.code || o.id) subParts.push(`Kode: ${o.code || o.id}`);
      if (o.cabang) subParts.push(`Cabang: ${o.cabang}`);
      if (o.status_gedung) subParts.push(`Status: ${o.status_gedung}`);
      return {
        id: o.id,
        value: o.nama,
        label: o.nama,
        subtext: subParts.join(" • ") || "Master Outlet",
        raw: o,
      };
    });
  }, [outlets]);

  // Prepare option objects for Master Vendors
  const vendorOptions = React.useMemo(() => {
    const seen = new Set();
    const options = [];

    (vendors || []).forEach((v) => {
      const name = typeof v === "string" ? v : (v.nama || v.name || v.label || "");
      if (!name) return;
      const key = name.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        const subParts = [];
        if (typeof v === "object") {
          if (v.bidang) subParts.push(v.bidang);
          if (v.kota) subParts.push(v.kota);
          if (v.pimpinan) subParts.push(`Pimpinan: ${v.pimpinan}`);
        }
        options.push({
          id: typeof v === "object" ? v.id : name,
          value: name,
          label: name,
          subtext: subParts.join(" • ") || "Master Vendor",
          raw: v,
        });
      }
    });

    // Also include any distinct pelaksana_pekerjaan from renovations if not in master vendors
    (renovations || []).forEach((r) => {
      if (!r.pelaksana_pekerjaan) return;
      const key = r.pelaksana_pekerjaan.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        options.push({
          id: key,
          value: r.pelaksana_pekerjaan,
          label: r.pelaksana_pekerjaan,
          subtext: r.bank ? `Bank: ${r.bank}` : "Pelaksana Pekerjaan",
          raw: {
            nama: r.pelaksana_pekerjaan,
            bank: r.bank,
            norek: r.norek || r.no_rekening,
          },
        });
      }
    });

    return options;
  }, [vendors, renovations]);

  // Prepare distinct cabang options
  const cabangOptions = React.useMemo(() => {
    const seen = new Set();
    const options = [];
    (outlets || []).forEach((o) => {
      const c = (o.cabang || "").trim();
      if (c && !seen.has(c.toLowerCase())) {
        seen.add(c.toLowerCase());
        options.push({ value: c, label: c });
      }
    });
    return options;
  }, [outlets]);

  // Check matched master outlet
  const matchedOutlet = React.useMemo(() => {
    const curName = (formData.nama_outlet || "").trim().toLowerCase();
    if (!curName) return null;
    return (outlets || []).find(
      (o) => (o.nama && o.nama.toLowerCase() === curName) || String(o.id) === curName
    );
  }, [formData.nama_outlet, outlets]);

  // Check matched master vendor
  const matchedVendor = React.useMemo(() => {
    const curName = (formData.pelaksana_pekerjaan || "").trim().toLowerCase();
    if (!curName) return null;
    return (vendors || []).find(
      (v) => (v.nama && v.nama.toLowerCase() === curName) || String(v.id) === curName
    );
  }, [formData.pelaksana_pekerjaan, vendors]);

  // Fast map for SPK numbers to lookup SPK details (e.g. tanggal)
  const spkMap = React.useMemo(() => {
    const map = {};
    (spkHistory || []).forEach((s) => {
      const no = (s.nomor_spk || s.nomorSpk || "").trim();
      if (no) {
        map[no] = s;
      }
    });
    return map;
  }, [spkHistory]);

  // Options for Nomor SPK dropdown
  const spkOptions = React.useMemo(() => {
    return (spkHistory || [])
      .filter((s) => {
        const t = (s.tipe_spk || s.type || "").toLowerCase();
        return t === "renovasi" || !t;
      })
      .map((s) => {
        const no = s.nomor_spk || s.nomorSpk || "";
        const per = s.perusahaan || s.kepadanya || "";
        const tgl = s.tanggal || s.tanggalSuratRaw || "";
        const ur = s.uraian || "";
        const subParts = [];
        if (tgl) subParts.push(`Tgl: ${formatDate(tgl)}`);
        if (per) subParts.push(`Pelaksana: ${per}`);
        if (ur) subParts.push(`Pekerjaan: ${ur}`);
        return {
          id: s.id || no,
          value: no,
          label: no,
          subtext: subParts.join(" • ") || "Surat SPK",
          raw: s,
        };
      });
  }, [spkHistory]);

  // Options for No Memo (Surat SOPP) dropdown
  const soppOptions = React.useMemo(() => {
    return (soppHistory || [])
      .filter((sopp) => {
        const t = (sopp.tipe_sopp || sopp.type || "").toLowerCase();
        return t === "renovasi" || !t;
      })
      .map((sopp) => {
        const content = sopp.content || {};
        const no = sopp.nomor_sopp || sopp.nomorSopp || content.nomorUrut || "";
        const per = sopp.dibayarkan_kepada || sopp.dibayarkanKepada || content.dibayarkanKepada || "";
        const tgl = sopp.tanggal || content.tanggal || "";
        const rows = content.rows || [];
        const uraian = rows[0]?.uraian || content.uraian || "";
        const subParts = [];
        if (tgl) subParts.push(`Tgl: ${formatDate(tgl)}`);
        if (per) subParts.push(`Pelaksana: ${per}`);
        if (uraian) subParts.push(`Pekerjaan: ${uraian}`);
        return {
          id: sopp.id || no,
          value: no,
          label: no,
          subtext: subParts.join(" • ") || "Surat SOPP",
          raw: sopp,
        };
      });
  }, [soppHistory]);

  // Handle auto-sync when Nomor SPK is selected
  const handleSpkSelect = (val) => {
    const spkNo = typeof val === "string" ? val : (val?.value || val?.label || "");
    const matched = (spkHistory || []).find((s) => (s.nomor_spk || s.nomorSpk) === spkNo);
    setFormData((prev) => {
      const next = { ...prev, no_spk: spkNo };
      if (matched) {
        const raw = matched.content?.formData || matched;
        if (matched.tanggal || raw.tanggalSuratRaw) {
          next.tgl_spk = matched.tanggal || raw.tanggalSuratRaw;
        }
        if (!next.pelaksana_pekerjaan && (matched.perusahaan || raw.kepadanya)) {
          next.pelaksana_pekerjaan = matched.perusahaan || raw.kepadanya;
        }
        if (!next.nama_pekerjaan && (matched.uraian || matched.content?.projectUraian)) {
          next.nama_pekerjaan = matched.uraian || matched.content?.projectUraian;
        }
        const cleanJml = String(matched.jumlah || raw.spkDibulatkan || raw.spkTotal || "").replace(/[^0-9]/g, "");
        if ((!next.nilai_spk_pelaksanaan || Number(next.nilai_spk_pelaksanaan) === 0) && cleanJml) {
          next.nilai_spk_pelaksanaan = cleanJml;
          const calculated = calculateFinancials({ ...next, nilai_spk_pelaksanaan: cleanJml });
          Object.assign(next, calculated);
        }
      }
      return next;
    });
  };

  // Handle auto-sync of all 20 columns when No Memo (SOPP) is selected
  const handleSoppSelect = (val) => {
    const memoNo = typeof val === "string" ? val : (val?.value || val?.label || "");
    const matched = (soppHistory || []).find((s) => {
      const c = s.content || {};
      return s.nomor_sopp === memoNo || s.nomorSopp === memoNo || c.nomorUrut === memoNo || String(s.id) === memoNo;
    });

    setFormData((prev) => {
      const next = { ...prev, no_memo: memoNo };
      if (matched) {
        const c = matched.content || {};
        const rows = Array.isArray(c.rows) ? c.rows : [];
        const r1 = rows[0] || {};

        // 1. Tanggal Memo & Tanggal Tagihan
        const soppDate = matched.tanggal || c.tanggal || prev.tgl_memo;
        if (soppDate) {
          next.tgl_memo = soppDate;
          next.tgl_tagihan = soppDate;
        }

        // 2. Nama Pekerjaan
        const rawUraian = r1.uraian || c.uraian || "";
        const cleanUraian = rawUraian
          .replace(/\s*\((Termin\s*\d+|Pelunasan|Retensi\s*5%)\)/gi, "")
          .replace(/^Biaya\s+Retensi\s+Pekerjaan\s+Renovasi/gi, "Biaya Pekerjaan Renovasi")
          .replace(/^Biaya\s+Pekerjaan\s+Renovasi\s*[-–—]?\s*/gi, "")
          .trim();
        if (cleanUraian) {
          next.nama_pekerjaan = cleanUraian;
        }

        // 3. Nilai Pembayaran (%)
        const termin = c.termin || "";
        let nilaiPembayaranPct = "95";
        if (/termin\s*2/i.test(termin) || termin.includes("50")) {
          nilaiPembayaranPct = "50";
        } else if (/pelunasan/i.test(termin) || /retensi/i.test(termin) || termin.includes("100")) {
          nilaiPembayaranPct = "100";
        } else {
          nilaiPembayaranPct = "95";
        }
        next.nilai_pembayaran = nilaiPembayaranPct;

        // 4. Nama Outlet & Cabang
        if (c.namaOutlet || matched.nama_outlet) next.nama_outlet = c.namaOutlet || matched.nama_outlet;
        if (c.cabang || matched.cabang) next.cabang = c.cabang || matched.cabang;

        // 5. No Rekening & Bank
        if (c.noRekening) next.norek = c.noRekening;
        if (c.namaBank) next.bank = c.namaBank;

        // 6. Pelaksana Pekerjaan
        const pelaksana = matched.dibayarkan_kepada || matched.dibayarkanKepada || c.dibayarkanKepada;
        if (pelaksana) next.pelaksana_pekerjaan = pelaksana;

        // 7. Nilai SPK Pelaksanaan / Nilai Dasar
        const cleanDP = String(c.dasarPengenaan || r1.debet || "").replace(/[^0-9]/g, "");
        const nilaiKontrak = Number(cleanDP) || 0;
        if (nilaiKontrak > 0) {
          next.nilai_spk_pelaksanaan = String(nilaiKontrak);
          next.tagihan_nilai = String(nilaiKontrak);
        }

        // 8. Pajak PPh
        const pphTarif = c.tarif || (c.kualifikasiUsaha === "Kecil" ? "1.75" : "2.65");
        if (pphTarif) next.pajak_pph = String(pphTarif).replace(".", ",");

        // 9. DPP, PPN, PPH, Retensi, Transfer
        const parseNum = (v) => Number(String(v || "").replace(/[^0-9]/g, "")) || 0;
        let rowRetensi = 0;
        let rowPpn = 0;
        let rowPph = 0;
        let rowTransfer = 0;

        rows.forEach((r) => {
          const u = (r.uraian || "").toLowerCase();
          const k = r.kode || "";
          const krt = parseNum(r.kredit);
          if ((r.id === 5 || u.includes("retensi")) && r.id !== 1) rowRetensi = krt;
          else if ((r.id === 2 || k === "214.02.02" || u.includes("ppn")) && r.id !== 1) rowPpn = krt;
          else if ((r.id === 3 || k === "214.02.03" || u.includes("pph")) && r.id !== 1) rowPph = krt;
          else if ((r.id === 4 || k === "112.01.03" || u.includes("bank")) && r.id !== 1) rowTransfer = krt;
        });

        if (nilaiKontrak > 0) {
          const nilaiDasarKontrak = Math.round(nilaiKontrak * (100 / 111));
          const dpp = Math.round(nilaiDasarKontrak * (11 / 12));
          const tarifNum = parseFloat(String(pphTarif).replace(",", ".")) || 2.65;
          const pphCalc = rowPph || Math.round(nilaiDasarKontrak * (tarifNum / 100));
          const ppnCalc = rowPpn || Math.round(dpp * 0.12);
          const retensiCalc = rowRetensi || Math.round(nilaiDasarKontrak * 0.05);
          const transferCalc = rowTransfer || (nilaiKontrak - pphCalc - retensiCalc - ppnCalc);

          const isPelunasan = /pelunasan/i.test(termin) || /retensi/i.test(termin);

          if (isPelunasan) {
            next.retensi_nilai = String(transferCalc || nilaiKontrak);
            next.retensi_dpp = "0";
            next.retensi_ppn = "0";
            next.retensi_pph = "0";
            next.retensi_transfer = String(transferCalc || nilaiKontrak);
          } else {
            next.tagihan_nilai = String(nilaiKontrak);
            next.tagihan_dpp = String(dpp);
            next.tagihan_ppn = String(ppnCalc);
            next.tagihan_pph = String(pphCalc);
            next.tagihan_retensi = String(retensiCalc);
            next.tagihan_transfer = String(transferCalc);
            next.retensi_nilai = String(retensiCalc);
            next.retensi_transfer = String(retensiCalc);
          }
        }

        // 10. Nomor SPK & Tanggal SPK dari SOPP
        const spkFromSopp = c.nomorSpk || matched.nomor_spk || matched.no_spk || c.no_spk;
        if (spkFromSopp) {
          next.no_spk = spkFromSopp;
          const spkMatched = (spkHistory || []).find((s) => (s.nomor_spk || s.nomorSpk) === spkFromSopp);
          if (spkMatched && (spkMatched.tanggal || spkMatched.content?.formData?.tanggalSuratRaw)) {
            next.tgl_spk = spkMatched.tanggal || spkMatched.content?.formData?.tanggalSuratRaw;
          }
        }
      }
      return next;
    });
  };

  const handleOutletChange = (e) => {
    const val = (typeof e === "object" && e !== null && e.target)
      ? e.target.value
      : (typeof e === "object" && e !== null ? (e.nama || e.value || e.label || "") : (e || ""));

    const strVal = String(val).trim();
    const matched = (outlets || []).find(
      (o) => (o.nama && o.nama.toLowerCase() === strVal.toLowerCase()) || String(o.id) === strVal
    );

    setFormData((p) => {
      const updated = {
        ...p,
        nama_outlet: matched ? matched.nama : strVal,
        outlet_id: matched ? matched.id : p.outlet_id,
        idOutlet: matched ? matched.id : p.idOutlet,
      };
      if (matched) {
        if (matched.cabang) updated.cabang = matched.cabang;
        if (matched.status_gedung) {
          const s = matched.status_gedung.trim().toLowerCase();
          if (s === "sewa") updated.status_gedung = "Sewa";
          else if (s === "milik sendiri") updated.status_gedung = "Milik Sendiri";
          else updated.status_gedung = matched.status_gedung;
        }
      }
      return updated;
    });
  };

  const handleCabangChange = (e) => {
    const val = (typeof e === "object" && e !== null && e.target)
      ? e.target.value
      : (typeof e === "object" && e !== null ? (e.nama || e.value || e.label || "") : (e || ""));
    setFormData((p) => ({
      ...p,
      cabang: val,
    }));
  };

  const handlePelaksanaChange = (e) => {
    const val = (typeof e === "object" && e !== null && e.target)
      ? e.target.value
      : (typeof e === "object" && e !== null ? (e.nama || e.value || e.label || "") : (e || ""));

    const strVal = String(val).trim();
    const matched = (vendors || []).find(
      (v) => (v.nama && v.nama.toLowerCase() === strVal.toLowerCase()) || String(v.id) === strVal
    );

    setFormData((p) => {
      const updated = {
        ...p,
        pelaksana_pekerjaan: matched ? matched.nama : strVal,
      };
      if (matched) {
        if (matched.bank && !p.bank) updated.bank = matched.bank;
        if (matched.norek && !p.norek) updated.norek = matched.norek;
      }
      return updated;
    });
  };

  const handleSave = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.nama_pekerjaan?.trim()) {
      showNotif("Nama Pekerjaan wajib diisi!", "error");
      return;
    }
    setIsSaving(true);

    const resolvedOutletId = (formData.outlet_id && !isNaN(Number(formData.outlet_id)))
      ? Number(formData.outlet_id)
      : ((formData.idOutlet && !isNaN(Number(formData.idOutlet))) ? Number(formData.idOutlet) : null);

    const payload = {
      outlet_id: resolvedOutletId,
      idOutlet: resolvedOutletId,
      no_memo: formData.no_memo || null,
      tgl_memo: formData.tgl_memo || null,
      nama_pekerjaan: formData.nama_pekerjaan,
      // Konversi dari skala 0-100 (input form) ke desimal (disimpan ke database)
      nilai_pembayaran: Number(formData.nilai_pembayaran) / 100 || 0,
      nama_outlet: formData.nama_outlet || null,
      cabang: formData.cabang || null,
      norek: formData.norek || null,
      bank: formData.bank || null,
      pelaksana_pekerjaan: formData.pelaksana_pekerjaan || null,
      tgl_tagihan: formData.tgl_tagihan || null,
      nilai_spk_pelaksanaan: Number(formData.nilai_spk_pelaksanaan) || 0,
      nilai_addendum_spk: Number(formData.nilai_addendum_spk) || 0,
      tgl_spk: formData.tgl_spk || null,
      no_spk: formData.no_spk || null,
      pajak_pph: Number(String(formData.pajak_pph).replace(",", ".")) || 0,
      tgl_bap_bast: formData.tgl_bap_bast || null,

      tagihan_nilai: Number(formData.tagihan_nilai) || 0,
      tagihan_dpp: Number(formData.tagihan_dpp) || 0,
      tagihan_ppn: Number(formData.tagihan_ppn) || 0,
      tagihan_pph: Number(formData.tagihan_pph) || 0,
      tagihan_retensi: Number(formData.tagihan_retensi) || 0,
      tagihan_transfer: Number(formData.tagihan_transfer) || 0,

      retensi_nilai: Number(formData.retensi_nilai) || 0,
      retensi_dpp: Number(formData.retensi_dpp) || 0,
      retensi_ppn: Number(formData.retensi_ppn) || 0,
      retensi_pph: Number(formData.retensi_pph) || 0,
      retensi_transfer: Number(formData.retensi_transfer) || 0,

      status_gedung: formData.status_gedung || null,
    };

    if (editingId) {
      router.put(`/building-renovations/${editingId}`, payload, {
        onSuccess: () => {
          showNotif("Data renovasi berhasil diperbarui!");
          setIsModalOpen(false);
        },
        onError: (err) => {
          console.error("Update renovation error:", err);
          const msg = (err.response?.data?.message) || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join("\n") : null) || Object.values(err).flat().join("\n");
          showNotif(msg || "Gagal menyimpan data renovasi.", "error");
        },
        onFinish: () => {
          setIsSaving(false);
        }
      });
    } else {
      router.post("/building-renovations", payload, {
        onSuccess: () => {
          showNotif("Proyek renovasi baru berhasil ditambahkan!");
          setIsModalOpen(false);
        },
        onError: (err) => {
          console.error("Create renovation error:", err);
          const msg = (err.response?.data?.message) || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join("\n") : null) || Object.values(err).flat().join("\n");
          showNotif(msg || "Gagal menyimpan data renovasi.", "error");
        },
        onFinish: () => {
          setIsSaving(false);
        }
      });
    }
  };

  const calculateFinancials = (state) => {
    const rawTagihan = String(state.tagihan_nilai || "").replace(/[^0-9]/g, "");
    const tagihanNilai = Number(rawTagihan) || 0;

    let tarifPph = parseFloat(String(state.pajak_pph || "").replace(",", ".")) || 2.65;
    if (isNaN(tarifPph) || tarifPph <= 0) tarifPph = 2.65;

    let persentasePembayaran = parseFloat(state.nilai_pembayaran);
    if (isNaN(persentasePembayaran)) persentasePembayaran = 95;
    const retensiPercent = Math.max(0, 100 - persentasePembayaran);

    if (tagihanNilai > 0) {
      // 2. Nilai Dasar Kontrak = Tagihan / 1.11
      const nilaiDasar = tagihanNilai / 1.11;

      // 3. DPP = Nilai Dasar * (11 / 12)
      const dpp = Math.round(nilaiDasar * (11 / 12));

      // 4. PPh Final = Nilai Dasar * tarifPph%
      const pph = Math.round(nilaiDasar * (tarifPph / 100));

      // PPN = DPP * 12%
      const ppn = Math.round(dpp * 0.12);

      // 5. Retensi = Nilai Dasar * retensiPercent%
      const retensi = Math.round(nilaiDasar * (retensiPercent / 100));

      // 6. Transfer = Total Tagihan - PPh Dipotong - Retensi - PPN Dipotong
      const transfer = tagihanNilai - pph - retensi - ppn;

      // Section IV Retensi 5% calculations
      const retensiNilai = retensi;
      const retensiTransfer = retensiNilai;

      return {
        tagihan_dpp: String(dpp),
        tagihan_ppn: String(ppn),
        tagihan_pph: String(pph),
        tagihan_retensi: String(retensi),
        tagihan_transfer: String(transfer),

        retensi_nilai: String(retensiNilai),
        retensi_transfer: String(retensiTransfer),
      };
    } else {
      // Fallback calculation from total SPK if tagihanNilai is not entered yet
      const spkVal = Number(String(state.nilai_spk_pelaksanaan || "").replace(/[^0-9]/g, "")) || 0;
      const addendumVal = Number(String(state.nilai_addendum_spk || "").replace(/[^0-9]/g, "")) || 0;
      const totalSpk = spkVal + addendumVal;

      if (totalSpk > 0 && retensiPercent > 0) {
        const retensiNominal = Math.round(totalSpk * (retensiPercent / 100));
        return {
          tagihan_retensi: String(retensiNominal),
          retensi_nilai: String(retensiNominal),
          retensi_transfer: String(retensiNominal),
        };
      }
    }
    return {};
  };

  const calculateRetensiSectionIV = (retensiNilaiRaw) => {
    const retensiNilai = Number(String(retensiNilaiRaw || "").replace(/[^0-9]/g, "")) || 0;
    return {
      retensi_transfer: retensiNilai > 0 ? String(retensiNilai) : "",
    };
  };

  const handleNilaiPembayaranChange = (val) => {
    setFormData((p) => {
      const nextState = { ...p, nilai_pembayaran: val };
      const calculated = calculateFinancials(nextState);
      return { ...nextState, ...calculated };
    });
  };

  const handlePajakPphChange = (val) => {
    setFormData((p) => {
      const nextState = { ...p, pajak_pph: val };
      const calculated = calculateFinancials(nextState);
      return { ...nextState, ...calculated };
    });
  };

  const handleRupiahChange = (field, val) => {
    const rawValue = val.replace(/[^0-9]/g, "");
    setFormData((p) => {
      const nextState = { ...p, [field]: rawValue };
      if (field === "tagihan_nilai" || field === "nilai_spk_pelaksanaan" || field === "nilai_addendum_spk") {
        const calculated = calculateFinancials(nextState);
        return { ...nextState, ...calculated };
      }
      if (field === "retensi_nilai") {
        const retensiCalc = calculateRetensiSectionIV(rawValue, nextState.pajak_pph);
        return { ...nextState, ...retensiCalc };
      }
      return nextState;
    });
  };

  const getRupiahValue = (field) => {
    const val = formData[field];
    if (val === null || val === undefined || val === "") return "";
    const cleanVal = String(val).replace(/[^0-9]/g, "");
    if (!cleanVal) return "";
    return Number(cleanVal).toLocaleString("id-ID");
  };

  // Filter
  const filteredRenovations = renovations.filter((item) => {
    if (statusGedungFilter) {
      if ((item.status_gedung || "").toLowerCase().trim() !== statusGedungFilter.toLowerCase().trim()) {
        return false;
      }
    }
    if (!searchQuery) return true;

    const q = searchQuery.toLowerCase();

    // Formatting numbers to match search
    const nilaiPembayaranPercent = (item.nilai_pembayaran !== null && item.nilai_pembayaran !== undefined && item.nilai_pembayaran !== "")
      ? formatPersentase(item.nilai_pembayaran).toLowerCase()
      : "";
    const nilaiSpkFormatted = item.nilai_spk_pelaksanaan ? Number(item.nilai_spk_pelaksanaan).toLocaleString("id-ID").toLowerCase() : "";
    const statusGedungStr = (item.status_gedung || "").toLowerCase();

    // Pajak PPH search strings
    const pajakPphStr = item.pajak_pph ? formatDesimal(item.pajak_pph).toLowerCase() : "";
    const pajakPphRaw = item.pajak_pph ? String(item.pajak_pph) : "";
    const tagihanPphStr = item.tagihan_pph ? formatBiaya(item.tagihan_pph).toLowerCase() : "";
    const tagihanPphRaw = item.tagihan_pph ? String(item.tagihan_pph) : "";
    const retensiPphStr = item.retensi_pph ? formatBiaya(item.retensi_pph).toLowerCase() : "";
    const retensiPphRaw = item.retensi_pph ? String(item.retensi_pph) : "";

    // Date search strings
    const datesSearchStrings = [
      ...getDateSearchStrings(item.tgl_memo),
      ...getDateSearchStrings(item.tgl_tagihan),
      ...getDateSearchStrings(item.tgl_spk),
      ...getDateSearchStrings(item.tgl_bap_bast)
    ];
    const matchesDates = datesSearchStrings.some(dStr => dStr.includes(q));

    return (
      (item.nama_pekerjaan && item.nama_pekerjaan.toLowerCase().includes(q)) ||
      (item.no_memo && item.no_memo.toLowerCase().includes(q)) ||
      (item.nama_outlet && item.nama_outlet.toLowerCase().includes(q)) ||
      (item.cabang && item.cabang.toLowerCase().includes(q)) ||
      (item.pelaksana_pekerjaan && item.pelaksana_pekerjaan.toLowerCase().includes(q)) ||
      (item.no_spk && item.no_spk.toLowerCase().includes(q)) ||
      (item.bank && item.bank.toLowerCase().includes(q)) ||
      (item.norek && String(item.norek).includes(q)) ||
      (item.no_rekening && String(item.no_rekening).includes(q)) ||
      (statusGedungStr && statusGedungStr.includes(q)) ||
      (nilaiPembayaranPercent && nilaiPembayaranPercent.includes(q)) ||
      (nilaiSpkFormatted && nilaiSpkFormatted.includes(q)) ||
      (pajakPphStr && pajakPphStr.includes(q)) ||
      (pajakPphRaw && pajakPphRaw.includes(q)) ||
      (tagihanPphStr && tagihanPphStr.includes(q)) ||
      (tagihanPphRaw && tagihanPphRaw.includes(q)) ||
      (retensiPphStr && retensiPphStr.includes(q)) ||
      (retensiPphRaw && retensiPphRaw.includes(q)) ||
      matchesDates
    );
  });

  // Pagination Windowing helper (max 5 page numbers visible)
  const totalPages = Math.ceil(filteredRenovations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredRenovations.slice(startIndex, startIndex + itemsPerPage);

  const getVisiblePages = () => {
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      return [...Array(totalPages)].map((_, i) => i + 1);
    }
    let start = currentPage - 2;
    let end = currentPage + 2;
    if (start < 1) {
      start = 1;
      end = maxVisible;
    } else if (end > totalPages) {
      end = totalPages;
      start = totalPages - maxVisible + 1;
    }
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };



  const getCellClass = (item, extraClass = "") => {
    const isSelected = selectedId === item.id;
    const isHovered = hoveredId === item.id;
    const isEven = paginatedData.indexOf(item) % 2 === 0;

    let bgClass = "";
    if (isSelected) {
      bgClass = isHovered 
        ? "bg-blue-200 text-blue-950 dark:bg-[#2e4c37] dark:text-[#f1f5f3]" 
        : "bg-blue-100 text-blue-900 dark:bg-[#1f3526] dark:text-[#48a359]";
    } else if (isHovered) {
      bgClass = "bg-slate-200 text-gray-900 dark:bg-[#273f2f] dark:text-[#f1f5f3]";
    } else {
      bgClass = isEven ? "bg-slate-100 text-gray-800 dark:bg-[#213527] dark:text-[#d1dcd4]" : "bg-white text-gray-800 dark:bg-[#1a2b20] dark:text-[#d1dcd4]";
    }

    // Filter out cell-specific background overrides if row is active (selected or hovered)
    let finalExtra = extraClass;
    if (isSelected || isHovered) {
      finalExtra = extraClass
        .replace(/\bbg-\S+/g, "") // remove any class starting with bg-
        .replace(/\s+/g, " ")     // normalize spaces
        .trim();
    }

    return `p-2 border border-slate-200 align-middle select-none cursor-pointer outline-none transition-colors duration-150 ${bgClass} ${finalExtra}`;
  };

  const openAdd = () => {
    setEditingId(null);
    setFormData({
      outlet_id: "",
      no_memo: "",
      tgl_memo: "",
      nama_pekerjaan: "",
      nilai_pembayaran: "95",
      nama_outlet: "",
      cabang: "",
      norek: "",
      bank: "",
      pelaksana_pekerjaan: "",
      tgl_tagihan: "",
      nilai_spk_pelaksanaan: "",
      nilai_addendum_spk: "",
      tgl_spk: "",
      no_spk: "",
      pajak_pph: "2.65",
      tgl_bap_bast: "",

      tagihan_nilai: "",
      tagihan_dpp: "",
      tagihan_ppn: "",
      tagihan_pph: "",
      tagihan_retensi: "",
      tagihan_transfer: "",

      retensi_nilai: "",
      retensi_dpp: "",
      retensi_ppn: "",
      retensi_pph: "",
      retensi_transfer: "",

      status_gedung: "",
    });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      outlet_id: item.outlet_id || "",
      no_memo: item.no_memo || "",
      tgl_memo: item.tgl_memo || "",
      nama_pekerjaan: item.nama_pekerjaan || "",
      // Konversi dari desimal (database) ke skala 0-100 (tampilan form)
      nilai_pembayaran:
        item.nilai_pembayaran !== null && item.nilai_pembayaran !== undefined && item.nilai_pembayaran !== ""
          ? Number(item.nilai_pembayaran) * 100
          : "",
      nama_outlet: item.nama_outlet || "",
      cabang: item.cabang || "",
      norek: item.norek || "",
      bank: item.bank || "",
      pelaksana_pekerjaan: item.pelaksana_pekerjaan || "",
      tgl_tagihan: item.tgl_tagihan || "",
      nilai_spk_pelaksanaan: item.nilai_spk_pelaksanaan || "",
      nilai_addendum_spk: item.nilai_addendum_spk || "",
      tgl_spk: item.tgl_spk || "",
      no_spk: item.no_spk || "",
      pajak_pph: item.pajak_pph || "2.65",
      tgl_bap_bast: item.tgl_bap_bast || "",

      tagihan_nilai: item.tagihan_nilai || "",
      tagihan_dpp: item.tagihan_dpp || "",
      tagihan_ppn: item.tagihan_ppn || "",
      tagihan_pph: item.tagihan_pph || "",
      tagihan_retensi: item.tagihan_retensi || "",
      tagihan_transfer: item.tagihan_transfer || "",

      retensi_nilai: item.retensi_nilai || "",
      retensi_dpp: item.retensi_dpp || "",
      retensi_ppn: item.retensi_ppn || "",
      retensi_pph: item.retensi_pph || "",
      retensi_transfer: item.retensi_transfer || "",

      status_gedung: item.status_gedung || "",
    });
    setIsModalOpen(true);
  };

  const askDelete = (id, nama) => {
    setDeleteConfirm({ show: true, id, name: nama });
  };

  const confirmDelete = () => {
    setIsSaving(true);
    router.delete(`/building-renovations/${deleteConfirm.id}`, {
      onSuccess: () => {
        showNotif("Data renovasi berhasil dihapus!");
        setDeleteConfirm({ show: false, id: null, name: "" });
      },
      onError: (err) => {
        console.error(err);
        showNotif("Gagal menghapus data renovasi.", "error");
      },
      onFinish: () => {
        setIsSaving(false);
      }
    });
  };



  const exportToExcel = () => {
    const rows = filteredRenovations.map((item, idx) => ({
      "No": idx + 1,
      "No Memo": item.no_memo || "",
      "Tanggal Memo": item.tgl_memo || "",
      "Nama Pekerjaan": item.nama_pekerjaan || "",
      "Nilai Pembayaran": formatPersentase(item.nilai_pembayaran),
      "Nama Outlet": item.nama_outlet || "",
      "Cabang": item.cabang || "",
      "Status Gedung": item.status_gedung || "",
      "No Rekening": item.norek || "",
      "Bank": item.bank || "",
      "Pelaksana Pekerjaan": item.pelaksana_pekerjaan || "",
      "Tanggal Tagihan": item.tgl_tagihan || "",
      "Nilai SPK Pelaksanaan": item.nilai_spk_pelaksanaan ? Number(item.nilai_spk_pelaksanaan) : 0,
      "Nilai Addendum SPK": item.nilai_addendum_spk ? Number(item.nilai_addendum_spk) : 0,
      "Tanggal SPK": item.tgl_spk || "",
      "Nomor SPK": item.no_spk || "",
      "Pajak PPh": item.pajak_pph ? Number(item.pajak_pph) : 0,
      "Tanggal BAP & BAST": item.tgl_bap_bast || "",
      "Tagihan - Nilai Tagihan": item.tagihan_nilai ? Number(item.tagihan_nilai) : 0,
      "Tagihan - DPP": item.tagihan_dpp ? Number(item.tagihan_dpp) : 0,
      "Tagihan - PPN": item.tagihan_ppn ? Number(item.tagihan_ppn) : 0,
      "Tagihan - PPh": item.tagihan_pph ? Number(item.tagihan_pph) : 0,
      "Tagihan - Retensi": item.tagihan_retensi ? Number(item.tagihan_retensi) : 0,
      "Tagihan - Transfer": item.tagihan_transfer ? Number(item.tagihan_transfer) : 0,
      "Retensi 5% - Nilai": item.retensi_nilai ? Number(item.retensi_nilai) : 0,
      "Retensi 5% - Transfer": item.retensi_transfer ? Number(item.retensi_transfer) : 0,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Renovasi Bangunan");
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...rows.map((r) => String(r[key]).length)) + 2,
    }));
    ws["!cols"] = colWidths;
    XLSX.writeFile(wb, `Renovasi_Bangunan_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsSaving(true);
    try {
      const data = await parseExcelFile(file);
      const total = await importRenovationCSV("logistikku_app_01", data);
      showNotif(`Sukses! ${total} data renovasi berhasil di-import.`, "success", () => {
        router.reload({ only: ['buildingRenovations'] });
      });
    } catch (err) {
      console.error(err);
      showNotif(err.response?.data?.message || err.message || "Gagal import! Pastikan file Excel valid dan kolom header sesuai template.", "error");
    } finally {
      setIsSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };


  return (
    <>
      <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300 relative print:hidden">

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
              <Hammer className="w-6 h-6 text-[#0d5c3a] dark:text-emerald-400" /> Renovasi Gedung
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Catatan pemeliharaan, perbaikan, proyek renovasi, SPK, rincian tagihan, dan retensi 5%.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={exportToExcel}
              disabled={filteredRenovations.length === 0}
              className="flex items-center gap-2 bg-[#279969] hover:bg-[#1e7a53] disabled:bg-[#279969]/50 text-white px-5 py-2.5 rounded-full font-bold shadow-md shadow-[#279969]/30 transition-all text-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>
            {userRole !== "guest" && (
              <>
                <button
                  type="button"
                  onClick={downloadRenovationTemplate}
                  className="flex items-center gap-2 bg-[#279969] hover:bg-[#1e7a53] text-white px-5 py-2.5 rounded-full font-bold shadow-md shadow-[#279969]/30 transition-all text-xs cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Template Excel
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-colors text-sm disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Import Excel
                </button>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  aria-label="Upload file Excel data renovasi"
                />
              </>
            )}
          </div>
        </div>

        {/* Tabel Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Search Toolbar */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search Bar */}
                <div className="relative w-full sm:w-80">
                  <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Cari memo, pekerjaan, kontraktor..."
                    value={inputValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
                  />
                </div>

                {/* Show Entries Dropdown */}
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span>Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="pl-3 pr-8 py-1.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs cursor-pointer font-medium shadow-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={10000}>All</option>
                  </select>
                  <span>entries</span>
                </div>

                {/* Reset Filters button if any filter active */}
                {(statusGedungFilter !== "" || inputValue !== "" || searchQuery !== "") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setInputValue("");
                      setStatusGedungFilter("");
                      setCurrentPage(1);
                      if (setRenovationFilter) setRenovationFilter("");
                    }}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold hover:underline shrink-0 cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                {userRole !== "guest" && (
                  <button
                    type="button"
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-[#0d5c3a] hover:bg-[#0a462c] text-white px-5 py-2 rounded-full font-bold shadow-md shadow-[#0d5c3a]/20 transition-all text-xs shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Renovasi
                  </button>
                )}
                <div className="bg-emerald-50 text-[#0d5c3a] dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 px-4 py-2 rounded-full text-xs font-bold shrink-0">
                  Total Proyek: {filteredRenovations.length}
                </div>
              </div>
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="flex flex-wrap gap-4 border-t border-gray-100 pt-3">
              {/* Status Gedung Filter */}
              <div className="w-full sm:w-60">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Status Gedung</label>
                <select
                  value={statusGedungFilter}
                  onChange={(e) => {
                    setStatusGedungFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm cursor-pointer"
                >
                  <option value="">Semua Status Gedung</option>
                  <option value="Milik Sendiri">Milik Sendiri</option>
                  <option value="Sewa">Sewa</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[3550px] table-fixed">
              <thead>
                <tr className="bg-[#0d5c3a] text-slate-100 text-[11px] font-bold uppercase tracking-wider text-center">
                  <th className="py-2.5 px-3 w-[50px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]" rowSpan={2}>No</th>
                  <th className="py-2.5 px-3 w-[130px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]" rowSpan={2}>No Memo</th>
                  <th className="py-2.5 px-3 w-[110px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]" rowSpan={2}>Tanggal Memo</th>
                  <th className="py-2.5 px-3 w-[280px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]" rowSpan={2}>Nama Pekerjaan</th>
                  <th className="py-2.5 px-3 w-[130px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]" rowSpan={2}>Nilai Pembayaran</th>
                  <th className="py-2.5 px-3 w-[180px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]" rowSpan={2}>Nama Outlet</th>
                  <th className="py-2.5 px-3 w-[110px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]" rowSpan={2}>Cabang</th>
                  <th className="py-2.5 px-3 w-[110px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]" rowSpan={2}>Status Gedung</th>
                  <th className="py-2.5 px-3 w-[140px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]" rowSpan={2}>No Rekening</th>
                  <th className="py-2.5 px-3 w-[90px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]" rowSpan={2}>Bank</th>
                  <th className="py-2.5 px-3 w-[180px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]" rowSpan={2}>Pelaksana Pekerjaan</th>
                  <th className="py-2.5 px-3 w-[110px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]" rowSpan={2}>Tanggal Tagihan</th>
                  <th className="py-2.5 px-3 w-[140px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]" rowSpan={2}>Nilai SPK Pelaksanaan</th>
                  <th className="py-2.5 px-3 w-[140px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]" rowSpan={2}>Nilai Addendum SPK</th>
                  <th className="py-2.5 px-3 w-[110px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]" rowSpan={2}>Tanggal SPK</th>
                  <th className="py-2.5 px-3 w-[140px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]" rowSpan={2}>Nomor SPK</th>
                  <th className="py-2.5 px-3 w-[90px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]" rowSpan={2}>Pajak PPh</th>
                  <th className="py-2.5 px-3 w-[140px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]" rowSpan={2}>Tanggal BAP & BAST</th>
                  <th className="py-2 px-3 text-center align-middle border border-[#0a4228] bg-[#0d5c3a] font-bold" colSpan={6}>Nilai Tagihan</th>
                  <th className="py-2 px-3 text-center align-middle border border-[#0a4228] bg-[#0d5c3a] font-bold" colSpan={2}>Retensi 5%</th>
                  {userRole !== "guest" && (
                    <th className="py-2.5 px-3 w-[100px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]" rowSpan={2}>Aksi</th>
                  )}
                </tr>
                <tr className="bg-[#0d5c3a] text-slate-100 text-[11px] font-bold uppercase tracking-wider">
                  {/* Nilai Tagihan sub-headers */}
                  <th className="py-2 px-2 w-[120px] text-center border border-[#0a4228] bg-[#0d5c3a]">Nilai Tagihan</th>
                  <th className="py-2 px-2 w-[110px] text-center border border-[#0a4228] bg-[#0d5c3a]">DPP</th>
                  <th className="py-2 px-2 w-[110px] text-center border border-[#0a4228] bg-[#0d5c3a]">PPN</th>
                  <th className="py-2 px-2 w-[110px] text-center border border-[#0a4228] bg-[#0d5c3a]">PPH</th>
                  <th className="py-2 px-2 w-[110px] text-center border border-[#0a4228] bg-[#0d5c3a]">Retensi</th>
                  <th className="py-2 px-2 w-[110px] text-center border border-[#0a4228] bg-[#0d5c3a]">Transfer</th>
                  {/* Retensi 5% sub-headers */}
                  <th className="py-2 px-2 w-[110px] text-center border border-[#0a4228] bg-[#0d5c3a]">Retensi 5%</th>
                  <th className="py-2 px-2 w-[120px] text-center border border-[#0a4228] bg-[#0d5c3a]">Transfer</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-800 bg-white">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={userRole === "guest" ? "27" : "28"} className="p-4 text-center text-gray-400 border border-slate-200">
                      Tidak ada data renovasi ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => (
                    <tr
                      key={item.id}
                      onMouseEnter={() => setHoveredId(item.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => setSelectedId((prev) => (prev === item.id ? null : item.id))}
                      className="transition-colors duration-150"
                    >
                      <td className={getCellClass(item, "text-center font-semibold bg-white/70")}>{startIndex + index + 1}</td>
                      <td className={getCellClass(item, "font-semibold text-gray-900 truncate")} title={item.no_memo || ""}>{item.no_memo || "-"}</td>
                      <td className={getCellClass(item, "text-center")}>{formatDate(item.tgl_memo)}</td>
                      <td className={getCellClass(item, "font-semibold text-gray-900 truncate")} title={item.nama_pekerjaan}>{item.nama_pekerjaan}</td>
                      <td className={getCellClass(item, "font-medium text-gray-800 text-center")}>{formatPersentase(item.nilai_pembayaran)}</td>
                      <td className={getCellClass(item, "truncate")} title={item.nama_outlet || ""}>{item.nama_outlet || "-"}</td>
                      <td className={getCellClass(item, "truncate")} title={item.cabang || ""}>{item.cabang || "-"}</td>
                      <td className={getCellClass(item, "font-semibold")}>{item.status_gedung || "-"}</td>
                      <td className={getCellClass(item, "font-mono text-gray-600 truncate")} title={item.norek || ""}>{item.norek || "-"}</td>
                      <td className={getCellClass(item, "truncate")} title={item.bank || ""}>{item.bank || "-"}</td>
                      <td className={getCellClass(item, "truncate")} title={item.pelaksana_pekerjaan || ""}>{item.pelaksana_pekerjaan || "-"}</td>
                      <td className={getCellClass(item, "text-center")}>{formatDate(item.tgl_tagihan)}</td>
                      <td className={getCellClass(item, "font-medium text-gray-800 whitespace-nowrap")}>{formatBiaya(item.nilai_spk_pelaksanaan)}</td>
                      <td className={getCellClass(item, "font-medium text-gray-800 whitespace-nowrap")}>{formatBiaya(item.nilai_addendum_spk)}</td>
                      <td className={getCellClass(item, "text-center")}>
                        {formatDate(
                          item.tgl_spk ||
                          spkMap[item.no_spk]?.tanggal ||
                          spkMap[item.no_spk]?.content?.formData?.tanggalSuratRaw
                        )}
                      </td>
                      <td className={getCellClass(item, "truncate")} title={item.no_spk || ""}>{item.no_spk || "-"}</td>
                      <td className={getCellClass(item, "font-medium text-gray-800 text-center whitespace-nowrap")}>{formatPajakPphKualifikasi(item.pajak_pph)}</td>
                      <td className={getCellClass(item, "text-center")}>{formatDate(item.tgl_bap_bast)}</td>

                      {/* Subbab Nilai Tagihan columns */}
                      <td className={getCellClass(item, "text-center font-semibold bg-gray-50/20 whitespace-nowrap")}>{formatBiaya(item.tagihan_nilai)}</td>
                      <td className={getCellClass(item, "text-center whitespace-nowrap")}>{formatBiaya(item.tagihan_dpp)}</td>
                      <td className={getCellClass(item, "text-center whitespace-nowrap")}>{formatBiaya(item.tagihan_ppn)}</td>
                      <td className={getCellClass(item, "text-center whitespace-nowrap")}>{formatBiaya(item.tagihan_pph)}</td>
                      <td className={getCellClass(item, "text-center whitespace-nowrap")}>{formatBiaya(item.tagihan_retensi)}</td>
                      <td className={getCellClass(item, "text-center font-bold text-emerald-600 bg-emerald-50/10 whitespace-nowrap")}>{formatBiaya(item.tagihan_transfer)}</td>

                      {/* Subbab Retensi 5% columns */}
                      <td className={getCellClass(item, "text-center font-semibold bg-gray-50/20 whitespace-nowrap")}>{formatBiaya(item.retensi_nilai || item.tagihan_retensi)}</td>
                      <td className={getCellClass(item, "text-center font-bold text-emerald-600 bg-emerald-50/10 whitespace-nowrap")}>{formatBiaya(item.retensi_transfer || item.tagihan_retensi)}</td>

                      {userRole !== "guest" && (
                        <td className={getCellClass(item, "text-center")} onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-center items-center gap-1.5">
                            {userRole === "admin" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openEdit(item)}
                                  title="Edit Data"
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => askDelete(item.id, item.nama_pekerjaan)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
              <span className="text-xs text-gray-500">
                Menampilkan {startIndex + 1} sampai {Math.min(startIndex + itemsPerPage, filteredRenovations.length)} dari {filteredRenovations.length} data
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  &lt; Prev
                </button>
                {getVisiblePages().map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${currentPage === page
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                      }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Next &gt;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal (Multi-column Premium Layout) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-gradient-to-b dark:from-[#052819] dark:via-[#073622] dark:to-[#03140d] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
            
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#0d5c3a] via-[#156e49] to-[#279969] text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/15 rounded-xl border border-white/20">
                  <Hammer className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg leading-tight text-white">
                    {editingId ? "Edit Proyek Renovasi" : "Tambah Proyek Renovasi Baru"}
                  </h3>
                  <p className="text-xs text-emerald-100/90 mt-0.5">
                    Kelola data memo, progress fisik, nilai anggaran, dan pelaksana proyek renovasi.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                aria-label="Tutup modal"
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white/80 hover:text-white disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 overflow-y-auto flex-1 custom-scrollbar gap-6 flex flex-col">

                {/* Section 1: Informasi Memo & Pekerjaan */}
                <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 bg-gray-50/30 dark:bg-[#14261c] shadow-xs">
                  <h4 className="text-xs font-bold text-[#0d5c3a] dark:text-emerald-400 uppercase tracking-wider mb-4 border-b border-emerald-100 dark:border-white/10 pb-1.5">
                    I. Informasi Memo & Pekerjaan
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <CustomSelectDropdown
                        label="No Memo"
                        labelCls="block text-xs font-bold text-gray-700 dark:text-white mb-1"
                        inputCls="w-full px-3 py-2 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs shadow-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium transition-all"
                        value={formData.no_memo || ""}
                        onChange={(e) => {
                          const val = e.target ? e.target.value : e;
                          setFormData((p) => ({ ...p, no_memo: val }));
                        }}
                        onSelect={(s) => handleSoppSelect(s.value || s.label || s)}
                        options={soppOptions}
                        placeholder="Pilih dari Surat SOPP atau ketik..."
                        disabled={isSaving}
                        allowCustomInput={true}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-white mb-1">Tanggal Memo</label>
                      <input
                        type="date"
                        value={formData.tgl_memo}
                        onChange={(e) => setFormData((p) => ({ ...p, tgl_memo: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs shadow-sm text-gray-900 dark:text-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-white mb-1">Nama Pekerjaan *</label>
                      <input
                        required
                        type="text"
                        value={formData.nama_pekerjaan}
                        onChange={(e) => setFormData((p) => ({ ...p, nama_pekerjaan: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs shadow-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                        placeholder="Nama pekerjaan/proyek..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-white mb-1">
                        Nilai Pembayaran (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={formData.nilai_pembayaran}
                          onChange={(e) => handleNilaiPembayaranChange(e.target.value)}
                          disabled={isSaving}
                          className="w-full px-3 py-2 pr-7 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs shadow-sm text-gray-900 dark:text-white transition-all"
                          placeholder="Masukkan persentase (contoh: 95)"
                        />
                        <span className="absolute right-3 top-2 text-xs text-gray-400 dark:text-gray-500 select-none">%</span>
                      </div>
                    </div>
                    <div>
                      <CustomSelectDropdown
                        label="Nama Outlet"
                        labelCls="block text-xs font-bold text-gray-700 dark:text-white mb-1"
                        inputCls="w-full px-3 py-2 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs shadow-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium transition-all"
                        value={formData.nama_outlet || ""}
                        onChange={(e) => handleOutletChange(e.target ? e.target.value : e)}
                        onSelect={(o) => handleOutletChange(o.nama || o.value || o)}
                        options={outletOptions}
                        placeholder="Pilih dari Master Outlet atau ketik..."
                        disabled={isSaving}
                        allowCustomInput={true}
                      />
                    </div>
                    <div>
                      <CustomSelectDropdown
                        label="Cabang"
                        labelCls="block text-xs font-bold text-gray-700 dark:text-white mb-1"
                        inputCls="w-full px-3 py-2 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs shadow-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium transition-all"
                        value={formData.cabang || ""}
                        onChange={(e) => handleCabangChange(e.target ? e.target.value : e)}
                        onSelect={(c) => handleCabangChange(c.value || c.nama || c)}
                        options={cabangOptions}
                        placeholder="Pilih atau ketik Cabang..."
                        disabled={isSaving}
                        allowCustomInput={true}
                      />
                    </div>
                    <div>
                      <CustomSelectDropdown
                        label="Status Gedung"
                        labelCls="block text-xs font-bold text-gray-700 dark:text-white mb-1"
                        inputCls="w-full px-3 py-2 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs shadow-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium transition-all"
                        value={formData.status_gedung || ""}
                        onChange={(e) => setFormData((p) => ({ ...p, status_gedung: e.target ? e.target.value : e }))}
                        onSelect={(s) => setFormData((p) => ({ ...p, status_gedung: s.value || s }))}
                        disabled={isSaving}
                        options={[
                          { label: "Sewa", value: "Sewa" },
                          { label: "Milik Sendiri", value: "Milik Sendiri" }
                        ]}
                        placeholder="Pilih Status Gedung..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-white mb-1">No Rekening</label>
                      <input
                        type="text"
                        value={formData.norek || ""}
                        onChange={(e) => setFormData((p) => ({ ...p, norek: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs shadow-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                        placeholder="Nomor rekening pelaksana..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-white mb-1">Bank</label>
                      <input
                        type="text"
                        value={formData.bank || ""}
                        onChange={(e) => setFormData((p) => ({ ...p, bank: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs shadow-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                        placeholder="Contoh: BRI, Mandiri..."
                      />
                    </div>
                    <div>
                      <CustomSelectDropdown
                        label="Pelaksana Pekerjaan"
                        labelCls="block text-xs font-bold text-gray-700 dark:text-white mb-1"
                        inputCls="w-full px-3 py-2 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs shadow-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium transition-all"
                        value={formData.pelaksana_pekerjaan || ""}
                        onChange={(e) => handlePelaksanaChange(e.target ? e.target.value : e)}
                        onSelect={(v) => handlePelaksanaChange(v.nama || v.value || v)}
                        options={vendorOptions}
                        placeholder="Pilih dari Master Vendor atau ketik..."
                        disabled={isSaving}
                        allowCustomInput={true}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Kontrak & SPK */}
                <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 bg-gray-50/30 dark:bg-[#14261c] shadow-xs">
                  <h4 className="text-xs font-bold text-[#0d5c3a] dark:text-emerald-400 uppercase tracking-wider mb-4 border-b border-emerald-100 dark:border-white/10 pb-1.5">
                    II. Kontrak & SPK
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <CustomSelectDropdown
                        label="Nomor SPK"
                        labelCls="block text-xs font-bold text-gray-700 dark:text-white mb-1"
                        inputCls="w-full px-3 py-2 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs shadow-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium transition-all"
                        value={formData.no_spk || ""}
                        onChange={(e) => {
                          const val = e.target ? e.target.value : e;
                          setFormData((p) => ({ ...p, no_spk: val }));
                        }}
                        onSelect={(s) => handleSpkSelect(s.value || s.label || s)}
                        options={spkOptions}
                        placeholder="Pilih dari Surat SPK atau ketik..."
                        disabled={isSaving}
                        allowCustomInput={true}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-white mb-1">Tanggal SPK</label>
                      <input
                        type="date"
                        value={formData.tgl_spk}
                        onChange={(e) => setFormData((p) => ({ ...p, tgl_spk: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs shadow-sm text-gray-900 dark:text-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-white mb-1">Nilai SPK Pelaksanaan</label>
                      <input
                        type="text"
                        value={getRupiahValue("nilai_spk_pelaksanaan")}
                        onChange={(e) => handleRupiahChange("nilai_spk_pelaksanaan", e.target.value)}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs shadow-sm text-gray-900 dark:text-white transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-white mb-1">Nilai Addendum SPK</label>
                      <input
                        type="text"
                        value={getRupiahValue("nilai_addendum_spk")}
                        onChange={(e) => handleRupiahChange("nilai_addendum_spk", e.target.value)}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs shadow-sm text-gray-900 dark:text-white transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <CustomSelectDropdown
                        label="Kualifikasi Usaha & Pajak PPh"
                        labelCls="block text-xs font-bold text-gray-700 dark:text-white mb-1"
                        inputCls="w-full px-3 py-2 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs shadow-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium transition-all"
                        value={
                          String(formData.pajak_pph) === "1.75" || String(formData.pajak_pph) === "1,75"
                            ? "Kecil"
                            : String(formData.pajak_pph) === "2.65" || String(formData.pajak_pph) === "2,65" || !formData.pajak_pph
                            ? "Menengah/Besar"
                            : "Custom"
                        }
                        onChange={(e) => {
                          const sel = typeof e === "string" ? e : e.target ? e.target.value : e;
                          if (sel === "Kecil") {
                            handlePajakPphChange("1,75");
                          } else if (sel === "Menengah/Besar") {
                            handlePajakPphChange("2,65");
                          }
                        }}
                        disabled={isSaving}
                        options={[
                          { label: "Menengah/Besar (2,65%)", value: "Menengah/Besar" },
                          { label: "Kecil (1,75%)", value: "Kecil" },
                          { label: "Custom Rate / Manual", value: "Custom" }
                        ]}
                        placeholder="Pilih Kualifikasi Usaha..."
                      />
                      <div className="relative mt-1.5">
                        <input
                          type="text"
                          value={formData.pajak_pph !== null && formData.pajak_pph !== undefined ? String(formData.pajak_pph).replace(".", ",") : "2,65"}
                          onChange={(e) => {
                            let val = e.target.value;
                            let cleaned = val.replace(/[^0-9.,]/g, "");
                            const firstSep = cleaned.search(/[.,]/);
                            if (firstSep !== -1) {
                              const before = cleaned.slice(0, firstSep);
                              const after = cleaned.slice(firstSep + 1).replace(/[.,]/g, "");
                              cleaned = before + "," + after;
                            }
                            handlePajakPphChange(cleaned);
                          }}
                          disabled={isSaving}
                          className="w-full px-3 py-1.5 pr-7 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs shadow-sm font-semibold text-gray-900 dark:text-white transition-all"
                          placeholder="2,65"
                        />
                        <span className="absolute right-3 top-1.5 text-xs text-gray-400 dark:text-gray-500 select-none">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-white mb-1">Tanggal Tagihan</label>
                      <input
                        type="date"
                        value={formData.tgl_tagihan}
                        onChange={(e) => setFormData((p) => ({ ...p, tgl_tagihan: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs shadow-sm text-gray-900 dark:text-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-white mb-1">Tanggal BAP & BAST</label>
                      <input
                        type="date"
                        value={formData.tgl_bap_bast}
                        onChange={(e) => setFormData((p) => ({ ...p, tgl_bap_bast: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs shadow-sm text-gray-900 dark:text-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Rincian Tagihan */}
                <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 bg-gray-50/30 dark:bg-[#14261c] shadow-xs">
                  <h4 className="text-xs font-bold text-[#0d5c3a] dark:text-emerald-400 uppercase tracking-wider mb-4 border-b border-emerald-100 dark:border-white/10 pb-1.5">
                    III. Rincian Tagihan
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 dark:text-white mb-1">Nilai Tagihan</label>
                      <input
                        type="text"
                        value={getRupiahValue("tagihan_nilai")}
                        onChange={(e) => handleRupiahChange("tagihan_nilai", e.target.value)}
                        disabled={isSaving}
                        className="w-full px-2 py-1.5 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs text-gray-900 dark:text-white transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 dark:text-white mb-1">DPP</label>
                      <input
                        type="text"
                        value={getRupiahValue("tagihan_dpp")}
                        onChange={(e) => handleRupiahChange("tagihan_dpp", e.target.value)}
                        disabled={isSaving}
                        className="w-full px-2 py-1.5 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs text-gray-900 dark:text-white transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 dark:text-white mb-1">PPN</label>
                      <input
                        type="text"
                        value={getRupiahValue("tagihan_ppn")}
                        onChange={(e) => handleRupiahChange("tagihan_ppn", e.target.value)}
                        disabled={isSaving}
                        className="w-full px-2 py-1.5 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs text-gray-900 dark:text-white transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 dark:text-white mb-1">PPH</label>
                      <input
                        type="text"
                        value={getRupiahValue("tagihan_pph")}
                        onChange={(e) => handleRupiahChange("tagihan_pph", e.target.value)}
                        disabled={isSaving}
                        className="w-full px-2 py-1.5 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs text-gray-900 dark:text-white transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 dark:text-white mb-1">Retensi</label>
                      <input
                        type="text"
                        value={getRupiahValue("tagihan_retensi")}
                        onChange={(e) => handleRupiahChange("tagihan_retensi", e.target.value)}
                        disabled={isSaving}
                        className="w-full px-2 py-1.5 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs text-gray-900 dark:text-white transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 dark:text-white mb-1">Transfer</label>
                      <input
                        type="text"
                        value={getRupiahValue("tagihan_transfer")}
                        onChange={(e) => handleRupiahChange("tagihan_transfer", e.target.value)}
                        disabled={isSaving}
                        className="w-full px-2 py-1.5 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Rincian Retensi 5% */}
                <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 bg-gray-50/30 dark:bg-[#14261c] shadow-xs">
                  <h4 className="text-xs font-bold text-[#0d5c3a] dark:text-emerald-400 uppercase tracking-wider mb-4 border-b border-emerald-100 dark:border-white/10 pb-1.5">
                    IV. Rincian Retensi 5%
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 dark:text-white mb-1">Retensi 5%</label>
                      <input
                        type="text"
                        value={getRupiahValue("retensi_nilai")}
                        onChange={(e) => handleRupiahChange("retensi_nilai", e.target.value)}
                        disabled={isSaving}
                        className="w-full px-2 py-1.5 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs text-gray-900 dark:text-white transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 dark:text-white mb-1">Transfer</label>
                      <input
                        type="text"
                        value={getRupiahValue("retensi_transfer")}
                        onChange={(e) => handleRupiahChange("retensi_transfer", e.target.value)}
                        disabled={isSaving}
                        className="w-full px-2 py-1.5 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-[#03140d] border-t border-gray-100 dark:border-white/10 flex justify-end items-center gap-3 shrink-0 rounded-b-2xl sm:rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingId ? "Simpan Perubahan" : "Simpan Proyek"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmDeleteModal
        show={deleteConfirm.show}
        name={deleteConfirm.name}
        isSaving={isSaving}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: null, name: "" })}
      />

      {/* Toast Notif */}
      <ToastNotif
        show={notif.show}
        message={notif.message}
        type={notif.type}
        onClose={() => {
          setNotif({ show: false, message: "", type: "", onOk: null });
          if (notif.onOk) notif.onOk();
        }}
      />
    </>
  );
}