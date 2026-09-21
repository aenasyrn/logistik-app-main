// resources/js/Components/DataMaster/MasterVendor.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  Building2,
  Edit,
  Trash2,
  Loader2,
  FileSpreadsheet,
  Upload,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { router } from "@inertiajs/react";
import * as XLSX from "xlsx";
import { importVendorCSV, downloadVendorTemplate } from "../../services/vendorService";
import { parseExcelFile } from "../../utils/excelHelper";
import VendorFormModal from "./VendorFormModal";
import ConfirmDeleteModal from "../Modal/ConfirmDeleteModal";
import ToastNotif from "../Modal/ToastNotif";

export default function MasterVendor({ vendors = [], userRole = "user" }) {
  const canAdd = userRole === "admin" || userRole === "logistic_officer" || userRole === "user";
  const [searchQuery, setSearchQuery] = useState("");
  const [localVendors, setLocalVendors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    id: null,
    name: "",
  });
  const [editingVendor, setEditingVendor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notif, setNotif] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const fileInputRef = useRef(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsSaving(true);
    try {
      const data = await parseExcelFile(file);
      const total = await importVendorCSV("logistikku_app_01", data);
      if (total === 0) {
        showLocalNotif("Gagal import! Tidak ada data vendor valid yang dapat dibaca. Pastikan nama perusahaan terisi.", "error");
      } else {
        router.reload();
        showLocalNotif(`Sukses! ${total} data vendor berhasil di-import.`, "success");
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.message || "Gagal import! Pastikan kolom header persis seperti template.";
      showLocalNotif(errorMsg, "error");
    } finally {
      setIsSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const exportToExcel = () => {
    const rows = filteredVendors.map((item, index) => {
      let masaBerlaku = "-";
      if (item.tgl_awal_drm && item.tgl_akhir_drm) {
        masaBerlaku = `${formatDate(item.tgl_awal_drm)} s/d ${formatDate(item.tgl_akhir_drm)}`;
      } else if (item.tgl_awal_drm) {
        masaBerlaku = formatDate(item.tgl_awal_drm);
      } else if (item.tgl_akhir_drm) {
        masaBerlaku = formatDate(item.tgl_akhir_drm);
      }

      return {
        "No": index + 1,
        "Nama Perusahaan": item.nama || "",
        "Pimpinan": item.pimpinan || "-",
        "Jabatan": item.jabatan || "-",
        "Bidang": item.bidang || "-",
        "Sertifikat DRM": item.sertifikat_drm || "-",
        "Masa Berlaku": masaBerlaku,
        "Kota": item.kota || "-",
        "No Telpon": item.no_telpon || "-",
        "Alamat": item.alamat || "-",
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Vendor");
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...rows.map((r) => String(r[key]).length)) + 2,
    }));
    ws["!cols"] = colWidths;
    XLSX.writeFile(wb, `Data_Vendor_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  useEffect(() => {
    setLocalVendors(vendors || []);
  }, [vendors]);

  const showLocalNotif = (message, type = "success", onOk = null) => {
    setNotif({ show: true, message, type, onOk });
  };

  const filteredVendors = localVendors.filter((v) => {
    const q = searchQuery.toLowerCase();
    const nama = (v.nama || "").toLowerCase();
    const pimpinan = (v.pimpinan || "").toLowerCase();
    const jabatan = (v.jabatan || "").toLowerCase();
    const bidang = (v.bidang || "").toLowerCase();
    const sertifikatDrm = (v.sertifikat_drm || "").toLowerCase();
    const tglAwal = (v.tgl_awal_drm || "").toLowerCase();
    const tglAkhir = (v.tgl_akhir_drm || "").toLowerCase();
    const kota = (v.kota || "").toLowerCase();
    const email = (v.email || "").toLowerCase();
    const telp = (v.no_telpon || "").toLowerCase();
    const alamat = (v.alamat || "").toLowerCase();
    return (
      nama.includes(q) ||
      pimpinan.includes(q) ||
      jabatan.includes(q) ||
      bidang.includes(q) ||
      sertifikatDrm.includes(q) ||
      tglAwal.includes(q) ||
      tglAkhir.includes(q) ||
      kota.includes(q) ||
      email.includes(q) ||
      telp.includes(q) ||
      alamat.includes(q)
    );
  });

  const openAdd = () => {
    setEditingVendor(null);
    setIsModalOpen(true);
  };
  const openEdit = (v) => {
    setEditingVendor(v);
    setIsModalOpen(true);
  };
  const askDelete = (v) => {
    setDeleteConfirm({ show: true, id: v.id, name: v.nama });
  };

  const confirmDeleteAction = () => {
    setIsSaving(true);
    router.delete(`/vendors/${deleteConfirm.id}`, {
      onSuccess: () => {
        showLocalNotif("Data vendor berhasil dihapus!", "success");
        setDeleteConfirm({ show: false, id: null, name: "" });
      },
      onError: (err) => {
        console.error(err);
        showLocalNotif("Gagal menghapus data vendor.", "error");
      },
      onFinish: () => {
        setIsSaving(false);
      }
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const namaVal = form.get("nama");

    setIsSaving(true);
    const payload = {
      nama: namaVal,
      pimpinan: form.get("pimpinan"),
      jabatan: form.get("jabatan"),
      bidang: form.get("bidang"),
      sertifikat_drm: form.get("sertifikat_drm"),
      tgl_awal_drm: form.get("tgl_awal_drm") || null,
      tgl_akhir_drm: form.get("tgl_akhir_drm") || null,
      kota: form.get("kota"),
      email: form.get("email"),
      no_telpon: form.get("no_telpon"),
      alamat: form.get("alamat"),
    };

    if (editingVendor) {
      router.post(`/vendors/${editingVendor.id}`, { ...payload, _method: "PUT" }, {
        onSuccess: () => {
          setIsModalOpen(false);
          showLocalNotif("Data vendor diperbarui!", "success");
        },
        onError: (err) => {
          console.error(err);
          const errorMsg = Object.values(err).join("\n");
          showLocalNotif(errorMsg || "Gagal mengupdate vendor!", "error");
        },
        onFinish: () => {
          setIsSaving(false);
        }
      });
    } else {
      router.post("/vendors", payload, {
        onSuccess: () => {
          setIsModalOpen(false);
          showLocalNotif("Vendor berhasil ditambahkan!", "success");
        },
        onError: (err) => {
          console.error(err);
          const errorMsg = Object.values(err).join("\n");
          showLocalNotif(errorMsg || "Gagal menambahkan vendor!", "error");
        },
        onFinish: () => {
          setIsSaving(false);
        }
      });
    }
  };

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVendors = filteredVendors.slice(startIndex, startIndex + itemsPerPage);

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
      {/* Toast Notification */}
      <ToastNotif
        show={notif.show}
        message={notif.message}
        type={notif.type}
        onClose={() => {
          setNotif({ ...notif, show: false });
          if (notif.onOk) notif.onOk();
        }}
      />

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-[#0d5c3a] dark:text-emerald-400" /> Master Data Vendor
            </h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data vendor partner, email kontak, nomor telepon, dan alamat penyedia barang/jasa.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={exportToExcel}
            disabled={filteredVendors.length === 0}
            className="flex items-center gap-2 bg-[#279969] hover:bg-[#1e7a53] disabled:bg-[#279969]/50 text-white px-5 py-2.5 rounded-full font-bold shadow-md shadow-[#279969]/30 transition-all text-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
          {userRole === "admin" && (
            <>
              <button
                type="button"
                onClick={downloadVendorTemplate}
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
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Import Excel
              </button>

              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Upload file Excel data vendor"
              />
            </>
          )}
        </div>
      </div>

      {/* ==================== TABEL UTAMA ==================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/30 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari vendor, email, telp, alamat..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                />
              </div>

              {/* Show Entries selector */}
              <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                <span>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  aria-label="Jumlah baris per halaman"
                  className="pl-2 pr-6 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs cursor-pointer font-medium"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={10000}>All</option>
                </select>
                <span>entries</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              {userRole === "admin" && (
                <button
                  onClick={openAdd}
                  className="bg-[#0d5c3a] hover:bg-[#0a462c] text-white px-5 py-2 rounded-full text-xs font-bold shadow-md shadow-[#0d5c3a]/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Vendor
                </button>
              )}
              <div className="bg-emerald-50 text-[#0d5c3a] dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 px-4 py-2 rounded-full text-xs font-bold shrink-0">
                Total: {filteredVendors.length} Vendor
              </div>
            </div>
          </div>
        </div>

        {/* Tabel */}
        <div className="px-4 py-3">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse border border-slate-200 min-w-[900px]">
              <thead>
                <tr className="bg-[#0d5c3a] text-slate-100 text-[11px] font-bold uppercase tracking-wider text-center">
                  <th className="p-2.5 w-12 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">No</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Nama Perusahaan</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Pimpinan &amp; Jabatan</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Bidang</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Sertifikat DRM</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Masa Berlaku</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Kota</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Kontak</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Alamat</th>
                  {userRole === "admin" && (
                    <th className="p-2.5 min-w-[110px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a] whitespace-nowrap">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="text-xs text-gray-800 bg-white">
                {paginatedVendors.length === 0 ? (
                  <tr>
                    <td colSpan={userRole === "admin" ? 10 : 9} className="p-6 text-center text-gray-400 border border-slate-200 bg-white">
                      Tidak ada data vendor ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedVendors.map((v, index) => {
                    const isEven = index % 2 !== 0;
                    const isSelected = selectedId === v.id;
                    const isHovered = hoveredId === v.id;
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
                        key={v.id}
                        onMouseEnter={() => setHoveredId(v.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => setSelectedId((prev) => (prev === v.id ? null : v.id))}
                        className={`transition-colors duration-150 cursor-pointer ${bgClass}`}
                      >
                        <td className="p-2.5 border border-slate-200 text-center align-middle font-medium text-gray-500">
                          {globalIndex}
                        </td>
                        <td className="p-2.5 border border-slate-200 align-middle font-semibold text-gray-900">
                          <div className="relative group cursor-default">
                            {v.nama}
                            <div className="absolute left-0 top-full mt-1 z-[999] hidden group-hover:block bg-gray-900 text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl pointer-events-none">
                              <p className="!text-gray-400 mb-0.5">Database ID</p>
                              <p className="font-mono !text-white">{v.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-2.5 border border-slate-200 align-middle text-gray-700 font-medium">
                          {v.pimpinan || v.jabatan ? (
                            <div>
                              <span>{v.pimpinan || "-"}</span>
                              {v.jabatan && <span className="text-gray-500 font-normal text-[11px] block">{v.jabatan}</span>}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-2.5 border border-slate-200 align-middle text-gray-700 font-medium">
                          {v.bidang || "-"}
                        </td>
                        <td className="p-2.5 border border-slate-200 align-middle text-gray-700 font-medium whitespace-nowrap">
                          {v.sertifikat_drm ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                              {v.sertifikat_drm}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-2.5 border border-slate-200 align-middle text-gray-700 text-center font-medium whitespace-nowrap">
                          {v.tgl_awal_drm || v.tgl_akhir_drm ? (
                            <div className="flex flex-col text-[11px] leading-tight">
                              <span className="font-semibold text-gray-800">{formatDate(v.tgl_awal_drm)}</span>
                              <span className="text-gray-400 text-[10px]">s/d</span>
                              <span className="font-semibold text-gray-800">{formatDate(v.tgl_akhir_drm)}</span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-2.5 border border-slate-200 align-middle text-gray-700 font-medium">
                          {v.kota || "-"}
                        </td>
                        <td className="p-2.5 border border-slate-200 align-middle text-gray-700 font-medium">
                          <div className="flex flex-col text-xs gap-0.5">
                            {v.no_telpon && <span className="font-medium text-gray-800">{v.no_telpon}</span>}
                            {v.email && (
                              <a href={`mailto:${v.email}`} className="text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                                {v.email}
                              </a>
                            )}
                            {!v.no_telpon && !v.email && <span className="text-gray-400">-</span>}
                          </div>
                        </td>
                        <td className="p-2.5 border border-slate-200 align-middle text-gray-700 font-normal">
                          {v.alamat || "-"}
                        </td>
                        {userRole === "admin" && (
                          <td className="px-3 py-2 border border-slate-200 text-center align-middle">
                            <div className="flex justify-center gap-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => openEdit(v)}
                                title="Edit Vendor"
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => askDelete(v)}
                                title="Hapus Vendor"
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
        </div>

        {/* Footer & Pagination */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="text-xs text-gray-500">
            Menampilkan {paginatedVendors.length > 0 ? startIndex + 1 : 0} sampai{" "}
            {Math.min(startIndex + itemsPerPage, filteredVendors.length)} dari {filteredVendors.length} Vendor
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getVisiblePages().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    currentPage === page
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form Tambah/Edit & Hapus (Admin Only) */}
      {userRole === "admin" && (
        <>
          <VendorFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            editingVendor={editingVendor}
            onSubmit={onSubmit}
            isSaving={isSaving}
          />

          <ConfirmDeleteModal
            isOpen={deleteConfirm.show}
            onClose={() => setDeleteConfirm({ show: false, id: null, name: "" })}
            onConfirm={confirmDeleteAction}
            itemName={deleteConfirm.name}
            isSaving={isSaving}
          />
        </>
      )}
    </div>
  );
}
