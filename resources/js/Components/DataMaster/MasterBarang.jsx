// resources/js/Components/DataMaster/MasterBarang.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Database, Plus, Box, Hash, Scale, Building2,
  CalendarDays, Clock, Search, Edit, Trash2,
  FileSpreadsheet, Upload, Loader2, ChevronLeft, ChevronRight
} from "lucide-react";
import { router } from "@inertiajs/react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { importInventoryCSV, downloadTemplate } from "../../services/inventoryService";
import BarangFormModal    from "./BarangFormModal";
import ConfirmDeleteModal from "../Modal/ConfirmDeleteModal";
import ToastNotif         from "../Modal/ToastNotif";

export default function MasterBarang({ inventory, userRole }) {
  const [searchQuery, setSearchQuery]           = useState("");
  const [calculatedStatus, setCalculatedStatus] = useState("Inventaris");
  const [localInventory, setLocalInventory]     = useState([]);
  const [isModalOpen, setIsModalOpen]           = useState(false);
  const [deleteConfirm, setDeleteConfirm]       = useState({ show: false, id: null, name: "" });
  const [editingInv, setEditingInv]             = useState(null);
  const [isSaving, setIsSaving]                 = useState(false);
  const [notif, setNotif]                       = useState({ show: false, message: "", type: "success" });
  const [selectedId, setSelectedId]             = useState(null);
  const [hoveredId, setHoveredId]               = useState(null);

  const fileInputRef = useRef(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState("Semua");

  // Sync state if query param from Inertia has status
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const statusParam = urlParams.get("status") || "Semua";
    setFilterStatus(statusParam);
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsSaving(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async ({ data }) => {
        try {
          const total = await importInventoryCSV("logistikku_app_01", data);
          showNotif(`Sukses! ${total} data barang berhasil di-import.`, "success");
        } catch (err) {
          console.error(err);
          const errorMsg = err.response?.data?.message || err.message || "Gagal import! Pastikan kolom header persis seperti template.";
          showNotif(errorMsg, "error");
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

  const exportToExcel = () => {
    const rows = filteredInventory.map((item, index) => ({
      "No": index + 1,
      "Nama Barang": item.nama || "",
      "Stok": item.kuantitas !== undefined ? item.kuantitas : (item.stok || 0),
      "Satuan": item.satuan || "",
      "Vendor": item.vendor_nama || "",
      "No SPK": item.no_spk || "",
      "No PKS": item.no_pks || "",
      "Tgl Mulai": item.tanggal_mulai || "",
      "Tgl Selesai": item.tanggal_selesai || "",
      "Masa Sewa (Bulan)": item.masa_sewa_bulan || 0,
      "Status": getStatusInfo(item) || "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Barang");
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...rows.map((r) => String(r[key]).length)) + 2,
    }));
    ws["!cols"] = colWidths;
    XLSX.writeFile(wb, `Data_Barang_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  useEffect(() => { setLocalInventory(inventory || []); }, [inventory]);

  const showNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  const handleDateChange = () => {
    const form = document.getElementById("formBarang");
    if (!form) return;
    const start = form.tanggal_mulai?.value;
    const end   = form.tanggal_selesai?.value;
    if (start && end) {
      const d1 = new Date(start);
      const d2 = new Date(end);
      let months = (d2.getFullYear() - d1.getFullYear()) * 12;
      months -= d1.getMonth();
      months += d2.getMonth();
      if (form.masa_sewa_bulan) form.masa_sewa_bulan.value = months > 0 ? months : 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setCalculatedStatus(new Date(end) >= today ? "Sewa Berjalan" : "Sewa Habis");
    } else {
      setCalculatedStatus("Inventaris");
      if (form.masa_sewa_bulan) form.masa_sewa_bulan.value = "";
    }
  };

  const getStatusInfo = (inv) => {
    if (inv.status) return inv.status;
    if (!inv.tanggal_mulai || !inv.tanggal_selesai) return "Inventaris";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(inv.tanggal_selesai) >= today ? "Sewa Berjalan" : "Sewa Habis";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Inventaris":    return "bg-blue-50 text-blue-700 border-blue-200";
      case "Sewa Berjalan": return "bg-green-50 text-green-700 border-green-200";
      case "Sewa Habis":    return "bg-red-50 text-red-700 border-red-200";
      default:              return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const filteredInventory = localInventory
    .filter((inv) => {
      const q = searchQuery.toLowerCase();
      const statusVal = getStatusInfo(inv);
      
      const matchSearch =
        inv.nama?.toLowerCase().includes(q) ||
        inv.vendor_nama?.toLowerCase().includes(q) ||
        inv.no_spk?.toLowerCase().includes(q) ||
        statusVal.toLowerCase().includes(q) ||
        inv.deskripsi?.toLowerCase().includes(q);

      const matchStatus =
        filterStatus === "Semua" || statusVal === filterStatus;

      return matchSearch && matchStatus;
    })
    .sort((a, b) => (b.id || 0) - (a.id || 0));

  const handleFilterStatus = (e) => {
    const val = e.target.value;
    setFilterStatus(val);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilterStatus("Semua");
    setCurrentPage(1);
  };

  const openAdd   = () => { setEditingInv(null); setCalculatedStatus("Inventaris"); setIsModalOpen(true); };
  const openEdit  = (inv) => { setEditingInv(inv); setCalculatedStatus(getStatusInfo(inv)); setIsModalOpen(true); };
  const askDelete = (inv) => setDeleteConfirm({ show: true, id: inv.id, name: inv.nama });

  const confirmDeleteAction = () => {
    setIsSaving(true);
    router.delete(`/inventory/${deleteConfirm.id}`, {
      onSuccess: () => {
        showNotif("Barang berhasil dihapus!");
        setDeleteConfirm({ show: false, id: null, name: "" });
      },
      onError: (err) => {
        console.error(err);
        showNotif("Gagal menghapus data barang.", "error");
      },
      onFinish: () => {
        setIsSaving(false);
      }
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    const form = new FormData(e.target);
    const payload = {
      nama: form.get("nama"),
      kuantitas: Number(form.get("kuantitas")) || 0,
      satuan: form.get("satuan") || "Pcs",
      vendor_nama: form.get("vendor_nama") || "",
      no_spk: form.get("no_spk") || "",
      no_pks: form.get("no_pks") || "",
      tanggal_mulai: form.get("tanggal_mulai") || "",
      tanggal_selesai: form.get("tanggal_selesai") || "",
      masa_sewa_bulan: Number(form.get("masa_sewa_bulan")) || 0,
      status: form.get("status") || "Inventaris",
      deskripsi: form.get("deskripsi") || "",
    };

    if (editingInv) {
      router.post(`/inventory/${editingInv.id}`, { ...payload, _method: "PUT" }, {
        onSuccess: () => {
          showNotif("Data barang berhasil diperbarui!");
          setIsModalOpen(false);
        },
        onError: (err) => {
          console.error(err);
          showNotif("Gagal mengupdate barang!", "error");
        },
        onFinish: () => {
          setIsSaving(false);
        }
      });
    } else {
      router.post("/inventory", payload, {
        onSuccess: () => {
          showNotif("Barang baru berhasil ditambahkan!");
          setIsModalOpen(false);
        },
        onError: (err) => {
          console.error(err);
          showNotif("Gagal menambah barang!", "error");
        },
        onFinish: () => {
          setIsSaving(false);
        }
      });
    }
  };
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

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

  return (
    <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300 relative">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
            <Database className="w-6 h-6 text-blue-600" /> Master Data Barang
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Kelola ketersediaan stok, status sewa, dan durasi kontrak barang.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={exportToExcel}
            disabled={filteredInventory.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-colors text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
          {userRole === "admin" && (
            <>
              <button
                type="button"
                onClick={downloadTemplate}
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
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Import CSV
              </button>

              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Upload file CSV data barang"
              />
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/30 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Cari barang atau status..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Show Entries Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-gray-600 self-start sm:self-auto">
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
              {(filterStatus !== "Semua" || searchQuery !== "") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-red-600 hover:text-red-800 font-semibold hover:underline shrink-0 self-start sm:self-auto"
                >
                  Reset Filter
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              {userRole === "admin" && (
                <button
                  onClick={openAdd}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Barang
                </button>
              )}
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-semibold shrink-0">
                Total: {filteredInventory.length}
              </div>
            </div>
          </div>

          {/* Row 2: Filter Status */}
          <div className="flex flex-col items-start pt-2 border-t border-slate-100/50">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase mb-1.5">
              STATUS
            </span>
            <div className="relative w-full max-w-xs">
              <select
                value={filterStatus}
                onChange={handleFilterStatus}
                aria-label="Filter status"
                className="w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs font-semibold cursor-pointer shadow-3xs appearance-none"
              >
                <option value="Semua">Semua Status</option>
                <option value="Inventaris">Inventaris</option>
                <option value="Sewa Berjalan">Sewa Berjalan</option>
                <option value="Sewa Habis">Sewa Habis</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2.5 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel */}
        <div className="px-4 py-3">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse border border-slate-200 min-w-[1100px]">
              <thead>
                <tr className="bg-blue-900 text-slate-100 text-[11px] font-bold uppercase tracking-wider text-center">
                  <th className="p-2.5 w-12 text-center align-middle border border-blue-800 bg-blue-900">No</th>
                  <th className="p-2.5 text-left align-middle border border-blue-800 bg-blue-900">Nama Barang</th>
                  <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Stok</th>
                  <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Satuan</th>
                  <th className="p-2.5 text-left align-middle border border-blue-800 bg-blue-900">Vendor & Kontrak</th>
                  <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Mulai</th>
                  <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Selesai</th>
                  <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Durasi</th>
                  <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Status</th>
                  {userRole === "admin" && <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Aksi</th>}
                </tr>
              </thead>
              <tbody className="text-xs text-gray-800 bg-white">
                {paginatedInventory.length === 0 ? (
                  <tr>
                    <td colSpan={userRole === "admin" ? "10" : "9"} className="p-4 text-center text-gray-400 border border-slate-200 bg-white">
                      Tidak ada data barang ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedInventory.map((inv, index) => {
                    const statusVal = getStatusInfo(inv);
                    const stokVal = inv.kuantitas !== undefined ? inv.kuantitas : (inv.stok || 0);
                    const isEven = index % 2 !== 0;
                    const isSelected = selectedId === inv.id;
                    const isHovered = hoveredId === inv.id;
                    const globalIndex = startIndex + index + 1;

                    let bgClass = "";
                    if (isSelected) {
                      bgClass = isHovered ? "bg-blue-200 text-blue-950" : "bg-blue-100 text-blue-900";
                    } else if (isHovered) {
                      bgClass = "bg-slate-200 text-gray-900";
                    } else {
                      bgClass = isEven ? "bg-slate-100 text-gray-800" : "bg-white text-gray-800";
                    }

                    return (
                      <tr
                        key={inv.id}
                        onMouseEnter={() => setHoveredId(inv.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => setSelectedId((prev) => (prev === inv.id ? null : inv.id))}
                        className={`transition-colors duration-150 cursor-pointer ${bgClass}`}
                      >
                        <td className="p-2 border border-slate-200 text-center align-middle font-medium text-gray-500">{globalIndex}</td>
                        <td className="p-2 border border-slate-200 align-middle font-semibold text-gray-900">
                          <div className="relative group cursor-default">
                            {inv.nama}
                            <div className="absolute left-0 top-full mt-1 z-[999] hidden group-hover:block bg-gray-900 text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl pointer-events-none">
                              <p className="!text-gray-400 mb-0.5">Database ID</p>
                              <p className="font-mono !text-white">{inv.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-2 border border-slate-200 text-center align-middle">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${stokVal <= 5 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
                            {stokVal}
                          </span>
                        </td>
                        <td className="p-2 border border-slate-200 text-center align-middle">{inv.satuan}</td>
                        <td className="p-2 border border-slate-200 align-middle">
                          {inv.vendor_nama ? (
                            <div>
                              <p className="font-semibold text-blue-900">{inv.vendor_nama}</p>
                              <p className="text-[10px] text-gray-500">SPK: {inv.no_spk || "-"}</p>
                            </div>
                          ) : "-"}
                        </td>
                        <td className="p-2 border border-slate-200 text-center align-middle">{formatDate(inv.tanggal_mulai)}</td>
                        <td className="p-2 border border-slate-200 text-center align-middle">{formatDate(inv.tanggal_selesai)}</td>
                        <td className="p-2 border border-slate-200 text-center align-middle">{inv.masa_sewa_bulan ? `${inv.masa_sewa_bulan} Bln` : "-"}</td>
                        <td className="p-2 border border-slate-200 text-center align-middle">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadge(statusVal)}`}>
                            {statusVal}
                          </span>
                        </td>
                        {userRole === "admin" && (
                          <td className="p-2 border border-slate-200 text-center align-middle">
                            <div className="flex justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => openEdit(inv)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => askDelete(inv)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
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
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/30">
            <span className="text-xs text-gray-500">
              Menampilkan {startIndex + 1} sampai {Math.min(startIndex + itemsPerPage, filteredInventory.length)} dari {filteredInventory.length} data
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

      {/* ── Modal Form ── */}
      {userRole === "admin" && (
        <BarangFormModal
          isOpen={isModalOpen}
          editingInv={editingInv}
          isSaving={isSaving}
          calculatedStatus={calculatedStatus}
          onClose={() => setIsModalOpen(false)}
          onSubmit={onSubmit}
          onDateChange={handleDateChange}
        />
      )}

      {/* ── Modal Konfirmasi Hapus ── */}
      <ConfirmDeleteModal
        show={deleteConfirm.show}
        name={deleteConfirm.name}
        isSaving={isSaving}
        onConfirm={confirmDeleteAction}
        onCancel={() => setDeleteConfirm({ show: false, id: null, name: "" })}
      />

      {/* ── Toast Notifikasi ── */}
      <ToastNotif
        show={notif.show}
        message={notif.message}
        type={notif.type}
        onClose={() => setNotif({ show: false, message: "", type: "" })}
      />
    </div>
  );
}