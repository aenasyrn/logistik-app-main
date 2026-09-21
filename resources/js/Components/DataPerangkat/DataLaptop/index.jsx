// resources/js/Components/DataPerangkat/DataLaptop/index.jsx
"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Laptop, Search, Plus,
  FileSpreadsheet, Upload, Loader2, AlertCircle,
} from "lucide-react";
import LaptopTable from "./LaptopTable";
import LaptopModal from "./LaptopModal";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";
import ToastNotif from "../../Modal/ToastNotif";
import axios from "axios";
import { router } from "@inertiajs/react";
import * as XLSX from "xlsx";
import { downloadExcelTemplate, parseExcelFile } from "../../../utils/excelHelper";

export default function DataLaptop({
  laptops = [],
  inventory = [],
  vendors = [],
  userRole = "admin",
  setView,
  laptopFilter,
  setLaptopFilter,
  laptopSearch,
  setLaptopSearch,
}) {
  const [searchQuery, setSearchQuery] = useState(laptopSearch || "");
  const [filterStatus, setFilterStatus] = useState(laptopFilter || "Semua");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  React.useEffect(() => {
    if (laptopSearch !== undefined) {
      setSearchQuery(laptopSearch);
      setCurrentPage(1);
    }
  }, [laptopSearch]);

  React.useEffect(() => {
    if (laptopFilter !== undefined) {
      setFilterStatus(laptopFilter);
      setCurrentPage(1);
    }
  }, [laptopFilter]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: "" });
  const [notif, setNotif] = useState({ show: false, message: "", type: "success" });

  const fileInputRef = useRef(null);

  const showNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
    setTimeout(() => setNotif({ show: false, message: "", type: "success" }), 3500);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    if (setLaptopSearch) setLaptopSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterStatus = (e) => {
    setFilterStatus(e.target.value);
    if (setLaptopFilter) setLaptopFilter(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilterStatus("Semua");
    if (setLaptopSearch) setLaptopSearch("");
    if (setLaptopFilter) setLaptopFilter("Semua");
    setCurrentPage(1);
  };

  // Filter data laptop
  const filteredData = useMemo(() => {
    return laptops.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        (item.namaPengguna || item.nama_pengguna || "").toLowerCase().includes(q) ||
        (item.nikPegawai || item.nik_pegawai || "").toLowerCase().includes(q) ||
        (item.jabatan || "").toLowerCase().includes(q) ||
        (item.departemen || "").toLowerCase().includes(q) ||
        (item.hostname || "").toLowerCase().includes(q) ||
        (item.sn || "").toLowerCase().includes(q) ||
        (item.produk || "").toLowerCase().includes(q) ||
        (item.penyedia || item.vendor || "").toLowerCase().includes(q) ||
        (item.os || "").toLowerCase().includes(q);

      const status = item.status || "Inventaris";
      const matchStatus = filterStatus === "Semua" || status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [laptops, searchQuery, filterStatus]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const openModalForAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      if (editingItem) {
        await axios.put(`/laptops/${editingItem.id}`, formData);
        showNotif("Data laptop berhasil diperbarui!");
      } else {
        await axios.post("/laptops", formData);
        showNotif("Data laptop baru berhasil disimpan!");
      }
      setIsModalOpen(false);
      setEditingItem(null);
      router.reload({ only: ["laptops", "activityLogs"] });
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Gagal menyimpan data laptop.";
      showNotif(errMsg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const askDelete = (id, name) => {
    setDeleteConfirm({ show: true, id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await axios.delete(`/laptops/${deleteConfirm.id}`);
      showNotif("Data laptop berhasil dihapus!");
      setDeleteConfirm({ show: false, id: null, name: "" });
      router.reload({ only: ["laptops", "activityLogs"] });
    } catch (err) {
      console.error(err);
      showNotif("Gagal menghapus data laptop.", "error");
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredData.map((l, index) => ({
      No: index + 1,
      "Nama Pengguna": l.namaPengguna || l.nama_pengguna || "-",
      "NIK Pegawai": l.nikPegawai || l.nik_pegawai || "-",
      "Jabatan": l.jabatan || "-",
      "Departemen": l.departemen || "-",
      "Hostname / Device Name": l.hostname || "-",
      "Serial Number (S/N)": l.sn || "-",
      "Model Laptop": l.produk || "-",
      "Operating System": l.os || "Windows",
      "Kondisi": l.kondisi || "BAIK",
      "Penyedia / Vendor": l.penyedia || l.vendor || "-",
      "Tgl Mulai Sewa": l.tanggalMulai || l.tanggal_mulai || "-",
      "Tgl Selesai Sewa": l.tanggalSelesai || l.tanggal_selesai || "-",
      "Masa Sewa (Bln)": l.masa_sewa_bulan || l.masaSewaBulan || "-",
      "Status": l.status || "Inventaris",
      "Keterangan": l.keterangan || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Laptop");
    XLSX.writeFile(wb, `Data_Laptop_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const downloadTemplate = () => {
    const headers = [
      "nik_pegawai", "nama_pengguna", "jabatan", "departemen", "produk",
      "hostname", "sn", "os", "kondisi", "penyedia", "tanggal_mulai",
      "tanggal_selesai", "status", "keterangan"
    ];
    const sampleRows = [
      ["P80524", "MAMAN SURATMAN", "Kepala Departemen", "Departemen Logistik & Umum", "ThinkPad L14 Gen 4", "NB-00108-", "5CG4222JJW", "Windows", "BAIK", "PT GLOBAL SOLUSINDO KOMPUDATA", "2024-01-01", "2026-01-01", "Sewa Berjalan", "-"]
    ];
    downloadExcelTemplate("Template_Data_Laptop.xlsx", headers, sampleRows, "Data Laptop");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSaving(true);
    try {
      const rows = await parseExcelFile(file);
      await axios.post("/laptops/import", { rows });
      showNotif(`Berhasil mengimpor ${rows.length} data laptop!`);
      router.reload({ only: ["laptops", "activityLogs"] });
    } catch (err) {
      console.error(err);
      showNotif(err.response?.data?.message || err.message || "Gagal mengimpor file Excel data laptop.", "error");
    } finally {
      setIsSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleNavigateToMaster = (laptopItem, matchedInv) => {
    if (setView) {
      setView("master_barang_non_meubelair");
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("open-perpanjang-barang", {
            detail: {
              id: matchedInv?.id || laptopItem?.inventory_id,
              nama: matchedInv?.nama || laptopItem?.produk,
            },
          })
        );
      }, 100);
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300 relative print:hidden">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2.5">
              <Laptop className="w-6 h-6 text-[#0d5c3a] dark:text-emerald-400" /> Manajemen Data Laptop
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Kelola spesifikasi, pengguna, dan masa sewa perangkat laptop.
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

            {userRole !== "guest" && (
              <>
                <button
                  type="button"
                  onClick={downloadTemplate}
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
                  aria-label="Upload file Excel data laptop"
                />
              </>
            )}
          </div>
        </div>

        {/* ── Card tabel ── */}
        <div className="bg-white dark:bg-[#1a2b20] rounded-2xl shadow-sm border border-gray-200 dark:border-[#213527] overflow-hidden">
          
          {/* Search Toolbar */}
          <div className="px-6 py-4 border-b border-slate-200/80 dark:border-[#263e2f] bg-slate-50/30 dark:bg-[#15241b] flex flex-col gap-4">
            
            {/* Row 1: Search, Entries & Add Button */}
            <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                <div className="relative w-full sm:w-80">
                  <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Cari pengguna, NIK, model, S/N, atau departemen..."
                    value={searchQuery}
                    onChange={handleSearch}
                    aria-label="Cari data laptop"
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-[#2a4a34] rounded-xl outline-none focus:ring-2 focus:ring-[#1b7e47] focus:border-[#1b7e47] text-sm text-gray-800 dark:text-gray-100"
                  />
                </div>

                {/* Show Entries Dropdown */}
                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 self-start sm:self-auto">
                  <span>Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="pl-3 pr-8 py-1.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-[#2a4a34] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b7e47] focus:border-[#1b7e47] text-xs cursor-pointer font-medium shadow-sm text-gray-800 dark:text-gray-100"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={10000}>All</option>
                  </select>
                  <span>entries</span>
                </div>

                {/* Reset Filters button */}
                {(filterStatus !== "Semua" || searchQuery !== "") && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold hover:underline shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 w-full xl:w-auto justify-between xl:justify-start">
                {userRole === "admin" && (
                  <button
                    type="button"
                    onClick={openModalForAdd}
                    className="flex items-center gap-2 bg-[#0d5c3a] hover:bg-[#0a462c] text-white px-5 py-2 rounded-full font-bold shadow-md shadow-[#0d5c3a]/20 transition-all text-xs shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Laptop
                  </button>
                )}
                <div className="bg-emerald-50 text-[#0d5c3a] dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 px-4 py-2 rounded-full text-xs font-bold shrink-0">
                  Total Laptop: {filteredData.length}
                </div>
              </div>
            </div>

            {/* Row 2: Filter Status & Kondisi */}
            <div className="flex flex-col items-start pt-2 border-t border-slate-100/50 dark:border-[#243d2c]">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase mb-1.5">
                STATUS & KONDISI
              </span>
              <div className="relative w-full max-w-xs">
                <select
                  value={filterStatus}
                  onChange={handleFilterStatus}
                  aria-label="Filter status dan kondisi"
                  className="w-full pl-3 pr-10 py-2 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-[#2a4a34] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7e47] focus:border-[#1b7e47] text-xs font-semibold cursor-pointer shadow-3xs appearance-none text-gray-800 dark:text-gray-100"
                >
                  <option value="Semua">Semua Status & Kondisi</option>
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

          {/* Tabel Laptop */}
          <LaptopTable
            userRole={userRole}
            filteredData={filteredData}
            onEdit={openModalForEdit}
            onDelete={askDelete}
            inventoryList={inventory}
            onNavigateToMasterBarang={handleNavigateToMaster}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />

        </div>

        {/* Modal Tambah / Edit */}
        <LaptopModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSave={handleSave}
          editingItem={editingItem}
          isSaving={isSaving}
          inventoryList={inventory}
          vendors={vendors}
        />

        {/* Modal Konfirmasi Hapus */}
        <ConfirmDeleteModal
          show={deleteConfirm.show}
          name={deleteConfirm.name}
          isSaving={isSaving}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm({ show: false, id: null, name: "" })}
        />

        {/* Toast Notifikasi */}
        {notif.show && (
          <ToastNotif
            message={notif.message}
            type={notif.type}
            onClose={() => setNotif({ show: false, message: "", type: "success" })}
          />
        )}

      </div>
    </>
  );
}
