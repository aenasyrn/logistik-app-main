// resources/js/Components/DataMaster/MasterMeubelairView.jsx
"use client";

import { useState, useMemo, useRef } from "react";
import {
  Plus, Search, FileSpreadsheet, Upload, Loader2,
  Box, ChevronLeft, ChevronRight
} from "lucide-react";
import * as XLSX from "xlsx";
import { parseExcelFile } from "../../utils/excelHelper";
import MasterMeubelairTable from "./MasterMeubelairTable";
import MasterMeubelairModal from "./MasterMeubelairModal";
import ConfirmDeleteModal from "../Modal/ConfirmDeleteModal";
import ToastNotif from "../Modal/ToastNotif";
import {
  addMasterMeubelair,
  updateMasterMeubelair,
  deleteMasterMeubelair,
  importMasterMeubelairCSV,
  downloadMasterMeubelairTemplate,
} from "../../services/masterMeubelairService";

export default function MasterMeubelairView({
  masterMeubelairs = [],
  userRole = "user",
  jenisMeubelairs = [],
  vendors = [],
  onRefreshJenis = null,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: "" });
  const [notif, setNotif] = useState({ show: false, message: "", type: "success" });

  const fileInputRef = useRef(null);

  const showNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
  };

  // Extract unique Jenis Barang for filter dropdown (from dynamic jenisMeubelairs & existing items)
  const uniqueJenis = useMemo(() => {
    const set = new Set();
    (jenisMeubelairs || []).forEach((j) => {
      const name = typeof j === "string" ? j : j.nama;
      if (name) set.add(name);
    });
    (masterMeubelairs || []).forEach((item) => {
      if (item.jenis_barang) set.add(item.jenis_barang);
    });
    return Array.from(set).sort();
  }, [jenisMeubelairs, masterMeubelairs]);

  // Filtered data
  const filteredData = useMemo(() => {
    return (masterMeubelairs || []).filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (item.nama_barang && item.nama_barang.toLowerCase().includes(q)) ||
        (item.jenis_barang && item.jenis_barang.toLowerCase().includes(q)) ||
        (item.tanggal_registrasi && item.tanggal_registrasi.toLowerCase().includes(q)) ||
        (item.vendor && item.vendor.toLowerCase().includes(q)) ||
        (item.keterangan && item.keterangan.toLowerCase().includes(q));

      const matchJenis =
        filterJenis === "Semua" ||
        (item.jenis_barang || "").toLowerCase() === filterJenis.toLowerCase();

      return matchSearch && matchJenis;
    });
  }, [masterMeubelairs, searchQuery, filterJenis]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, startIndex, itemsPerPage]);

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

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterJenis("Semua");
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
        await updateMasterMeubelair(editingItem.id, formData);
        showNotif("Data Master Meubelair berhasil diperbarui!", "success");
      } else {
        await addMasterMeubelair(formData);
        showNotif("Master Meubelair baru berhasil ditambahkan!", "success");
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
      await deleteMasterMeubelair(deleteConfirm.id);
      showNotif("Data Master Meubelair berhasil dihapus!", "success");
      setDeleteConfirm({ show: false, id: null, name: "" });
    } catch (error) {
      console.error(error);
      showNotif("Gagal menghapus data Master Meubelair.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Export Excel
  const exportToExcel = () => {
    if (filteredData.length === 0) return;

    const dataToExport = filteredData.map((item, idx) => ({
      No: idx + 1,
      "Nama Barang": item.nama_barang || "",
      "Jenis Barang": item.jenis_barang || "-",
      Stok: item.stok !== undefined ? item.stok : 0,
      "Tanggal Registrasi": item.tanggal_registrasi || "-",
      Vendor: item.vendor || "-",
      "Harga Satuan": item.harga_satuan || 0,
      Biaya: item.biaya || 0,
      Keterangan: item.keterangan || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Master_Meubelair");
    XLSX.writeFile(
      workbook,
      `Master_Meubelair_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Import Excel
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsSaving(true);
    try {
      const data = await parseExcelFile(file);
      const total = await importMasterMeubelairCSV(data);
      showNotif(`Sukses! ${total} data Master Meubelair berhasil di-import.`, "success");
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Gagal import! Pastikan file Excel valid dan kolom header sesuai template.";
      showNotif(errorMsg, "error");
    } finally {
      setIsSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top Header Toolbar: Identik dengan gambar ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80 dark:border-[#213527]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2.5">
              <Box className="w-6 h-6 text-[#0d5c3a] dark:text-emerald-400" /> Master Data Barang Meubelair
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kelola ketersediaan stok, biaya, vendor, dan tanggal registrasi barang meubelair.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={exportToExcel}
            disabled={filteredData.length === 0}
            className="flex items-center gap-2 bg-[#279969] hover:bg-[#1e7a53] disabled:bg-[#279969]/50 text-white px-5 py-2.5 rounded-full font-bold shadow-md shadow-[#279969]/30 transition-all text-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>

          {userRole === "admin" && (
            <>
              <button
                type="button"
                onClick={downloadMasterMeubelairTemplate}
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
                className="hidden"
                onChange={handleFileUpload}
              />
            </>
          )}
        </div>
      </div>

      {/* ── White Container Card: Identik dengan gambar ── */}
      <div className="bg-white dark:bg-[#101e16] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1d3124] overflow-hidden">
        {/* Toolbar Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-gray-800 bg-slate-50/30 dark:bg-[#121e16]/60 flex flex-col gap-4">
          {/* Row 1: Search, Show Entries, Tambah Barang, Total Badge */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Cari barang atau jenis..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1a2d21] border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:text-white"
                />
              </div>

              {/* Show Entries Dropdown */}
              <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                <span>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  aria-label="Jumlah baris per halaman"
                  className="pl-2 pr-6 py-1.5 bg-white border border-gray-200 dark:border-gray-700 dark:bg-[#1a2d21] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs cursor-pointer font-medium"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={10000}>All</option>
                </select>
                <span>entries</span>
              </div>

              {/* Reset Filters button */}
              {(filterJenis !== "Semua" || searchQuery !== "") && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-red-600 hover:text-red-800 font-semibold hover:underline shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              {userRole === "admin" && (
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="bg-[#0d5c3a] hover:bg-[#0a462c] text-white px-5 py-2 rounded-full text-xs font-bold shadow-md shadow-[#0d5c3a]/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Barang
                </button>
              )}
              <div className="bg-emerald-50 text-[#0d5c3a] dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 px-4 py-2 rounded-full text-xs font-bold shrink-0">
                Total: {filteredData.length}
              </div>
            </div>
          </div>

          {/* Row 2: Filter Jenis Barang */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100/50 dark:border-gray-800">
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase mb-1.5">
                JENIS BARANG
              </span>
              <div className="relative w-44">
                <select
                  value={filterJenis}
                  onChange={(e) => {
                    setFilterJenis(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ WebkitAppearance: "none", MozAppearance: "none", appearance: "none", backgroundImage: "none" }}
                  className="w-full pl-3 pr-8 py-2 bg-white dark:bg-[#1a2d21] border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold cursor-pointer shadow-3xs appearance-none bg-none dark:text-white"
                >
                  <option value="Semua">Semua Jenis</option>
                  {uniqueJenis.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel */}
        <div className="px-4 py-3">
          <MasterMeubelairTable
            data={paginatedData}
            startIndex={startIndex}
            userRole={userRole}
            onEdit={handleOpenEdit}
            onDelete={askDelete}
          />
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-[#121e16]/40">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Menampilkan {filteredData.length > 0 ? startIndex + 1 : 0} sampai{" "}
            {Math.min(startIndex + itemsPerPage, filteredData.length)} dari {filteredData.length} data
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2d21] hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getVisiblePages().map((page) => (
                <button
                  type="button"
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    currentPage === page
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white dark:bg-[#1a2d21] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2d21] hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Add/Edit */}
      {userRole === "admin" && (
        <MasterMeubelairModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveItem}
          editingItem={editingItem}
          isSaving={isSaving}
          userRole={userRole}
          jenisList={jenisMeubelairs}
          vendors={vendors}
          onRefreshJenis={onRefreshJenis}
        />
      )}

      {/* Modal Confirm Delete */}
      {userRole === "admin" && (
        <ConfirmDeleteModal
          isOpen={deleteConfirm.show}
          onClose={() => setDeleteConfirm({ show: false, id: null, name: "" })}
          onConfirm={confirmDelete}
          title="Hapus Master Meubelair"
          message={`Apakah Anda yakin ingin menghapus "${deleteConfirm.name}" dari master meubelair?`}
          isDeleting={isSaving}
        />
      )}

      {/* Toast Notification */}
      <ToastNotif
        show={notif.show}
        message={notif.message}
        type={notif.type}
        onClose={() => setNotif({ ...notif, show: false })}
      />
    </div>
  );
}
