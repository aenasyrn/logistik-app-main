// resources/js/Components/DataMaster/MasterOutlet.jsx
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
  ChevronRight,
  Filter,
  RotateCcw
} from "lucide-react";
import { router } from "@inertiajs/react";
import * as XLSX from "xlsx";
import { importOutletCSV, downloadTemplate } from "../../services/outletService";
import { parseExcelFile } from "../../utils/excelHelper";
import OutletFormModal from "./OutletFormModal";
import ToastNotif from "../Modal/ToastNotif";

export default function MasterOutlet({ outlets, userRole = "user", outletAreas = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterArea, setFilterArea] = useState("all");
  const [filterCP, setFilterCP] = useState("all");
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

  const predefinedAreas = useMemo(() => [
    "AREA SENEN",
    "AREA KRAMAT JATI",
    "AREA JATIWARINGIN",
    "AREA BEKASI",
    "AREA BOGOR"
  ], []);

  // Extract unique Area list
  const uniqueAreas = useMemo(() => {
    const set = new Set(predefinedAreas);
    (outletAreas || []).forEach((a) => {
      if (a.nama) set.add(String(a.nama).trim().toUpperCase());
    });
    (localOutlets || []).forEach((o) => {
      if (o.area && String(o.area).trim()) {
        set.add(String(o.area).trim().toUpperCase());
      }
    });
    return Array.from(set).sort();
  }, [localOutlets, predefinedAreas, outletAreas]);

  // Extract unique CP (Cabang) list based on selected Area
  const uniqueCPs = useMemo(() => {
    const set = new Set();
    (localOutlets || []).forEach((o) => {
      const oArea = (o.area || "").trim().toUpperCase();
      const oCabang = (o.cabang || "").trim();
      if (!oCabang) return;

      if (filterArea === "all" || oArea === filterArea.toUpperCase()) {
        set.add(oCabang);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "id", { sensitivity: "base" }));
  }, [localOutlets, filterArea]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsSaving(true);
    try {
      const data = await parseExcelFile(file);
      const total = await importOutletCSV("logistikku_app_01", data);
      showLocalNotif(`Sukses! ${total} data instansi berhasil di-import.`, "success", () => {
        router.reload({ only: ['outlets', 'activityLogs'] });
      });
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.message || "Gagal import! Pastikan file Excel valid dan kolom header sesuai template.";
      showLocalNotif(errorMsg, "error");
    } finally {
      setIsSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filteredOutlets = useMemo(() => {
    return localOutlets.filter((out) => {
      const q = searchQuery.toLowerCase().trim();
      const code = (out.code || "-").toLowerCase();
      const nama = (out.nama || "").toLowerCase();
      const area = (out.area || "").toLowerCase();
      const cabang = (out.cabang || "").toLowerCase();
      const typeOutlet = (out.type_outlet || "").toLowerCase();
      const typeBangunan = (out.type_bangunan || "").toLowerCase();
      const statusGedung = (out.status_gedung || "").toLowerCase();
      const alamat = (out.alamat || "").toLowerCase();
      const kelurahan = (out.kelurahan || "").toLowerCase();
      const kecamatan = (out.kecamatan || "").toLowerCase();
      const kabKota = (out.kab_kota || "").toLowerCase();
      const provinsi = (out.provinsi || "").toLowerCase();

      // Filter Area
      if (filterArea !== "all") {
        const outArea = (out.area || "").trim().toUpperCase();
        if (outArea !== filterArea.toUpperCase()) {
          return false;
        }
      }

      // Filter CP
      if (filterCP !== "all") {
        const outCabang = (out.cabang || "").trim().toUpperCase();
        if (outCabang !== filterCP.toUpperCase()) {
          return false;
        }
      }

      if (!q) return true;

      return (
        nama.includes(q) ||
        code.includes(q) ||
        area.includes(q) ||
        cabang.includes(q) ||
        typeOutlet.includes(q) ||
        typeBangunan.includes(q) ||
        statusGedung.includes(q) ||
        alamat.includes(q) ||
        kelurahan.includes(q) ||
        kecamatan.includes(q) ||
        kabKota.includes(q) ||
        provinsi.includes(q)
      );
    });
  }, [localOutlets, searchQuery, filterArea, filterCP]);

  const isFiltered = filterArea !== "all" || filterCP !== "all" || searchQuery.trim() !== "";

  const resetFilters = () => {
    setSearchQuery("");
    setFilterArea("all");
    setFilterCP("all");
    setCurrentPage(1);
  };

  const exportToExcel = () => {
    const rows = filteredOutlets.map((item, index) => ({
      "No": index + 1,
      "Kode Outlet": item.code && item.code.startsWith("OT_") ? "-" : item.code || "",
      "Nama Outlet / Instansi": item.nama || "",
      "Area": item.area || "",
      "CP / Cabang": item.cabang || "",
      "Tipe Outlet": item.type_outlet || "",
      "Tipe Bangunan": item.type_bangunan || "",
      "Status Gedung": item.status_gedung || "",
      "Alamat": item.alamat || "",
      "Kelurahan": item.kelurahan || "",
      "Kecamatan": item.kecamatan || "",
      "Kab/Kota": item.kab_kota || "",
      "Provinsi": item.provinsi || "",
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
      area: form.get("area"),
      cabang: form.get("cabang"),
      type_outlet: form.get("type_outlet"),
      type_bangunan: form.get("type_bangunan"),
      status_gedung: form.get("status_gedung"),
      alamat: form.get("alamat"),
      kelurahan: form.get("kelurahan"),
      kecamatan: form.get("kecamatan"),
      kab_kota: form.get("kab_kota"),
      provinsi: form.get("provinsi"),
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
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
              <MapPin className="w-6 h-6 text-[#0d5c3a] dark:text-emerald-400" /> Master Data Instansi
            </h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Kelola kode, nama, dan data instansi/outlet yang terdaftar.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={exportToExcel}
            disabled={filteredOutlets.length === 0}
            className="flex items-center gap-2 bg-[#279969] hover:bg-[#1e7a53] disabled:bg-[#279969]/50 text-white px-5 py-2.5 rounded-full font-bold shadow-md shadow-[#279969]/30 transition-all text-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
          {userRole === "admin" && (
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
                aria-label="Upload file Excel data instansi"
              />
            </>
          )}
        </div>
      </div>

      {/* ==================== TABEL UTAMA ==================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/30 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Cari nama, kode, area, CP..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-xs shadow-sm"
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
                  className="pl-3 pr-8 py-1.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs cursor-pointer font-medium shadow-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={10000}>All</option>
                </select>
                <span>entries</span>
              </div>

              {/* Reset Filters button if any filter active */}
              {isFiltered && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-red-600 hover:text-red-800 font-semibold hover:underline shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
              {userRole === "admin" && (
                <button
                  onClick={openAdd}
                  className="bg-[#0d5c3a] hover:bg-[#0a462c] text-white px-5 py-2 rounded-full text-xs font-bold shadow-md shadow-[#0d5c3a]/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Outlet
                </button>
              )}
              <div className="bg-emerald-50 text-[#0d5c3a] dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 px-4 py-2 rounded-full text-xs font-bold shrink-0">
                Total: {filteredOutlets.length}
              </div>
            </div>
          </div>

          {/* Row 2: Filter Area & Filter Cabang / CP */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100/50">
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase mb-1.5">
                AREA
              </span>
              <div className="relative w-48 sm:w-52">
                <select
                  value={filterArea}
                  onChange={(e) => {
                    setFilterArea(e.target.value);
                    setFilterCP("all");
                    setCurrentPage(1);
                  }}
                  aria-label="Filter area"
                  className="w-full pl-3 pr-8 py-2 bg-white dark:bg-[#1a2b20] text-gray-800 dark:text-white border border-gray-300 dark:border-[#2b4533] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs font-semibold cursor-pointer shadow-3xs appearance-none"
                >
                  <option value="all">Semua Area</option>
                  {uniqueAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2.5 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase mb-1.5">
                CABANG / CP
              </span>
              <div className="relative w-52 sm:w-60">
                <select
                  value={filterCP}
                  onChange={(e) => {
                    setFilterCP(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Filter cabang / CP"
                  className="w-full pl-3 pr-8 py-2 bg-white dark:bg-[#1a2b20] text-gray-800 dark:text-white border border-gray-300 dark:border-[#2b4533] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs font-semibold cursor-pointer shadow-3xs appearance-none"
                >
                  <option value="all">
                    {filterArea === "all" ? "Semua Cabang / CP" : `Semua CP (${filterArea})`}
                  </option>
                  {uniqueCPs.map((cp) => (
                    <option key={cp} value={cp}>
                      {cp}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2.5 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-[#0d5c3a] text-slate-100 text-[11px] font-bold uppercase tracking-wider text-center">
                  <th className="p-2.5 w-12 text-center align-middle border border-[#0a4228] bg-[#0d5c3a] whitespace-nowrap">
                    No
                  </th>
                  <th className="p-2.5 min-w-[110px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a] whitespace-nowrap">
                    Kode Outlet
                  </th>
                  <th className="p-2.5 min-w-[300px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a] whitespace-nowrap">
                    Nama Outlet / Instansi
                  </th>
                  <th className="p-2.5 min-w-[120px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a] whitespace-nowrap">
                    Tipe Outlet
                  </th>
                  <th className="p-2.5 min-w-[120px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a] whitespace-nowrap">
                    Tipe Bangunan
                  </th>
                  <th className="p-2.5 min-w-[120px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a] whitespace-nowrap">
                    Status Gedung
                  </th>
                  <th className="p-2.5 min-w-[220px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a] whitespace-nowrap">
                    Alamat
                  </th>
                  <th className="p-2.5 min-w-[120px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a] whitespace-nowrap">
                    Kelurahan
                  </th>
                  <th className="p-2.5 min-w-[120px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a] whitespace-nowrap">
                    Kecamatan
                  </th>
                  <th className="p-2.5 min-w-[130px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a] whitespace-nowrap">
                    Kab/Kota
                  </th>
                  <th className="p-2.5 min-w-[130px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a] whitespace-nowrap">
                    Provinsi
                  </th>
                  {userRole === "admin" && (
                    <th className="p-2.5 min-w-[80px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a] whitespace-nowrap">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="text-xs text-gray-800 bg-white">
                {paginatedOutlets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={userRole === "admin" ? "12" : "11"}
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
                        <td className="p-2 border border-slate-200 text-center align-middle font-medium text-gray-500 whitespace-nowrap">
                          {globalIndex}
                        </td>
                        <td className="p-2 border border-slate-200 align-middle font-mono text-xs text-gray-700 whitespace-nowrap">
                          {out.code && out.code.startsWith("OT_") ? "-" : out.code || "-"}
                        </td>
                        <td className="p-2 min-w-[300px] border border-slate-200 align-middle font-semibold text-gray-900 leading-snug">
                          {out.nama}
                        </td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600 whitespace-nowrap">
                          {out.type_outlet || "-"}
                        </td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600 whitespace-nowrap">
                          {out.type_bangunan || "-"}
                        </td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600 whitespace-nowrap">
                          {out.status_gedung || "-"}
                        </td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600 max-w-xs truncate" title={out.alamat}>
                          {out.alamat || "-"}
                        </td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600 whitespace-nowrap">
                          {out.kelurahan || "-"}
                        </td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600 whitespace-nowrap">
                          {out.kecamatan || "-"}
                        </td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600 whitespace-nowrap">
                          {out.kab_kota || "-"}
                        </td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600 whitespace-nowrap">
                          {out.provinsi || "-"}
                        </td>
                        {userRole === "admin" && (
                          <td className="p-2 border border-slate-200 text-center align-middle whitespace-nowrap">
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
          outlets={outlets}
          userRole={userRole}
          outletAreas={outletAreas}
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
