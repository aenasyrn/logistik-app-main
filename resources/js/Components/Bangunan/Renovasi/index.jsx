// resources/js/Components/Bangunan/Renovasi/index.jsx
"use client";

import React, { useState, useRef } from "react";
import { Hammer, Search, Plus, FileSpreadsheet, Edit, Trash2, X, Loader2, Key, Upload } from "lucide-react";
import axios from "axios";
import { router } from "@inertiajs/react";
import * as XLSX from "xlsx";
import Papa from "papaparse";

import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";
import ToastNotif from "../../Modal/ToastNotif";
import { importRenovationCSV, downloadRenovationTemplate } from "../../../services/renovationService";

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
  return `Rp ${rounded.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const formatDesimal = (val) => {
  if (val === null || val === undefined || val === "" || Number(val) === 0) return "—";
  return Number(val).toLocaleString("id-ID");
};

// Nilai disimpan di database sebagai desimal (contoh: 0.95 = 95%)
const formatPersentase = (nilai) => {
  if (nilai === null || nilai === undefined || nilai === "" || Number(nilai) === 0) return "—";
  const num = Number(nilai) * 100;
  // Hindari angka desimal panjang akibat floating point (contoh: 94.99999999%)
  const rounded = Math.round(num * 100) / 100;
  return `${rounded.toLocaleString("id-ID")}%`;
};

export default function Renovasi({ userRole, renovations = [], renovationFilter = "", setRenovationFilter }) {
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
    no_memo: "",
    tgl_memo: "",
    nama_pekerjaan: "",
    nilai_pembayaran: "",
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
    pajak_pph: "",
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
  const [notif, setNotif] = useState({ show: false, message: "", type: "success" });

  const showNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
  };

  const handleRupiahChange = (field, val) => {
    const rawValue = val.replace(/[^0-9]/g, "");
    setFormData((p) => ({ ...p, [field]: rawValue }));
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
      no_memo: "",
      tgl_memo: "",
      nama_pekerjaan: "",
      nilai_pembayaran: "",
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
      pajak_pph: "",
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
      pajak_pph: item.pajak_pph || "",
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

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      no_memo: formData.no_memo,
      tgl_memo: formData.tgl_memo || null,
      nama_pekerjaan: formData.nama_pekerjaan,
      // Konversi dari skala 0-100 (input form) ke desimal (disimpan ke database)
      nilai_pembayaran: Number(formData.nilai_pembayaran) / 100 || 0,
      nama_outlet: formData.nama_outlet,
      cabang: formData.cabang,
      norek: formData.norek,
      bank: formData.bank,
      pelaksana_pekerjaan: formData.pelaksana_pekerjaan,
      tgl_tagihan: formData.tgl_tagihan || null,
      nilai_spk_pelaksanaan: Number(formData.nilai_spk_pelaksanaan) || 0,
      nilai_addendum_spk: Number(formData.nilai_addendum_spk) || 0,
      tgl_spk: formData.tgl_spk || null,
      no_spk: formData.no_spk,
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

      status_gedung: formData.status_gedung,
    };

    if (editingId) {
      router.put(`/building-renovations/${editingId}`, payload, {
        onSuccess: () => {
          showNotif("Data renovasi berhasil diperbarui!");
          setIsModalOpen(false);
        },
        onError: (err) => {
          console.error(err);
          showNotif("Gagal menyimpan data renovasi.", "error");
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
          console.error(err);
          showNotif("Gagal menyimpan data renovasi.", "error");
        },
        onFinish: () => {
          setIsSaving(false);
        }
      });
    }
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
      "Retensi 5% - DPP": item.retensi_dpp ? Number(item.retensi_dpp) : 0,
      "Retensi 5% - PPN": item.retensi_ppn ? Number(item.retensi_ppn) : 0,
      "Retensi 5% - PPh": item.retensi_pph ? Number(item.retensi_pph) : 0,
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsSaving(true);
    showNotif("Sedang memproses dan mengunggah CSV...");
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async ({ data }) => {
        try {
          const total = await importRenovationCSV("logistikku_app_01", data);
          showNotif(`Sukses! ${total} data renovasi berhasil di-import.`);
        } catch (err) {
          console.error(err);
          showNotif("Gagal import! Pastikan kolom header persis seperti template.", "error");
        } finally {
          setIsSaving(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
      error: (err) => {
        console.error(err);
        showNotif("Gagal membaca file CSV.", "error");
        setIsSaving(false);
      },
    });
  };


  return (
    <>
      <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300 relative print:hidden">

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
              <Hammer className="w-6 h-6 text-orange-500" /> Renovasi Gedung
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
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-colors text-sm"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>
            {userRole === "admin" && (
              <>
                <button
                  type="button"
                  onClick={downloadRenovationTemplate}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-colors text-sm"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Template CSV
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-colors text-sm disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Import CSV
                </button>
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  aria-label="Upload file CSV data renovasi"
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
                {userRole === "admin" && (
                  <button
                    type="button"
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold shadow-sm transition-colors text-xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Renovasi
                  </button>
                )}
                <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-xl text-xs font-semibold shrink-0">
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
          <div className={`overflow-x-auto custom-scrollbar ${itemsPerPage > 20 ? "max-h-[60vh] overflow-y-auto" : ""}`}>
            <table className="w-full text-left border-collapse min-w-[3550px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-blue-900 text-slate-100 text-[11px] font-bold uppercase tracking-wider text-center">
                  <th className="py-2.5 px-3 w-12 text-center align-middle border border-blue-800 bg-blue-900" rowSpan={2}>No</th>
                  <th className="py-2.5 px-3 text-center align-middle border border-blue-800 bg-blue-900" rowSpan={2}>No Memo</th>
                  <th className="py-2.5 px-3 text-center align-middle border border-blue-800 bg-blue-900" rowSpan={2}>Tanggal Memo</th>
                  <th className="py-2.5 px-3 text-center align-middle border border-blue-800 bg-blue-900" rowSpan={2}>Nama Pekerjaan</th>
                  <th className="py-2.5 px-3 text-center align-middle border border-blue-800 bg-blue-900" rowSpan={2}>Nilai Pembayaran</th>
                  <th className="py-2.5 px-3 text-center align-middle border border-blue-800 bg-blue-900" rowSpan={2}>Nama Outlet</th>
                  <th className="py-2.5 px-3 text-center align-middle border border-blue-800 bg-blue-900" rowSpan={2}>Cabang</th>
                  <th className="py-2.5 px-3 text-center align-middle border border-blue-800 bg-blue-900" rowSpan={2}>Status Gedung</th>
                  <th className="py-2.5 px-3 text-center align-middle border border-blue-800 bg-blue-900" rowSpan={2}>No Rekening</th>
                  <th className="py-2.5 px-3 text-center align-middle border border-blue-800 bg-blue-900" rowSpan={2}>Bank</th>
                  <th className="py-2.5 px-3 text-center align-middle border border-blue-800 bg-blue-900" rowSpan={2}>Pelaksana Pekerjaan</th>
                  <th className="py-2.5 px-3 text-center align-middle border border-blue-800 bg-blue-900" rowSpan={2}>Tanggal Tagihan</th>
                  <th className="py-2.5 px-3 text-center align-middle border border-blue-800 bg-blue-900" rowSpan={2}>Nilai SPK Pelaksanaan</th>
                  <th className="py-2.5 px-3 text-center align-middle border border-blue-800 bg-blue-900" rowSpan={2}>Nilai Addendum SPK</th>
                  <th className="py-2.5 px-3 text-center align-middle border border-blue-800 bg-blue-900" rowSpan={2}>Tanggal SPK</th>
                  <th className="py-2.5 px-3 text-center align-middle border border-blue-800 bg-blue-900" rowSpan={2}>Nomor SPK</th>
                  <th className="py-2.5 px-3 text-center align-middle border border-blue-800 bg-blue-900" rowSpan={2}>Pajak PPh</th>
                  <th className="py-2.5 px-3 text-center align-middle border border-blue-800 bg-blue-900" rowSpan={2}>Tanggal BAP & BAST</th>
                  <th className="py-2 px-3 text-center align-middle border border-blue-800 bg-blue-900 font-bold" colSpan={6}>Nilai Tagihan</th>
                  <th className="py-2 px-3 text-center align-middle border border-blue-800 bg-blue-900 font-bold" colSpan={5}>Retensi 5%</th>
                  {userRole === "admin" && <th className="py-2.5 px-3 text-center align-middle border border-blue-800 bg-blue-900" rowSpan={2}>Aksi</th>}
                </tr>
                <tr className="bg-blue-900 text-slate-100 text-[11px] font-bold uppercase tracking-wider">
                  {/* Nilai Tagihan sub-headers */}
                  <th className="py-2 px-2 text-center border border-blue-800 bg-blue-900">Nilai Tagihan</th>
                  <th className="py-2 px-2 text-center border border-blue-800 bg-blue-900">DPP</th>
                  <th className="py-2 px-2 text-center border border-blue-800 bg-blue-900">PPN</th>
                  <th className="py-2 px-2 text-center border border-blue-800 bg-blue-900">PPH</th>
                  <th className="py-2 px-2 text-center border border-blue-800 bg-blue-900">Retensi</th>
                  <th className="py-2 px-2 text-center border border-blue-800 bg-blue-900">Transfer</th>
                  {/* Retensi 5% sub-headers */}
                  <th className="py-2 px-2 text-center border border-blue-800 bg-blue-900">Retensi 5%</th>
                  <th className="py-2 px-2 text-center border border-blue-800 bg-blue-900">DPP</th>
                  <th className="py-2 px-2 text-center border border-blue-800 bg-blue-900">PPN Retensi 5%</th>
                  <th className="py-2 px-2 text-center border border-blue-800 bg-blue-900">PPH Retensi 5%</th>
                  <th className="py-2 px-2 text-center border border-blue-800 bg-blue-900">Transfer</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-800 bg-white">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="31" className="p-4 text-center text-gray-400 border border-slate-200">
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
                      <td className={getCellClass(item, "font-semibold text-gray-900")}>{item.no_memo || "-"}</td>
                      <td className={getCellClass(item, "text-center")}>{formatDate(item.tgl_memo)}</td>
                      <td className={getCellClass(item, "font-semibold text-gray-900")}>{item.nama_pekerjaan}</td>
                      <td className={getCellClass(item, "font-medium text-gray-800 text-center")}>{formatPersentase(item.nilai_pembayaran)}</td>
                      <td className={getCellClass(item)}>{item.nama_outlet || "-"}</td>
                      <td className={getCellClass(item)}>{item.cabang || "-"}</td>
                      <td className={getCellClass(item, "font-semibold")}>{item.status_gedung || "-"}</td>
                      <td className={getCellClass(item, "font-mono text-gray-600")}>{item.norek || "-"}</td>
                      <td className={getCellClass(item)}>{item.bank || "-"}</td>
                      <td className={getCellClass(item)}>{item.pelaksana_pekerjaan || "-"}</td>
                      <td className={getCellClass(item, "text-center")}>{formatDate(item.tgl_tagihan)}</td>
                      <td className={getCellClass(item, "font-medium text-gray-800")}>{formatBiaya(item.nilai_spk_pelaksanaan)}</td>
                      <td className={getCellClass(item, "font-medium text-gray-800")}>{formatBiaya(item.nilai_addendum_spk)}</td>
                      <td className={getCellClass(item, "text-center")}>{formatDate(item.tgl_spk)}</td>
                      <td className={getCellClass(item)}>{item.no_spk || "-"}</td>
                      <td className={getCellClass(item, "font-medium text-gray-800 text-center")}>{formatDesimal(item.pajak_pph)}</td>
                      <td className={getCellClass(item, "text-center")}>{formatDate(item.tgl_bap_bast)}</td>

                      {/* Subbab Nilai Tagihan columns */}
                      <td className={getCellClass(item, "text-center font-semibold bg-gray-50/20")}>{formatBiaya(item.tagihan_nilai)}</td>
                      <td className={getCellClass(item, "text-center")}>{formatBiaya(item.tagihan_dpp)}</td>
                      <td className={getCellClass(item, "text-center")}>{formatBiaya(item.tagihan_ppn)}</td>
                      <td className={getCellClass(item, "text-center")}>{formatBiaya(item.tagihan_pph)}</td>
                      <td className={getCellClass(item, "text-center")}>{formatBiaya(item.tagihan_retensi)}</td>
                      <td className={getCellClass(item, "text-center font-bold text-emerald-600 bg-emerald-50/10")}>{formatBiaya(item.tagihan_transfer)}</td>

                      {/* Subbab Retensi 5% columns */}
                      <td className={getCellClass(item, "text-center font-semibold bg-gray-50/20")}>{formatBiaya(item.retensi_nilai)}</td>
                      <td className={getCellClass(item, "text-center")}>{formatBiaya(item.retensi_dpp)}</td>
                      <td className={getCellClass(item, "text-center")}>{formatBiaya(item.retensi_ppn)}</td>
                      <td className={getCellClass(item, "text-center")}>{formatBiaya(item.retensi_pph)}</td>
                      <td className={getCellClass(item, "text-center font-bold text-emerald-600 bg-emerald-50/10")}>{formatBiaya(item.retensi_transfer)}</td>

                      {userRole === "admin" && (
                        <td className={getCellClass(item, "text-right")} onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-orange-50 p-2 rounded-xl text-orange-600">
                  <Hammer className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-gray-800">
                  {editingId ? "Edit Proyek Renovasi" : "Tambah Proyek Renovasi Baru"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 overflow-y-auto flex-1 custom-scrollbar gap-6 flex flex-col">

                {/* Section 1: Informasi Memo & Pekerjaan */}
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/30">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-1.5">I. Informasi Memo & Pekerjaan</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">No Memo</label>
                      <input
                        type="text"
                        value={formData.no_memo}
                        onChange={(e) => setFormData((p) => ({ ...p, no_memo: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                        placeholder="Contoh: MEMO/X/2026..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Memo</label>
                      <input
                        type="date"
                        value={formData.tgl_memo}
                        onChange={(e) => setFormData((p) => ({ ...p, tgl_memo: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Pekerjaan *</label>
                      <input
                        required
                        type="text"
                        value={formData.nama_pekerjaan}
                        onChange={(e) => setFormData((p) => ({ ...p, nama_pekerjaan: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                        placeholder="Nama pekerjaan/proyek..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Nilai Pembayaran (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={formData.nilai_pembayaran}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              nilai_pembayaran: e.target.value,
                            }))
                          }
                          disabled={isSaving}
                          className="w-full px-3 py-2 pr-7 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                          placeholder="Masukkan persentase (contoh: 95)"
                        />
                        <span className="absolute right-3 top-2 text-xs text-gray-400 select-none">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Outlet</label>
                      <input
                        type="text"
                        value={formData.nama_outlet}
                        onChange={(e) => setFormData((p) => ({ ...p, nama_outlet: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                        placeholder="Nama Kantor/Unit..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Cabang</label>
                      <input
                        type="text"
                        value={formData.cabang}
                        onChange={(e) => setFormData((p) => ({ ...p, cabang: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                        placeholder="Cabang..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Status Gedung</label>
                      <select
                        value={formData.status_gedung}
                        onChange={(e) => setFormData((p) => ({ ...p, status_gedung: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                      >
                        <option value="">Pilih Status Gedung...</option>
                        <option value="Sewa">Sewa</option>
                        <option value="Milik Sendiri">Milik Sendiri</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">No Rekening</label>
                      <input
                        type="text"
                        value={formData.norek}
                        onChange={(e) => setFormData((p) => ({ ...p, norek: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                        placeholder="Nomor rekening pelaksana..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Bank</label>
                      <input
                        type="text"
                        value={formData.bank}
                        onChange={(e) => setFormData((p) => ({ ...p, bank: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                        placeholder="Contoh: BRI, Mandiri..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Pelaksana Pekerjaan</label>
                      <input
                        type="text"
                        value={formData.pelaksana_pekerjaan}
                        onChange={(e) => setFormData((p) => ({ ...p, pelaksana_pekerjaan: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                        placeholder="Nama Vendor / Pelaksana..."
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Kontrak & SPK */}
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/30">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-1.5">II. Kontrak & SPK</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Nomor SPK</label>
                      <input
                        type="text"
                        value={formData.no_spk}
                        onChange={(e) => setFormData((p) => ({ ...p, no_spk: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                        placeholder="Nomor SPK..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal SPK</label>
                      <input
                        type="date"
                        value={formData.tgl_spk}
                        onChange={(e) => setFormData((p) => ({ ...p, tgl_spk: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Nilai SPK Pelaksanaan</label>
                      <input
                        type="text"
                        value={getRupiahValue("nilai_spk_pelaksanaan")}
                        onChange={(e) => handleRupiahChange("nilai_spk_pelaksanaan", e.target.value)}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Nilai Addendum SPK</label>
                      <input
                        type="text"
                        value={getRupiahValue("nilai_addendum_spk")}
                        onChange={(e) => handleRupiahChange("nilai_addendum_spk", e.target.value)}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Pajak PPh</label>
                      <input
                        type="text"
                        value={formData.pajak_pph !== null && formData.pajak_pph !== undefined ? String(formData.pajak_pph).replace(".", ",") : ""}
                        onChange={(e) => {
                          let val = e.target.value;
                          // Allow only numbers, dot, or comma
                          let cleaned = val.replace(/[^0-9.,]/g, "");
                          // Ensure at most one decimal separator (comma or dot)
                          const firstSep = cleaned.search(/[.,]/);
                          if (firstSep !== -1) {
                            const before = cleaned.slice(0, firstSep);
                            const after = cleaned.slice(firstSep + 1).replace(/[.,]/g, "");
                            cleaned = before + "," + after;
                          }
                          setFormData((p) => ({ ...p, pajak_pph: cleaned }));
                        }}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Tagihan</label>
                      <input
                        type="date"
                        value={formData.tgl_tagihan}
                        onChange={(e) => setFormData((p) => ({ ...p, tgl_tagihan: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal BAP & BAST</label>
                      <input
                        type="date"
                        value={formData.tgl_bap_bast}
                        onChange={(e) => setFormData((p) => ({ ...p, tgl_bap_bast: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Rincian Tagihan */}
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/30">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-1.5">III. Rincian Tagihan</h4>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1">Nilai Tagihan</label>
                      <input
                        type="text"
                        value={getRupiahValue("tagihan_nilai")}
                        onChange={(e) => handleRupiahChange("tagihan_nilai", e.target.value)}
                        disabled={isSaving}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1">DPP</label>
                      <input
                        type="text"
                        value={getRupiahValue("tagihan_dpp")}
                        onChange={(e) => handleRupiahChange("tagihan_dpp", e.target.value)}
                        disabled={isSaving}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1">PPN</label>
                      <input
                        type="text"
                        value={getRupiahValue("tagihan_ppn")}
                        onChange={(e) => handleRupiahChange("tagihan_ppn", e.target.value)}
                        disabled={isSaving}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1">PPH</label>
                      <input
                        type="text"
                        value={getRupiahValue("tagihan_pph")}
                        onChange={(e) => handleRupiahChange("tagihan_pph", e.target.value)}
                        disabled={isSaving}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1">Retensi</label>
                      <input
                        type="text"
                        value={getRupiahValue("tagihan_retensi")}
                        onChange={(e) => handleRupiahChange("tagihan_retensi", e.target.value)}
                        disabled={isSaving}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1">Transfer</label>
                      <input
                        type="text"
                        value={getRupiahValue("tagihan_transfer")}
                        onChange={(e) => handleRupiahChange("tagihan_transfer", e.target.value)}
                        disabled={isSaving}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold text-emerald-600"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Rincian Retensi 5% */}
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/30">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-1.5">IV. Rincian Retensi 5%</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1">Retensi 5%</label>
                      <input
                        type="text"
                        value={getRupiahValue("retensi_nilai")}
                        onChange={(e) => handleRupiahChange("retensi_nilai", e.target.value)}
                        disabled={isSaving}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1">DPP</label>
                      <input
                        type="text"
                        value={getRupiahValue("retensi_dpp")}
                        onChange={(e) => handleRupiahChange("retensi_dpp", e.target.value)}
                        disabled={isSaving}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1">PPN Retensi 5%</label>
                      <input
                        type="text"
                        value={getRupiahValue("retensi_ppn")}
                        onChange={(e) => handleRupiahChange("retensi_ppn", e.target.value)}
                        disabled={isSaving}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1">PPH Retensi 5%</label>
                      <input
                        type="text"
                        value={getRupiahValue("retensi_pph")}
                        onChange={(e) => handleRupiahChange("retensi_pph", e.target.value)}
                        disabled={isSaving}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1">Transfer</label>
                      <input
                        type="text"
                        value={getRupiahValue("retensi_transfer")}
                        onChange={(e) => handleRupiahChange("retensi_transfer", e.target.value)}
                        disabled={isSaving}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold text-emerald-600"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>



              </div>
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-gray-600 dark:text-[#a4b4a9] hover:bg-gray-100 dark:hover:bg-[#243e2e] dark:hover:text-white rounded-xl font-medium text-sm transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Simpan Proyek
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
        onClose={() => setNotif({ show: false, message: "", type: "" })}
      />
    </>
  );
}