// resources/js/Components/Bangunan/Sewa/index.jsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Key, Search, Plus, FileSpreadsheet, X, Upload, Loader2 } from "lucide-react";
import axios from "axios";
import { router } from "@inertiajs/react";
import * as XLSX from "xlsx";
import Papa from "papaparse";

import SewaTable, { hitungSisaWaktu, getStatusInfo } from "./SewaTable";
import SewaModal from "./SewaModal";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";
import ToastNotif from "../../Modal/ToastNotif";
import { importSewaCSV, downloadSewaTemplate } from "../../../services/sewaService";

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

export default function SewaIndex({ userRole, sewas = [], outlets = [], sewaFilter = "", setSewaFilter }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [filterExpiry, setFilterExpiry] = useState("all");
  const [filterTypeOutlet, setFilterTypeOutlet] = useState("all");
  const [filterTypeBangunan, setFilterTypeBangunan] = useState("all");
  const [filterStatusGedung, setFilterStatusGedung] = useState("all");
  const [filterOutletCategory, setFilterOutletCategory] = useState("all");

  useEffect(() => {
    if (sewaFilter === "") {
      setSearchQuery("");
      setFilterExpiry("all");
      setFilterTypeOutlet("all");
      setFilterTypeBangunan("all");
      setFilterStatusGedung("all");
      setFilterOutletCategory("all");
    }
  }, [sewaFilter]);

  useEffect(() => {
    const handleReset = () => {
      setSearchQuery("");
      setFilterExpiry("all");
      setFilterTypeOutlet("all");
      setFilterTypeBangunan("all");
      setFilterStatusGedung("all");
      setFilterOutletCategory("all");
      setCurrentPage(1);
    };
    window.addEventListener("reset-all-filters", handleReset);
    return () => window.removeEventListener("reset-all-filters", handleReset);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [localStatuses, setLocalStatuses] = useState({});

  const [formData, setFormData] = useState({
    outlet_id: "",
    outlet: "",
    idOutlet: "",
    kode_outlet: "",
    nama_outlet: "",
    type_outlet: "",
    type_bangunan: "",
    jenis_sto: "",
    status_gedung: "",
    periode_sewa: "",
    tgl_kontrak_mulai: "",
    tgl_kontrak_berakhir: "",
    harga_sewa: "",
    keterangan: "",
    alamat: "",
    kelurahan: "",
    kecamatan: "",
    kab_kota: "",
    provinsi: "",
    status: "",
  });

  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: "" });
  const [detailData, setDetailData] = useState(null);
  const [notif, setNotif] = useState({ show: false, message: "", type: "success" });

  const showNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
  };

  const handleStatusChange = async (id, newStatus) => {
    const oldStatus = localStatuses[id] !== undefined ? localStatuses[id] : (sewas.find(s => s.id === id)?.status || getStatusInfo(sewas.find(s => s.id === id)));

    // Update UI immediately (optimistic update)
    setLocalStatuses(prev => ({ ...prev, [id]: newStatus }));

    try {
      await axios.put(`/building-sewas/${id}/status`, { status: newStatus });
      router.reload({
        only: ["buildingSewas", "activityLogs"],
        onSuccess: () => {
          setLocalStatuses(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }
      });
    } catch (err) {
      console.error(err);
      showNotif("Gagal mengubah status.", "error");
      // Rollback to old status if server call fails
      setLocalStatuses(prev => ({ ...prev, [id]: oldStatus }));
    }
  };

  const filterTypeOutletOptions = [
    "Rencana Relokasi/Tutup",
    "Include UPC",
    "Induk Cluster",
    "Anggota Cluster",
    "Non Cluster",
    "Mandiri"
  ];

  const filterTypeBangunanOptions = [
    "Stand Alone",
    "Ruko Double",
    "Ruko Single",
    "Mall / Kios",
    "Pasar"
  ];

  // Filter data based on search and selected filters
  const filteredSewas = sewas.filter((item) => {
    // 1. Search Query filter
    const q = searchQuery.toLowerCase();

    // Generate date search strings for tgl_kontrak_mulai and tgl_kontrak_berakhir
    const tglMulai = item.tgl_kontrak_mulai || item.tanggal_kontrak_mulai || item.tanggal_mulai;
    const tglBerakhir = item.tgl_kontrak_berakhir || item.tanggal_kontrak_berakhir || item.tanggal_selesai;

    const datesSearchStrings = [
      ...getDateSearchStrings(tglMulai),
      ...getDateSearchStrings(tglBerakhir)
    ];
    const matchesDates = datesSearchStrings.some(dStr => dStr.includes(q));

    // Calculate dynamic status and remaining time
    const calculatedStatus = getStatusInfo(item);
    const calculatedSisaWaktu = hitungSisaWaktu(tglBerakhir);

    const matchesSearch = !searchQuery || (
      (item.nama_outlet && item.nama_outlet.toLowerCase().includes(q)) ||
      (item.outlet && item.outlet.toLowerCase().includes(q)) ||
      (item.kode_outlet && item.kode_outlet.toLowerCase().includes(q)) ||
      (item.type_outlet && item.type_outlet.toLowerCase().includes(q)) ||
      (item.type_bangunan && item.type_bangunan.toLowerCase().includes(q)) ||
      (item.jenis_sto && item.jenis_sto.toLowerCase().includes(q)) ||
      (item.status_gedung && item.status_gedung.toLowerCase().includes(q)) ||
      (item.status && item.status.toLowerCase().includes(q)) ||
      (calculatedStatus && calculatedStatus.toLowerCase().includes(q)) ||
      (calculatedSisaWaktu && calculatedSisaWaktu.toLowerCase().includes(q)) ||
      matchesDates ||
      (item.periode_sewa && String(item.periode_sewa).toLowerCase().includes(q)) ||
      (item.alamat && item.alamat.toLowerCase().includes(q)) ||
      (item.kelurahan && item.kelurahan.toLowerCase().includes(q)) ||
      (item.kecamatan && item.kecamatan.toLowerCase().includes(q)) ||
      (item.kab_kota && item.kab_kota.toLowerCase().includes(q)) ||
      (item.provinsi && item.provinsi.toLowerCase().includes(q)) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(q))
    );

    if (!matchesSearch) return false;

    // Expiry filter via dashboard "Lihat lainnya"
    if (sewaFilter === "expired") {
      const targetDate = item.tgl_kontrak_berakhir || item.tanggal_kontrak_berakhir;
      if (!targetDate) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiration = new Date(targetDate);
      expiration.setHours(0, 0, 0, 0);
      const diffTime = expiration.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 30 || item.status === "Done" || item.status === "Selesai") return false;
    } else if (sewaFilter === "active") {
      const statusInfo = getStatusInfo(item);
      if (statusInfo !== "Aktif" && statusInfo !== "Hampir Habis") return false;
    } else if (sewaFilter === "6months") {
      const targetDate = item.tgl_kontrak_berakhir || item.tanggal_kontrak_berakhir;
      if (!targetDate) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiration = new Date(targetDate);
      expiration.setHours(0, 0, 0, 0);
      const diffTime = expiration.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 180 || item.status === "Done" || item.status === "Selesai") return false;
    }

    // 2. Expiry filter (mau habis: sisa waktu <= 30 hari)
    if (filterExpiry === "expiring_30") {
      const targetDate = item.tgl_kontrak_berakhir || item.tanggal_kontrak_berakhir;
      if (!targetDate) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiration = new Date(targetDate);
      expiration.setHours(0, 0, 0, 0);
      const diffTime = expiration.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Expiring soon: remaining days <= 30 and >= 0 (not expired yet)
      if (diffDays > 30 || diffDays < 0) return false;
    }

    // 3. Type Outlet filter
    if (filterTypeOutlet !== "all") {
      if (!item.type_outlet || item.type_outlet.toUpperCase() !== filterTypeOutlet.toUpperCase()) return false;
    }

    // 4. Type Bangunan filter
    if (filterTypeBangunan !== "all") {
      if (!item.type_bangunan || item.type_bangunan.toUpperCase() !== filterTypeBangunan.toUpperCase()) return false;
    }

    // 5. Status Gedung filter
    if (filterStatusGedung !== "all") {
      if (!item.status_gedung || item.status_gedung.toUpperCase() !== filterStatusGedung.toUpperCase()) return false;
    }

    // 6. Outlet Category filter (Gudang Terpadu, CP, UPC, UPS)
    if (filterOutletCategory !== "all") {
      const name = (item.nama_outlet || item.outlet || "").toUpperCase();
      if (filterOutletCategory === "Gudang Terpadu") {
        if (!name.includes("GUDANG TERPADU")) return false;
      } else if (filterOutletCategory === "CP") {
        if (!name.startsWith("CP")) return false;
      } else if (filterOutletCategory === "UPC") {
        if (!name.startsWith("UPC")) return false;
      } else if (filterOutletCategory === "UPS") {
        if (!name.startsWith("UPS")) return false;
      }
    }

    return true;
  });

  // Sort sewas if filter is active
  const sortedSewas = [...filteredSewas].sort((a, b) => {
    if (sewaFilter === "expired" || sewaFilter === "6months" || filterExpiry === "expiring_30") {
      const aDate = a.tgl_kontrak_berakhir || a.tanggal_kontrak_berakhir || a.tanggal_mulai;
      const bDate = b.tgl_kontrak_berakhir || b.tanggal_kontrak_berakhir || b.tanggal_mulai;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return new Date(aDate).getTime() - new Date(bDate).getTime();
    }
    // Default: Sort by id descending
    return b.id - a.id;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedSewas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedSewas.slice(startIndex, startIndex + itemsPerPage);

  const openAdd = () => {
    setEditingId(null);
    setFormData({
      outlet_id: "",
      outlet: "",
      idOutlet: "",
      kode_outlet: "",
      nama_outlet: "",
      type_outlet: "",
      type_bangunan: "",
      jenis_sto: "",
      status_gedung: "",
      periode_sewa: "",
      tgl_kontrak_mulai: "",
      tgl_kontrak_berakhir: "",
      harga_sewa: "",
      keterangan: "",
      alamat: "",
      kelurahan: "",
      kecamatan: "",
      kab_kota: "",
      provinsi: "",
      status: "Aktif",
    });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    const formatDateForInput = (dateStr) => {
      if (!dateStr) return "";
      return dateStr.substring(0, 10);
    };

    const normalizeStatusGedung = (status) => {
      if (!status) return "";
      const s = status.toLowerCase().trim();
      if (s === "sewa") return "Sewa";
      if (s === "milik sendiri") return "Milik Sendiri";
      return status;
    };

    setEditingId(item.id);
    setFormData({
      outlet_id: item.outlet_id || "",
      outlet: item.nama_outlet || item.outlet || "",
      idOutlet: item.outlet_id || "",
      kode_outlet: item.kode_outlet || "",
      nama_outlet: item.nama_outlet || item.outlet || "",
      type_outlet: item.type_outlet || "",
      type_bangunan: item.type_bangunan || "",
      jenis_sto: item.jenis_sto || "",
      status_gedung: normalizeStatusGedung(item.status_gedung),
      periode_sewa: item.periode_sewa || "",
      tgl_kontrak_mulai: formatDateForInput(item.tgl_kontrak_mulai || item.tanggal_kontrak_mulai),
      tgl_kontrak_berakhir: formatDateForInput(item.tgl_kontrak_berakhir || item.tanggal_kontrak_berakhir),
      harga_sewa: item.harga_sewa || "",
      keterangan: item.keterangan || "",
      alamat: item.alamat || "",
      kelurahan: item.kelurahan || "",
      kecamatan: item.kecamatan || "",
      kab_kota: item.kab_kota || item.kabKota || "",
      provinsi: item.provinsi || "",
      status: item.status || getStatusInfo(item) || "Aktif",
    });
    setIsModalOpen(true);
  };

  const askDelete = (id, nama) => {
    setDeleteConfirm({ show: true, id, name: nama });
  };

  const confirmDelete = () => {
    setIsSaving(true);
    router.delete(`/building-sewas/${deleteConfirm.id}`, {
      onSuccess: () => {
        showNotif("Data sewa berhasil dihapus!");
        setDeleteConfirm({ show: false, id: null, name: "" });
      },
      onError: (err) => {
        console.error(err);
        showNotif("Gagal menghapus data sewa.", "error");
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
      outlet_id: formData.idOutlet || null,
      kode_outlet: formData.kode_outlet,
      nama_outlet: formData.nama_outlet || formData.outlet,
      type_outlet: formData.type_outlet,
      type_bangunan: formData.type_bangunan,
      jenis_sto: formData.jenis_sto,
      status_gedung: formData.status_gedung,
      periode_sewa: formData.periode_sewa,
      tgl_kontrak_mulai: formData.tgl_kontrak_mulai || formData.tanggal_kontrak_mulai || formData.tanggal_mulai || "",
      tgl_kontrak_berakhir: formData.tgl_kontrak_berakhir || formData.tanggal_kontrak_berakhir || formData.tanggal_selesai || "",
      harga_sewa: Number(formData.harga_sewa) || 0,
      keterangan: formData.keterangan || formData.deskripsi,
      alamat: formData.alamat,
      kelurahan: formData.kelurahan,
      kecamatan: formData.kecamatan,
      kab_kota: formData.kab_kota,
      provinsi: formData.provinsi,
      status: formData.status,
    };

    if (editingId) {
      router.put(`/building-sewas/${editingId}`, payload, {
        onSuccess: () => {
          showNotif("Data sewa berhasil diperbarui!");
          setIsModalOpen(false);
        },
        onError: (err) => {
          console.error(err);
          showNotif("Gagal memperbarui data sewa.", "error");
        },
        onFinish: () => {
          setIsSaving(false);
        }
      });
    } else {
      router.post("/building-sewas", payload, {
        onSuccess: () => {
          showNotif("Sewa baru berhasil ditambahkan!");
          setIsModalOpen(false);
        },
        onError: (err) => {
          console.error(err);
          showNotif("Gagal menambahkan sewa baru.", "error");
        },
        onFinish: () => {
          setIsSaving(false);
        }
      });
    }
  };

  const exportToExcel = () => {
    const rows = filteredSewas.map((item, idx) => ({
      "No": indexToNo(idx),
      "Kode Outlet": item.kode_outlet || "",
      "Nama Outlet": item.nama_outlet || item.outlet || "",
      "Type Outlet": item.type_outlet || "",
      "Type Bangunan": item.type_bangunan || "",
      "Jenis STO": item.jenis_sto || "",
      "Status Gedung": item.status_gedung || "",
      "Periode Sewa": item.periode_sewa ? (isNaN(item.periode_sewa) ? item.periode_sewa : parseFloat(item.periode_sewa)) : "",
      "Tanggal Kontrak Mulai": item.tgl_kontrak_mulai || item.tanggal_kontrak_mulai || "",
      "Tanggal Kontrak Berakhir": item.tgl_kontrak_berakhir || item.tanggal_kontrak_berakhir || "",
      "Harga Sewa": `Rp ${Number(item.harga_sewa).toLocaleString("id-ID")}`,
      "Keterangan": item.keterangan || "",
      "Alamat": item.alamat || "",
      "Kelurahan": item.kelurahan || "",
      "Kecamatan": item.kecamatan || "",
      "Kab/Kota": item.kab_kota || item.kabKota || "",
      "Provinsi": item.provinsi || "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sewa Bangunan");
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...rows.map((r) => String(r[key]).length)) + 2,
    }));
    ws["!cols"] = colWidths;
    XLSX.writeFile(wb, `Data_Sewa_Bangunan_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const indexToNo = (idx) => idx + 1;

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
          const total = await importSewaCSV("logistikku_app_01", data);
          showNotif(`Sukses! ${total} data sewa berhasil di-import. Memuat ulang...`);
          setTimeout(() => window.location.reload(), 2000);
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
      <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300 relative print:p-0">

        {/* Header (Disembunyikan saat print) */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 print:hidden">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
              <Key className="w-6 h-6 text-emerald-600" /> Sewa Bangunan
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Pantau kontrak, pemilik, biaya, dan masa berakhir sewa bangunan instansi.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={exportToExcel}
              disabled={filteredSewas.length === 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-colors text-sm"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>
            {userRole === "admin" && (
              <>
                <button
                  type="button"
                  onClick={downloadSewaTemplate}
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
                  aria-label="Upload file CSV data sewa"
                />
              </>
            )}
          </div>
        </div>

        {/* PRINT ONLY HEADER */}
        <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold text-center">LAPORAN SEWA BANGUNAN</h1>
          <p className="text-sm text-center text-gray-500 mt-1">
            Dicetak pada tanggal: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Tabel Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
          {/* Search & Filters Toolbar (Disembunyikan saat print) */}
          <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/30 flex flex-col gap-4 print:hidden">
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
              {/* Search Bar, Show Entries & Reset Filter */}
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative w-full sm:w-80">
                  <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Cari data sewa..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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
                {(filterExpiry !== "all" || filterTypeOutlet !== "all" || filterTypeBangunan !== "all" || filterStatusGedung !== "all" || filterOutletCategory !== "all" || searchQuery !== "") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterExpiry("all");
                      setFilterTypeOutlet("all");
                      setFilterTypeBangunan("all");
                      setFilterStatusGedung("all");
                      setFilterOutletCategory("all");
                      setCurrentPage(1);
                    }}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold hover:underline shrink-0"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 self-start lg:self-auto shrink-0">
                {userRole === "admin" && (
                  <button
                    type="button"
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold shadow-sm transition-colors text-xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Sewa
                  </button>
                )}
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-100 shrink-0">
                  Total Kontrak: {filteredSewas.length}
                </div>
              </div>
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Expiry Filter */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Masa Sewa</label>
                <select
                  value={filterExpiry}
                  onChange={(e) => { setFilterExpiry(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                >
                  <option value="all">Semua Masa Sewa</option>
                  <option value="expiring_30">Akan Habis (≤ 30 Hari)</option>
                </select>
              </div>

              {/* Type Outlet Filter */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Type Outlet</label>
                <select
                  value={filterTypeOutlet}
                  onChange={(e) => { setFilterTypeOutlet(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                >
                  <option value="all">Semua Type Outlet</option>
                  {filterTypeOutletOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Type Bangunan Filter */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Type Bangunan</label>
                <select
                  value={filterTypeBangunan}
                  onChange={(e) => { setFilterTypeBangunan(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                >
                  <option value="all">Semua Type Bangunan</option>
                  {filterTypeBangunanOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Status Gedung Filter */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Status Gedung</label>
                <select
                  value={filterStatusGedung}
                  onChange={(e) => { setFilterStatusGedung(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                >
                  <option value="all">Semua Status Gedung</option>
                  <option value="Sewa">Sewa</option>
                  <option value="Milik Sendiri">Milik Sendiri</option>
                </select>
              </div>

              {/* Kategori Outlet Filter */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Kategori Outlet</label>
                <select
                  value={filterOutletCategory}
                  onChange={(e) => { setFilterOutletCategory(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                >
                  <option value="all">Semua Outlet</option>
                  <option value="Gudang Terpadu">Gudang Terpadu</option>
                  <option value="CP">CP</option>
                  <option value="UPC">UPC</option>
                  <option value="UPS">UPS</option>
                </select>
              </div>
            </div>
          </div>

          {sewaFilter === "expired" && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-sm text-red-800 animate-in fade-in duration-300">
              <span className="font-medium">Menampilkan kontrak sewa bangunan yang mendekati masa habis kontrak / expired.</span>
              <button
                onClick={() => setSewaFilter("")}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                Hapus Filter
              </button>
            </div>
          )}

          {sewaFilter === "active" && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between text-sm text-green-800 animate-in fade-in duration-300">
              <span className="font-medium">Menampilkan sewa dengan perjanjian aktif.</span>
              <button
                onClick={() => setSewaFilter("")}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                Hapus Filter
              </button>
            </div>
          )}

          {sewaFilter === "6months" && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-sm text-red-800 animate-in fade-in duration-300">
              <span className="font-medium">Menampilkan sewa dengan masa kontrak berakhir dalam &lt; 6 bulan atau sudah habis.</span>
              <button
                onClick={() => setSewaFilter("")}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                Hapus Filter
              </button>
            </div>
          )}

          {/* Table */}
          <SewaTable
            isLoading={false}
            paginatedData={paginatedData}
            filteredData={filteredSewas}
            userRole={userRole}
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            onEdit={openEdit}
            onDelete={askDelete}
            onDetail={setDetailData}
            localStatuses={localStatuses}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>

      {/* Modal Tambah / Edit */}
      <SewaModal
        isOpen={isModalOpen}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        isSaving={isSaving}
        outletsList={outlets}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

      {/* Modal Detail Sewa */}
      {detailData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Detail Sewa Bangunan</h3>
              <button
                type="button"
                onClick={() => setDetailData(null)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4 text-sm text-gray-700 max-h-[70vh] overflow-y-auto custom-scrollbar">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase">Kode Outlet</span>
                  <span className="font-semibold text-gray-900 font-mono text-base">{detailData.kode_outlet || "-"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase">Nama Outlet / Instansi</span>
                  <span className="font-semibold text-gray-900 text-base">{detailData.nama_outlet || detailData.outlet || "-"}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase">Type Outlet</span>
                  <span className="font-medium text-gray-900">{detailData.type_outlet || "-"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase">Type Bangunan</span>
                  <span className="font-medium text-gray-900">{detailData.type_bangunan || "-"}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase">Jenis STO</span>
                  <span className="font-medium text-gray-900">{detailData.jenis_sto || "-"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase">Status Gedung</span>
                  <span className="font-medium text-gray-900">{detailData.status_gedung || "-"}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase">Periode Sewa</span>
                  <span className="font-semibold text-blue-700">
                    {detailData.periode_sewa ? (isNaN(detailData.periode_sewa) ? detailData.periode_sewa : parseFloat(detailData.periode_sewa)) : "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase">Harga Sewa</span>
                  <span className="font-semibold text-emerald-600">
                    Rp {Number(detailData.harga_sewa).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase">Tanggal Kontrak Mulai</span>
                  <span className="font-medium text-gray-900">
                    {detailData.tgl_kontrak_mulai || detailData.tanggal_kontrak_mulai || detailData.tanggal_mulai ? new Date(detailData.tgl_kontrak_mulai || detailData.tanggal_kontrak_mulai || detailData.tanggal_mulai).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase">Tanggal Kontrak Berakhir</span>
                  <span className="font-medium text-gray-900">
                    {detailData.tgl_kontrak_berakhir || detailData.tanggal_kontrak_berakhir || detailData.tanggal_selesai ? new Date(detailData.tgl_kontrak_berakhir || detailData.tanggal_kontrak_berakhir || detailData.tanggal_selesai).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <span className="block text-xs font-medium text-gray-400 uppercase">Alamat</span>
                <p className="mt-1 text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 break-words whitespace-pre-wrap">
                  {detailData.alamat || "Tidak ada alamat."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase">Kelurahan</span>
                  <span className="font-medium text-gray-900">{detailData.kelurahan || "-"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase">Kecamatan</span>
                  <span className="font-medium text-gray-900">{detailData.kecamatan || "-"}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase">Kab/Kota</span>
                  <span className="font-medium text-gray-900">{detailData.kab_kota || detailData.kabKota || "-"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase">Provinsi</span>
                  <span className="font-medium text-gray-900">{detailData.provinsi || "-"}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <span className="block text-xs font-medium text-gray-400 uppercase">Keterangan / Catatan</span>
                <p className="mt-1 text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 break-words whitespace-pre-wrap">
                  {detailData.keterangan || detailData.deskripsi || "Tidak ada catatan tambahan."}
                </p>
              </div>

            </div>
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailData(null)}
                className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 font-medium text-gray-700 transition-colors text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      <ConfirmDeleteModal
        show={deleteConfirm.show}
        name={deleteConfirm.name}
        isSaving={isSaving}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: null, name: "" })}
      />

      {/* Toast Notifikasi */}
      <ToastNotif
        show={notif.show}
        message={notif.message}
        type={notif.type}
        onClose={() => setNotif({ show: false, message: "", type: "" })}
      />
    </>
  );
}
