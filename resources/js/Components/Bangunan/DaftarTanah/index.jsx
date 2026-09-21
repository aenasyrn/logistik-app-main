// resources/js/Components/Bangunan/DaftarTanah/index.jsx
"use client";

import React, { useState, useRef } from "react";
import { Map, Search, Plus, FileSpreadsheet, Edit, Trash2, X, Loader2, Upload, Eye, MapPin, FileText } from "lucide-react";
import DetailHistoryModal from "../../Common/DetailHistoryModal";
import axios from "axios";
import { router } from "@inertiajs/react";
import * as XLSX from "xlsx";
import { parseExcelFile } from "../../../utils/excelHelper";

import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";
import ToastNotif from "../../Modal/ToastNotif";
import { importLandCSV, downloadLandTemplate } from "../../../services/landService";
import CustomSelectDropdown from "../../Form/CustomSelectDropdown";

const SearchableSelect = ({ label, value, onChange, options, placeholder, disabled, className, labelCls }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  React.useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.nama?.toLowerCase().includes(search.toLowerCase())
  );

  const exactMatch = options.some(opt => opt.nama?.toLowerCase() === search.toLowerCase());
  const showCustomOption = search.trim() !== "" && !exactMatch;

  return (
    <div ref={containerRef} className="relative w-full text-left">
      <label className={labelCls}>{label}</label>
      <div
        onClick={() => { if (!disabled) { setIsOpen(!isOpen); setSearch(""); } }}
        className={`w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer flex justify-between items-center text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <svg className="w-4 h-4 text-gray-400 shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto flex flex-col p-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari..."
            className="w-full px-3 py-1.5 mb-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
          <div className="overflow-y-auto max-h-48 custom-scrollbar">
            {showCustomOption && (
              <div
                onClick={() => {
                  onChange({ target: { value: search } });
                  setIsOpen(false);
                }}
                className="px-3.5 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors font-medium text-left"
              >
                Gunakan: "{search}"
              </div>
            )}
            {filteredOptions.length === 0 && !showCustomOption ? (
              <div className="p-2 text-sm text-gray-500 text-center">Tidak ada hasil</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange({ target: { value: opt.nama } });
                    setIsOpen(false);
                  }}
                  className="px-3.5 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors text-left"
                >
                  {opt.nama}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function DaftarTanah({ userRole, lands = [], outlets = [], landFilter = "", setLandFilter, landSearch = "", setLandSearch }) {
  const isGuest = userRole === "guest";
  const canModify = userRole === "admin";
  const [searchQuery, setSearchQuery] = useState(landSearch || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterStatusShgb, setFilterStatusShgb] = useState("all");

  React.useEffect(() => {
    if (landSearch !== undefined) {
      setSearchQuery(landSearch);
      setCurrentPage(1);
    }
  }, [landSearch]);

  React.useEffect(() => {
    const handleReset = () => {
      setSearchQuery("");
      setCurrentPage(1);
      setSelectedUnit(null);
      setSelectedCell({ id: null, field: null });
      setFilterStatusShgb("all");
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

  const createEmptyCert = () => ({
    no_shgb: "",
    no_sertifikat: "",
    tgl_mulai_shgb: "",
    tgl_berakhir_shgb: "",
    no_imb: "",
    nama_pemilik_imb: "",
    tahun_perolehan: "",
    luas_tanah: "",
    luas_pagar: "",
    luas_bangunan: "",
  });

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
    certificates: [createEmptyCert()],
  });

  const updateCertificatesAndMerge = (certs) => {
    const firstCert = certs[0] || {};
    const isMulti = certs.length > 1;
    const allCertNo = certs.map((c) => (c.no_sertifikat || c.no_shgb || "").trim()).filter(Boolean);
    const allImbNo = certs.map((c) => (c.no_imb || "").trim()).filter(Boolean);
    const allPemilikImb = [...new Set(certs.map((c) => (c.nama_pemilik_imb || "").trim()).filter(Boolean))];

    setFormData((prev) => ({
      ...prev,
      certificates: certs,
      no_shgb: firstCert.no_shgb || "",
      no_sertifikat: firstCert.no_sertifikat || "",
      no_sertifikat_gabungan: isMulti
        ? (prev.no_sertifikat_gabungan || allCertNo.join(", "))
        : "",
      no_imb: isMulti
        ? (prev.no_imb || allImbNo.join(", "))
        : (firstCert.no_imb || prev.no_imb || ""),
      nama_pemilik_imb: isMulti
        ? (prev.nama_pemilik_imb || allPemilikImb.join(", "))
        : (firstCert.nama_pemilik_imb || prev.nama_pemilik_imb || ""),
      tgl_mulai_shgb: firstCert.tgl_mulai_shgb || prev.tgl_mulai_shgb || "",
      tgl_berakhir_shgb: firstCert.tgl_berakhir_shgb || prev.tgl_berakhir_shgb || "",
      tahun_perolehan: firstCert.tahun_perolehan !== undefined ? firstCert.tahun_perolehan : (prev.tahun_perolehan || ""),
      luas_tanah: firstCert.luas_tanah !== undefined ? firstCert.luas_tanah : (prev.luas_tanah || ""),
      luas_pagar: firstCert.luas_pagar !== undefined ? firstCert.luas_pagar : (prev.luas_pagar || ""),
      luas_bangunan: firstCert.luas_bangunan !== undefined ? firstCert.luas_bangunan : (prev.luas_bangunan || ""),
    }));
  };

  const handleAddCertificate = () => {
    const updatedCerts = [...(formData.certificates || []), createEmptyCert()];
    updateCertificatesAndMerge(updatedCerts);
  };

  const handleRemoveCertificate = (index) => {
    if ((formData.certificates || []).length <= 1) return;
    const updatedCerts = (formData.certificates || []).filter((_, i) => i !== index);
    updateCertificatesAndMerge(updatedCerts);
  };

  const handleCertificateChange = (index, field, val) => {
    const certs = [...(formData.certificates || [])];
    certs[index] = { ...certs[index], [field]: val };
    updateCertificatesAndMerge(certs);
  };

  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: "" });
  const [notif, setNotif] = useState({ show: false, message: "", type: "success", onOk: null });
  const [localStatuses, setLocalStatuses] = useState({});
  const [detailItem, setDetailItem] = useState(null);

  const showNotif = (message, type = "success", onOk = null) => {
    setNotif({ show: true, message, type, onOk });
  };

  const handleStatusChange = async (id, newStatus) => {
    const oldStatus = localStatuses[id] !== undefined
      ? localStatuses[id]
      : (lands.find(l => l.id === id)?.status || getStatusInfo(lands.find(l => l.id === id)));

    setLocalStatuses(prev => ({ ...prev, [id]: newStatus }));

    try {
      await axios.put(`/building-lands/${id}/status`, { status: newStatus });
      router.reload({
        only: ["buildingLands", "activityLogs"],
        onSuccess: () => {
          setLocalStatuses(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }
      });
    } catch (err) {
      console.error(err);
      showNotif("Gagal mengubah status.", "error");
      setLocalStatuses(prev => ({ ...prev, [id]: oldStatus }));
    }
  };

  const uniqueUnits = [...new Set(lands.map((item) => item.unit_kerja).filter(Boolean))];

  const handleUnitKerjaChange = (e) => {
    const value = e.target.value;
    const matched = outlets.find((o) => o.nama.toLowerCase() === value.toLowerCase());
    setFormData((p) => {
      const updated = {
        ...p,
        unit_kerja: value,
        outlet_id: matched ? matched.id : "",
      };
      if (!editingId) {
        const existing = lands.find(
          (l) => (l.unit_kerja || "").toLowerCase().trim() === value.toLowerCase().trim()
        );
        if (existing) {
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
    const isGroupHovered = hoveredGroupNo === item._groupVisualNo;

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

  const hitungSisaWaktu = (tanggalSelesai) => {
    if (!tanggalSelesai) return "—";
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);
    const tglSelesai = new Date(tanggalSelesai);
    tglSelesai.setHours(0, 0, 0, 0);

    if (tglSelesai < hariIni) {
      const diffTime = hariIni.getTime() - tglSelesai.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 30) {
        return `> ${diffDays} hari`;
      } else {
        const diffMonths = (hariIni.getFullYear() - tglSelesai.getFullYear()) * 12 + (hariIni.getMonth() - tglSelesai.getMonth());
        return `> ${diffMonths > 0 ? diffMonths : 0} bln`;
      }
    }

    const diffTime = tglSelesai.getTime() - hariIni.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 30) {
      return `< ${diffDays} hari`;
    } else {
      const diffMonths = (tglSelesai.getFullYear() - hariIni.getFullYear()) * 12 + (tglSelesai.getMonth() - hariIni.getMonth());
      return `${diffMonths > 0 ? diffMonths : 0} bln`;
    }
  };

  const getStatusInfo = (land) => {
    if (land.status === "Done" || land.status === "Selesai") return "Selesai";
    if (!land.tgl_berakhir_shgb) return "Aktif";
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);
    const tglSelesai = new Date(land.tgl_berakhir_shgb);
    tglSelesai.setHours(0, 0, 0, 0);

    if (tglSelesai < hariIni) return "Habis Masa Berlaku";

    const diffTime = tglSelesai.getTime() - hariIni.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 30) return "Hampir Habis";
    return "Aktif";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Selesai":
      case "Done":
        return "bg-blue-100 text-blue-800 border-blue-300 font-extrabold shadow-sm";
      case "Aktif":
        return "bg-green-50 text-green-700 border-green-200";
      case "Hampir Habis":
        return "bg-red-50 text-red-700 border-red-200";
      case "Habis Masa Berlaku":
      case "Expired":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
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

    if (filterStatusShgb !== "all") {
      const statusInfo = getStatusInfo(item);
      if (filterStatusShgb === "aktif") {
        if (statusInfo !== "Aktif") return false;
      } else if (filterStatusShgb === "hampir_habis") {
        if (statusInfo !== "Hampir Habis") return false;
      } else if (filterStatusShgb === "expired") {
        if (statusInfo !== "Habis Masa Berlaku") return false;
      } else if (filterStatusShgb === "selesai") {
        if (statusInfo !== "Selesai") return false;
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

    const calculatedStatus = getStatusInfo(item);
    const calculatedSisaWaktu = hitungSisaWaktu(item.tgl_berakhir_shgb);

    return (
      (item.no && String(item.no).includes(q)) ||
      (item.unit_kerja && item.unit_kerja.toLowerCase().includes(q)) ||
      (item.alamat && item.alamat.toLowerCase().includes(q)) ||
      (item.peruntukan && item.peruntukan.toLowerCase().includes(q)) ||
      (calculatedStatus && calculatedStatus.toLowerCase().includes(q)) ||
      (calculatedSisaWaktu && calculatedSisaWaktu.toLowerCase().includes(q)) ||
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

    const unitA = (a.unit_kerja || "").trim().toLowerCase();
    const unitB = (b.unit_kerja || "").trim().toLowerCase();

    // Group by unit_kerja first so multiple certificates for the same unit sit together for rowSpan merging
    if (unitA !== unitB) {
      const noA = a.no !== null && a.no !== undefined ? Number(a.no) : 999999;
      const noB = b.no !== null && b.no !== undefined ? Number(b.no) : 999999;
      if (noA !== noB) return noA - noB;
      return unitA.localeCompare(unitB);
    }

    return a.id - b.id;
  });

  // Pagination based on sortedLands directly
  const totalPages = Math.ceil(sortedLands.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDataRaw = sortedLands.slice(startIndex, startIndex + itemsPerPage);

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

  const paginatedData = [];
  let currentGroupValue = null;
  let currentGroupStartIndex = -1;
  let visualNoCounter = startIndex + 1;

  for (let i = 0; i < paginatedDataRaw.length; i++) {
    const item = paginatedDataRaw[i];
    const groupValue = (item.unit_kerja || "").trim().toLowerCase();

    if (groupValue === "" || groupValue !== currentGroupValue) {
      currentGroupValue = groupValue;
      currentGroupStartIndex = paginatedData.length;

      paginatedData.push({
        ...item,
        _rowSpan: 1,
        _isFirstInGroup: true,
        _groupVisualNo: visualNoCounter++,
        _isEvenGroup: (visualNoCounter - 1) % 2 === 0,
      });
    } else {
      paginatedData[currentGroupStartIndex]._rowSpan += 1;

      paginatedData.push({
        ...item,
        _rowSpan: 0,
        _isFirstInGroup: false,
        _groupVisualNo: paginatedData[currentGroupStartIndex]._groupVisualNo,
        _isEvenGroup: paginatedData[currentGroupStartIndex]._isEvenGroup,
      });
    }
  }


  const openAdd = () => {
    setEditingId(null);
    setFormData({
      outlet_id: "",
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
      certificates: [createEmptyCert()],
    });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    const relatedRecords = lands.filter(
      (l) => l.unit_kerja && item.unit_kerja && l.unit_kerja.trim().toLowerCase() === item.unit_kerja.trim().toLowerCase()
    );
    const certsToLoad = relatedRecords.length > 0
      ? relatedRecords.map((r) => ({
        no_shgb: r.no_shgb || "",
        no_sertifikat: r.no_sertifikat || "",
        tgl_mulai_shgb: r.tgl_mulai_shgb || "",
        tgl_berakhir_shgb: r.tgl_berakhir_shgb || "",
        no_imb: r.no_imb || "",
        nama_pemilik_imb: r.nama_pemilik_imb || "",
        tahun_perolehan: r.tahun_perolehan !== null && r.tahun_perolehan !== undefined ? String(r.tahun_perolehan) : "",
        luas_tanah: r.luas_tanah !== null && r.luas_tanah !== undefined ? String(r.luas_tanah) : "",
        luas_pagar: r.luas_pagar !== null && r.luas_pagar !== undefined ? String(r.luas_pagar) : "",
        luas_bangunan: r.luas_bangunan !== null && r.luas_bangunan !== undefined ? String(r.luas_bangunan) : "",
      }))
      : [{
        no_shgb: item.no_shgb || "",
        no_sertifikat: item.no_sertifikat || "",
        tgl_mulai_shgb: item.tgl_mulai_shgb || "",
        tgl_berakhir_shgb: item.tgl_berakhir_shgb || "",
        no_imb: item.no_imb || "",
        nama_pemilik_imb: item.nama_pemilik_imb || "",
        tahun_perolehan: item.tahun_perolehan !== null && item.tahun_perolehan !== undefined ? String(item.tahun_perolehan) : "",
        luas_tanah: item.luas_tanah !== null && item.luas_tanah !== undefined ? String(item.luas_tanah) : "",
        luas_pagar: item.luas_pagar !== null && item.luas_pagar !== undefined ? String(item.luas_pagar) : "",
        luas_bangunan: item.luas_bangunan !== null && item.luas_bangunan !== undefined ? String(item.luas_bangunan) : "",
      }];

    setFormData({
      outlet_id: item.outlet_id || "",
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
      certificates: certsToLoad,
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
    if (!formData.unit_kerja?.trim()) {
      showNotif("Unit Kerja wajib diisi!", "error");
      return;
    }
    setIsSaving(true);

    const cleanedCerts = (formData.certificates || []).map((c) => ({
      no_shgb: c.no_shgb?.trim() || null,
      no_sertifikat: c.no_sertifikat?.trim() || null,
      tgl_mulai_shgb: c.tgl_mulai_shgb || null,
      tgl_berakhir_shgb: c.tgl_berakhir_shgb || null,
      no_imb: c.no_imb?.trim() || null,
      nama_pemilik_imb: c.nama_pemilik_imb?.trim() || null,
      tahun_perolehan: (c.tahun_perolehan !== "" && c.tahun_perolehan !== null && !isNaN(Number(c.tahun_perolehan))) ? Number(c.tahun_perolehan) : null,
      luas_tanah: (c.luas_tanah !== "" && c.luas_tanah !== null && !isNaN(Number(c.luas_tanah))) ? Number(c.luas_tanah) : null,
      luas_pagar: (c.luas_pagar !== "" && c.luas_pagar !== null && !isNaN(Number(c.luas_pagar))) ? Number(c.luas_pagar) : null,
      luas_bangunan: (c.luas_bangunan !== "" && c.luas_bangunan !== null && !isNaN(Number(c.luas_bangunan))) ? Number(c.luas_bangunan) : null,
    }));

    const firstCert = cleanedCerts[0] || {};
    const isMulti = cleanedCerts.length > 1;

    const payload = {
      outlet_id: (formData.outlet_id && !isNaN(Number(formData.outlet_id))) ? Number(formData.outlet_id) : null,
      unit_kerja: formData.unit_kerja?.trim(),
      alamat: formData.alamat?.trim() || null,
      peruntukan: formData.peruntukan?.trim() || null,
      aset_sap: formData.aset_sap?.trim() || null,
      no_shgb: firstCert.no_shgb || formData.no_shgb?.trim() || null,
      no_sertifikat: firstCert.no_sertifikat || formData.no_sertifikat?.trim() || null,
      no_sertifikat_gabungan: isMulti ? (formData.no_sertifikat_gabungan?.trim() || null) : null,
      no_imb: isMulti ? (formData.no_imb?.trim() || null) : (firstCert.no_imb || formData.no_imb?.trim() || null),
      nama_pemilik_imb: isMulti ? (formData.nama_pemilik_imb?.trim() || null) : (firstCert.nama_pemilik_imb || formData.nama_pemilik_imb?.trim() || null),
      tgl_mulai_shgb: firstCert.tgl_mulai_shgb || formData.tgl_mulai_shgb || null,
      tgl_berakhir_shgb: firstCert.tgl_berakhir_shgb || formData.tgl_berakhir_shgb || null,
      tahun_perolehan: firstCert.tahun_perolehan !== null && firstCert.tahun_perolehan !== undefined ? firstCert.tahun_perolehan : (formData.tahun_perolehan ? Number(formData.tahun_perolehan) : null),
      luas_tanah: firstCert.luas_tanah !== null && firstCert.luas_tanah !== undefined ? firstCert.luas_tanah : (formData.luas_tanah ? Number(formData.luas_tanah) : null),
      luas_pagar: firstCert.luas_pagar !== null && firstCert.luas_pagar !== undefined ? firstCert.luas_pagar : (formData.luas_pagar ? Number(formData.luas_pagar) : null),
      luas_bangunan: firstCert.luas_bangunan !== null && firstCert.luas_bangunan !== undefined ? firstCert.luas_bangunan : (formData.luas_bangunan ? Number(formData.luas_bangunan) : null),
      keterangan: formData.keterangan?.trim() || null,
      certificates: cleanedCerts,
      mode_edit: formData.mode_edit || "koreksi",
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsSaving(true);
    try {
      const data = await parseExcelFile(file);
      const total = await importLandCSV("logistikku_app_01", data);
      showNotif(`Sukses! ${total} data tanah berhasil di-import.`, "success", () => {
        router.reload({ only: ['buildingLands'] });
      });
    } catch (err) {
      console.error(err);
      showNotif(err.response?.data?.message || err.message || "Gagal import! Pastikan file Excel valid dan kolom header sesuai template.", "error");
    } finally {
      setIsSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300 relative print:hidden">

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
              <Map className="w-6 h-6 text-[#0d5c3a] dark:text-emerald-400" /> Daftar Tanah
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
              className="flex items-center gap-2 bg-[#279969] hover:bg-[#1e7a53] disabled:bg-[#279969]/50 text-white px-5 py-2.5 rounded-full font-bold shadow-md shadow-[#279969]/30 transition-all text-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>
            {!isGuest && (
              <>
                <button
                  type="button"
                  onClick={downloadLandTemplate}
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
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Import Excel
                </button>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  aria-label="Upload file Excel data tanah"
                />
              </>
            )}
          </div>
        </div>


        {/* Tabel Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search Bar */}
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

                {/* Reset Filters button if any filter active */}
                {(filterStatusShgb !== "all" || searchQuery !== "") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterStatusShgb("all");
                      setCurrentPage(1);
                    }}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold hover:underline shrink-0 cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                {!isGuest && (
                  <button
                    type="button"
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-[#0d5c3a] hover:bg-[#0a462c] text-white px-5 py-2 rounded-full font-bold shadow-md shadow-[#0d5c3a]/20 transition-all text-xs shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Tanah
                  </button>
                )}
                <div className="bg-emerald-50 text-[#0d5c3a] dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 px-4 py-2 rounded-full text-xs font-bold shrink-0">
                  Total Lahan: {filteredLands.length}
                </div>
              </div>
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="flex flex-wrap gap-4 border-t border-gray-100 pt-3">
              {/* Status SHGB Filter */}
              <div className="w-full sm:w-60">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Status SHGB</label>
                <select
                  value={filterStatusShgb}
                  onChange={(e) => {
                    setFilterStatusShgb(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm cursor-pointer"
                >
                  <option value="all">Semua Status SHGB</option>
                  <option value="aktif">Aktif</option>
                  <option value="hampir_habis">Hampir Habis</option>
                  <option value="expired">Habis Masa Berlaku</option>
                  <option value="selesai">Selesai</option>
                </select>
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
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[2230px] table-fixed">
              <colgroup>
                <col className="w-[50px]" />
                <col className="w-[150px]" />
                <col className="w-[220px]" />
                <col className="w-[120px]" />
                <col className="w-[80px]" /> {/* Sisa Waktu */}
                <col className="w-[150px]" /> {/* Status */}
                <col className="w-[110px]" />
                <col className="w-[110px]" />
                <col className="w-[110px]" />
                <col className="w-[120px]" />
                <col className="w-[110px]" />
                <col className="w-[140px]" />
                <col className="w-[100px]" /> {/* Mulai */}
                <col className="w-[100px]" /> {/* Berakhir */}
                <col className="w-[90px]" />
                <col className="w-[110px]" />
                <col className="w-[110px]" />
                <col className="w-[130px]" />
                <col className="w-[150px]" />
                <col className="w-[100px]" />
              </colgroup>
              <thead>
                <tr className="bg-[#0d5c3a] text-slate-100 text-[11px] font-bold uppercase tracking-wider text-center">
                  <th rowSpan="2" className="p-2.5 w-[50px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">No</th>
                  <th rowSpan="2" className="p-2.5 w-[150px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Unit Kerja</th>
                  <th rowSpan="2" className="p-2.5 w-[220px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Alamat</th>
                  <th rowSpan="2" className="p-2.5 w-[120px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Peruntukan</th>
                  <th rowSpan="2" className="p-2.5 w-[80px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Sisa Waktu</th>
                  <th rowSpan="2" className="p-2.5 w-[150px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Status</th>
                  <th rowSpan="2" className="p-2.5 w-[110px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Aset SAP</th>
                  <th rowSpan="2" className="p-2.5 w-[110px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">No. SHGB</th>
                  <th rowSpan="2" className="p-2.5 w-[110px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">No. Sertifikat</th>
                  <th rowSpan="2" className="p-2.5 w-[120px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">No. Sertifikat Gabungan</th>
                  <th rowSpan="2" className="p-2.5 w-[110px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">No. IMB</th>
                  <th rowSpan="2" className="p-2.5 w-[140px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Nama Pemilik IMB</th>
                  <th colSpan="2" className="p-1.5 text-center border border-[#0a4228] bg-[#0d5c3a]">Tanggal SHGB</th>
                  <th rowSpan="2" className="p-2.5 w-[90px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Tahun Perolehan</th>
                  <th rowSpan="2" className="p-2.5 w-[110px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Luas Tanah (m²)</th>
                  <th rowSpan="2" className="p-2.5 w-[110px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Luas Pagar (m²)</th>
                  <th rowSpan="2" className="p-2.5 w-[130px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Luas Bangunan (m²)</th>
                  <th rowSpan="2" className="p-2.5 w-[150px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Keterangan</th>
                  <th rowSpan="2" className="p-2.5 w-[100px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Aksi</th>
                </tr>
                <tr className="bg-[#0d5c3a] text-slate-100 text-[11px] font-bold uppercase tracking-wider text-center">
                  <th className="p-1.5 w-[90px] text-center border border-[#0a4228] bg-[#0d5c3a]">Mulai</th>
                  <th className="p-1.5 w-[90px] text-center border border-[#0a4228] bg-[#0d5c3a]">Berakhir</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-800 bg-white">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="20" className="p-4 text-center text-gray-400 border border-slate-200">
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
                        onMouseEnter={() => setHoveredGroupNo(item._groupVisualNo)}
                        onMouseLeave={() => setHoveredGroupNo(null)}
                      >
                        {/* No (#) */}
                        {item._isFirstInGroup && (
                          <td
                            rowSpan={item._rowSpan}
                            onClick={() => handleCellClick(item.id, "no")}
                            className={getCellClass(item, "no", "text-center font-semibold bg-white/70 truncate align-middle")}
                            title={item._groupVisualNo}
                          >
                            {item._groupVisualNo}
                          </td>
                        )}

                        {/* Unit Kerja */}
                        {item._isFirstInGroup && (
                          <td
                            rowSpan={item._rowSpan}
                            onClick={() => handleCellClick(item.id, "unit_kerja")}
                            className={getCellClass(item, "unit_kerja", "font-semibold text-gray-900 bg-white/70 whitespace-normal break-words align-middle")}
                            title={item.unit_kerja || "-"}
                          >
                            {item.unit_kerja || "-"}
                          </td>
                        )}

                        {/* Alamat */}
                        {item._isFirstInGroup && (
                          <td
                            rowSpan={item._rowSpan}
                            onClick={() => handleCellClick(item.id, "alamat")}
                            className={getCellClass(item, "alamat", "whitespace-normal break-words bg-white/70 align-middle")}
                            title={item.alamat}
                          >
                            {item.alamat || "-"}
                          </td>
                        )}

                        {/* Peruntukan */}
                        <td
                          onClick={() => handleCellClick(item.id, "peruntukan")}
                          className={getCellClass(item, "peruntukan", "whitespace-normal break-words")}
                          title={item.peruntukan || "-"}
                        >
                          {item.peruntukan || "-"}
                        </td>

                        {/* Sisa Waktu */}
                        <td
                          onClick={() => handleCellClick(item.id, "sisa_waktu")}
                          className={getCellClass(item, "sisa_waktu", "text-center font-medium text-xs bg-white/70")}
                          title={hitungSisaWaktu(item.tgl_berakhir_shgb)}
                        >
                          <span className={(getStatusInfo(item) === "Hampir Habis" || getStatusInfo(item) === "Habis Masa Berlaku") ? "text-red-600 font-bold" : "text-gray-700"}>
                            {hitungSisaWaktu(item.tgl_berakhir_shgb)}
                          </span>
                        </td>

                        {/* Status */}
                        <td
                          className={getCellClass(item, "status", "text-center")}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {(() => {
                            const status = getStatusInfo(item);
                            const originalStatus = item.status === "Done" || item.status === "Selesai" ? "Selesai" : status;
                            const currentStatus = localStatuses[item.id] !== undefined
                              ? localStatuses[item.id]
                              : originalStatus;

                            const displayStatus = currentStatus === "Done" || currentStatus === "Selesai"
                              ? "Selesai"
                              : (currentStatus === "Expired" || currentStatus === "Habis Masa Berlaku" ? "Habis Masa Berlaku" : currentStatus);

                            if (isGuest) {
                              return (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${getStatusBadge(currentStatus)}`} style={{ minWidth: '105px', textAlign: 'center' }}>
                                  {displayStatus}
                                </span>
                              );
                            }

                            if (originalStatus === "Habis Masa Berlaku" || originalStatus === "Expired") {
                              return (
                                <select
                                  value={displayStatus === "Selesai" ? "Selesai" : "Habis Masa Berlaku"}
                                  onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                  className={`text-center pl-2 pr-5 py-0.5 rounded text-[10px] font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${getStatusBadge(currentStatus)}`}
                                  style={{ minWidth: '105px', textAlignLast: 'center' }}
                                >
                                  <option value="Habis Masa Berlaku" className="bg-white text-gray-800">Habis Masa Berlaku</option>
                                  <option value="Selesai" className="bg-white text-gray-800">Selesai</option>
                                </select>
                              );
                            } else if (originalStatus === "Hampir Habis") {
                              return (
                                <select
                                  value={displayStatus}
                                  onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                  className={`text-center pl-2 pr-5 py-0.5 rounded text-[10px] font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${getStatusBadge(currentStatus)}`}
                                  style={{ minWidth: '105px', textAlignLast: 'center' }}
                                >
                                  <option value="Hampir Habis" className="bg-white text-gray-800">Hampir Habis</option>
                                  <option value="Selesai" className="bg-white text-gray-800">Selesai</option>
                                </select>
                              );
                            } else if (originalStatus === "Selesai") {
                              const naturalStatus = getStatusInfo({ ...item, status: null });
                              return (
                                <select
                                  value={displayStatus === "Selesai" ? "Selesai" : (naturalStatus === "Expired" || naturalStatus === "Habis Masa Berlaku" ? "Habis Masa Berlaku" : naturalStatus)}
                                  onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                  className={`text-center pl-2 pr-5 py-0.5 rounded text-[10px] font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${getStatusBadge(currentStatus)}`}
                                  style={{ minWidth: '105px', textAlignLast: 'center' }}
                                >
                                  <option value="Selesai" className="bg-white text-gray-800">Selesai</option>
                                  <option value={naturalStatus === "Expired" || naturalStatus === "Habis Masa Berlaku" ? "Habis Masa Berlaku" : naturalStatus} className="bg-white text-gray-800">
                                    {naturalStatus === "Expired" || naturalStatus === "Habis Masa Berlaku" ? "Habis Masa Berlaku" : naturalStatus}
                                  </option>
                                </select>
                              );
                            } else {
                              return (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${getStatusBadge(currentStatus)}`} style={{ minWidth: '105px', textAlign: 'center' }}>
                                  {displayStatus}
                                </span>
                              );
                            }
                          })()}
                        </td>

                        {/* Aset SAP */}
                        <td
                          onClick={() => handleCellClick(item.id, "aset_sap")}
                          className={getCellClass(item, "aset_sap", "whitespace-normal break-words")}
                          title={item.aset_sap || "-"}
                        >
                          {item.aset_sap || "-"}
                        </td>

                        {/* No. SHGB */}
                        <td
                          onClick={() => handleCellClick(item.id, "no_shgb")}
                          className={getCellClass(item, "no_shgb", "whitespace-pre-line break-words leading-tight")}
                          title={item.no_shgb || "-"}
                        >
                          {item.no_shgb || "-"}
                        </td>

                        {/* No. Sertifikat */}
                        <td
                          onClick={() => handleCellClick(item.id, "no_sertifikat")}
                          className={getCellClass(item, "no_sertifikat", "whitespace-normal break-words")}
                          title={item.no_sertifikat || "-"}
                        >
                          {item.no_sertifikat || "-"}
                        </td>

                        {/* No. Sertifikat Gabungan */}
                        {item._isFirstInGroup && (
                          <td
                            rowSpan={item._rowSpan}
                            onClick={() => handleCellClick(item.id, "no_sertifikat_gabungan")}
                            className={getCellClass(item, "no_sertifikat_gabungan", "whitespace-normal break-words font-semibold text-blue-900 bg-white/70 align-middle")}
                            title={item.no_sertifikat_gabungan || "-"}
                          >
                            {item.no_sertifikat_gabungan || "-"}
                          </td>
                        )}

                        {/* No. IMB */}
                        {item._isFirstInGroup && (
                          <td
                            rowSpan={item._rowSpan}
                            onClick={() => handleCellClick(item.id, "no_imb")}
                            className={getCellClass(item, "no_imb", "whitespace-normal break-words bg-white/70 align-middle")}
                            title={item.no_imb || "-"}
                          >
                            {item.no_imb || "-"}
                          </td>
                        )}

                        {/* Nama Pemilik IMB */}
                        {item._isFirstInGroup && (
                          <td
                            rowSpan={item._rowSpan}
                            onClick={() => handleCellClick(item.id, "nama_pemilik_imb")}
                            className={getCellClass(item, "nama_pemilik_imb", "whitespace-normal break-words bg-white/70 align-middle")}
                            title={item.nama_pemilik_imb || "-"}
                          >
                            {item.nama_pemilik_imb || "-"}
                          </td>
                        )}

                        {/* Tanggal SHGB Mulai */}
                        <td
                          onClick={() => handleCellClick(item.id, "tgl_mulai_shgb")}
                          className={getCellClass(item, "tgl_mulai_shgb", "text-center")}
                          title={formatDate(item.tgl_mulai_shgb)}
                        >
                          {formatDate(item.tgl_mulai_shgb)}
                        </td>

                        {/* Tanggal SHGB Berakhir */}
                        <td
                          onClick={() => handleCellClick(item.id, "tgl_berakhir_shgb")}
                          className={getCellClass(item, "tgl_berakhir_shgb", "text-center")}
                          title={formatDate(item.tgl_berakhir_shgb)}
                        >
                          {formatDate(item.tgl_berakhir_shgb)}
                        </td>

                        {/* Tahun Perolehan */}
                        <td
                          onClick={() => handleCellClick(item.id, "tahun_perolehan")}
                          className={getCellClass(item, "tahun_perolehan", "text-center font-medium")}
                          title={item.tahun_perolehan || "-"}
                        >
                          {item.tahun_perolehan || "-"}
                        </td>

                        {/* Luas Lahan (m²) */}
                        <td
                          onClick={() => handleCellClick(item.id, "luas_tanah")}
                          className={getCellClass(item, "luas_tanah", "font-medium")}
                          title={item.luas_tanah ? `${Number(item.luas_tanah).toLocaleString("id-ID")} m²` : "-"}
                        >
                          {item.luas_tanah ? `${Number(item.luas_tanah).toLocaleString("id-ID")} m²` : "-"}
                        </td>

                        {/* Luas Pagar (m²) */}
                        <td
                          onClick={() => handleCellClick(item.id, "luas_pagar")}
                          className={getCellClass(item, "luas_pagar", "font-medium")}
                          title={item.luas_pagar ? `${Number(item.luas_pagar).toLocaleString("id-ID")} m²` : "-"}
                        >
                          {item.luas_pagar ? `${Number(item.luas_pagar).toLocaleString("id-ID")} m²` : "-"}
                        </td>

                        {/* Luas Bangunan (m²) */}
                        <td
                          onClick={() => handleCellClick(item.id, "luas_bangunan")}
                          className={getCellClass(item, "luas_bangunan", "font-medium")}
                          title={item.luas_bangunan ? `${Number(item.luas_bangunan).toLocaleString("id-ID")} m²` : "-"}
                        >
                          {item.luas_bangunan ? `${Number(item.luas_bangunan).toLocaleString("id-ID")} m²` : "-"}
                        </td>

                        {/* Keterangan */}
                        <td
                          onClick={() => handleCellClick(item.id, "keterangan")}
                          className={getCellClass(item, "keterangan", "text-[10px] text-gray-500 whitespace-normal break-words")}
                          title={item.keterangan}
                        >
                          {item.keterangan || "-"}
                        </td>

                        {/* Aksi */}
                        <td className={getCellClass(item, "aksi", "text-center")}>
                          <div className="flex justify-center items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailItem(item);
                              }}
                              title="Detail & Riwayat SHGB"
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {canModify && (
                              <>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200/80 flex items-center justify-between bg-slate-50/30">
              <span className="text-xs text-gray-500">
                Menampilkan {startIndex + 1} sampai {Math.min(startIndex + itemsPerPage, sortedLands.length)} dari {sortedLands.length} data
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-gradient-to-b dark:from-[#052819] dark:via-[#073622] dark:to-[#03140d] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
            
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#0d5c3a] via-[#156e49] to-[#279969] text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/15 rounded-xl border border-white/20">
                  <Map className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg leading-tight text-white">
                    {editingId ? "Edit Data Aset Tanah" : "Tambah Data Aset Tanah Baru"}
                  </h3>
                  <p className="text-xs text-emerald-100/90 mt-0.5">
                    Pilih nama unit kerja untuk mengisi informasi tanah, legalitas SHGB, dan IMB secara otomatis.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                aria-label="Tutup modal"
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white/80 hover:text-white disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-5 overflow-y-auto flex-1 custom-scrollbar space-y-4">

                {/* Mode Edit Choice (Only when editing) */}
                {editingId && (
                  <div className="bg-blue-50/70 dark:bg-[#14261c] border border-blue-200 dark:border-gray-700 rounded-xl p-3 mb-1">
                    <label className="block text-xs font-bold text-blue-900 dark:text-white mb-2">
                      Tujuan Pengubahan Data:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${formData.mode_edit === 'koreksi' || !formData.mode_edit ? 'bg-white dark:bg-[#1a2e22] border-blue-500 dark:border-blue-400 font-semibold text-blue-900 dark:text-blue-300 shadow-2xs' : 'bg-white/50 dark:bg-[#1a2e22]/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#1a2e22]'}`}>
                        <input
                          type="radio"
                          name="mode_edit"
                          value="koreksi"
                          checked={formData.mode_edit === 'koreksi' || !formData.mode_edit}
                          onChange={() => setFormData(p => ({ ...p, mode_edit: 'koreksi' }))}
                          className="mt-0.5 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="block font-semibold">Koreksi / Perbaiki Data</span>
                          <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-normal mt-0.5">Mengedit kesalahan data (tanpa simpan riwayat)</span>
                        </div>
                      </label>

                      <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${formData.mode_edit === 'perpanjang' ? 'bg-white dark:bg-[#1a2e22] border-emerald-500 dark:border-emerald-400 font-semibold text-emerald-900 dark:text-emerald-300 shadow-2xs' : 'bg-white/50 dark:bg-[#1a2e22]/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#1a2e22]'}`}>
                        <input
                          type="radio"
                          name="mode_edit"
                          value="perpanjang"
                          checked={formData.mode_edit === 'perpanjang'}
                          onChange={() => setFormData(p => ({ ...p, mode_edit: 'perpanjang' }))}
                          className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="block font-semibold text-emerald-700 dark:text-emerald-400">Perpanjang Masa SHGB</span>
                          <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-normal mt-0.5">Memperpanjang SHGB (simpan riwayat lama)</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Section 1: Informasi Umum & Lahan */}
                <div className="space-y-3 bg-white dark:bg-[#14261c] p-3.5 sm:p-4 rounded-xl border border-slate-200/80 dark:border-gray-700 shadow-xs">
                  <h4 className="font-bold text-[11px] text-[#0d5c3a] dark:text-emerald-400 pb-1 uppercase tracking-wide flex items-center gap-1.5 border-b border-emerald-100 dark:border-white/10">
                    <MapPin className="w-3.5 h-3.5" /> 1. Informasi Umum & Wilayah
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="sm:col-span-2">
                      <CustomSelectDropdown
                        label="Unit Kerja *"
                        labelCls="block text-[11px] font-bold text-gray-900 dark:text-white mb-1"
                        value={formData.unit_kerja}
                        onChange={(e) => handleUnitKerjaChange(e.target ? e.target.value : e)}
                        onSelect={(u) => handleUnitKerjaChange(u.nama || u.value)}
                        options={outlets.map((o) => ({ id: o.id, nama: o.nama }))}
                        placeholder="Pilih atau ketik Unit Kerja..."
                        disabled={isSaving}
                        allowCustomInput={true}
                        inputCls="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">Alamat</label>
                      <textarea
                        rows="2"
                        value={formData.alamat}
                        onChange={(e) => setFormData((p) => ({ ...p, alamat: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none custom-scrollbar transition-all"
                        placeholder="Alamat lengkap lahan..."
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">Peruntukan</label>
                      <input
                        type="text"
                        value={formData.peruntukan}
                        onChange={(e) => setFormData((p) => ({ ...p, peruntukan: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                        placeholder="Contoh: Kantor Cabang, Gudang..."
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">Aset SAP</label>
                      <input
                        type="text"
                        value={formData.aset_sap}
                        onChange={(e) => setFormData((p) => ({ ...p, aset_sap: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                        placeholder="Nomor Aset SAP..."
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Legalitas & Sertifikat */}
                <div className="space-y-3.5 bg-white dark:bg-[#14261c] p-3.5 sm:p-4 rounded-xl border border-slate-200/80 dark:border-gray-700 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-emerald-100 dark:border-white/10">
                    <div>
                      <h4 className="font-bold text-[11px] text-[#0d5c3a] dark:text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> 2. Legalitas & Sertifikat
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Tambahkan satu atau beberapa dokumen sertifikat/legalitas untuk aset tanah ini.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCertificate}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 bg-emerald-50 dark:bg-[#1a2e22] hover:bg-emerald-100 dark:hover:bg-[#213b2c] text-[#0d5c3a] dark:text-emerald-300 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors border border-emerald-200 dark:border-emerald-700 shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Tambah Sertifikat</span>
                    </button>
                  </div>

                  {/* List of Certificate Items */}
                  <div className="space-y-3.5">
                    {(formData.certificates || []).map((cert, idx) => (
                      <div key={idx} className="p-3 sm:p-3.5 bg-slate-50/70 dark:bg-[#1a2e22]/50 rounded-xl border border-slate-200/80 dark:border-gray-700/80 space-y-3 relative transition-all">
                        {/* Certificate Item Header */}
                        <div className="flex items-center justify-between pb-1.5 border-b border-gray-200/70 dark:border-white/10">
                          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#0d5c3a] text-white text-[10px] flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            Sertifikat #{idx + 1}
                          </span>
                          {(formData.certificates || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCertificate(idx)}
                              disabled={isSaving}
                              className="flex items-center gap-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 px-2 py-1 rounded-lg transition-colors text-xs font-bold cursor-pointer"
                              title="Hapus Sertifikat Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          )}
                        </div>

                        {/* Dokumen SHGB */}
                        <div className="space-y-2.5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">No. SHGB</label>
                              <textarea
                                rows={2}
                                value={cert.no_shgb || ""}
                                onChange={(e) => handleCertificateChange(idx, "no_shgb", e.target.value)}
                                disabled={isSaving}
                                className="w-full px-3.5 py-1.5 bg-white dark:bg-[#14261c] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-2xs transition-all resize-none whitespace-pre-line leading-relaxed"
                                placeholder={"Contoh:\nHGB NO.781\nAT954504"}
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">No. Sertifikat</label>
                              <input
                                type="text"
                                value={cert.no_sertifikat || ""}
                                onChange={(e) => handleCertificateChange(idx, "no_sertifikat", e.target.value)}
                                disabled={isSaving}
                                className="w-full px-3.5 py-2 bg-white dark:bg-[#14261c] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-2xs transition-all"
                                placeholder="Contoh: 00012/Kramat..."
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">Tanggal SHGB Mulai</label>
                              <input
                                type="date"
                                value={cert.tgl_mulai_shgb || ""}
                                onChange={(e) => handleCertificateChange(idx, "tgl_mulai_shgb", e.target.value)}
                                disabled={isSaving}
                                className="w-full px-3.5 py-2 bg-white dark:bg-[#14261c] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white shadow-2xs transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">Tanggal SHGB Berakhir</label>
                              <input
                                type="date"
                                value={cert.tgl_berakhir_shgb || ""}
                                onChange={(e) => handleCertificateChange(idx, "tgl_berakhir_shgb", e.target.value)}
                                disabled={isSaving}
                                className="w-full px-3.5 py-2 bg-white dark:bg-[#14261c] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white shadow-2xs transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Dokumen IMB */}
                        <div className="pt-2 border-t border-gray-200/60 dark:border-white/5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">No. IMB</label>
                              <input
                                type="text"
                                value={cert.no_imb || ""}
                                onChange={(e) => handleCertificateChange(idx, "no_imb", e.target.value)}
                                disabled={isSaving}
                                className="w-full px-3.5 py-2 bg-white dark:bg-[#14261c] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-2xs transition-all"
                                placeholder="Contoh: IMB-2020/001..."
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">Nama Pemilik IMB</label>
                              <input
                                type="text"
                                value={cert.nama_pemilik_imb || ""}
                                onChange={(e) => handleCertificateChange(idx, "nama_pemilik_imb", e.target.value)}
                                disabled={isSaving}
                                className="w-full px-3.5 py-2 bg-white dark:bg-[#14261c] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-2xs transition-all"
                                placeholder="Masukkan nama pemilik IMB..."
                              />
                            </div>
                          </div>
                        </div>

                        {/* Dimensi & Spesifikasi Fisik */}
                        <div className="pt-2 border-t border-gray-200/60 dark:border-white/5">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">Thn Perolehan</label>
                              <input
                                type="number"
                                value={cert.tahun_perolehan || ""}
                                onChange={(e) => handleCertificateChange(idx, "tahun_perolehan", e.target.value)}
                                disabled={isSaving}
                                className="w-full px-3 py-2 bg-white dark:bg-[#14261c] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-2xs transition-all"
                                placeholder="Contoh: 2020"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">Luas Tanah (m²)</label>
                              <input
                                type="number"
                                step="any"
                                value={cert.luas_tanah || ""}
                                onChange={(e) => handleCertificateChange(idx, "luas_tanah", e.target.value)}
                                disabled={isSaving}
                                className="w-full px-3 py-2 bg-white dark:bg-[#14261c] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-2xs transition-all"
                                placeholder="Contoh: 500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">Luas Bangunan (m²)</label>
                              <input
                                type="number"
                                step="any"
                                value={cert.luas_bangunan || ""}
                                onChange={(e) => handleCertificateChange(idx, "luas_bangunan", e.target.value)}
                                disabled={isSaving}
                                className="w-full px-3 py-2 bg-white dark:bg-[#14261c] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-2xs transition-all"
                                placeholder="Contoh: 250"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">Luas Pagar (m²)</label>
                              <input
                                type="number"
                                step="any"
                                value={cert.luas_pagar || ""}
                                onChange={(e) => handleCertificateChange(idx, "luas_pagar", e.target.value)}
                                disabled={isSaving}
                                className="w-full px-3 py-2 bg-white dark:bg-[#14261c] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-2xs transition-all"
                                placeholder="Contoh: 150"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary / Manual Input Box for Merged Info (Only shown if > 1 certificate) */}
                  {(formData.certificates || []).length > 1 && (
                    <div className="p-3 sm:p-3.5 bg-blue-50/70 dark:bg-[#1a2e22]/70 rounded-xl border border-blue-200/80 dark:border-gray-700 space-y-2.5 animate-in fade-in duration-200 shadow-xs">
                      <div className="flex items-center justify-between pb-1 border-b border-blue-200/60 dark:border-white/10">
                        <span className="text-xs font-extrabold text-blue-900 dark:text-emerald-400 uppercase tracking-wider block">
                          Hasil Gabungan ({(formData.certificates || []).length} Sertifikat)
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">
                            No. Sertifikat Gabungan
                          </label>
                          <input
                            type="text"
                            value={formData.no_sertifikat_gabungan || ""}
                            onChange={(e) => setFormData((p) => ({ ...p, no_sertifikat_gabungan: e.target.value }))}
                            disabled={isSaving}
                            className="w-full px-3.5 py-2 bg-white dark:bg-[#14261c] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                            placeholder="Masukkan nomor sertifikat gabungan..."
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">
                            No. IMB (Gabungan)
                          </label>
                          <input
                            type="text"
                            value={formData.no_imb || ""}
                            onChange={(e) => setFormData((p) => ({ ...p, no_imb: e.target.value }))}
                            disabled={isSaving}
                            className="w-full px-3.5 py-2 bg-white dark:bg-[#14261c] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                            placeholder="Masukkan nomor IMB gabungan..."
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">
                            Nama Pemilik IMB
                          </label>
                          <input
                            type="text"
                            value={formData.nama_pemilik_imb || ""}
                            onChange={(e) => setFormData((p) => ({ ...p, nama_pemilik_imb: e.target.value }))}
                            disabled={isSaving}
                            className="w-full px-3.5 py-2 bg-white dark:bg-[#14261c] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                            placeholder="Masukkan nama pemilik IMB..."
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Catatan & Keterangan */}
                <div className="space-y-3 bg-white dark:bg-[#14261c] p-3.5 sm:p-4 rounded-xl border border-slate-200/80 dark:border-gray-700 shadow-xs">
                  <h4 className="font-bold text-[11px] text-[#0d5c3a] dark:text-emerald-400 pb-1 uppercase tracking-wide flex items-center gap-1.5 border-b border-emerald-100 dark:border-white/10">
                    <FileText className="w-3.5 h-3.5" /> 3. Catatan & Keterangan
                  </h4>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">Keterangan</label>
                    <textarea
                      rows="2"
                      value={formData.keterangan}
                      onChange={(e) => setFormData((p) => ({ ...p, keterangan: e.target.value }))}
                      disabled={isSaving}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none custom-scrollbar transition-all"
                      placeholder="Catatan tambahan..."
                    />
                  </div>
                </div>

              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-[#03140d] border-t border-gray-100 dark:border-white/10 flex justify-end items-center gap-3 shrink-0 rounded-b-2xl sm:rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-[#1a2e22] transition-all border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#14261c] cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#0d5c3a] hover:bg-[#156e49] shadow-md shadow-[#0d5c3a]/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  {editingId ? "Simpan Perubahan" : "Simpan Data"}
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
        onClose={() => {
          setNotif({ show: false, message: "", type: "", onOk: null });
          if (notif.onOk) notif.onOk();
        }}
      />
      {/* Detail & History Modal */}
      <DetailHistoryModal
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
        item={detailItem}
        type="tanah"
        onEditItem={openEdit}
      />
    </>
  );
}
