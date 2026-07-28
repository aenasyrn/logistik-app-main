// resources/js/Components/Bangunan/DaftarTanah/index.jsx
"use client";

import React, { useState, useRef } from "react";
import { Map, Search, Plus, FileSpreadsheet, Edit, Trash2, X, Loader2, Upload } from "lucide-react";
import axios from "axios";
import { router } from "@inertiajs/react";
import * as XLSX from "xlsx";
import Papa from "papaparse";

import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";
import ToastNotif from "../../Modal/ToastNotif";
import { importLandCSV, downloadLandTemplate } from "../../../services/landService";

export default function DaftarTanah({ userRole, lands = [], landFilter = "", setLandFilter }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  React.useEffect(() => {
    const handleReset = () => {
      setSearchQuery("");
      setCurrentPage(1);
    };
    window.addEventListener("reset-all-filters", handleReset);
    return () => window.removeEventListener("reset-all-filters", handleReset);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCell, setSelectedCell] = useState({ id: null, field: null });
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [hoveredGroupNo, setHoveredGroupNo] = useState(null);

  const [formData, setFormData] = useState({
    unit_kerja: "",
    alamat: "",
    peruntukan: "",
    aset_sap: "",
    no_shgb: "",
    no_sertifikat: "",
    no_sertifikat_gabungan: "",
    no_imb: "",
    nama_pemilik_imb: "",
    tgl_mulai_shgb: "",
    tgl_berakhir_shgb: "",
    tahun_perolehan: "",
    luas_tanah: "",
    luas_pagar: "",
    luas_bangunan: "",
    keterangan: "",
  });

  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: "" });
  const [notif, setNotif] = useState({ show: false, message: "", type: "success" });

  const showNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
  };

  const uniqueUnits = [...new Set(lands.map((item) => item.unit_kerja).filter(Boolean))];

  const handleUnitKerjaChange = (e) => {
    const value = e.target.value;
    setFormData((p) => {
      const updated = { ...p, unit_kerja: value };
      if (!editingId && value) {
        const existing = lands.find(
          (l) => (l.unit_kerja || "").toLowerCase().trim() === value.toLowerCase().trim()
        );
        if (existing) {
          updated.alamat = existing.alamat || "";
          updated.no_imb = existing.no_imb || "";
          updated.nama_pemilik_imb = existing.nama_pemilik_imb || "";
          updated.luas_pagar = existing.luas_pagar !== null && existing.luas_pagar !== undefined ? String(existing.luas_pagar) : "";
          updated.luas_bangunan = existing.luas_bangunan !== null && existing.luas_bangunan !== undefined ? String(existing.luas_bangunan) : "";
        }
      }
      return updated;
    });
  };

  const isItemSelected = (item) => {
    if (!selectedUnit) return false;
    if (item.unit_kerja && item.unit_kerja.trim() !== "") {
      return item.unit_kerja === selectedUnit;
    }
    return String(item.id) === String(selectedUnit);
  };

  const handleCellClick = (id, field) => {
    const clickedItem = lands.find((l) => l.id === id);
    if (!clickedItem) return;
    const unit = (clickedItem.unit_kerja && clickedItem.unit_kerja.trim() !== "")
      ? clickedItem.unit_kerja
      : String(clickedItem.id);
    setSelectedUnit((prev) => (prev === unit ? null : unit));
  };

  const getCellClass = (item, field, extraClass = "") => {
    const isSelected = isItemSelected(item);
    const isEven = item._isEvenGroup;
    const isGroupHovered = hoveredGroupNo === item._visualNo;

    let bgClass = "";
    if (isSelected) {
      bgClass = isGroupHovered
        ? "bg-blue-200 text-blue-950 dark:bg-[#2e4c37] dark:text-[#f1f5f3]"
        : "bg-blue-100 text-blue-900 dark:bg-[#1f3526] dark:text-[#48a359]";
    } else if (isGroupHovered) {
      bgClass = "bg-slate-200 text-gray-900 dark:bg-[#273f2f] dark:text-[#f1f5f3]";
    } else {
      bgClass = isEven
        ? "bg-slate-100 text-gray-800 dark:bg-[#213527] dark:text-[#d1dcd4]"
        : "bg-white text-gray-800 dark:bg-[#1a2b20] dark:text-[#d1dcd4]";
    }

    let finalClass = extraClass;
    finalClass = finalClass.replace(/bg-white\/\d+|bg-white/g, "");

    return `p-2 border border-slate-200 align-middle select-none cursor-pointer outline-none transition-colors duration-150 ${bgClass} ${finalClass}`;
  };


  const hitungSisaHari = (tanggalSelesai) => {
    if (!tanggalSelesai) return null;
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);
    const tglSelesai = new Date(tanggalSelesai);
    tglSelesai.setHours(0, 0, 0, 0);
    const diffTime = tglSelesai.getTime() - hariIni.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateStr) => {
    if (!dateStr || String(dateStr).trim() === "" || String(dateStr).trim() === "-") return "-";
    if (dateStr.includes("/")) return dateStr;
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return `${parts[0]}/${parts[1]}/${parts[2]}`;
    }
    return dateStr;
  };

  // Filter
  const filteredLands = lands.filter((item) => {
    if (landFilter === "expired") {
      const sisaHari = hitungSisaHari(item.tgl_berakhir_shgb);
      if (sisaHari === null || sisaHari > 30 || item.status === "Done" || item.status === "Selesai") {
        return false;
      }
    } else if (landFilter === "active") {
      if (item.status === "Done" || item.status === "Selesai") {
        return false;
      }
    } else if (landFilter === "6months") {
      const sisaHari = hitungSisaHari(item.tgl_berakhir_shgb);
      if (sisaHari === null || sisaHari > 180 || item.status === "Done" || item.status === "Selesai") {
        return false;
      }
    }

    const q = searchQuery.toLowerCase();

    // Format dates to match display format (dd/mm/yyyy)
    const tglMulaiFormatted = formatDate(item.tgl_mulai_shgb).toLowerCase();
    const tglBerakhirFormatted = formatDate(item.tgl_berakhir_shgb).toLowerCase();

    // Format numbers to match Indonesian format
    const luasTanahFormatted = item.luas_tanah ? Number(item.luas_tanah).toLocaleString("id-ID").toLowerCase() : "";
    const luasPagarFormatted = item.luas_pagar ? Number(item.luas_pagar).toLocaleString("id-ID").toLowerCase() : "";
    const luasBangunanFormatted = item.luas_bangunan ? Number(item.luas_bangunan).toLocaleString("id-ID").toLowerCase() : "";

    return (
      (item.no && String(item.no).includes(q)) ||
      (item.unit_kerja && item.unit_kerja.toLowerCase().includes(q)) ||
      (item.alamat && item.alamat.toLowerCase().includes(q)) ||
      (item.peruntukan && item.peruntukan.toLowerCase().includes(q)) ||
      (item.aset_sap && item.aset_sap.toLowerCase().includes(q)) ||
      (item.no_shgb && item.no_shgb.toLowerCase().includes(q)) ||
      (item.no_sertifikat && item.no_sertifikat.toLowerCase().includes(q)) ||
      (item.no_sertifikat_gabungan && item.no_sertifikat_gabungan.toLowerCase().includes(q)) ||
      (item.no_imb && item.no_imb.toLowerCase().includes(q)) ||
      (item.nama_pemilik_imb && item.nama_pemilik_imb.toLowerCase().includes(q)) ||
      (item.tgl_mulai_shgb && item.tgl_mulai_shgb.toLowerCase().includes(q)) ||
      (tglMulaiFormatted && tglMulaiFormatted.includes(q)) ||
      (item.tgl_berakhir_shgb && item.tgl_berakhir_shgb.toLowerCase().includes(q)) ||
      (tglBerakhirFormatted && tglBerakhirFormatted.includes(q)) ||
      (item.tahun_perolehan && String(item.tahun_perolehan).includes(q)) ||
      (item.luas_tanah && String(item.luas_tanah).includes(q)) ||
      (luasTanahFormatted && luasTanahFormatted.includes(q)) ||
      (item.luas_pagar && String(item.luas_pagar).includes(q)) ||
      (luasPagarFormatted && luasPagarFormatted.includes(q)) ||
      (item.luas_bangunan && String(item.luas_bangunan).includes(q)) ||
      (luasBangunanFormatted && luasBangunanFormatted.includes(q)) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(q))
    );
  });

  const sortedLands = [...filteredLands].sort((a, b) => {
    if (landFilter === "expired" || landFilter === "6months") {
      const aDate = a.tgl_berakhir_shgb;
      const bDate = b.tgl_berakhir_shgb;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return new Date(aDate).getTime() - new Date(bDate).getTime();
    }

    const noA = a.no !== null && a.no !== undefined ? Number(a.no) : -999999;
    const noB = b.no !== null && b.no !== undefined ? Number(b.no) : -999999;
    if (noA !== noB) return noB - noA;

    const unitA = (a.unit_kerja || "").toLowerCase();
    const unitB = (b.unit_kerja || "").toLowerCase();
    if (unitA !== unitB) return unitA.localeCompare(unitB);

    return b.id - a.id;
  });

  // Group the sortedLands by unit_kerja to paginate by groups (visual rows)
  const groupedLands = [];
  let currentGroup = null;
  sortedLands.forEach((item) => {
    if (!currentGroup || currentGroup.unit_kerja !== item.unit_kerja) {
      currentGroup = {
        unit_kerja: item.unit_kerja,
        items: [item],
      };
      groupedLands.push(currentGroup);
    } else {
      currentGroup.items.push(item);
    }
  });

  // Pagination based on groups
  const totalPages = Math.ceil(groupedLands.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGroups = groupedLands.slice(startIndex, startIndex + itemsPerPage);

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

  // Flatten back to items and assign group-based properties
  const paginatedData = paginatedGroups.flatMap((group, groupIdx) => {
    const visualNo = startIndex + groupIdx + 1;
    const isEvenGroup = visualNo % 2 === 0;
    return group.items.map((item) => ({
      ...item,
      _visualNo: visualNo,
      _isEvenGroup: isEvenGroup,
    }));
  });

  // Helper to calculate rowspan info for paginatedData
  const getRowSpanInfo = (data) => {
    const info = [];
    let i = 0;
    while (i < data.length) {
      const currentUnit = data[i].unit_kerja;
      let j = i;
      while (j < data.length && data[j].unit_kerja === currentUnit) {
        j++;
      }
      const groupSize = j - i;
      const groupRows = data.slice(i, j);

      const getUniqueValue = (field) => {
        const vals = groupRows
          .map(r => r[field])
          .filter(v => v !== null && v !== undefined && String(v).trim() !== "" && String(v).trim() !== "-");
        const uniqueVals = [...new Set(vals)];
        if (uniqueVals.length === 1) {
          return { merge: true, value: uniqueVals[0] };
        } else if (uniqueVals.length === 0) {
          return { merge: true, value: "-" };
        } else {
          return { merge: false };
        }
      };

      for (let k = i; k < j; k++) {
        info[k] = {
          isFirst: k === i,
          span: groupSize,
          no_imb: getUniqueValue("no_imb"),
          nama_pemilik_imb: getUniqueValue("nama_pemilik_imb"),
          no_sertifikat_gabungan: getUniqueValue("no_sertifikat_gabungan"),
          luas_pagar: getUniqueValue("luas_pagar"),
          luas_bangunan: getUniqueValue("luas_bangunan"),
        };
      }
      i = j;
    }
    return info;
  };

  const rowSpanInfo = getRowSpanInfo(paginatedData);

  const openAdd = () => {
    setEditingId(null);
    setFormData({
      unit_kerja: "",
      alamat: "",
      peruntukan: "",
      aset_sap: "",
      no_shgb: "",
      no_sertifikat: "",
      no_sertifikat_gabungan: "",
      no_imb: "",
      nama_pemilik_imb: "",
      tgl_mulai_shgb: "",
      tgl_berakhir_shgb: "",
      tahun_perolehan: "",
      luas_tanah: "",
      luas_pagar: "",
      luas_bangunan: "",
      keterangan: "",
    });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      unit_kerja: item.unit_kerja || "",
      alamat: item.alamat || "",
      peruntukan: item.peruntukan || "",
      aset_sap: item.aset_sap || "",
      no_shgb: item.no_shgb || "",
      no_sertifikat: item.no_sertifikat || "",
      no_sertifikat_gabungan: item.no_sertifikat_gabungan || "",
      no_imb: item.no_imb || "",
      nama_pemilik_imb: item.nama_pemilik_imb || "",
      tgl_mulai_shgb: item.tgl_mulai_shgb || "",
      tgl_berakhir_shgb: item.tgl_berakhir_shgb || "",
      tahun_perolehan: item.tahun_perolehan !== null && item.tahun_perolehan !== undefined ? String(item.tahun_perolehan) : "",
      luas_tanah: item.luas_tanah !== null && item.luas_tanah !== undefined ? String(item.luas_tanah) : "",
      luas_pagar: item.luas_pagar !== null && item.luas_pagar !== undefined ? String(item.luas_pagar) : "",
      luas_bangunan: item.luas_bangunan !== null && item.luas_bangunan !== undefined ? String(item.luas_bangunan) : "",
      keterangan: item.keterangan || "",
    });
    setIsModalOpen(true);
  };

  const askDelete = (id, nama) => {
    setDeleteConfirm({ show: true, id, name: nama });
  };

  const confirmDelete = () => {
    setIsSaving(true);
    router.delete(`/building-lands/${deleteConfirm.id}`, {
      onSuccess: () => {
        showNotif("Data tanah berhasil dihapus!");
        setDeleteConfirm({ show: false, id: null, name: "" });
      },
      onError: (err) => {
        console.error(err);
        showNotif("Gagal menghapus data tanah.", "error");
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
      unit_kerja: formData.unit_kerja,
      alamat: formData.alamat,
      peruntukan: formData.peruntukan,
      aset_sap: formData.aset_sap,
      no_shgb: formData.no_shgb,
      no_sertifikat: formData.no_sertifikat,
      no_sertifikat_gabungan: formData.no_sertifikat_gabungan,
      no_imb: formData.no_imb,
      nama_pemilik_imb: formData.nama_pemilik_imb,
      tgl_mulai_shgb: formData.tgl_mulai_shgb || null,
      tgl_berakhir_shgb: formData.tgl_berakhir_shgb || null,
      tahun_perolehan: formData.tahun_perolehan ? Number(formData.tahun_perolehan) : null,
      luas_tanah: formData.luas_tanah ? Number(formData.luas_tanah) : null,
      luas_pagar: formData.luas_pagar ? Number(formData.luas_pagar) : null,
      luas_bangunan: formData.luas_bangunan ? Number(formData.luas_bangunan) : null,
      keterangan: formData.keterangan,
    };

    if (editingId) {
      router.put(`/building-lands/${editingId}`, payload, {
        onSuccess: () => {
          showNotif("Data tanah berhasil diperbarui!");
          setIsModalOpen(false);
        },
        onError: (err) => {
          console.error(err);
          showNotif("Gagal menyimpan data tanah.", "error");
        },
        onFinish: () => {
          setIsSaving(false);
        }
      });
    } else {
      router.post("/building-lands", payload, {
        onSuccess: () => {
          showNotif("Tanah baru berhasil ditambahkan!");
          setIsModalOpen(false);
        },
        onError: (err) => {
          console.error(err);
          showNotif("Gagal menyimpan data tanah.", "error");
        },
        onFinish: () => {
          setIsSaving(false);
        }
      });
    }
  };

  const exportToExcel = () => {
    const rows = filteredLands.map((item, idx) => ({
      "No": idx + 1,
      "Unit Kerja": item.unit_kerja || "",
      "Alamat": item.alamat || "",
      "Peruntukan": item.peruntukan || "",
      "Aset SAP": item.aset_sap || "",
      "No. SHGB": item.no_shgb || "",
      "No. Sertifikat": item.no_sertifikat || "",
      "No. Sertifikat Gabungan": item.no_sertifikat_gabungan || "",
      "No. IMB": item.no_imb || "",
      "Nama Pemilik IMB": item.nama_pemilik_imb || "",
      "Tanggal SHGB Mulai": item.tgl_mulai_shgb || "",
      "Tanggal SHGB Berakhir": item.tgl_berakhir_shgb || "",
      "Tahun Perolehan": item.tahun_perolehan || "",
      "Luas Lahan (m²)": item.luas_tanah || "",
      "Luas Pagar (m²)": item.luas_pagar || "",
      "Luas Bangunan (m²)": item.luas_bangunan || "",
      "Keterangan": item.keterangan || "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daftar Tanah");
    XLSX.writeFile(wb, `Daftar_Tanah_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
          const total = await importLandCSV("logistikku_app_01", data);
          showNotif(`Sukses! ${total} data tanah berhasil di-import.`);
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

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300 relative print:hidden">

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
              <Map className="w-6 h-6 text-blue-500" /> Daftar Tanah
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manajemen inventaris aset tanah instansi beserta sertifikat dan penggunaannya.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={exportToExcel}
              disabled={filteredLands.length === 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-colors text-sm"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>
            {userRole === "admin" && (
              <>
                <button
                  type="button"
                  onClick={downloadLandTemplate}
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
                  aria-label="Upload file CSV data tanah"
                />
              </>
            )}
          </div>
        </div>


        {/* Tabel Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Search Toolbar */}
          <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Cari data tanah..."
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
            <div className="flex items-center gap-3">
              {userRole === "admin" && (
                <button
                  type="button"
                  onClick={openAdd}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold shadow-sm transition-colors text-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Tanah
                </button>
              )}
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-semibold shrink-0">
                Total Lahan: {filteredLands.length}
              </div>
            </div>
          </div>

          {landFilter === "expired" && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-sm text-red-800 animate-in fade-in duration-300 print:hidden">
              <span className="font-medium">Menampilkan aset tanah yang mendekati masa habis berlaku SHGB / expired.</span>
              <button
                onClick={() => setLandFilter("")}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                Hapus Filter
              </button>
            </div>
          )}

          {landFilter === "active" && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between text-sm text-green-800 animate-in fade-in duration-300 print:hidden">
              <span className="font-medium">Menampilkan aset tanah aktif.</span>
              <button
                onClick={() => setLandFilter("")}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                Hapus Filter
              </button>
            </div>
          )}

          {landFilter === "6months" && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-sm text-red-800 animate-in fade-in duration-300 print:hidden">
              <span className="font-medium">Menampilkan aset tanah dengan masa berlaku SHGB berakhir dalam &lt; 6 bulan Atau sudah habis.</span>
              <button
                onClick={() => setLandFilter("")}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                Hapus Filter
              </button>
            </div>
          )}

          {/* Table */}
          <div className={`overflow-x-auto custom-scrollbar ${itemsPerPage > 20 ? "max-h-[60vh] overflow-y-auto" : ""}`}>
            <table className="w-full text-left border-collapse min-w-[2000px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-blue-900 text-slate-100 text-[11px] font-bold uppercase tracking-wider text-center">
                  <th rowSpan="2" className="p-2.5 w-12 text-center align-middle border border-blue-800 bg-blue-900">No</th>
                  <th rowSpan="2" className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Unit Kerja</th>
                  <th rowSpan="2" className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Alamat</th>
                  <th rowSpan="2" className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Peruntukan</th>
                  <th rowSpan="2" className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Aset SAP</th>
                  <th rowSpan="2" className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">No. SHGB</th>
                  <th rowSpan="2" className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">No. Sertifikat</th>
                  <th rowSpan="2" className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">No. Sertifikat Gabungan</th>
                  <th rowSpan="2" className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">No. IMB</th>
                  <th rowSpan="2" className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Nama Pemilik IMB</th>
                  <th colSpan="2" className="p-1.5 text-center border border-blue-800 bg-blue-900">Tanggal SHGB</th>
                  <th rowSpan="2" className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Tahun Perolehan</th>
                  <th rowSpan="2" className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Luas Tanah (m²)</th>
                  <th rowSpan="2" className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Luas Pagar (m²)</th>
                  <th rowSpan="2" className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Luas Bangunan (m²)</th>
                  <th rowSpan="2" className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Keterangan</th>
                  {userRole === "admin" && <th rowSpan="2" className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Aksi</th>}
                </tr>
                <tr className="bg-blue-900 text-slate-100 text-[11px] font-bold uppercase tracking-wider text-center">
                  <th className="p-1.5 text-center border border-blue-800 bg-blue-900">Mulai</th>
                  <th className="p-1.5 text-center border border-blue-800 bg-blue-900">Berakhir</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-800 bg-white">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="18" className="p-4 text-center text-gray-400 border border-slate-200">
                      Tidak ada data lahan ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => {
                    const isEven = item._isEvenGroup;
                    const isSelected = isItemSelected(item);

                    return (
                      <tr
                        key={item.id}
                        onMouseEnter={() => setHoveredGroupNo(item._visualNo)}
                        onMouseLeave={() => setHoveredGroupNo(null)}
                      >
                        {/* No (#) - Merged */}
                        {rowSpanInfo[index].isFirst ? (
                          <td
                            rowSpan={rowSpanInfo[index].span}
                            onClick={() => handleCellClick(item.id, "no")}
                            className={getCellClass(item, "no", "text-center font-semibold bg-white/70")}
                          >
                            {item._visualNo}
                          </td>
                        ) : null}

                        {/* Unit Kerja - Merged */}
                        {rowSpanInfo[index].isFirst ? (
                          <td
                            rowSpan={rowSpanInfo[index].span}
                            onClick={() => handleCellClick(item.id, "unit_kerja")}
                            className={getCellClass(item, "unit_kerja", "font-semibold text-gray-900 bg-white/70")}
                          >
                            {item.unit_kerja}
                          </td>
                        ) : null}

                        {/* Alamat - Merged */}
                        {rowSpanInfo[index].isFirst ? (
                          <td
                            rowSpan={rowSpanInfo[index].span}
                            onClick={() => handleCellClick(item.id, "alamat")}
                            className={getCellClass(item, "alamat", "max-w-xs truncate bg-white/70")}
                            title={item.alamat}
                          >
                            {item.alamat || "-"}
                          </td>
                        ) : null}

                        {/* Peruntukan - Not Merged */}
                        <td
                          onClick={() => handleCellClick(item.id, "peruntukan")}
                          className={getCellClass(item, "peruntukan")}
                        >
                          {item.peruntukan || "-"}
                        </td>

                        {/* Aset SAP - Not Merged */}
                        <td
                          onClick={() => handleCellClick(item.id, "aset_sap")}
                          className={getCellClass(item, "aset_sap")}
                        >
                          {item.aset_sap || "-"}
                        </td>

                        {/* No. SHGB - Not Merged */}
                        <td
                          onClick={() => handleCellClick(item.id, "no_shgb")}
                          className={getCellClass(item, "no_shgb")}
                        >
                          {item.no_shgb || "-"}
                        </td>

                        {/* No. Sertifikat - Not Merged */}
                        <td
                          onClick={() => handleCellClick(item.id, "no_sertifikat")}
                          className={getCellClass(item, "no_sertifikat")}
                        >
                          {item.no_sertifikat || "-"}
                        </td>

                        {/* No. Sertifikat Gabungan - Dynamically Merged */}
                        {rowSpanInfo[index].no_sertifikat_gabungan.merge ? (
                          rowSpanInfo[index].isFirst ? (
                            <td
                              rowSpan={rowSpanInfo[index].span}
                              onClick={() => handleCellClick(item.id, "no_sertifikat_gabungan")}
                              className={getCellClass(item, "no_sertifikat_gabungan", "bg-white/70")}
                            >
                              {rowSpanInfo[index].no_sertifikat_gabungan.value}
                            </td>
                          ) : null
                        ) : (
                          <td
                            onClick={() => handleCellClick(item.id, "no_sertifikat_gabungan")}
                            className={getCellClass(item, "no_sertifikat_gabungan")}
                          >
                            {item.no_sertifikat_gabungan || "-"}
                          </td>
                        )}

                        {/* No. IMB - Merged */}
                        {rowSpanInfo[index].no_imb.merge ? (
                          rowSpanInfo[index].isFirst ? (
                            <td
                              rowSpan={rowSpanInfo[index].span}
                              onClick={() => handleCellClick(item.id, "no_imb")}
                              className={getCellClass(item, "no_imb", "bg-white/70")}
                            >
                              {rowSpanInfo[index].no_imb.value}
                            </td>
                          ) : null
                        ) : (
                          <td
                            onClick={() => handleCellClick(item.id, "no_imb")}
                            className={getCellClass(item, "no_imb")}
                          >
                            {item.no_imb || "-"}
                          </td>
                        )}

                        {/* Nama Pemilik IMB - Merged */}
                        {rowSpanInfo[index].nama_pemilik_imb.merge ? (
                          rowSpanInfo[index].isFirst ? (
                            <td
                              rowSpan={rowSpanInfo[index].span}
                              onClick={() => handleCellClick(item.id, "nama_pemilik_imb")}
                              className={getCellClass(item, "nama_pemilik_imb", "bg-white/70")}
                            >
                              {rowSpanInfo[index].nama_pemilik_imb.value}
                            </td>
                          ) : null
                        ) : (
                          <td
                            onClick={() => handleCellClick(item.id, "nama_pemilik_imb")}
                            className={getCellClass(item, "nama_pemilik_imb")}
                          >
                            {item.nama_pemilik_imb || "-"}
                          </td>
                        )}

                        {/* Tanggal SHGB Mulai - Not Merged */}
                        <td
                          onClick={() => handleCellClick(item.id, "tgl_mulai_shgb")}
                          className={getCellClass(item, "tgl_mulai_shgb", "text-center")}
                        >
                          {formatDate(item.tgl_mulai_shgb)}
                        </td>

                        {/* Tanggal SHGB Berakhir - Not Merged */}
                        <td
                          onClick={() => handleCellClick(item.id, "tgl_berakhir_shgb")}
                          className={getCellClass(item, "tgl_berakhir_shgb", "text-center")}
                        >
                          {formatDate(item.tgl_berakhir_shgb)}
                        </td>

                        {/* Tahun Perolehan - Not Merged */}
                        <td
                          onClick={() => handleCellClick(item.id, "tahun_perolehan")}
                          className={getCellClass(item, "tahun_perolehan", "text-center font-medium")}
                        >
                          {item.tahun_perolehan || "-"}
                        </td>

                        {/* Luas Lahan (m²) - Not Merged */}
                        <td
                          onClick={() => handleCellClick(item.id, "luas_tanah")}
                          className={getCellClass(item, "luas_tanah", "font-medium")}
                        >
                          {item.luas_tanah ? `${Number(item.luas_tanah).toLocaleString("id-ID")} m²` : "-"}
                        </td>

                        {/* Luas Pagar (m²) - Dynamically Merged */}
                        {rowSpanInfo[index].luas_pagar.merge ? (
                          rowSpanInfo[index].isFirst ? (
                            <td
                              rowSpan={rowSpanInfo[index].span}
                              onClick={() => handleCellClick(item.id, "luas_pagar")}
                              className={getCellClass(item, "luas_pagar", "font-medium bg-white/70")}
                            >
                              {rowSpanInfo[index].luas_pagar.value !== "-" ? `${Number(rowSpanInfo[index].luas_pagar.value).toLocaleString("id-ID")} m²` : "-"}
                            </td>
                          ) : null
                        ) : (
                          <td
                            onClick={() => handleCellClick(item.id, "luas_pagar")}
                            className={getCellClass(item, "luas_pagar", "font-medium")}
                          >
                            {item.luas_pagar ? `${Number(item.luas_pagar).toLocaleString("id-ID")} m²` : "-"}
                          </td>
                        )}

                        {/* Luas Bangunan (m²) - Dynamically Merged */}
                        {rowSpanInfo[index].luas_bangunan.merge ? (
                          rowSpanInfo[index].isFirst ? (
                            <td
                              rowSpan={rowSpanInfo[index].span}
                              onClick={() => handleCellClick(item.id, "luas_bangunan")}
                              className={getCellClass(item, "luas_bangunan", "font-medium bg-white/70")}
                            >
                              {rowSpanInfo[index].luas_bangunan.value !== "-" ? `${Number(rowSpanInfo[index].luas_bangunan.value).toLocaleString("id-ID")} m²` : "-"}
                            </td>
                          ) : null
                        ) : (
                          <td
                            onClick={() => handleCellClick(item.id, "luas_bangunan")}
                            className={getCellClass(item, "luas_bangunan", "font-medium")}
                          >
                            {item.luas_bangunan ? `${Number(item.luas_bangunan).toLocaleString("id-ID")} m²` : "-"}
                          </td>
                        )}

                        {/* Keterangan - Not Merged */}
                        <td
                          onClick={() => handleCellClick(item.id, "keterangan")}
                          className={getCellClass(item, "keterangan", "text-[10px] text-gray-500 max-w-xs truncate")}
                          title={item.keterangan}
                        >
                          {item.keterangan || "-"}
                        </td>

                        {/* Aksi - Not Merged */}
                        {userRole === "admin" && (
                          <td className={getCellClass(item, "aksi", "text-right")}>
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEdit(item);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  askDelete(item.id, item.unit_kerja);
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
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
            <div className="px-6 py-4 border-t border-slate-200/80 flex items-center justify-between bg-slate-50/30">
              <span className="text-xs text-gray-500">
                Menampilkan {startIndex + 1} sampai {Math.min(startIndex + itemsPerPage, groupedLands.length)} dari {groupedLands.length} data
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
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-lg text-gray-800">
                {editingId ? "Edit Aset Tanah" : "Tambah Aset Tanah Baru"}
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
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">

                {/* Section 1: Informasi Umum */}
                <div>
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">1. Informasi Umum</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Unit Kerja *</label>
                      <input
                        required
                        type="text"
                        list="unit-kerja-list"
                        value={formData.unit_kerja}
                        onChange={handleUnitKerjaChange}
                        disabled={isSaving}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Contoh: KC Palembang..."
                      />
                      <datalist id="unit-kerja-list">
                        {uniqueUnits.map((unit) => (
                          <option key={unit} value={unit} />
                        ))}
                      </datalist>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Alamat</label>
                      <textarea
                        rows="2"
                        value={formData.alamat}
                        onChange={(e) => setFormData((p) => ({ ...p, alamat: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Alamat lengkap lahan..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Peruntukan</label>
                      <input
                        type="text"
                        value={formData.peruntukan}
                        onChange={(e) => setFormData((p) => ({ ...p, peruntukan: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Contoh: Kantor Cabang, Gudang..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Aset SAP</label>
                      <input
                        type="text"
                        value={formData.aset_sap}
                        onChange={(e) => setFormData((p) => ({ ...p, aset_sap: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Nomor Aset SAP..."
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Legalitas & Sertifikat */}
                <div className="border-t border-gray-100 pt-5">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">2. Legalitas & Sertifikat</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">No. SHGB</label>
                      <input
                        type="text"
                        value={formData.no_shgb}
                        onChange={(e) => setFormData((p) => ({ ...p, no_shgb: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Nomor SHGB..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">No. Sertifikat</label>
                      <input
                        type="text"
                        value={formData.no_sertifikat}
                        onChange={(e) => setFormData((p) => ({ ...p, no_sertifikat: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Nomor Sertifikat..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">No. Sertifikat Gabungan</label>
                      <input
                        type="text"
                        value={formData.no_sertifikat_gabungan}
                        onChange={(e) => setFormData((p) => ({ ...p, no_sertifikat_gabungan: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Nomor Sertifikat Gabungan..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">No. IMB</label>
                      <input
                        type="text"
                        value={formData.no_imb}
                        onChange={(e) => setFormData((p) => ({ ...p, no_imb: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Nomor IMB..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Nama Pemilik IMB</label>
                      <input
                        type="text"
                        value={formData.nama_pemilik_imb}
                        onChange={(e) => setFormData((p) => ({ ...p, nama_pemilik_imb: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Nama pemilik yang tertera di IMB..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Tanggal SHGB Mulai</label>
                      <input
                        type="date"
                        value={formData.tgl_mulai_shgb}
                        onChange={(e) => setFormData((p) => ({ ...p, tgl_mulai_shgb: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Tanggal SHGB Berakhir</label>
                      <input
                        type="date"
                        value={formData.tgl_berakhir_shgb}
                        onChange={(e) => setFormData((p) => ({ ...p, tgl_berakhir_shgb: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Dimensi & Perolehan */}
                <div className="border-t border-gray-100 pt-5">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">3. Dimensi & Perolehan</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Thn Perolehan</label>
                      <input
                        type="number"
                        value={formData.tahun_perolehan}
                        onChange={(e) => setFormData((p) => ({ ...p, tahun_perolehan: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Contoh: 2020"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Luas Tanah (m²)</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.luas_tanah}
                        onChange={(e) => setFormData((p) => ({ ...p, luas_tanah: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Contoh: 500"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Luas Pagar (m²)</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.luas_pagar}
                        onChange={(e) => setFormData((p) => ({ ...p, luas_pagar: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Contoh: 150"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Luas Bangunan (m²)</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.luas_bangunan}
                        onChange={(e) => setFormData((p) => ({ ...p, luas_bangunan: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Contoh: 250"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-4">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Keterangan</label>
                      <textarea
                        rows="2"
                        value={formData.keterangan}
                        onChange={(e) => setFormData((p) => ({ ...p, keterangan: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Catatan tambahan..."
                      />
                    </div>
                  </div>
                </div>

              </div>
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-gray-600 dark:text-[#a4b4a9] hover:bg-gray-100 dark:hover:bg-[#243e2e] dark:hover:text-white rounded-xl font-medium text-sm transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Simpan Lahan
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
