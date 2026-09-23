// resources/js/Components/Bangunan/SaranaPengamanan/index.jsx
import React, { useState, useRef, useEffect } from "react";
import { Shield, Search, Plus, FileSpreadsheet, Edit, Trash2, X, Loader2, FileText, Upload } from "lucide-react";
import axios from "axios";
import { router } from "@inertiajs/react";
import * as XLSX from "xlsx";
import { parseExcelFile } from "../../../utils/excelHelper";

import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";
import ToastNotif from "../../Modal/ToastNotif";
import { importSecurityCSV, downloadSecurityTemplate } from "../../../services/securityService";
import CustomSelectDropdown from "../../Form/CustomSelectDropdown";

const DropdownSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div ref={containerRef} className="relative w-full text-left font-sans">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[38px] px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm cursor-pointer flex justify-between items-center"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto p-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`block px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors truncate ${
                value === opt.value ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SearchableSelect = ({ label, value, onChange, options, placeholder, disabled, className, labelCls }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
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
    <div ref={containerRef} className="relative w-full text-left font-sans">
      <label className={labelCls}>{label}</label>
      <div 
        onClick={() => { if (!disabled) { setIsOpen(!isOpen); setSearch(""); } }}
        className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer flex justify-between items-center text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
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

export default function SaranaPengamanan({ userRole, facilities = [], outlets = [], securityFilter = "", setSecurityFilter }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  React.useEffect(() => {
    if (securityFilter === "") {
      setSearchQuery("");
      setFilterArea("all");
      setFilterCabang("all");
      setFilterStatus("all");
    } else if (securityFilter === "online") {
      setFilterStatus("Online");
      setCurrentPage(1);
    } else if (securityFilter === "offline") {
      setFilterStatus("Offline");
      setCurrentPage(1);
    }
  }, [securityFilter]);

  React.useEffect(() => {
    const handleReset = () => {
      setSearchQuery("");
      setFilterArea("all");
      setFilterCabang("all");
      setFilterStatus("all");
      setCurrentPage(1);
      setSelectedId(null);
      setHoveredId(null);
    };
    window.addEventListener("reset-all-filters", handleReset);
    return () => window.removeEventListener("reset-all-filters", handleReset);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Row selection and hover states
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  // Filter States
  const [filterArea, setFilterArea] = useState("all");
  const [filterCabang, setFilterCabang] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [localStatuses, setLocalStatuses] = useState({});

  const [formData, setFormData] = useState({
    no_urut: "",
    kantor_wilayah: "KANWIL JAKARTA 1",
    kantor_area: "",
    kantor_cabang: "",
    kode_unit_kerja: "",
    nama_unit_kerja: "",
    outlet_id: "",
    idOutlet: "",
    status: "Online",
    vendor: "",
    jumlah_kamera: "",
    aplikasi: "",
    nama_aplikasi: "",
    keterangan: "",
  });

  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: "" });
  const [notif, setNotif] = useState({ show: false, message: "", type: "success", onOk: null });

  const showNotif = (message, type = "success", onOk = null) => {
    setNotif({ show: true, message, type, onOk });
  };

  // Dynamic filter options
  const uniqueAreas = Array.from(new Set(facilities.map((f) => f.kantor_area).filter(Boolean))).sort();
  const uniqueCabangs = Array.from(
    new Set(
      facilities
        .filter((f) => filterArea === "all" || f.kantor_area === filterArea)
        .map((f) => f.kantor_cabang)
        .filter(Boolean)
    )
  ).sort();
  const cabangOptions = [
    { value: "all", label: "Semua Kantor Cabang" },
    ...uniqueCabangs.map((c) => ({ value: c, label: c }))
  ];

  // Prepare rich option objects for Master Outlets
  const outletOptions = React.useMemo(() => {
    const seen = new Set();
    const options = [];

    // Add from master outlets
    (outlets || []).forEach((o) => {
      if (!o.nama) return;
      const key = o.nama.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        const subParts = [];
        if (o.code || o.id) subParts.push(`Kode: ${o.code || o.id}`);
        if (o.area) subParts.push(`Area: ${o.area}`);
        if (o.cabang) subParts.push(`Cabang: ${o.cabang}`);
        options.push({
          id: o.id,
          value: o.nama,
          label: o.nama,
          subtext: subParts.join(" • ") || "Master Outlet",
          raw: o,
        });
      }
    });

    // Add any other unit kerja from facilities if not in outlets
    (facilities || []).forEach((f) => {
      if (!f.nama_unit_kerja) return;
      const key = f.nama_unit_kerja.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        const subParts = [];
        if (f.kode_unit_kerja) subParts.push(`Kode: ${f.kode_unit_kerja}`);
        if (f.kantor_area) subParts.push(`Area: ${f.kantor_area}`);
        if (f.kantor_cabang) subParts.push(`Cabang: ${f.kantor_cabang}`);
        options.push({
          id: f.id,
          value: f.nama_unit_kerja,
          label: f.nama_unit_kerja,
          subtext: subParts.join(" • ") || "Unit Kerja",
          raw: {
            nama: f.nama_unit_kerja,
            code: f.kode_unit_kerja,
            area: f.kantor_area,
            cabang: f.kantor_cabang,
            id: f.outlet_id,
          },
        });
      }
    });

    return options;
  }, [outlets, facilities]);

  // Check matched master outlet
  const matchedOutlet = React.useMemo(() => {
    const curName = (formData.nama_unit_kerja || "").trim().toLowerCase();
    const curCode = (formData.kode_unit_kerja || "").trim().toLowerCase();
    if (!curName && !curCode) return null;
    return (outlets || []).find(
      (o) =>
        (curName && o.nama && o.nama.toLowerCase() === curName) ||
        (curCode && o.code && String(o.code).toLowerCase() === curCode) ||
        (curCode && String(o.id) === curCode)
    );
  }, [formData.nama_unit_kerja, formData.kode_unit_kerja, outlets]);

  // Filter
  const filteredFacilities = facilities.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      (item.no_urut && String(item.no_urut).toLowerCase().includes(q)) ||
      (item.kantor_wilayah && item.kantor_wilayah.toLowerCase().includes(q)) ||
      (item.kantor_area && item.kantor_area.toLowerCase().includes(q)) ||
      (item.kantor_cabang && item.kantor_cabang.toLowerCase().includes(q)) ||
      (item.kode_unit_kerja && item.kode_unit_kerja.toLowerCase().includes(q)) ||
      (item.nama_unit_kerja && item.nama_unit_kerja.toLowerCase().includes(q)) ||
      (item.status && item.status.toLowerCase().includes(q)) ||
      (item.vendor && item.vendor.toLowerCase().includes(q)) ||
      (item.jumlah_kamera && String(item.jumlah_kamera).includes(q)) ||
      (item.aplikasi && item.aplikasi.toLowerCase().includes(q)) ||
      (item.nama_aplikasi && item.nama_aplikasi.toLowerCase().includes(q)) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(q))
    );

    const matchesArea = filterArea === "all" || item.kantor_area === filterArea;
    const matchesCabang = filterCabang === "all" || item.kantor_cabang === filterCabang;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;

    return matchesSearch && matchesArea && matchesCabang && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredFacilities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredFacilities.slice(startIndex, startIndex + itemsPerPage);

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

  const openAdd = () => {
    setEditingId(null);
    setFormData({
      no_urut: "",
      kantor_wilayah: "KANWIL JAKARTA 1",
      kantor_area: "",
      kantor_cabang: "",
      kode_unit_kerja: "",
      nama_unit_kerja: "",
      outlet_id: "",
      idOutlet: "",
      status: "Online",
      vendor: "",
      jumlah_kamera: "",
      aplikasi: "",
      nama_aplikasi: "",
      keterangan: "",
    });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      no_urut: item.no_urut || "",
      kantor_wilayah: item.kantor_wilayah || "KANWIL JAKARTA 1",
      kantor_area: item.kantor_area || "",
      kantor_cabang: item.kantor_cabang || "",
      kode_unit_kerja: item.kode_unit_kerja || "",
      nama_unit_kerja: item.nama_unit_kerja || "",
      outlet_id: item.outlet_id || "",
      idOutlet: item.outlet_id || "",
      status: item.status || "Online",
      vendor: item.vendor || "",
      jumlah_kamera: item.jumlah_kamera ?? "",
      aplikasi: item.aplikasi || "",
      nama_aplikasi: item.nama_aplikasi || "",
      keterangan: item.keterangan || "",
    });
    setIsModalOpen(true);
  };

  const askDelete = (id, nama) => {
    setDeleteConfirm({ show: true, id, name: nama });
  };

  const confirmDelete = () => {
    setIsSaving(true);
    router.delete(`/security-facilities/${deleteConfirm.id}`, {
      onSuccess: () => {
        showNotif("Data pengamanan & korporasi berhasil dihapus!");
        setDeleteConfirm({ show: false, id: null, name: "" });
      },
      onError: (err) => {
        console.error(err);
        showNotif("Gagal menghapus data pengamanan & korporasi.", "error");
      },
      onFinish: () => {
        setIsSaving(false);
      }
    });
  };

  const handleUnitKerjaChange = (e) => {
    const val = (typeof e === "object" && e !== null && e.target)
      ? e.target.value
      : (typeof e === "object" && e !== null ? (e.nama || e.value || e.label || "") : (e || ""));

    const strVal = String(val).trim();
    const matched = (outlets || []).find(
      (o) => (o.nama && o.nama.toLowerCase() === strVal.toLowerCase()) || String(o.id) === strVal
    );
    const matchedFacility = !matched ? (facilities || []).find(
      (f) => f.nama_unit_kerja && f.nama_unit_kerja.toLowerCase() === strVal.toLowerCase()
    ) : null;

    setFormData((p) => ({
      ...p,
      nama_unit_kerja: matched ? matched.nama : (matchedFacility ? matchedFacility.nama_unit_kerja : strVal),
      kode_unit_kerja: matched ? (matched.code || String(matched.id)) : (matchedFacility?.kode_unit_kerja || p.kode_unit_kerja || ""),
      kantor_wilayah: p.kantor_wilayah || "KANWIL JAKARTA 1",
      kantor_area: matched ? (matched.area || "") : (matchedFacility?.kantor_area || p.kantor_area || ""),
      kantor_cabang: matched ? (matched.cabang || "") : (matchedFacility?.kantor_cabang || p.kantor_cabang || ""),
      outlet_id: matched ? matched.id : (matchedFacility?.outlet_id || p.outlet_id || null),
      idOutlet: matched ? matched.id : (matchedFacility?.outlet_id || p.idOutlet || null),
    }));
  };

  const handleKodeUnitKerjaChange = (e) => {
    const val = e.target.value;
    const strVal = String(val).trim().toLowerCase();

    const matched = (outlets || []).find(
      (o) => (o.code && String(o.code).toLowerCase() === strVal) || String(o.id) === strVal
    );
    const matchedFacility = !matched ? (facilities || []).find(
      (f) => f.kode_unit_kerja && String(f.kode_unit_kerja).toLowerCase() === strVal
    ) : null;

    setFormData((p) => {
      const updated = {
        ...p,
        kode_unit_kerja: val,
        kantor_wilayah: p.kantor_wilayah || "KANWIL JAKARTA 1",
      };
      if (matched) {
        updated.nama_unit_kerja = matched.nama || p.nama_unit_kerja;
        updated.kantor_area = matched.area || p.kantor_area;
        updated.kantor_cabang = matched.cabang || p.kantor_cabang;
        updated.outlet_id = matched.id;
        updated.idOutlet = matched.id;
      } else if (matchedFacility) {
        updated.nama_unit_kerja = matchedFacility.nama_unit_kerja || p.nama_unit_kerja;
        updated.kantor_area = matchedFacility.kantor_area || p.kantor_area;
        updated.kantor_cabang = matchedFacility.kantor_cabang || p.kantor_cabang;
      }
      return updated;
    });
  };

  const handleSave = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const unitName = (formData.nama_unit_kerja || "").trim();
    if (!unitName) {
      showNotif("Nama Unit Kerja wajib diisi!", "error");
      return;
    }
    setIsSaving(true);

    const resolvedOutletId = (formData.outlet_id && !isNaN(Number(formData.outlet_id)))
      ? Number(formData.outlet_id)
      : ((formData.idOutlet && !isNaN(Number(formData.idOutlet))) ? Number(formData.idOutlet) : null);

    const payload = {
      outlet_id: resolvedOutletId,
      idOutlet: resolvedOutletId,
      no_urut: formData.no_urut ? Number(formData.no_urut) : null,
      kantor_wilayah: formData.kantor_wilayah?.trim() || "KANWIL JAKARTA 1",
      kantor_area: formData.kantor_area?.trim() || null,
      kantor_cabang: formData.kantor_cabang?.trim() || null,
      kode_unit_kerja: formData.kode_unit_kerja?.trim() || null,
      nama_unit_kerja: unitName,
      status: formData.status || "Online",
      vendor: formData.vendor?.trim() || null,
      jumlah_kamera: formData.jumlah_kamera !== "" && formData.jumlah_kamera !== null && !isNaN(Number(formData.jumlah_kamera)) ? Number(formData.jumlah_kamera) : null,
      aplikasi: formData.aplikasi?.trim() || null,
      nama_aplikasi: formData.nama_aplikasi?.trim() || null,
      keterangan: formData.keterangan?.trim() || null,
    };

    if (editingId) {
      router.put(`/security-facilities/${editingId}`, payload, {
        onSuccess: () => {
          showNotif("Data pengamanan & korporasi berhasil diperbarui!");
          setIsModalOpen(false);
        },
        onError: (err) => {
          console.error("Update security error:", err);
          const msg = (err.response?.data?.message) || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join("\n") : null) || Object.values(err).flat().join("\n");
          showNotif(msg || "Gagal menyimpan data pengamanan & korporasi.", "error");
        },
        onFinish: () => {
          setIsSaving(false);
        }
      });
    } else {
      router.post("/security-facilities", payload, {
        onSuccess: () => {
          showNotif("Data pengamanan & korporasi baru berhasil ditambahkan!");
          setIsModalOpen(false);
        },
        onError: (err) => {
          console.error("Create security error:", err);
          const msg = (err.response?.data?.message) || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join("\n") : null) || Object.values(err).flat().join("\n");
          showNotif(msg || "Gagal menyimpan data pengamanan & korporasi.", "error");
        },
        onFinish: () => {
          setIsSaving(false);
        }
      });
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const oldStatus = localStatuses[id] !== undefined ? localStatuses[id] : (facilities.find(f => f.id === id)?.status || "Offline");

    // Update UI immediately (optimistic update)
    setLocalStatuses(prev => ({ ...prev, [id]: newStatus }));

    try {
      await axios.put(`/security-facilities/${id}/status`, { status: newStatus });
      router.reload({
        only: ["securityFacilities", "activityLogs"],
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
      // Rollback to old status if server call fails
      setLocalStatuses(prev => ({ ...prev, [id]: oldStatus }));
    }
  };

  const exportToExcel = () => {
    const rows = filteredFacilities.map((item) => ({
      "No.": item.no_urut || "",
      "Kantor Wilayah": item.kantor_wilayah || "",
      "Kantor Area": item.kantor_area || "",
      "Kantor Cabang": item.kantor_cabang || "",
      "Kode Unit Kerja": item.kode_unit_kerja || "",
      "Nama Unit Kerja": item.nama_unit_kerja || "",
      "Status": item.status || "",
      "Vendor": item.vendor || "",
      "Jumlah Kamera": item.jumlah_kamera || "",
      "Aplikasi": item.aplikasi || "",
      "Nama Aplikasi": item.nama_aplikasi || "",
      "Keterangan": item.keterangan || "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pengamanan dan Korporasi");
    XLSX.writeFile(wb, `Pengamanan_dan_Korporasi_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsSaving(true);
    try {
      const data = await parseExcelFile(file);
      const total = await importSecurityCSV(data);
      showNotif(`Sukses! ${total} data pengamanan & korporasi berhasil di-import.`, "success", () => {
        router.reload({ only: ['securityFacilities', 'activityLogs'] });
      });
    } catch (err) {
      console.error(err);
      showNotif(err.response?.data?.message || err.message || "Gagal import! Pastikan file Excel valid dan kolom header sesuai template.", "error");
    } finally {
      setIsSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "online":
        return "bg-green-50 text-green-700 border-green-200";
      case "offline":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300 relative print:hidden">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
              <Shield className="w-6 h-6 text-[#0d5c3a] dark:text-emerald-400" /> Pengamanan dan Korporasi
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Pantau ketersediaan CCTV, sistem alarm, pagar pengamanan, pos satpam, dan perangkat keselamatan korporasi.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={exportToExcel}
              disabled={filteredFacilities.length === 0}
              className="flex items-center gap-2 bg-[#279969] hover:bg-[#1e7a53] disabled:bg-[#279969]/50 text-white px-5 py-2.5 rounded-full font-bold shadow-md shadow-[#279969]/30 transition-all text-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>
            {userRole !== "guest" && (
              <>
                <button
                  type="button"
                  onClick={downloadSecurityTemplate}
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
                  aria-label="Upload file Excel data pengamanan"
                />
              </>
            )}
          </div>
        </div>

        {/* Tabel Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Search & Filter Toolbar */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative w-full sm:w-80">
                  <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Cari sarana keamanan..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                {(() => {
                  const showResetFilter = (() => {
                    if (securityFilter === "online" && filterStatus === "Online") {
                      return filterArea !== "all" || filterCabang !== "all" || searchQuery !== "";
                    }
                    if (securityFilter === "offline" && filterStatus === "Offline") {
                      return filterArea !== "all" || filterCabang !== "all" || searchQuery !== "";
                    }
                    return filterArea !== "all" || filterCabang !== "all" || filterStatus !== "all" || searchQuery !== "";
                  })();

                  return showResetFilter && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setFilterArea("all");
                        setFilterCabang("all");
                        setFilterStatus("all");
                        setCurrentPage(1);
                        if (setSecurityFilter) setSecurityFilter("");
                      }}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold hover:underline shrink-0 cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  );
                })()}
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {userRole !== "guest" && (
                  <button
                    type="button"
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-[#0d5c3a] hover:bg-[#0a462c] text-white px-5 py-2 rounded-full font-bold shadow-md shadow-[#0d5c3a]/20 transition-all text-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Sarana
                  </button>
                )}
                <div className="bg-emerald-50 text-[#0d5c3a] dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 px-4 py-2 rounded-full text-xs font-bold shrink-0 max-w-fit">
                  Total Data: {filteredFacilities.length}
                </div>
              </div>
            </div>

            {/* Dropdown Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Kantor Area Filter */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Kantor Area</label>
                <select
                  value={filterArea}
                  onChange={(e) => { setFilterArea(e.target.value); setFilterCabang("all"); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                >
                  <option value="all">Semua Kantor Area</option>
                  {uniqueAreas.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              {/* Kantor Cabang Filter */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Kantor Cabang</label>
                <DropdownSelect
                  value={filterCabang}
                  onChange={(val) => { setFilterCabang(val); setCurrentPage(1); }}
                  options={cabangOptions}
                  placeholder="Semua Kantor Cabang"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                    if (setSecurityFilter && securityFilter !== "") {
                      setSecurityFilter("");
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
                >
                  <option value="all">Semua Status</option>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
            </div>
          </div>

          {securityFilter === "online" && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between text-sm text-green-800 animate-in fade-in duration-300">
              <span className="font-medium">Menampilkan data CCTV Online.</span>
              <button
                onClick={() => setSecurityFilter("")}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                Hapus Filter
              </button>
            </div>
          )}

          {securityFilter === "offline" && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-sm text-red-800 animate-in fade-in duration-300">
              <span className="font-medium">Menampilkan data CCTV Offline.</span>
              <button
                onClick={() => setSecurityFilter("")}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                Hapus Filter
              </button>
            </div>
          )}

          {/* Table */}
          <div className={`overflow-x-auto custom-scrollbar ${itemsPerPage > 20 ? "max-h-[60vh] overflow-y-auto" : ""}`}>
            <table className="w-full text-left border-collapse min-w-[1800px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#0d5c3a] text-slate-100 text-[11px] font-bold uppercase tracking-wider text-center">
                  <th className="p-2.5 w-12 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">No</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Kantor Wilayah</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Kantor Area</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Kantor Cabang</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Kode Unit Kerja</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Nama Unit Kerja</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Status</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Vendor</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Jumlah Kamera</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Aplikasi</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Nama Aplikasi</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Keterangan (Jika Offline)</th>
                  {userRole !== "guest" && (
                    <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="text-xs text-gray-800 bg-white">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={userRole === "guest" ? "12" : "13"} className="p-4 text-center text-gray-400 border border-slate-200 bg-white">
                      Tidak ada data sarana pengamanan ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => {
                    const globalIndex = startIndex + index + 1;
                    const isEven = index % 2 !== 0;
                    const isSelected = selectedId === item.id;
                    const isHovered = hoveredId === item.id;

                    let bgClass = "";
                    if (isSelected) {
                      bgClass = isHovered 
                        ? "bg-blue-200 text-blue-950 dark:bg-[#2e4c37] dark:text-[#f1f5f3]" 
                        : "bg-blue-100 text-blue-900 dark:bg-[#1f3526] dark:text-[#48a359]";
                    } else if (isHovered) {
                      bgClass = "bg-slate-200 text-gray-900 dark:bg-[#273f2f] dark:text-[#f1f5f3]";
                    } else {
                      bgClass = isEven 
                        ? "bg-slate-100 text-gray-800 dark:bg-[#213527] dark:text-[#d1dcd4]" 
                        : "bg-white text-gray-800 dark:bg-[#1a2b20] dark:text-[#d1dcd4]";
                    }

                    return (
                      <tr
                        key={item.id}
                        onMouseEnter={() => setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => setSelectedId((prev) => (prev === item.id ? null : item.id))}
                        className={`transition-colors duration-150 cursor-pointer ${bgClass}`}
                      >
                        <td className="p-2 border border-slate-200 text-center align-middle text-xs font-medium">{globalIndex}</td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600">{item.kantor_wilayah || "-"}</td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600">{item.kantor_area || "-"}</td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600">{item.kantor_cabang || "-"}</td>
                        <td className="p-2 border border-slate-200 text-center align-middle text-xs font-mono text-gray-600">{item.kode_unit_kerja || "-"}</td>
                        <td className="p-2 border border-slate-200 align-middle font-semibold text-gray-900">{item.nama_unit_kerja || "-"}</td>
                        <td className="p-2 border border-slate-200 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                          {(() => {
                            const currentStatus = localStatuses[item.id] !== undefined ? localStatuses[item.id] : (item.status || "Offline");
                            if (userRole === "guest") {
                              return (
                                <span
                                  className={`inline-block text-center px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(currentStatus)}`}
                                  style={{ minWidth: '85px', textAlign: 'center' }}
                                >
                                  {currentStatus}
                                </span>
                              );
                            }
                            return (
                              <select
                                value={currentStatus}
                                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                className={`text-center pl-2 pr-5 py-0.5 rounded text-[10px] font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${getStatusBadge(currentStatus)}`}
                                style={{ minWidth: '85px', textAlignLast: 'center' }}
                              >
                                <option value="Online" className="bg-white text-gray-800">Online</option>
                                <option value="Offline" className="bg-white text-gray-800">Offline</option>
                              </select>
                            );
                          })()}
                        </td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600">{item.vendor || "-"}</td>
                        <td className="p-2 border border-slate-200 text-center align-middle font-semibold text-gray-900">{item.jumlah_kamera ?? "-"}</td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600">{item.aplikasi || "-"}</td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600">{item.nama_aplikasi || "-"}</td>
                        <td className="p-2 border border-slate-200 align-middle text-gray-600 truncate max-w-xs" title={item.keterangan}>
                          {item.status?.toLowerCase() === "offline" ? (item.keterangan || "-") : "-"}
                        </td>
                        {userRole !== "guest" && (
                          <td className="p-2 border border-slate-200 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-center items-center gap-1">
                              {userRole === "admin" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openEdit(item)}
                                    title="Edit Data"
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => askDelete(item.id, item.nama_unit_kerja)}
                                    title="Hapus Data"
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
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
            <div className="px-6 py-4 border-t border-slate-200/85 flex items-center justify-between bg-slate-50/30">
              <span className="text-xs text-gray-500">
                Menampilkan {startIndex + 1} sampai {Math.min(startIndex + itemsPerPage, filteredFacilities.length)} dari {filteredFacilities.length} data
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
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      currentPage === page
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
          <div className="bg-white dark:bg-gradient-to-b dark:from-[#052819] dark:via-[#073622] dark:to-[#03140d] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
            
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#0d5c3a] via-[#156e49] to-[#279969] text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/15 rounded-xl border border-white/20">
                  <Shield className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg leading-tight text-white">
                    {editingId ? "Edit Pengamanan & Korporasi" : "Tambah Pengamanan & Korporasi Baru"}
                  </h3>
                  <p className="text-xs text-emerald-100/90 mt-0.5">
                    Pilih nama unit kerja untuk mengisi Kantor Area dan Cabang secara otomatis.
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
                
                {/* Bagian 1: Identitas Unit Kerja */}
                <div className="space-y-3 bg-white dark:bg-[#14261c] p-3.5 rounded-xl border border-slate-200/80 dark:border-gray-700 shadow-xs">
                  <h4 className="font-bold text-[11px] text-[#0d5c3a] dark:text-emerald-400 pb-1 uppercase tracking-wide flex items-center gap-1.5 border-b border-emerald-100 dark:border-white/10">
                    <Shield className="w-3.5 h-3.5" /> Identitas Unit Kerja
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Nama Unit Kerja */}
                    <div className="sm:col-span-2">
                      <CustomSelectDropdown
                        label="Nama Unit Kerja *"
                        labelCls="block text-[11px] font-bold text-gray-900 dark:text-white mb-1"
                        value={formData.nama_unit_kerja || ""}
                        onChange={(e) => handleUnitKerjaChange(e.target ? e.target.value : e)}
                        onSelect={(u) => handleUnitKerjaChange(u.nama || u.value || u)}
                        options={outletOptions}
                        placeholder="Pilih atau ketik nama unit kerja..."
                        disabled={isSaving}
                        allowCustomInput={true}
                        inputCls="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                      />
                    </div>

                    {/* Kode Unit Kerja */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">Kode Unit Kerja</label>
                      <input
                        type="text"
                        value={formData.kode_unit_kerja || ""}
                        onChange={handleKodeUnitKerjaChange}
                        disabled={isSaving}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-mono text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                        placeholder="Contoh: 12293"
                      />
                    </div>
                  </div>
                </div>

                {/* Bagian 2: Wilayah & Struktur Organisasi */}
                <div className="space-y-3 bg-white dark:bg-[#14261c] p-3.5 rounded-xl border border-slate-200/80 dark:border-gray-700 shadow-xs">
                  <h4 className="font-bold text-[11px] text-[#0d5c3a] dark:text-emerald-400 pb-1 uppercase tracking-wide flex items-center gap-1.5 border-b border-emerald-100 dark:border-white/10">
                    Struktur Wilayah & Kantor
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Kantor Wilayah (Default KANWIL JAKARTA 1, can be edited) */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">Kantor Wilayah</label>
                      <input
                        type="text"
                        value={formData.kantor_wilayah || ""}
                        onChange={(e) => setFormData((p) => ({ ...p, kantor_wilayah: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                        placeholder="Contoh: KANWIL JAKARTA 1"
                      />
                    </div>

                    {/* Kantor Area (Otomatis terisi dari master outlet) */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">Kantor Area</label>
                      <input
                        type="text"
                        value={formData.kantor_area || ""}
                        onChange={(e) => setFormData((p) => ({ ...p, kantor_area: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                        placeholder="Area..."
                      />
                    </div>

                    {/* Kantor Cabang (Otomatis terisi dari master outlet) */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">Kantor Cabang</label>
                      <input
                        type="text"
                        value={formData.kantor_cabang || ""}
                        onChange={(e) => setFormData((p) => ({ ...p, kantor_cabang: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                        placeholder="Cabang..."
                      />
                    </div>
                  </div>
                </div>

                {/* Bagian 3: Sarana CCTV & Aplikasi */}
                <div className="space-y-3 bg-white dark:bg-[#14261c] p-3.5 rounded-xl border border-slate-200/80 dark:border-gray-700 shadow-xs">
                  <h4 className="font-bold text-[11px] text-emerald-800 dark:text-emerald-400 pb-1 uppercase tracking-wide flex items-center gap-1.5 border-b border-emerald-100 dark:border-white/10">
                    Kamera CCTV & Aplikasi
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Status */}
                    <div>
                      <CustomSelectDropdown
                        label="Status *"
                        labelCls="block text-[11px] font-bold text-gray-900 dark:text-white mb-1"
                        value={formData.status || "Online"}
                        onChange={(e) => setFormData((p) => ({ ...p, status: e.target ? e.target.value : e }))}
                        onSelect={(s) => setFormData((p) => ({ ...p, status: s.value || s }))}
                        disabled={isSaving}
                        options={[
                          { label: "Online", value: "Online" },
                          { label: "Offline", value: "Offline" }
                        ]}
                        placeholder="Pilih Status..."
                        inputCls="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                      />
                    </div>

                    {/* Jumlah Kamera */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">Jumlah Kamera</label>
                      <input
                        type="number"
                        value={formData.jumlah_kamera ?? ""}
                        onChange={(e) => setFormData((p) => ({ ...p, jumlah_kamera: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                        placeholder="Contoh: 10"
                      />
                    </div>

                    {/* Aplikasi */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">Aplikasi</label>
                      <input
                        type="text"
                        value={formData.aplikasi || ""}
                        onChange={(e) => setFormData((p) => ({ ...p, aplikasi: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                        placeholder="Contoh: Mobile APP"
                      />
                    </div>

                    {/* Nama Aplikasi */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">Nama Aplikasi</label>
                      <input
                        type="text"
                        value={formData.nama_aplikasi || ""}
                        onChange={(e) => setFormData((p) => ({ ...p, nama_aplikasi: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                        placeholder="Contoh: Hik-Connect"
                      />
                    </div>

                    {/* Vendor */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">Vendor</label>
                      <input
                        type="text"
                        value={formData.vendor || ""}
                        onChange={(e) => setFormData((p) => ({ ...p, vendor: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                        placeholder="Contoh: Teknisi CCTV Perorangan"
                      />
                    </div>

                    {/* Keterangan */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-900 dark:text-white mb-1">Keterangan (Catatan Offline)</label>
                      <textarea
                        rows="2"
                        value={formData.keterangan || ""}
                        onChange={(e) => setFormData((p) => ({ ...p, keterangan: e.target.value }))}
                        disabled={isSaving}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a2e22] border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#066027]/20 focus:border-[#066027] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none custom-scrollbar transition-all"
                        placeholder="Tulis alasan jika status Offline..."
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer */}
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
                  ) : editingId ? (
                    <Edit className="w-3.5 h-3.5" />
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
    </>
  );
}
