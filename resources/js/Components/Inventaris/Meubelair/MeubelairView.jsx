// resources/js/Components/Inventaris/Meubelair/MeubelairView.jsx
"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Search, Plus, FileSpreadsheet, Upload,
  Loader2, RotateCcw, Armchair, ChevronDown,
  ChevronLeft, ChevronRight
} from "lucide-react";
import * as XLSX from "xlsx";
import { parseExcelFile } from "../../../utils/excelHelper";

import MeubelairTable from "./MeubelairTable";
import MeubelairModal from "./MeubelairModal";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";
import ToastNotif from "../../Modal/ToastNotif";
import {
  addMeubelair,
  updateMeubelair,
  deleteMeubelair,
  importMeubelairCSV,
  downloadTemplate,
} from "../../../services/meubelairService";

export default function MeubelairView({
  meubelairs = [],
  outlets = [],
  userRole = "user",
  jenisMeubelairs = [],
  onRefreshJenis = null,
}) {
  const fileInputRef = useRef(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterKondisi, setFilterKondisi] = useState("Semua");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal & CRUD States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: "" });
  const [notif, setNotif] = useState({ show: false, message: "", type: "success" });

  const showNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
  };

  // Dynamic unique Jenis list from master DB and existing meubelairs
  const uniqueJenis = useMemo(() => {
    const set = new Set();
    const defaults = ["Meja", "Kursi", "Lemari", "Sofa", "AC"];
    defaults.forEach((d) => set.add(d));

    (jenisMeubelairs || []).forEach((j) => {
      const name = typeof j === "string" ? j : j.nama;
      if (name) set.add(name);
    });

    (meubelairs || []).forEach((item) => {
      if (item && item.kategori) {
        const kStr = String(item.kategori).trim();
        if (kStr) {
          const norm = kStr.toLowerCase() === "ac" 
            ? "AC" 
            : (kStr.charAt(0).toUpperCase() + kStr.slice(1));
          set.add(norm);
        }
      }
    });

    return Array.from(set).sort();
  }, [jenisMeubelairs, meubelairs]);

  // Apply search, category/jenis, and condition filters
  const filteredData = useMemo(() => {
    return (meubelairs || []).filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (item.jenis && String(item.jenis).toLowerCase().includes(q)) ||
        (item.kategori && String(item.kategori).toLowerCase().includes(q)) ||
        (item.lokasi && String(item.lokasi).toLowerCase().includes(q)) ||
        (item.outlet_rel && (String(item.outlet_rel.nama || item.outlet_rel.nama_outlet || "").toLowerCase().includes(q))) ||
        (item.outlet_rel && item.outlet_rel.code && String(item.outlet_rel.code).toLowerCase().includes(q)) ||
        (item.tanggal_register && String(item.tanggal_register).toLowerCase().includes(q)) ||
        (item.keterangan && String(item.keterangan).toLowerCase().includes(q));

      const matchJenis =
        filterJenis === "Semua" ||
        (item.kategori || "").toLowerCase() === filterJenis.toLowerCase();

      const matchKondisi =
        filterKondisi === "Semua" ||
        (item.kondisi || "").toLowerCase() === filterKondisi.toLowerCase();

      return matchSearch && matchJenis && matchKondisi;
    });
  }, [meubelairs, searchQuery, filterJenis, filterKondisi]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, startIndex, itemsPerPage]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterJenis("Semua");
    setFilterKondisi("Semua");
    setCurrentPage(1);
  };

  // Add & Edit Handlers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (formData) => {
    setIsSaving(true);
    try {
      if (editingItem) {
        await updateMeubelair(editingItem.id, formData);
        showNotif("Data Meubelair berhasil diperbarui!", "success");
      } else {
        await addMeubelair(formData);
        showNotif("Data Meubelair baru berhasil ditambahkan!", "success");
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Gagal menyimpan data Meubelair.";
      showNotif(msg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Handlers
  const askDelete = (id, name) => {
    setDeleteConfirm({ show: true, id, name });
  };

  const confirmDelete = async () => {
    setIsSaving(true);
    try {
      await deleteMeubelair(deleteConfirm.id);
      showNotif("Data Meubelair berhasil dihapus!", "success");
      setDeleteConfirm({ show: false, id: null, name: "" });
    } catch (error) {
      console.error(error);
      showNotif("Gagal menghapus data Meubelair.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    if (filteredData.length === 0) return;

    const dataToExport = filteredData.map((item, idx) => ({
      No: idx + 1,
      "Lokasi / Outlet": item.lokasi || (item.outlet_rel ? (item.outlet_rel.nama || item.outlet_rel.nama_outlet) : "-"),
      "Jenis Barang": item.kategori || "-",
      "Type Barang": item.jenis || "-",
      Quantity: item.quantity || 1,
      Kondisi: item.kondisi || "Baik",
      "Tanggal Registrasi": item.tanggal_register || "-",
      Keterangan: item.keterangan || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventaris_Meubelair");
    XLSX.writeFile(workbook, `Inventaris_Meubelair_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // Import Excel
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsSaving(true);
    try {
      const data = await parseExcelFile(file);
      const res = await importMeubelairCSV("all", data);
      showNotif(res.message || "Berhasil mengimpor data Meubelair.", "success");
    } catch (error) {
      console.error(error);
      showNotif(error.message || "Gagal mengimpor file Excel Meubelair.", "error");
    } finally {
      setIsSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300 relative print:hidden">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2.5">
              <Armchair className="w-6 h-6 text-[#0d5c3a] dark:text-emerald-400" /> Manajemen Inventaris Meubelair
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Pencatatan seluruh inventaris perabot meubelair, jumlah unit, kondisi fisik, dan lokasi penempatan.
            </p>
          </div>

          {/* Action Buttons Top */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={filteredData.length === 0}
              className="flex items-center gap-2 bg-[#279969] hover:bg-[#1e7a53] disabled:bg-[#279969]/50 text-white px-5 py-2.5 rounded-full font-bold shadow-md shadow-[#279969]/30 transition-all text-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>

            {userRole !== "guest" && (
              <>
                <button
                  type="button"
                  onClick={() => downloadTemplate("all")}
                  className="flex items-center gap-2 bg-[#279969] hover:bg-[#1e7a53] text-white px-5 py-2.5 rounded-full font-bold shadow-md shadow-[#279969]/30 transition-all text-xs cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Template Excel
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-colors text-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Import Excel
                </button>

                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  aria-label="Upload file Excel data meubelair"
                />
              </>
            )}
          </div>
        </div>

        {/* ── Card Tabel ── */}
        <div className="bg-white dark:bg-[#16251c] rounded-2xl shadow-sm border border-gray-200 dark:border-[#213527] overflow-hidden">
          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-slate-200/80 dark:border-[#213527] bg-slate-50/40 dark:bg-[#121e16] flex flex-col gap-4">
            <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                {/* Search Bar */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Cari type, jenis barang, lokasi, dsb..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1e3325] border border-gray-200 dark:border-[#2a4533] rounded-xl outline-none focus:ring-2 focus:ring-[#0d5c3a] text-xs shadow-sm font-medium text-gray-900 dark:text-slate-100"
                  />
                </div>

                {/* Show Entries */}
                <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                  <span>Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    aria-label="Jumlah baris per halaman"
                    className="pl-2 pr-6 py-1.5 bg-white border border-gray-200 dark:border-[#2a4533] dark:bg-[#1e3325] text-gray-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5c3a] text-xs cursor-pointer font-medium"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={10000}>All</option>
                  </select>
                  <span>entries</span>
                </div>

                {/* Reset Filters */}
                {(searchQuery || filterJenis !== "Semua" || filterKondisi !== "Semua") && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Filter
                  </button>
                )}
              </div>

              {/* Action Buttons Right */}
              <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
                {userRole === "admin" && (
                  <button
                    type="button"
                    onClick={handleOpenAdd}
                    className="flex items-center gap-2 bg-[#0d5c3a] hover:bg-[#0a462c] text-white px-5 py-2 rounded-full font-bold shadow-md shadow-[#0d5c3a]/20 transition-all text-xs cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Barang
                  </button>
                )}
                <div className="bg-emerald-50 text-[#0d5c3a] dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 px-4 py-2 rounded-full text-xs font-bold shrink-0">
                  Total: {filteredData.length}
                </div>
              </div>
            </div>

            {/* Dropdown Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-200/60 dark:border-[#213527]">
              {/* Filter Jenis Barang */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Jenis Barang
                </label>
                <div className="relative">
                  <select
                    value={filterJenis}
                    onChange={(e) => {
                      setFilterJenis(e.target.value);
                      setCurrentPage(1);
                    }}
                    aria-label="Filter jenis barang"
                    style={{ WebkitAppearance: "none", MozAppearance: "none", appearance: "none", backgroundImage: "none" }}
                    className="w-full pl-3 pr-8 py-1.5 bg-white dark:bg-[#1e3325] border border-gray-200 dark:border-[#2a4533] rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#0d5c3a] cursor-pointer appearance-none bg-none text-gray-900 dark:text-slate-100"
                  >
                    <option value="Semua">Semua Jenis</option>
                    {uniqueJenis.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Filter Kondisi */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Kondisi
                </label>
                <div className="relative">
                  <select
                    value={filterKondisi}
                    onChange={(e) => {
                      setFilterKondisi(e.target.value);
                      setCurrentPage(1);
                    }}
                    aria-label="Filter kondisi barang"
                    style={{ WebkitAppearance: "none", MozAppearance: "none", appearance: "none", backgroundImage: "none" }}
                    className="w-full pl-3 pr-8 py-1.5 bg-white dark:bg-[#1e3325] border border-gray-200 dark:border-[#2a4533] rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#0d5c3a] cursor-pointer appearance-none bg-none text-gray-900 dark:text-slate-100"
                  >
                    <option value="Semua">Semua Kondisi</option>
                    <option value="Baik">Baik</option>
                    <option value="Kurang Baik">Kurang Baik</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <MeubelairTable
            userRole={userRole}
            data={paginatedData}
            startIndex={startIndex}
            outlets={outlets}
            onEdit={handleOpenEdit}
            onDelete={askDelete}
          />

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-slate-200/80 dark:border-[#213527] flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30 dark:bg-[#121e16]">
            <span className="text-xs text-gray-500 dark:text-slate-400">
              Menampilkan {filteredData.length > 0 ? startIndex + 1 : 0} sampai{" "}
              {Math.min(startIndex + itemsPerPage, filteredData.length)} dari {filteredData.length} data
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 dark:border-[#2a4533] bg-white dark:bg-[#1e3325] hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                  .map((page, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && page - prev > 1;
                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && <span className="px-1 text-gray-400 text-xs">...</span>}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            currentPage === page
                              ? "bg-[#0d5c3a] text-white shadow-xs"
                              : "border border-gray-200 dark:border-[#2a4533] bg-white dark:bg-[#1e3325] text-gray-700 dark:text-slate-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 dark:border-[#2a4533] bg-white dark:bg-[#1e3325] hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <MeubelairModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
        outlets={outlets}
        userRole={userRole}
        jenisList={uniqueJenis}
        onSave={handleSaveItem}
        isSaving={isSaving}
      />

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
        onClose={() => setNotif({ show: false, message: "", type: "success" })}
      />
    </>
  );
}
