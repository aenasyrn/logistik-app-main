// resources/js/Components/Bangunan/SaranaPengamanan/index.jsx
"use client";

import React, { useState, useRef } from "react";
import { Shield, Search, Plus, FileSpreadsheet, Edit, Trash2, X, Loader2, Eye, Upload } from "lucide-react";
import axios from "axios";
import { router } from "@inertiajs/react";
import * as XLSX from "xlsx";
import Papa from "papaparse";

import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";
import ToastNotif from "../../Modal/ToastNotif";
import { importSecurityCSV, downloadSecurityTemplate } from "../../../services/securityService";

export default function SaranaPengamanan({ userRole, facilities = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter States
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterKanwil, setFilterKanwil] = useState("all");
  const [filterAplikasi, setFilterAplikasi] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    no_urut: "",
    kantor_wilayah: "",
    kantor_area: "",
    kantor_cabang: "",
    kode_unit_kerja: "",
    nama_unit_kerja: "",
    status: "Online",
    vendor: "",
    jumlah_kamera: "",
    aplikasi: "",
    nama_aplikasi: "",
    keterangan: "",
  });

  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: "" });
  const [detailData, setDetailData] = useState(null);
  const [notif, setNotif] = useState({ show: false, message: "", type: "success" });

  const fileInputRef = useRef(null);

  const showNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
  };

  // Generate dynamic filter options from database records
  const kanwilOptions = Array.from(
    new Set(
      facilities
        .map((f) => f.kantor_wilayah?.trim())
        .filter((w) => !!w)
    )
  ).sort();

  const aplikasiOptions = Array.from(
    new Set(
      facilities
        .map((f) => f.aplikasi?.trim())
        .filter((a) => !!a)
    )
  ).sort();

  // Filter logic
  const filteredFacilities = facilities.filter((item) => {
    const q = searchQuery.toLowerCase();

    // 1. Search Query filter
    const matchesSearch = !searchQuery || (
      (item.kantor_wilayah && item.kantor_wilayah.toLowerCase().includes(q)) ||
      (item.kantor_area && item.kantor_area.toLowerCase().includes(q)) ||
      (item.kantor_cabang && item.kantor_cabang.toLowerCase().includes(q)) ||
      (item.kode_unit_kerja && item.kode_unit_kerja.toLowerCase().includes(q)) ||
      (item.nama_unit_kerja && item.nama_unit_kerja.toLowerCase().includes(q)) ||
      (item.status && item.status.toLowerCase().includes(q)) ||
      (item.vendor && item.vendor.toLowerCase().includes(q)) ||
      (item.aplikasi && item.aplikasi.toLowerCase().includes(q)) ||
      (item.nama_aplikasi && item.nama_aplikasi.toLowerCase().includes(q)) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(q))
    );

    if (!matchesSearch) return false;

    // 2. Status filter
    if (filterStatus !== "all") {
      const s = (item.status || "").toLowerCase();
      if (s !== filterStatus.toLowerCase()) return false;
    }

    // 3. Kanwil filter
    if (filterKanwil !== "all") {
      if ((item.kantor_wilayah || "").trim() !== filterKanwil) return false;
    }

    // 4. Aplikasi filter
    if (filterAplikasi !== "all") {
      if ((item.aplikasi || "").trim() !== filterAplikasi) return false;
    }

    return true;
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
      vendor: "",
      jumlah_kamera: "",
      aplikasi: "",
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
      vendor: item.vendor || "",
      jumlah_kamera: item.jumlah_kamera !== null && item.jumlah_kamera !== undefined ? String(item.jumlah_kamera) : "",
      aplikasi: item.aplikasi || "",
      nama_aplikasi: item.nama_aplikasi || "",
      keterangan: item.keterangan || "",
    });
    setIsModalOpen(true);
  };

  const askDelete = (id, nama) => {
    setDeleteConfirm({ show: true, id, name: nama });
  };

  const confirmDelete = async () => {
    setIsSaving(true);
    try {
      await axios.delete(`/security-facilities/${deleteConfirm.id}`);
      router.reload({ only: ["securityFacilities", "activityLogs"] });
      showNotif("Data pengamanan & korporasi berhasil dihapus!");
    } catch (e) {
      console.error(e);
      showNotif("Gagal menghapus data pengamanan & korporasi.", "error");
    } finally {
      setIsSaving(false);
      setDeleteConfirm({ show: false, id: null, name: "" });
    }
  };

  const handleSave = async (e) => {
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
      jumlah_kamera: formData.jumlah_kamera !== "" ? Number(formData.jumlah_kamera) : null,
      aplikasi: formData.aplikasi,
      nama_aplikasi: formData.nama_aplikasi,
      keterangan: formData.keterangan,
    };

    try {
      if (editingId) {
        await axios.put(`/security-facilities/${editingId}`, payload);
        router.reload({ only: ["securityFacilities", "activityLogs"] });
        showNotif("Data pengamanan & korporasi berhasil diperbarui!");
      } else {
        await axios.post("/security-facilities", payload);
        router.reload({ only: ["securityFacilities", "activityLogs"] });
        showNotif("Data pengamanan & korporasi baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showNotif("Gagal menyimpan data pengamanan & korporasi.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const exportToExcel = () => {
    const rows = filteredFacilities.map((item, idx) => ({
      "No": idx + 1,
      "No. Urut": item.no_urut || "",
      "Kantor Wilayah": item.kantor_wilayah || "",
      "Kantor Area": item.kantor_area || "",
      "Kantor Cabang": item.kantor_cabang || "",
      "Kode Unit Kerja": item.kode_unit_kerja || "",
      "Nama Unit Kerja": item.nama_unit_kerja || "",
      "Status": item.status || "",
      "Vendor": item.vendor || "",
      "Jumlah Kamera": item.jumlah_kamera || 0,
      "Aplikasi": item.aplikasi || "",
      "Nama Aplikasi": item.nama_aplikasi || "",
      "Keterangan": item.keterangan || "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pengamanan dan Korporasi");
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...rows.map((r) => String(r[key]).length)) + 2,
    }));
    ws["!cols"] = colWidths;
    XLSX.writeFile(wb, `Pengamanan_dan_Korporasi_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

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
    const s = (status || "").toLowerCase().trim();
    if (s === "online" || s === "aktif") {
      return "bg-green-50 text-green-700 border-green-200";
    }
    if (s === "offline" || s === "rusak") {
      return "bg-red-50 text-red-700 border-red-200";
    }
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300 relative print:p-0">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 print:hidden">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
              <Shield className="w-6 h-6 text-blue-900" /> Pengamanan dan Korporasi
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Pantau ketersediaan CCTV, vendor, status online/offline, unit kerja, dan aplikasi pengamanan korporasi.
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

        {/* PRINT ONLY HEADER */}
        <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold text-center">LAPORAN PENGAMANAN DAN KORPORASI</h1>
          <p className="text-sm text-center text-gray-500 mt-1">
            Dicetak pada tanggal: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Tabel Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
          {/* Search & Filters Toolbar */}
          <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/30 flex flex-col gap-4 print:hidden">
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative w-full sm:w-80">
                  <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Cari data pengamanan..."
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
                
                {/* Reset Filters button */}
                {(filterStatus !== "all" || filterKanwil !== "all" || filterAplikasi !== "all" || searchQuery !== "") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterStatus("all");
                      setFilterKanwil("all");
                      setFilterAplikasi("all");
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
                    <Plus className="w-3.5 h-3.5" /> Tambah Sarana
                  </button>
                )}
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-100 shrink-0">
                  Total Data: {filteredFacilities.length}
                </div>
              </div>
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Status Filter */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                >
                  <option value="all">Semua Status</option>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>

              {/* Kantor Wilayah Filter */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Kantor Wilayah</label>
                <select
                  value={filterKanwil}
                  onChange={(e) => { setFilterKanwil(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                >
                  <option value="all">Semua Kanwil</option>
                  {kanwilOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Aplikasi Filter */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Aplikasi</label>
                <select
                  value={filterAplikasi}
                  onChange={(e) => { setFilterAplikasi(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                >
                  <option value="all">Semua Aplikasi</option>
                  {aplikasiOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className={`overflow-x-auto custom-scrollbar ${itemsPerPage > 20 ? "max-h-[60vh] overflow-y-auto" : ""}`}>
            <table className="w-full text-left border-collapse min-w-[1800px]">
              <thead>
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
                  <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Keterangan</th>
                  <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-800 bg-white">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="p-4 text-center text-gray-400 border border-slate-200 bg-white">
                      Tidak ada data pengamanan korporasi ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => {
                    const globalIndex = startIndex + index + 1;
                    const isEven = index % 2 !== 0;

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors duration-150 cursor-pointer hover:bg-slate-200/60 ${
                          isEven ? "bg-slate-100/50" : "bg-white"
                        }`}
                        onClick={() => setDetailData(item)}
                      >
                        <td className="p-2 border border-slate-200 text-center align-middle text-xs font-medium text-gray-500">
                          {globalIndex}
                        </td>
                        <td className="p-2 border border-slate-200 align-middle font-semibold text-gray-900">
                          {item.kantor_wilayah || "-"}
                        </td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-700">
                          {item.kantor_area || "-"}
                        </td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-700">
                          {item.kantor_cabang || "-"}
                        </td>
                        <td className="p-2 border border-slate-200 align-middle font-mono text-gray-700 text-center font-medium">
                          {item.kode_unit_kerja || "-"}
                        </td>
                        <td className="p-2 border border-slate-200 align-middle font-semibold text-gray-900">
                          {item.nama_unit_kerja || "-"}
                        </td>
                        <td className="p-2 border border-slate-200 text-center align-middle">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(item.status)}`}>
                            {item.status || "Offline"}
                          </span>
                        </td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600">
                          {item.vendor || "-"}
                        </td>
                        <td className="p-2 border border-slate-200 text-center align-middle font-semibold text-gray-900">
                          {item.jumlah_kamera !== null && item.jumlah_kamera !== undefined ? item.jumlah_kamera : "-"}
                        </td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600">
                          {item.aplikasi || "-"}
                        </td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600">
                          {item.nama_aplikasi || "-"}
                        </td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600 truncate max-w-xs" title={item.keterangan}>
                          {item.keterangan || "-"}
                        </td>
                        <td className="p-2 border border-slate-200 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setDetailData(item)}
                              title="Detail Data"
                              className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
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
                                  onClick={() => askDelete(item.id, item.nama_unit_kerja)}
                                  title="Hapus Data"
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200/85 flex items-center justify-between bg-slate-50/30 print:hidden">
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

      {/* Detail Modal */}
      {detailData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Detail Pengamanan & Korporasi</h3>
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
                  <span className="block text-xs font-medium text-gray-400 uppercase">Kode Unit Kerja</span>
                  <span className="font-semibold text-gray-900 font-mono text-base">{detailData.kode_unit_kerja || "-"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase">Nama Unit Kerja</span>
                  <span className="font-semibold text-gray-900 text-base">{detailData.nama_unit_kerja || "-"}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase">Kantor Wilayah</span>
                  <span className="font-medium text-gray-900">{detailData.kantor_wilayah || "-"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase">Kantor Area</span>
                  <span className="font-medium text-gray-900">{detailData.kantor_area || "-"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase">Kantor Cabang</span>
                  <span className="font-medium text-gray-900">{detailData.kantor_cabang || "-"}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase">Status</span>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold border ${getStatusBadge(detailData.status)}`}>
                    {detailData.status || "Offline"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase">Vendor</span>
                  <span className="font-medium text-gray-900">{detailData.vendor || "-"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase">Jumlah Kamera</span>
                  <span className="font-semibold text-blue-700 text-base">{detailData.jumlah_kamera !== null && detailData.jumlah_kamera !== undefined ? detailData.jumlah_kamera : "-"}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase">Aplikasi</span>
                  <span className="font-medium text-gray-900">{detailData.aplikasi || "-"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase">Nama Aplikasi</span>
                  <span className="font-medium text-gray-900">{detailData.nama_aplikasi || "-"}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <span className="block text-xs font-medium text-gray-400 uppercase">Keterangan / Catatan</span>
                <p className="mt-1 text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 break-words whitespace-pre-wrap">
                  {detailData.keterangan || "Tidak ada keterangan tambahan."}
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

      {/* Add / Edit Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-lg text-gray-800">
                {editingId ? "Edit Pengamanan & Korporasi" : "Tambah Pengamanan & Korporasi"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 overflow-y-auto flex-1 custom-scrollbar gap-4 flex flex-col">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Kode Unit Kerja *</label>
                    <input
                      required
                      type="text"
                      value={formData.kode_unit_kerja}
                      onChange={(e) => setFormData((p) => ({ ...p, kode_unit_kerja: e.target.value }))}
                      disabled={isSaving}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                      placeholder="Contoh: 12293"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nama Unit Kerja *</label>
                    <input
                      required
                      type="text"
                      value={formData.nama_unit_kerja}
                      onChange={(e) => setFormData((p) => ({ ...p, nama_unit_kerja: e.target.value }))}
                      disabled={isSaving}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                      placeholder="Contoh: CP Petamburan"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Kantor Wilayah</label>
                    <input
                      type="text"
                      value={formData.kantor_wilayah}
                      onChange={(e) => setFormData((p) => ({ ...p, kantor_wilayah: e.target.value }))}
                      disabled={isSaving}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                      placeholder="KANWIL JAKARTA 1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Kantor Area</label>
                    <input
                      type="text"
                      value={formData.kantor_area}
                      onChange={(e) => setFormData((p) => ({ ...p, kantor_area: e.target.value }))}
                      disabled={isSaving}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                      placeholder="AREA SENEN"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Kantor Cabang</label>
                    <input
                      type="text"
                      value={formData.kantor_cabang}
                      onChange={(e) => setFormData((p) => ({ ...p, kantor_cabang: e.target.value }))}
                      disabled={isSaving}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                      placeholder="CP PETAMBURAN"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                      disabled={isSaving}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none bg-white text-xs"
                    >
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Vendor</label>
                    <input
                      type="text"
                      value={formData.vendor}
                      onChange={(e) => setFormData((p) => ({ ...p, vendor: e.target.value }))}
                      disabled={isSaving}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                      placeholder="Teknisi CCTV Perorangan"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Jumlah Kamera</label>
                    <input
                      type="number"
                      value={formData.jumlah_kamera}
                      onChange={(e) => setFormData((p) => ({ ...p, jumlah_kamera: e.target.value }))}
                      disabled={isSaving}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                      placeholder="4"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Aplikasi</label>
                    <input
                      type="text"
                      value={formData.aplikasi}
                      onChange={(e) => setFormData((p) => ({ ...p, aplikasi: e.target.value }))}
                      disabled={isSaving}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                      placeholder="Mobile APP / CMS"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nama Aplikasi</label>
                    <input
                      type="text"
                      value={formData.nama_aplikasi}
                      onChange={(e) => setFormData((p) => ({ ...p, nama_aplikasi: e.target.value }))}
                      disabled={isSaving}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                      placeholder="DMSS / Hik-Connect"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Keterangan / Catatan</label>
                  <textarea
                    rows="3"
                    value={formData.keterangan}
                    onChange={(e) => setFormData((p) => ({ ...p, keterangan: e.target.value }))}
                    disabled={isSaving}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                    placeholder="Catatan tambahan (seperti penyebab offline atau status relokasi)..."
                  />
                </div>
              </div>
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl flex items-center justify-center gap-2 text-xs"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
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
