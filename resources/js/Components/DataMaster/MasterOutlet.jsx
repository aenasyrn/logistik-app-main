// resources/js/Components/DataMaster/MasterOutlet.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  MapPin,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileSpreadsheet,
  Upload,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { router } from "@inertiajs/react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { importOutletCSV, downloadTemplate } from "../../services/outletService";
import OutletFormModal from "./OutletFormModal";
import ToastNotif from "../Modal/ToastNotif";

export default function MasterOutlet({ outlets, userRole }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [localOutlets, setLocalOutlets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    id: null,
    name: "",
  });
  const [editingOutlet, setEditingOutlet] = useState(null);
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsSaving(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async ({ data }) => {
        try {
          const total = await importOutletCSV("logistikku_app_01", data);
          showLocalNotif(`Sukses! ${total} data instansi berhasil di-import.`, "success", () => {
            router.reload({ only: ['outlets', 'activityLogs'] });
          });
        } catch (err) {
          console.error(err);
          const errorMsg = err.response?.data?.message || err.message || "Gagal import! Pastikan kolom header persis seperti template.";
          showLocalNotif(errorMsg, "error");
        } finally {
          setIsSaving(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
      error: (err) => {
        console.error(err);
        showLocalNotif("Gagal membaca file CSV.", "error");
        setIsSaving(false);
      },
    });
  };

  const exportToExcel = () => {
    const rows = filteredOutlets.map((item, index) => ({
      "No": index + 1,
      "Kode Outlet": item.code || "",
      "Nama Outlet / Instansi": item.nama || "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Instansi");
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...rows.map((r) => String(r[key]).length)) + 2,
    }));
    ws["!cols"] = colWidths;
    XLSX.writeFile(wb, `Data_Instansi_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  useEffect(() => {
    setLocalOutlets(outlets || []);
  }, [outlets]);

  const showLocalNotif = (message, type = "success", onOk = null) => {
    setNotif({ show: true, message, type, onOk });
  };

  const filteredOutlets = localOutlets.filter((out) => {
    const q = searchQuery.toLowerCase();
    return (
      out.nama?.toLowerCase().includes(q) || out.code?.toLowerCase().includes(q)
    );
  });

  const openAdd = () => {
    setEditingOutlet(null);
    setIsModalOpen(true);
  };
  const openEdit = (out) => {
    setEditingOutlet(out);
    setIsModalOpen(true);
  };
  const askDelete = (out) => {
    setDeleteConfirm({ show: true, id: out.id, name: out.nama });
  };

  const confirmDeleteAction = () => {
    setIsSaving(true);
    router.delete(`/outlets/${deleteConfirm.id}`, {
      onSuccess: () => {
        showLocalNotif("Instansi berhasil dihapus!", "success");
        setDeleteConfirm({ show: false, id: null, name: "" });
      },
      onError: (err) => {
        console.error(err);
        showLocalNotif("Gagal menghapus data instansi.", "error");
      },
      onFinish: () => {
        setIsSaving(false);
      }
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const codeVal = form.get("kode");
    const namaVal = form.get("nama");

    setIsSaving(true);
    const payload = {
      kode: codeVal,
      nama: namaVal,
    };

    if (editingOutlet) {
      router.post(`/outlets/${editingOutlet.id}`, { ...payload, _method: "PUT" }, {
        onSuccess: () => {
          setIsModalOpen(false);
          showLocalNotif("Instansi diperbarui!", "success");
        },
        onError: (err) => {
          console.error(err);
          const errorMsg = Object.values(err).join("\n");
          showLocalNotif(errorMsg || "Gagal mengupdate instansi!", "error");
        },
        onFinish: () => {
          setIsSaving(false);
        }
      });
    } else {
      router.post("/outlets", payload, {
        onSuccess: () => {
          setIsModalOpen(false);
          showLocalNotif("Instansi berhasil ditambahkan!", "success");
        },
        onError: (err) => {
          console.error(err);
          const errorMsg = Object.values(err).join("\n");
          showLocalNotif(errorMsg || "Gagal menambahkan instansi!", "error");
        },
        onFinish: () => {
          setIsSaving(false);
        }
      });
    }
  };

  const totalPages = Math.ceil(filteredOutlets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOutlets = filteredOutlets.slice(startIndex, startIndex + itemsPerPage);

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
            <MapPin className="w-6 h-6 text-blue-600" /> Master Data Instansi
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Kelola kode, nama, dan data instansi/outlet yang terdaftar.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={exportToExcel}
            disabled={filteredOutlets.length === 0}
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
                aria-label="Upload file CSV data instansi"
              />
            </>
          )}
        </div>
      </div>

      {/* ==================== TABEL UTAMA ==================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/30 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Cari nama atau kode..."
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
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              {userRole === "admin" && (
                <button
                  onClick={openAdd}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Outlet
                </button>
              )}
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-semibold shrink-0">
                Total: {filteredOutlets.length}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-blue-900 text-slate-100 text-[11px] font-bold uppercase tracking-wider text-center">
                  <th className="p-2.5 w-12 text-center align-middle border border-blue-800 bg-blue-900">
                    No
                  </th>
                  <th className="p-2.5 w-40 text-left align-middle border border-blue-800 bg-blue-900">
                    Kode Outlet
                  </th>
                  <th className="p-2.5 text-left align-middle border border-blue-800 bg-blue-900">
                    Nama Outlet / Instansi
                  </th>
                  {userRole === "admin" && (
                    <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="text-xs text-gray-800 bg-white">
                {paginatedOutlets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={userRole === "admin" ? "4" : "3"}
                      className="p-4 text-center text-gray-400 border border-slate-200 bg-white"
                    >
                      Belum ada data instansi.
                    </td>
                  </tr>
                ) : (
                  paginatedOutlets.map((out, index) => {
                    const isEven = index % 2 !== 0;
                    const isSelected = selectedId === out.id;
                    const isHovered = hoveredId === out.id;
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
                        key={out.id}
                        onMouseEnter={() => setHoveredId(out.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => setSelectedId((prev) => (prev === out.id ? null : out.id))}
                        className={`transition-colors duration-150 cursor-pointer ${bgClass}`}
                      >
                        <td className="p-2 border border-slate-200 text-center align-middle font-medium text-gray-500">
                          {globalIndex}
                        </td>
                        <td className="p-2 border border-slate-200 align-middle font-mono text-xs text-gray-700">
                          {out.code || "-"}
                        </td>
                        <td className="p-2 border border-slate-200 align-middle font-semibold text-gray-900">
                          {out.nama}
                        </td>
                        {userRole === "admin" && (
                          <td className="p-2 border border-slate-200 text-center align-middle">
                            <div className="flex justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => openEdit(out)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => askDelete(out)}
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
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/30">
            <span className="text-xs text-gray-500">
              Menampilkan {startIndex + 1} sampai {Math.min(startIndex + itemsPerPage, filteredOutlets.length)} dari {filteredOutlets.length} data
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

      {/* ==================== MODAL TAMBAH/EDIT (DIPANGGIL DARI FILE LAIN) ==================== */}
      {userRole === "admin" && (
        <OutletFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingOutlet={editingOutlet}
          onSubmit={onSubmit}
          isSaving={isSaving}
        />
      )}

      {/* ==================== MODAL KONFIRMASI HAPUS ==================== */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Konfirmasi Hapus</h3>
              <p className="text-sm text-gray-500">
                Yakin hapus{" "}
                <span className="font-bold">{deleteConfirm.name}</span>?
              </p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={() =>
                  setDeleteConfirm({ show: false, id: null, name: "" })
                }
                disabled={isSaving}
                className="flex-1 px-4 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50 border-r"
              >
                BATAL
              </button>
              <button
                onClick={confirmDeleteAction}
                disabled={isSaving}
                className="flex-1 px-4 py-4 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "YA, HAPUS"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TOAST NOTIFICATION ==================== */}
      <ToastNotif
        show={notif.show}
        message={notif.message}
        type={notif.type}
        onClose={() => {
          setNotif({ show: false, message: "", type: "" });
          if (notif.onOk) notif.onOk();
        }}
      />
    </div>
  );
}
