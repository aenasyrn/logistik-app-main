// src/components/DataPerangkat/DataPrinter/index.jsx
"use client";

import React, { useState } from "react";
import {
  Printer, Search, Filter, Plus,
  AlertCircle, FileSpreadsheet, Upload, Loader2,
} from "lucide-react";

import { router }            from "@inertiajs/react";
import { usePrinterData }  from "../../../hooks/printer/usePrinterData";
import PrinterTable        from "./PrinterTable";
import PrinterModal        from "./PrinterModal";
import QrLabelModal        from "./QrLabelModal";
import ConfirmDeleteModal  from "../../Modal/ConfirmDeleteModal";
import ToastNotif          from "../../Modal/ToastNotif";
import PerpanjangSewaModal from "../../DataMaster/PerpanjangSewaModal";

export default function DataPrinter({
  userRole, printers, outlets, inventory, vendors = [],
  filterStatus: propFilterStatus, setFilterStatus: propSetFilterStatus,
  printerSearch, setPrinterSearch,
  onNavigateToMasterBarang, setView,
}) {
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: "" });
  const [perpanjangInv, setPerpanjangInv] = useState(null);
  const [isPerpanjangOpen, setIsPerpanjangOpen] = useState(false);
  const [isPerpanjangSaving, setIsPerpanjangSaving] = useState(false);

  const {
    downloadTemplate, fileInputRef, isSaving, handleFileUpload,
    openModalForAdd, koneksiError,
    searchQuery, handleSearch, filterStatus, handleFilterStatus, resetFilters,
    isLoading, paginatedData, filteredData,
    currentPage, totalPages, startIndex, itemsPerPage, setItemsPerPage, setCurrentPage,
    openModalForEdit, handleDelete,
    setQrModalData, notif, setNotif,
    isModalOpen, setIsModalOpen,
    editingId, formData, setFormData,
    outletsList, inventoryList, snList,
    handleSave, handleOutletChange, handleProdukChange, handleDateChange,
    qrModalData, exportToExcel,
  } = usePrinterData(printers, outlets, inventory, propFilterStatus, propSetFilterStatus, printerSearch, setPrinterSearch);

  const showNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
    setTimeout(() => setNotif({ show: false, message: "", type: "" }), 3500);
  };

  const handleOpenPerpanjangModal = (printerItem, matchedInv) => {
    let inv = matchedInv;
    if (!inv && printerItem) {
      inv = (inventoryList || []).find((i) => 
        (printerItem.inventory_id && Number(i.id) === Number(printerItem.inventory_id)) ||
        (printerItem.produk && i.nama && i.nama.trim().toLowerCase() === printerItem.produk.trim().toLowerCase())
      );
    }
    if (!inv && printerItem) {
      inv = {
        id: null,
        nama: printerItem.produk || "Printer",
        jenis_barang: "Printer",
        kuantitas: 1,
        satuan: "Unit",
        vendor_nama: printerItem.vendor || "",
        tanggal_mulai: printerItem.tanggalMulai || printerItem.tanggal_mulai || "",
        tanggal_selesai: printerItem.tanggalSelesai || printerItem.tanggal_selesai || "",
        status: printerItem.status || "Sewa Berjalan",
        biaya_sewa: 0,
      };
    }

    if (inv) {
      setPerpanjangInv(inv);
      setIsPerpanjangOpen(true);
    } else if (onNavigateToMasterBarang) {
      onNavigateToMasterBarang(printerItem, matchedInv);
    } else if (setView) {
      setView("master_barang_non_meubelair");
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("open-perpanjang-barang", {
            detail: {
              id: matchedInv?.id || printerItem?.inventory_id,
              nama: matchedInv?.nama || printerItem?.produk,
            },
          })
        );
      }, 100);
    }
  };

  const handlePerpanjangSubmit = (payload) => {
    if (!perpanjangInv) return;
    setIsPerpanjangSaving(true);
    
    if (perpanjangInv.id) {
      router.post(`/inventory/${perpanjangInv.id}`, { ...payload, _method: "PUT", mode_edit: "perpanjang" }, {
        onSuccess: () => {
          showNotif("Perpanjangan sewa berhasil disimpan dan disinkronkan ke seluruh printer terkait!");
          setIsPerpanjangOpen(false);
          setPerpanjangInv(null);
        },
        onError: (err) => {
          console.error(err);
          const errorMsg = typeof err === "object" ? Object.values(err).join("\n") : "Gagal memperpanjang sewa printer.";
          showNotif(errorMsg, "error");
        },
        onFinish: () => {
          setIsPerpanjangSaving(false);
        },
      });
    } else {
      router.post('/inventory', { ...payload, mode_edit: "perpanjang" }, {
        onSuccess: () => {
          showNotif("Perpanjangan sewa berhasil disimpan dan master barang dibuat!");
          setIsPerpanjangOpen(false);
          setPerpanjangInv(null);
        },
        onError: (err) => {
          console.error(err);
          const errorMsg = typeof err === "object" ? Object.values(err).join("\n") : "Gagal menyimpan perpanjangan sewa.";
          showNotif(errorMsg, "error");
        },
        onFinish: () => {
          setIsPerpanjangSaving(false);
        },
      });
    }
  };

  const askDelete = (id, nama) => setDeleteConfirm({ show: true, id, name: nama });

  const confirmDelete = async () => {
    await handleDelete(deleteConfirm.id);
    setDeleteConfirm({ show: false, id: null, name: "" });
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300 relative print:hidden">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
              <Printer className="w-6 h-6 text-[#0d5c3a] dark:text-emerald-400" /> Manajemen Data Printer
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Pantau status inventaris dan masa sewa perangkat printer
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
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
                <button type="button" onClick={downloadTemplate}
                  className="flex items-center gap-2 bg-[#279969] hover:bg-[#1e7a53] text-white px-5 py-2.5 rounded-full font-bold shadow-md shadow-[#279969]/30 transition-all text-xs cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4" /> Template Excel
                </button>

                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isSaving}
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Import Excel
                </button>

                <input type="file" accept=".xlsx, .xls, .csv" ref={fileInputRef} onChange={handleFileUpload}
                  className="hidden" aria-label="Upload file Excel data printer" />
              </>
            )}
          </div>
        </div>

        {/* ── Error koneksi ── */}
        {koneksiError && (
          <div className="mb-6 bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm">Koneksi Database Bermasalah</p>
              <p className="text-xs mt-1">Gagal terhubung ke server.</p>
            </div>
          </div>
        )}

        {/* ── Card tabel ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Search Toolbar */}
          <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/30 flex flex-col gap-4">
            {/* Row 1: Search, Entries & Add Button */}
            <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                <div className="relative w-full sm:w-80">
                  <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Cari model, S/N, atau outlet..."
                    value={searchQuery}
                    onChange={handleSearch}
                    aria-label="Cari data printer"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1b7e47] focus:border-[#1b7e47] text-sm"
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
                    className="pl-3 pr-8 py-1.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b7e47] focus:border-[#1b7e47] text-xs cursor-pointer font-medium shadow-sm"
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

              <div className="flex items-center gap-3 w-full xl:w-auto justify-between xl:justify-start">
                {userRole === "admin" && (
                  <button
                    type="button"
                    onClick={openModalForAdd}
                    className="flex items-center gap-2 bg-[#0d5c3a] hover:bg-[#0a462c] text-white px-5 py-2 rounded-full font-bold shadow-md shadow-[#0d5c3a]/20 transition-all text-xs shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Printer
                  </button>
                )}
                <div className="bg-emerald-50 text-[#0d5c3a] dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 px-4 py-2 rounded-full text-xs font-bold shrink-0">
                  Total Printer: {filteredData.length}
                </div>
              </div>
            </div>

            {/* Row 2: Filter Status & Kondisi */}
            <div className="flex flex-col items-start pt-2 border-t border-slate-100/50">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase mb-1.5">
                STATUS & KONDISI
              </span>
              <div className="relative w-full max-w-xs">
                <select
                  value={filterStatus}
                  onChange={handleFilterStatus}
                  aria-label="Filter status dan kondisi"
                  className="w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7e47] focus:border-[#1b7e47] text-xs font-semibold cursor-pointer shadow-3xs appearance-none"
                >
                  <option value="Semua">Semua Status & Kondisi</option>
                  {filterStatus === "warning" && (
                    <option value="warning">Peringatan Sewa</option>
                  )}
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
          <PrinterTable
            isLoading={isLoading}
            paginatedData={paginatedData}
            filteredData={filteredData}
            userRole={userRole}
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            onEdit={openModalForEdit}
            onDelete={(id, nama) => askDelete(id, nama)}
            onQr={setQrModalData}
            inventoryList={inventoryList}
            onNavigateToMasterBarang={handleOpenPerpanjangModal}
          />
        </div>
      </div>

      {/* ── Modal Perpanjang Masa Sewa ── */}
      <PerpanjangSewaModal
        isOpen={isPerpanjangOpen}
        item={perpanjangInv}
        vendors={vendors}
        isSaving={isPerpanjangSaving}
        onClose={() => {
          setIsPerpanjangOpen(false);
          setPerpanjangInv(null);
        }}
        onSubmit={handlePerpanjangSubmit}
      />

      {/* ── Modal Tambah / Edit ── */}
      <PrinterModal
        isOpen={isModalOpen}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        isSaving={isSaving}
        outletsList={outletsList}
        inventoryList={inventoryList}
        snList={snList}
        vendors={vendors}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onOutletChange={handleOutletChange}
        onProdukChange={handleProdukChange}
        onDateChange={handleDateChange}
      />

      {/* ── Modal QR Code ── */}
      <QrLabelModal data={qrModalData} onClose={() => setQrModalData(null)} />

      {/* ── Modal Konfirmasi Hapus ── */}
      <ConfirmDeleteModal
        show={deleteConfirm.show}
        name={deleteConfirm.name}
        isSaving={isSaving}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: null, name: "" })}
      />

      {/* ── Fullscreen Glassmorphic Loading Overlay ── */}
      {isSaving && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/95 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4 border border-slate-100 text-center animate-in zoom-in-95 duration-300">
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <div className="absolute w-12 h-12 rounded-full border-4 border-blue-100 animate-ping opacity-25" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-base">Sedang Memproses Data</h4>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Harap tunggu beberapa saat. Sistem sedang memproses dan memvalidasi data Anda...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notifikasi ── */}
      <ToastNotif
        show={notif.show}
        message={notif.message}
        type={notif.type}
        onClose={() => setNotif({ show: false, message: "", type: "" })}
      />
    </>
  );
}