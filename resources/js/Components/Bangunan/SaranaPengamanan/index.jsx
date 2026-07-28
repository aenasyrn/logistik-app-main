// resources/js/Components/Bangunan/SaranaPengamanan/index.jsx
"use client";

import React, { useState, useRef } from "react";
import { Shield, Search, Plus, FileSpreadsheet, Edit, Trash2, X, Loader2, FileText, Upload } from "lucide-react";
import axios from "axios";
import { router } from "@inertiajs/react";
import * as XLSX from "xlsx";
import Papa from "papaparse";

import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";
import ToastNotif from "../../Modal/ToastNotif";
import { importSecurityCSV, downloadSecurityTemplate } from "../../../services/securityService";

export default function SaranaPengamanan({ userRole, facilities = [], securityFilter = "", setSecurityFilter }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  React.useEffect(() => {
    if (securityFilter === "") {
      setSearchQuery("");
      setFilterArea("all");
      setFilterCabang("all");
      setFilterStatus("all");
    } else if (securityFilter === "online") {
      setFilterStatus("Online");
      setCurrentPage(1);
    } else if (securityFilter === "offline") {
      setFilterStatus("Offline");
      setCurrentPage(1);
    }
  }, [securityFilter]);

  React.useEffect(() => {
    const handleReset = () => {
      setSearchQuery("");
      setFilterArea("all");
      setFilterCabang("all");
      setFilterStatus("all");
      setCurrentPage(1);
    };
    window.addEventListener("reset-all-filters", handleReset);
    return () => window.removeEventListener("reset-all-filters", handleReset);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Row selection and hover states
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  // Filter States
  const [filterArea, setFilterArea] = useState("all");
  const [filterCabang, setFilterCabang] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [localStatuses, setLocalStatuses] = useState({});

  const [formData, setFormData] = useState({
    no_urut: "",
    kantor_wilayah: "",
    kantor_area: "",
    kantor_cabang: "",
    kode_unit_kerja: "",
    nama_unit_kerja: "",
    status: "Online",
    vendor: "Teknisi CCTV Perorangan",
    jumlah_kamera: "",
    aplikasi: "Mobile APP",
    nama_aplikasi: "",
    keterangan: "",
  });

  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: "" });
  const [notif, setNotif] = useState({ show: false, message: "", type: "success" });

  const showNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
  };

  // Dynamic filter options
  const uniqueAreas = Array.from(new Set(facilities.map((f) => f.kantor_area).filter(Boolean))).sort();
  const uniqueCabangs = Array.from(
    new Set(
      facilities
        .filter((f) => filterArea === "all" || f.kantor_area === filterArea)
        .map((f) => f.kantor_cabang)
        .filter(Boolean)
    )
  ).sort();

  // Filter
  const filteredFacilities = facilities.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      (item.no_urut && String(item.no_urut).toLowerCase().includes(q)) ||
      (item.kantor_wilayah && item.kantor_wilayah.toLowerCase().includes(q)) ||
      (item.kantor_area && item.kantor_area.toLowerCase().includes(q)) ||
      (item.kantor_cabang && item.kantor_cabang.toLowerCase().includes(q)) ||
      (item.kode_unit_kerja && item.kode_unit_kerja.toLowerCase().includes(q)) ||
      (item.nama_unit_kerja && item.nama_unit_kerja.toLowerCase().includes(q)) ||
      (item.status && item.status.toLowerCase().includes(q)) ||
      (item.vendor && item.vendor.toLowerCase().includes(q)) ||
      (item.jumlah_kamera && String(item.jumlah_kamera).includes(q)) ||
      (item.aplikasi && item.aplikasi.toLowerCase().includes(q)) ||
      (item.nama_aplikasi && item.nama_aplikasi.toLowerCase().includes(q)) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(q))
    );

    const matchesArea = filterArea === "all" || item.kantor_area === filterArea;
    const matchesCabang = filterCabang === "all" || item.kantor_cabang === filterCabang;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;

    return matchesSearch && matchesArea && matchesCabang && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredFacilities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredFacilities.slice(startIndex, startIndex + itemsPerPage);

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

  const openAdd = () => {
    setEditingId(null);
    setFormData({
      no_urut: "",
      kantor_wilayah: "",
      kantor_area: "",
      kantor_cabang: "",
      kode_unit_kerja: "",
      nama_unit_kerja: "",
      status: "Online",
      vendor: "Teknisi CCTV Perorangan",
      jumlah_kamera: "",
      aplikasi: "Mobile APP",
      nama_aplikasi: "",
      keterangan: "",
    });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      no_urut: item.no_urut || "",
      kantor_wilayah: item.kantor_wilayah || "",
      kantor_area: item.kantor_area || "",
      kantor_cabang: item.kantor_cabang || "",
      kode_unit_kerja: item.kode_unit_kerja || "",
      nama_unit_kerja: item.nama_unit_kerja || "",
      status: item.status || "Online",
      vendor: item.vendor || "Teknisi CCTV Perorangan",
      jumlah_kamera: item.jumlah_kamera || "",
      aplikasi: item.aplikasi || "Mobile APP",
      nama_aplikasi: item.nama_aplikasi || "",
      keterangan: item.keterangan || "",
    });
    setIsModalOpen(true);
  };

  const askDelete = (id, nama) => {
    setDeleteConfirm({ show: true, id, name: nama });
  };

  const confirmDelete = () => {
    setIsSaving(true);
    router.delete(`/security-facilities/${deleteConfirm.id}`, {
      onSuccess: () => {
        showNotif("Data pengamanan & korporasi berhasil dihapus!");
        setDeleteConfirm({ show: false, id: null, name: "" });
      },
      onError: (err) => {
        console.error(err);
        showNotif("Gagal menghapus data pengamanan & korporasi.", "error");
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
      no_urut: formData.no_urut || null,
      kantor_wilayah: formData.kantor_wilayah,
      kantor_area: formData.kantor_area,
      kantor_cabang: formData.kantor_cabang,
      kode_unit_kerja: formData.kode_unit_kerja,
      nama_unit_kerja: formData.nama_unit_kerja,
      status: formData.status,
      vendor: formData.vendor,
      jumlah_kamera: formData.jumlah_kamera ? Number(formData.jumlah_kamera) : null,
      aplikasi: formData.aplikasi,
      nama_aplikasi: formData.nama_aplikasi,
      keterangan: formData.keterangan,
    };

    if (editingId) {
      router.put(`/security-facilities/${editingId}`, payload, {
        onSuccess: () => {
          showNotif("Data pengamanan & korporasi berhasil diperbarui!");
          setIsModalOpen(false);
        },
        onError: (err) => {
          console.error(err);
          showNotif("Gagal menyimpan data pengamanan & korporasi.", "error");
        },
        onFinish: () => {
          setIsSaving(false);
        }
      });
    } else {
      router.post("/security-facilities", payload, {
        onSuccess: () => {
          showNotif("Data pengamanan & korporasi baru berhasil ditambahkan!");
          setIsModalOpen(false);
        },
        onError: (err) => {
          console.error(err);
          showNotif("Gagal menyimpan data pengamanan & korporasi.", "error");
        },
        onFinish: () => {
          setIsSaving(false);
        }
      });
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const oldStatus = localStatuses[id] !== undefined ? localStatuses[id] : (facilities.find(f => f.id === id)?.status || "Offline");

    // Update UI immediately (optimistic update)
    setLocalStatuses(prev => ({ ...prev, [id]: newStatus }));

    try {
      await axios.put(`/security-facilities/${id}/status`, { status: newStatus });
      router.reload({
        only: ["securityFacilities", "activityLogs"],
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

  const exportToExcel = () => {
    const rows = filteredFacilities.map((item) => ({
      "No.": item.no_urut || "",
      "Kantor Wilayah": item.kantor_wilayah || "",
      "Kantor Area": item.kantor_area || "",
      "Kantor Cabang": item.kantor_cabang || "",
      "Kode Unit Kerja": item.kode_unit_kerja || "",
      "Nama Unit Kerja": item.nama_unit_kerja || "",
      "Status": item.status || "",
      "Vendor": item.vendor || "",
      "Jumlah Kamera": item.jumlah_kamera || "",
      "Aplikasi": item.aplikasi || "",
      "Nama Aplikasi": item.nama_aplikasi || "",
      "Keterangan": item.keterangan || "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pengamanan dan Korporasi");
    XLSX.writeFile(wb, `Pengamanan_dan_Korporasi_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
          const total = await importSecurityCSV("logistikku_app_01", data);
          showNotif(`Sukses! ${total} data pengamanan & korporasi berhasil di-import. Memuat ulang...`);
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

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "online":
        return "bg-green-50 text-green-700 border-green-200";
      case "offline":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300 relative print:hidden">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
              <Shield className="w-6 h-6 text-indigo-500" /> Pengamanan dan Korporasi
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Pantau ketersediaan CCTV, sistem alarm, pagar pengamanan, pos satpam, dan perangkat keselamatan korporasi.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={exportToExcel}
              disabled={filteredFacilities.length === 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-colors text-sm"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>
            {userRole === "admin" && (
              <>
                <button
                  type="button"
                  onClick={downloadSecurityTemplate}
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
                  aria-label="Upload file CSV data pengamanan"
                />
              </>
            )}
          </div>
        </div>

        {/* Tabel Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Search & Filter Toolbar */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative w-full sm:w-80">
                  <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Cari sarana keamanan..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                {(filterArea !== "all" || filterCabang !== "all" || filterStatus !== "all" || searchQuery !== "") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterArea("all");
                      setFilterCabang("all");
                      setFilterStatus("all");
                      setCurrentPage(1);
                      if (setSecurityFilter) setSecurityFilter("");
                    }}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold hover:underline shrink-0 cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {userRole === "admin" && (
                  <button
                    type="button"
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-colors text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Sarana
                  </button>
                )}
                <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-semibold shrink-0 max-w-fit">
                  Total Data: {filteredFacilities.length}
                </div>
              </div>
            </div>

            {/* Dropdown Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Kantor Area Filter */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Kantor Area</label>
                <select
                  value={filterArea}
                  onChange={(e) => { setFilterArea(e.target.value); setFilterCabang("all"); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                >
                  <option value="all">Semua Kantor Area</option>
                  {uniqueAreas.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              {/* Kantor Cabang Filter */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Kantor Cabang</label>
                <select
                  value={filterCabang}
                  onChange={(e) => { setFilterCabang(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                >
                  <option value="all">Semua Kantor Cabang</option>
                  {uniqueCabangs.map((cabang) => (
                    <option key={cabang} value={cabang}>{cabang}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                    if (setSecurityFilter && securityFilter !== "") {
                      setSecurityFilter("");
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                >
                  <option value="all">Semua Status</option>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
            </div>
          </div>

          {securityFilter === "online" && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between text-sm text-green-800 animate-in fade-in duration-300">
              <span className="font-medium">Menampilkan data CCTV Online.</span>
              <button
                onClick={() => setSecurityFilter("")}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                Hapus Filter
              </button>
            </div>
          )}

          {securityFilter === "offline" && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-sm text-red-800 animate-in fade-in duration-300">
              <span className="font-medium">Menampilkan data CCTV Offline.</span>
              <button
                onClick={() => setSecurityFilter("")}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                Hapus Filter
              </button>
            </div>
          )}

          {/* Table */}
          <div className={`overflow-x-auto custom-scrollbar ${itemsPerPage > 20 ? "max-h-[60vh] overflow-y-auto" : ""}`}>
            <table className="w-full text-left border-collapse min-w-[1800px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-blue-900 text-slate-100 text-[11px] font-bold uppercase tracking-wider text-center">
                  <th className="p-2.5 w-12 text-center align-middle border border-blue-800 bg-blue-900">No</th>
                  <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Kantor Wilayah</th>
                  <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Kantor Area</th>
                  <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Kantor Cabang</th>
                  <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Kode Unit Kerja</th>
                  <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Nama Unit Kerja</th>
                  <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Status</th>
                  <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Vendor</th>
                  <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Jumlah Kamera</th>
                  <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Aplikasi</th>
                  <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Nama Aplikasi</th>
                  <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Keterangan (Jika Offline)</th>
                  {userRole === "admin" && (
                    <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="text-xs text-gray-800 bg-white">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={userRole === "admin" ? "13" : "12"} className="p-4 text-center text-gray-400 border border-slate-200 bg-white">
                      Tidak ada data sarana pengamanan ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => {
                    const globalIndex = startIndex + index + 1;
                    const isEven = index % 2 !== 0;
                    const isSelected = selectedId === item.id;
                    const isHovered = hoveredId === item.id;

                    let bgClass = "";
                    if (isSelected) {
                      bgClass = isHovered 
                        ? "bg-blue-200 text-blue-950 dark:bg-[#2e4c37] dark:text-[#f1f5f3]" 
                        : "bg-blue-100 text-blue-900 dark:bg-[#1f3526] dark:text-[#48a359]";
                    } else if (isHovered) {
                      bgClass = "bg-slate-200 text-gray-900 dark:bg-[#273f2f] dark:text-[#f1f5f3]";
                    } else {
                      bgClass = isEven 
                        ? "bg-slate-100 text-gray-800 dark:bg-[#213527] dark:text-[#d1dcd4]" 
                        : "bg-white text-gray-800 dark:bg-[#1a2b20] dark:text-[#d1dcd4]";
                    }

                    return (
                      <tr
                        key={item.id}
                        onMouseEnter={() => setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => setSelectedId((prev) => (prev === item.id ? null : item.id))}
                        className={`transition-colors duration-150 cursor-pointer ${bgClass}`}
                      >
                        <td className="p-2 border border-slate-200 text-center align-middle text-xs font-medium">{globalIndex}</td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600">{item.kantor_wilayah || "-"}</td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600">{item.kantor_area || "-"}</td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600">{item.kantor_cabang || "-"}</td>
                        <td className="p-2 border border-slate-200 text-center align-middle text-xs font-mono text-gray-600">{item.kode_unit_kerja || "-"}</td>
                        <td className="p-2 border border-slate-200 align-middle font-semibold text-gray-900">{item.nama_unit_kerja || "-"}</td>
                        <td className="p-2 border border-slate-200 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                          {(() => {
                            const currentStatus = localStatuses[item.id] !== undefined ? localStatuses[item.id] : (item.status || "Offline");
                            return (
                              <select
                                value={currentStatus}
                                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                className={`text-center pl-2 pr-5 py-0.5 rounded text-[10px] font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${getStatusBadge(currentStatus)}`}
                                style={{ minWidth: '85px', textAlignLast: 'center' }}
                              >
                                <option value="Online" className="bg-white text-gray-800">Online</option>
                                <option value="Offline" className="bg-white text-gray-800">Offline</option>
                              </select>
                            );
                          })()}
                        </td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600">{item.vendor || "-"}</td>
                        <td className="p-2 border border-slate-200 text-center align-middle font-semibold text-gray-900">{item.jumlah_kamera ?? "-"}</td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600">{item.aplikasi || "-"}</td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600">{item.nama_aplikasi || "-"}</td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600 truncate max-w-xs" title={item.keterangan}>
                          {item.status?.toLowerCase() === "offline" ? (item.keterangan || "-") : "-"}
                        </td>
                        {userRole === "admin" && (
                          <td className="p-2 border border-slate-200 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-1">
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
                                onClick={() => askDelete(item.id, item.nama_unit_kerja)}
                                title="Hapus Data"
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200/85 flex items-center justify-between bg-slate-50/30">
              <span className="text-xs text-gray-500">
                Menampilkan {startIndex + 1} sampai {Math.min(startIndex + itemsPerPage, filteredFacilities.length)} dari {filteredFacilities.length} data
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
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      currentPage === page
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

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-gray-800">
                  {editingId ? "Edit Pengamanan & Korporasi" : "Tambah Pengamanan & Korporasi Baru"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 overflow-y-auto flex-1 custom-scrollbar gap-4 flex flex-col">
                
                {/* Grid 1: No. Urut & Kode Unit Kerja */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editingId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">No. Urut</label>
                      <input
                        type="number"
                        value={formData.no_urut}
                        onChange={(e) => setFormData((p) => ({ ...p, no_urut: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Contoh: 1"
                      />
                    </div>
                  )}
                  <div className={editingId ? "" : "col-span-2"}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Kode Unit Kerja</label>
                    <input
                      type="text"
                      value={formData.kode_unit_kerja}
                      onChange={(e) => setFormData((p) => ({ ...p, kode_unit_kerja: e.target.value }))}
                      disabled={isSaving}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Contoh: 12293"
                    />
                  </div>
                </div>

                {/* Field: Nama Unit Kerja */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Unit Kerja *</label>
                  <input
                    required
                    type="text"
                    value={formData.nama_unit_kerja}
                    onChange={(e) => setFormData((p) => ({ ...p, nama_unit_kerja: e.target.value }))}
                    disabled={isSaving}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                    placeholder="Contoh: CP PETAMBURAN"
                  />
                </div>

                {/* Grid 2: Kantor Wilayah, Area, Cabang */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Kantor Wilayah</label>
                    <input
                      type="text"
                      value={formData.kantor_wilayah}
                      onChange={(e) => setFormData((p) => ({ ...p, kantor_wilayah: e.target.value }))}
                      disabled={isSaving}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Wilayah"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Kantor Area</label>
                    <input
                      type="text"
                      value={formData.kantor_area}
                      onChange={(e) => setFormData((p) => ({ ...p, kantor_area: e.target.value }))}
                      disabled={isSaving}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Area"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Kantor Cabang</label>
                    <input
                      type="text"
                      value={formData.kantor_cabang}
                      onChange={(e) => setFormData((p) => ({ ...p, kantor_cabang: e.target.value }))}
                      disabled={isSaving}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Cabang"
                    />
                  </div>
                </div>

                {/* Grid 3: Status & Jumlah Kamera */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                      disabled={isSaving}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none bg-white text-sm"
                    >
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Jumlah Kamera</label>
                    <input
                      type="number"
                      value={formData.jumlah_kamera}
                      onChange={(e) => setFormData((p) => ({ ...p, jumlah_kamera: e.target.value }))}
                      disabled={isSaving}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Contoh: 10"
                    />
                  </div>
                </div>

                {/* Grid 4: Aplikasi & Nama Aplikasi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Aplikasi</label>
                    <input
                      type="text"
                      value={formData.aplikasi}
                      onChange={(e) => setFormData((p) => ({ ...p, aplikasi: e.target.value }))}
                      disabled={isSaving}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Contoh: Mobile APP"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Aplikasi</label>
                    <input
                      type="text"
                      value={formData.nama_aplikasi}
                      onChange={(e) => setFormData((p) => ({ ...p, nama_aplikasi: e.target.value }))}
                      disabled={isSaving}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Contoh: Hik-Connect"
                    />
                  </div>
                </div>

                {/* Field: Vendor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Vendor</label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => setFormData((p) => ({ ...p, vendor: e.target.value }))}
                    disabled={isSaving}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Contoh: Teknisi CCTV Perorangan"
                  />
                </div>

                {/* Field: Keterangan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Keterangan (Catatan Offline)</label>
                  <textarea
                    rows="2.5"
                    value={formData.keterangan}
                    onChange={(e) => setFormData((p) => ({ ...p, keterangan: e.target.value }))}
                    disabled={isSaving}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Tulis alasan jika status Offline..."
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium text-sm transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Simpan Data
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
