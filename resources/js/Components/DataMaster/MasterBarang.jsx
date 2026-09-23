// resources/js/Components/DataMaster/MasterBarang.jsx
import { useState, useEffect, useRef } from "react";
import {
  Database, Plus, Box, Hash, Scale, Building2,
  CalendarDays, Clock, Search, Edit, Trash2, Eye,
  FileSpreadsheet, Upload, Loader2, ChevronLeft, ChevronRight, Warehouse,
  CalendarPlus
} from "lucide-react";
import { router } from "@inertiajs/react";
import * as XLSX from "xlsx";
import { importInventoryCSV, downloadTemplate } from "../../services/inventoryService";
import { parseExcelFile } from "../../utils/excelHelper";
import BarangFormModal    from "./BarangFormModal";
import PerpanjangSewaModal from "./PerpanjangSewaModal";
import DetailHistoryModal from "../Common/DetailHistoryModal";
import ConfirmDeleteModal from "../Modal/ConfirmDeleteModal";
import ToastNotif         from "../Modal/ToastNotif";
import MasterMeubelairView from "./MasterMeubelairView";

export default function MasterBarang({
  inventory = [],
  userRole = "user",
  vendors = [],
  masterMeubelairs = [],
  activeSubMenu = "meubelair",
  jenisMeubelairs = [],
  onRefreshJenis = null,
}) {
  const [searchQuery, setSearchQuery]           = useState("");
  const [calculatedStatus, setCalculatedStatus] = useState("Inventaris");
  const [localInventory, setLocalInventory]     = useState([]);
  const [isModalOpen, setIsModalOpen]           = useState(false);
  const [deleteConfirm, setDeleteConfirm]       = useState({ show: false, id: null, name: "" });
  const [editingInv, setEditingInv]             = useState(null);
  const [modalModeEdit, setModalModeEdit]       = useState("koreksi");
  const [perpanjangInv, setPerpanjangInv]       = useState(null);
  const [isPerpanjangModalOpen, setIsPerpanjangModalOpen] = useState(false);
  const [isSaving, setIsSaving]                 = useState(false);
  const [notif, setNotif]                       = useState({ show: false, message: "", type: "success" });
  const [historyInv, setHistoryInv]             = useState(null);
  const [selectedId, setSelectedId]             = useState(null);
  const [hoveredId, setHoveredId]               = useState(null);
  const [hoveredGroupKey, setHoveredGroupKey]   = useState(null);
  const [lastTouchedGroupKey, setLastTouchedGroupKey] = useState(null);

  const fileInputRef = useRef(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterJenisBarang, setFilterJenisBarang] = useState("Semua");

  // Sync state if query param from Inertia has status
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const statusParam = urlParams.get("status") || "Semua";
    setFilterStatus(statusParam);
  }, []);

  // Listen for direct navigation to perpanjang sewa for a specific item -> Buka di Modal Edit langsung dengan mode perpanjang
  useEffect(() => {
    const handleOpenPerpanjang = (e) => {
      const { id, nama } = e.detail || {};
      if (!localInventory || localInventory.length === 0) return;
      const cleanNama = (nama || "").trim().toLowerCase();
      const target = localInventory.find((inv) => {
        if (id && String(inv.id) === String(id)) return true;
        if (!cleanNama) return false;
        const invNama = (inv.nama || "").trim().toLowerCase();
        return invNama === cleanNama || invNama.includes(cleanNama) || cleanNama.includes(invNama);
      });
      if (target) {
        setSearchQuery(target.nama);
        setEditingInv(target);
        setModalModeEdit("perpanjang");
        setCalculatedStatus(getStatusInfo(target));
        setIsModalOpen(true);
      }
    };

    window.addEventListener("open-perpanjang-barang", handleOpenPerpanjang);
    return () => window.removeEventListener("open-perpanjang-barang", handleOpenPerpanjang);
  }, [localInventory]);

  const [currentSubMenu, setCurrentSubMenu] = useState(activeSubMenu || "meubelair");

  useEffect(() => {
    if (activeSubMenu) {
      setCurrentSubMenu(activeSubMenu);
    }
  }, [activeSubMenu]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsSaving(true);
    try {
      const data = await parseExcelFile(file);
      const total = await importInventoryCSV(data);
      showNotif(`Sukses! ${total} data barang berhasil di-import.`, "success");
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.message || "Gagal import! Pastikan file Excel valid dan kolom header sesuai template.";
      showNotif(errorMsg, "error");
    } finally {
      setIsSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const exportToExcel = () => {
    const rows = filteredInventory.map((item, index) => ({
      "No": index + 1,
      "Nama Barang": item.nama || "",
      "Jenis Barang": item.jenis_barang || "-",
      "Stok": item.kuantitas !== undefined ? item.kuantitas : (item.stok || 0),
      "Satuan": item.satuan || "",
      "Vendor": item.vendor_nama || "",
      "No SPK": item.no_spk || "",
      "No PKS": item.no_pks || "",
      "Tgl Mulai": item.tanggal_mulai || "",
      "Tgl Selesai": item.tanggal_selesai || "",
      "Masa Sewa (Bulan)": item.masa_sewa_bulan || 0,
      "Biaya Sewa": item.biaya_sewa || 0,
      "Status": getStatusInfo(item) || "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Barang");
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...rows.map((r) => String(r[key]).length)) + 2,
    }));
    ws["!cols"] = colWidths;
    XLSX.writeFile(wb, `Data_Barang_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  useEffect(() => { setLocalInventory(inventory || []); }, [inventory]);

  const showNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  const handleDateChange = () => {
    const form = document.getElementById("formBarang");
    if (!form) return;
    const start = form.tanggal_mulai?.value;
    const end   = form.tanggal_selesai?.value;
    if (start && end) {
      const d1 = new Date(start);
      const d2 = new Date(end);
      let months = (d2.getFullYear() - d1.getFullYear()) * 12;
      months -= d1.getMonth();
      months += d2.getMonth();
      if (form.masa_sewa_bulan) form.masa_sewa_bulan.value = months > 0 ? months : 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setCalculatedStatus(new Date(end) >= today ? "Sewa Berjalan" : "Sewa Habis");
    } else {
      setCalculatedStatus("Inventaris");
      if (form.masa_sewa_bulan) form.masa_sewa_bulan.value = "";
    }
  };

  const getStatusInfo = (inv) => {
    if (inv.tanggal_selesai) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(inv.tanggal_selesai);
      end.setHours(0, 0, 0, 0);
      if (!isNaN(end.getTime())) {
        return end >= today ? "Sewa Berjalan" : "Sewa Habis";
      }
    }
    if (inv.status && inv.status !== "Sewa Berjalan" && inv.status !== "Sewa Habis") return inv.status;
    if (!inv.tanggal_mulai || !inv.tanggal_selesai) return "Inventaris";
    return "Inventaris";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Inventaris":    return "bg-blue-50 text-blue-700 border-blue-200";
      case "Sewa Berjalan": return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case "Sewa Habis":    return "bg-red-50 text-red-700 border-red-200";
      default:              return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const filteredInventory = localInventory
    .filter((inv) => {
      const q = searchQuery.toLowerCase();
      const statusVal = getStatusInfo(inv);
      
      const matchSearch =
        inv.nama?.toLowerCase().includes(q) ||
        inv.jenis_barang?.toLowerCase().includes(q) ||
        inv.vendor_nama?.toLowerCase().includes(q) ||
        inv.no_spk?.toLowerCase().includes(q) ||
        statusVal.toLowerCase().includes(q) ||
        inv.deskripsi?.toLowerCase().includes(q);

      const matchStatus =
        filterStatus === "Semua" ||
        statusVal === filterStatus ||
        (filterStatus === "Sewa Berjalan" && statusVal === "Sewa Berjalan") ||
        (filterStatus === "Sewa Habis" && statusVal === "Sewa Habis") ||
        (filterStatus === "Inventaris" && statusVal === "Inventaris");

      const matchJenis =
        filterJenisBarang === "Semua" ||
        (inv.jenis_barang && inv.jenis_barang.toLowerCase() === filterJenisBarang.toLowerCase());

      return matchSearch && matchStatus && matchJenis;
    });

  // Calculate group total stok for each group
  const groupTotalStokMap = {};
  const groupCountMap = {};
  const groupJenisMap = {};
  const groupLatestTimeMap = {};

  filteredInventory.forEach((inv) => {
    const gKey = (inv.nama || "").trim().toLowerCase();
    const itemTime = inv.updated_at
      ? new Date(inv.updated_at).getTime()
      : inv.created_at
      ? new Date(inv.created_at).getTime()
      : Number(inv.id || 0);
    groupLatestTimeMap[gKey] = Math.max(groupLatestTimeMap[gKey] || 0, itemTime);

    const stok = inv.kuantitas !== undefined && inv.kuantitas !== null ? Number(inv.kuantitas) : (Number(inv.stok) || 0);
    groupTotalStokMap[gKey] = (groupTotalStokMap[gKey] || 0) + stok;

    groupCountMap[gKey] = (groupCountMap[gKey] || 0) + 1;

    if (!groupJenisMap[gKey]) groupJenisMap[gKey] = [];
    const jVal = (inv.jenis_barang || "").trim();
    if (jVal && jVal !== "-" && !groupJenisMap[gKey].includes(jVal)) {
      groupJenisMap[gKey].push(jVal);
    }
  });

  // Sort filteredInventory by group's latest update/creation time descending so newest/edited items appear at the VERY TOP
  const sortedInventory = [...filteredInventory].sort((a, b) => {
    const gKeyA = (a.nama || "").trim().toLowerCase();
    const gKeyB = (b.nama || "").trim().toLowerCase();

    const timeA = groupLatestTimeMap[gKeyA] || 0;
    const timeB = groupLatestTimeMap[gKeyB] || 0;

    if (timeA !== timeB) {
      return timeB - timeA; // Most recently created/edited group FIRST at top!
    }

    if (gKeyA !== gKeyB) {
      return gKeyA.localeCompare(gKeyB);
    }

    return (b.id || 0) - (a.id || 0);
  });

  const handleFilterStatus = (e) => {
    const val = e.target.value;
    setFilterStatus(val);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilterStatus("Semua");
    setFilterJenisBarang("Semua");
    setCurrentPage(1);
  };

  const openAdd   = () => { setEditingInv(null); setModalModeEdit("koreksi"); setCalculatedStatus("Inventaris"); setIsModalOpen(true); };
  const openEdit  = (inv, mode = "koreksi") => { 
    setEditingInv(inv); 
    setModalModeEdit(mode); 
    setCalculatedStatus(getStatusInfo(inv)); 
    setIsModalOpen(true); 
  };
  const openPerpanjang = (inv) => { 
    openEdit(inv, "perpanjang"); 
  };
  const openHistory = (inv) => { setHistoryInv(inv); };
  const askDelete = (inv) => setDeleteConfirm({ show: true, id: inv.id, name: inv.nama });

  const onPerpanjangSubmit = (payload) => {
    if (!perpanjangInv) return;
    setIsSaving(true);
    router.post(`/inventory/${perpanjangInv.id}`, { ...payload, _method: "PUT", mode_edit: "perpanjang" }, {
      onSuccess: () => {
        showNotif("Perpanjangan sewa berhasil disimpan dan disinkronkan ke seluruh perangkat terkait!");
        setIsPerpanjangModalOpen(false);
        setPerpanjangInv(null);
      },
      onError: (err) => {
        console.error(err);
        const errorMsg = Object.values(err).join("\n");
        showNotif(errorMsg || "Gagal memperpanjang sewa barang!", "error");
      },
      onFinish: () => {
        setIsSaving(false);
      },
    });
  };

  const confirmDeleteAction = () => {
    setIsSaving(true);
    router.delete(`/inventory/${deleteConfirm.id}`, {
      onSuccess: () => {
        showNotif("Barang berhasil dihapus!");
        setDeleteConfirm({ show: false, id: null, name: "" });
      },
      onError: (err) => {
        console.error(err);
        showNotif("Gagal menghapus data barang.", "error");
      },
      onFinish: () => {
        setIsSaving(false);
      }
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const namaVal = form.get("nama")?.trim().toLowerCase() || "";
    const vendorVal = form.get("vendor_nama")?.trim().toLowerCase() || "";
    const spkVal = form.get("no_spk")?.trim().toLowerCase() || "";

    const isDuplicate = localInventory.some((item) => {
      if (editingInv && item.id === editingInv.id) return false;
      const existingNama = (item.nama || "").trim().toLowerCase();
      const existingVendor = (item.vendor_nama || "").trim().toLowerCase();
      const existingSpk = (item.no_spk || "").trim().toLowerCase();
      return existingNama === namaVal && existingVendor === vendorVal && existingSpk === spkVal;
    });

    if (isDuplicate) {
      showNotif("Barang dengan nama, vendor, dan SPK yang sama sudah terdaftar.", "error");
      return;
    }

    setLastTouchedGroupKey(namaVal);
    setCurrentPage(1);
    setIsSaving(true);

    const rawBiayaSewa = form.get("biaya_sewa") ? String(form.get("biaya_sewa")).replace(/[^0-9]/g, "") : 0;
    const rawHargaSatuan = form.get("harga_satuan") ? String(form.get("harga_satuan")).replace(/[^0-9]/g, "") : 0;

    const payload = {
      nama: form.get("nama"),
      jenis_barang: form.get("jenis_barang") || "Komputer",
      kuantitas: Number(form.get("kuantitas")) || 0,
      satuan: form.get("satuan") || "Pcs",
      vendor_nama: form.get("vendor_nama") || "",
      no_spk: form.get("no_spk") || "",
      no_pks: form.get("no_pks") || "",
      tanggal_mulai: form.get("tanggal_mulai") || "",
      tanggal_selesai: form.get("tanggal_selesai") || "",
      masa_sewa_bulan: Number(form.get("masa_sewa_bulan")) || 0,
      status: form.get("status") || "Inventaris",
      deskripsi: form.get("deskripsi") || "",
      biaya_sewa: Number(rawBiayaSewa) || 0,
      harga_satuan: rawHargaSatuan ? Number(rawHargaSatuan) : null,
      mode_edit: form.get("mode_edit") || "koreksi",
    };

    if (editingInv) {
      router.post(`/inventory/${editingInv.id}`, { ...payload, _method: "PUT" }, {
        onSuccess: () => {
          showNotif(
            payload.mode_edit === "perpanjang"
              ? "Perpanjangan sewa berhasil disimpan dan disinkronkan ke seluruh perangkat terkait!"
              : "Data barang berhasil diperbarui!"
          );
          setIsModalOpen(false);
        },
        onError: (err) => {
          console.error(err);
          const errorMsg = Object.values(err).join("\n");
          showNotif(errorMsg || "Gagal mengupdate barang!", "error");
        },
        onFinish: () => {
          setIsSaving(false);
        }
      });
    } else {
      router.post("/inventory", payload, {
        onSuccess: () => {
          showNotif("Barang baru berhasil ditambahkan!");
          setIsModalOpen(false);
        },
        onError: (err) => {
          console.error(err);
          const errorMsg = Object.values(err).join("\n");
          showNotif(errorMsg || "Gagal menambah barang!", "error");
        },
        onFinish: () => {
          setIsSaving(false);
        }
      });
    }
  };

  // Pagination based on sortedInventory
  const totalPages = Math.ceil(sortedInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInventoryRaw = sortedInventory.slice(startIndex, startIndex + itemsPerPage);

  // Grouping logic for rowSpan merging by Nama Barang
  const paginatedInventory = [];
  let currentGroupValue = null;
  let currentGroupStartIndex = -1;
  let visualNoCounter = startIndex + 1;

  for (let i = 0; i < paginatedInventoryRaw.length; i++) {
    const item = paginatedInventoryRaw[i];
    const groupKey = (item.nama || "").trim().toLowerCase();
    const jenisList = groupJenisMap[groupKey] || [];
    const displayJenis = jenisList.length > 0 ? jenisList.join(", ") : (item.jenis_barang || "-");

    if (groupKey === "" || groupKey !== currentGroupValue) {
      currentGroupValue = groupKey;
      currentGroupStartIndex = paginatedInventory.length;

      paginatedInventory.push({
        ...item,
        _groupKey: groupKey,
        _rowSpan: 1,
        _isFirstInGroup: true,
        _groupVisualNo: visualNoCounter++,
        _isEvenGroup: (visualNoCounter - 1) % 2 === 0,
        _groupTotalStok: groupTotalStokMap[groupKey] !== undefined ? groupTotalStokMap[groupKey] : (item.kuantitas || item.stok || 0),
        _groupSpkCount: groupCountMap[groupKey] || 1,
        _groupDisplayJenis: displayJenis,
      });
    } else {
      paginatedInventory[currentGroupStartIndex]._rowSpan += 1;

      paginatedInventory.push({
        ...item,
        _groupKey: groupKey,
        _rowSpan: 0,
        _isFirstInGroup: false,
        _groupVisualNo: paginatedInventory[currentGroupStartIndex]._groupVisualNo,
        _isEvenGroup: paginatedInventory[currentGroupStartIndex]._isEvenGroup,
        _groupTotalStok: groupTotalStokMap[groupKey] !== undefined ? groupTotalStokMap[groupKey] : (item.kuantitas || item.stok || 0),
        _groupSpkCount: groupCountMap[groupKey] || 1,
        _groupDisplayJenis: displayJenis,
      });
    }
  }

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
      {currentSubMenu === "meubelair" ? (
        <MasterMeubelairView
          masterMeubelairs={masterMeubelairs}
          userRole={userRole}
          jenisMeubelairs={jenisMeubelairs}
          vendors={vendors}
          onRefreshJenis={onRefreshJenis}
        />
      ) : (
        <>
          {/* ── Header Toolbar Non Meubelair ── */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80 dark:border-[#213527]">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2.5">
                <Box className="w-6 h-6 text-[#0d5c3a] dark:text-emerald-400" /> Master Data Barang Non Meubelair
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Kelola ketersediaan stok, status sewa, dan durasi kontrak barang non meubelair.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={exportToExcel}
                disabled={filteredInventory.length === 0}
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
                aria-label="Upload file Excel data barang"
              />
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/30 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Cari barang atau status..."
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

              {/* Reset Filters button if any filter active */}
              {(filterStatus !== "Semua" || filterJenisBarang !== "Semua" || searchQuery !== "") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-red-600 hover:text-red-800 font-semibold hover:underline shrink-0 self-start sm:self-auto"
                >
                  Reset Filter
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              {userRole === "admin" && (
                <button
                  onClick={openAdd}
                  className="bg-[#0d5c3a] hover:bg-[#0a462c] text-white px-5 py-2 rounded-full text-xs font-bold shadow-md shadow-[#0d5c3a]/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Barang
                </button>
              )}
              <div className="bg-emerald-50 text-[#0d5c3a] dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 px-4 py-2 rounded-full text-xs font-bold shrink-0">
                Total: {filteredInventory.length}
              </div>
            </div>
          </div>

          {/* Row 2: Filter Status & Filter Jenis Barang */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100/50">
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase mb-1.5">
                STATUS
              </span>
              <div className="relative w-44">
                <select
                  value={filterStatus}
                  onChange={handleFilterStatus}
                  aria-label="Filter status"
                  className="w-full pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs font-semibold cursor-pointer shadow-3xs appearance-none"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Inventaris">Inventaris</option>
                  <option value="Sewa Berjalan">Sewa Berjalan</option>
                  <option value="Sewa Habis">Sewa Habis</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase mb-1.5">
                JENIS BARANG
              </span>
              <div className="relative w-44">
                <select
                  value={filterJenisBarang}
                  onChange={(e) => {
                    setFilterJenisBarang(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Filter jenis barang"
                  className="w-full pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs font-semibold cursor-pointer shadow-3xs appearance-none"
                >
                  <option value="Semua">Semua Jenis</option>
                  <option value="Komputer">Komputer</option>
                  <option value="Printer">Printer</option>
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
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse border border-slate-200 min-w-[1250px]">
              <thead>
                <tr className="bg-[#0d5c3a] text-slate-100 text-[11px] font-bold uppercase tracking-wider text-center">
                  <th className="p-2.5 w-12 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">No</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Nama Barang</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Jenis Barang</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Stok</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Satuan</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Vendor & Kontrak</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Mulai</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Selesai</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Durasi</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Biaya Sewa</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Status</th>
                  <th className="p-2.5 text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-800 bg-white">
                {paginatedInventory.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="p-4 text-center text-gray-400 border border-slate-200 bg-white">
                      Tidak ada data barang ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedInventory.map((inv) => {
                    const statusVal = getStatusInfo(inv);
                    const isSelected = selectedId === inv.id;
                    const isGroupHovered = hoveredGroupKey === inv._groupKey;
                    const isEven = inv._isEvenGroup;

                    let bgClass = "";
                    if (isSelected) {
                      bgClass = "bg-blue-100 text-blue-900 dark:bg-[#1f3526]";
                    } else if (isGroupHovered) {
                      bgClass = "bg-blue-50/70 text-gray-900 dark:bg-[#273f2f]";
                    } else {
                      bgClass = isEven ? "bg-slate-50/80 text-gray-800" : "bg-white text-gray-800";
                    }

                    return (
                      <tr
                        key={inv.id}
                        onMouseEnter={() => setHoveredGroupKey(inv._groupKey)}
                        onMouseLeave={() => setHoveredGroupKey(null)}
                        onClick={() => setSelectedId((prev) => (prev === inv.id ? null : inv.id))}
                        className={`transition-colors duration-150 cursor-pointer ${bgClass}`}
                      >
                        {inv._isFirstInGroup && (
                          <td rowSpan={inv._rowSpan} className="p-2.5 border border-slate-200 text-center align-middle font-medium text-gray-500 bg-white dark:bg-[#1a2b20]">
                            {inv._groupVisualNo}
                          </td>
                        )}

                        {inv._isFirstInGroup && (
                          <td rowSpan={inv._rowSpan} className="p-2.5 border border-slate-200 align-middle font-semibold text-gray-900 bg-white dark:bg-[#1a2b20]">
                            <div className="relative group cursor-default">
                              <span>{inv.nama}</span>
                              <div className="absolute left-0 top-full mt-1 z-[999] hidden group-hover:block bg-gray-900 text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl pointer-events-none">
                                <p className="!text-gray-400 mb-0.5">Database ID</p>
                                <p className="font-mono !text-white">{inv.id}</p>
                              </div>
                            </div>
                          </td>
                        )}

                        {inv._isFirstInGroup && (
                          <td rowSpan={inv._rowSpan} className="p-2.5 border border-slate-200 text-center align-middle font-medium whitespace-nowrap bg-white dark:bg-[#1a2b20]">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              inv._groupDisplayJenis?.includes("Komputer")
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : inv._groupDisplayJenis?.includes("Printer")
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-gray-50 text-gray-700 border border-gray-200"
                            }`}>
                              {inv._groupDisplayJenis || "-"}
                            </span>
                          </td>
                        )}

                        <td className="p-2.5 border border-slate-200 text-center align-middle">
                          {(() => {
                            const stokVal = inv.kuantitas !== undefined ? inv.kuantitas : (inv.stok || 0);
                            return (
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${stokVal <= 5 ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                                {stokVal}
                              </span>
                            );
                          })()}
                        </td>

                        <td className="p-2.5 border border-slate-200 text-center align-middle font-medium">
                          {inv.satuan || "Pcs"}
                        </td>

                        <td className="p-2.5 border border-slate-200 align-middle">
                          {inv.vendor_nama ? (
                            <div>
                              <p className="font-semibold text-blue-900">{inv.vendor_nama}</p>
                              <p className="text-[10px] text-gray-500 font-mono">SPK: {inv.no_spk || "-"}</p>
                              {inv.no_pks && <p className="text-[10px] text-gray-400 font-mono">PKS: {inv.no_pks}</p>}
                            </div>
                          ) : "-"}
                        </td>
                        <td className="p-2.5 border border-slate-200 text-center align-middle whitespace-nowrap font-medium">{formatDate(inv.tanggal_mulai)}</td>
                        <td className="p-2.5 border border-slate-200 text-center align-middle whitespace-nowrap font-medium">{formatDate(inv.tanggal_selesai)}</td>
                        <td className="p-2.5 border border-slate-200 text-center align-middle whitespace-nowrap font-medium">{inv.masa_sewa_bulan ? `${inv.masa_sewa_bulan} Bln` : "-"}</td>
                        <td className="p-2.5 border border-slate-200 text-center align-middle whitespace-nowrap font-medium">
                          {inv.biaya_sewa ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(inv.biaya_sewa) : "-"}
                        </td>
                        <td className="p-2.5 border border-slate-200 text-center align-middle whitespace-nowrap">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border whitespace-nowrap shadow-3xs ${getStatusBadge(statusVal)}`}>
                            {statusVal}
                          </span>
                        </td>
                        <td className="p-2 border border-slate-200 text-center align-middle">
                          <div className="flex justify-center items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {statusVal !== "Inventaris" && (
                              <button
                                type="button"
                                onClick={() => openHistory(inv)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                                title="Riwayat Perpanjangan Sewa"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {userRole === "admin" && (
                              <>
                                <button onClick={() => openEdit(inv)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Data Barang">
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => askDelete(inv)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Data Barang">
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
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
          <span className="text-xs text-gray-500">
            Menampilkan {filteredInventory.length > 0 ? startIndex + 1 : 0} sampai {Math.min(startIndex + itemsPerPage, filteredInventory.length)} dari {filteredInventory.length} data
          </span>
          {totalPages > 1 && (
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
          )}
        </div>
      </div>

      {/* ── Modal Form ── */}
      {userRole === "admin" && (
        <BarangFormModal
          isOpen={isModalOpen}
          editingInv={editingInv}
          isSaving={isSaving}
          calculatedStatus={calculatedStatus}
          vendors={vendors}
          initialModeEdit={modalModeEdit}
          onClose={() => setIsModalOpen(false)}
          onSubmit={onSubmit}
          onDateChange={handleDateChange}
        />
      )}

      {/* ── Modal Perpanjang Sewa ── */}
      {userRole === "admin" && (
        <PerpanjangSewaModal
          isOpen={isPerpanjangModalOpen}
          item={perpanjangInv}
          vendors={vendors}
          isSaving={isSaving}
          onClose={() => {
            setIsPerpanjangModalOpen(false);
            setPerpanjangInv(null);
          }}
          onSubmit={onPerpanjangSubmit}
        />
      )}

      {/* ── Modal Riwayat Perpanjangan Sewa ── */}
      <DetailHistoryModal
        isOpen={!!historyInv}
        onClose={() => setHistoryInv(null)}
        item={historyInv}
        type="inventory"
        inventoryList={localInventory}
        onPerpanjang={userRole === "admin" ? (inv) => {
          setHistoryInv(null);
          openEdit(inv, "perpanjang");
        } : null}
      />

      {/* ── Modal Konfirmasi Hapus ── */}
      <ConfirmDeleteModal
        show={deleteConfirm.show}
        name={deleteConfirm.name}
        isSaving={isSaving}
        onConfirm={confirmDeleteAction}
        onCancel={() => setDeleteConfirm({ show: false, id: null, name: "" })}
      />

      {/* ── Toast Notifikasi ── */}
      <ToastNotif
        show={notif.show}
        message={notif.message}
        type={notif.type}
        onClose={() => setNotif({ show: false, message: "", type: "" })}
      />
        </>
      )}
    </div>
  );
}