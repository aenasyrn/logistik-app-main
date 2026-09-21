import React, { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Search, Box, Building2, Package, FileText, Sparkles, ArrowRight, ShieldCheck,
  Users, Download, Eye, X, Printer, CheckCircle, AlertTriangle, ChevronDown, Monitor,
  Armchair, Laptop
} from "lucide-react";

// Clean date formatting helper (e.g. 2026-07-28T07:15:20.000000Z => 28 Jul 2026)
const formatDate = (dateStr) => {
  if (!dateStr || dateStr === "-") return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (e) {
    return dateStr;
  }
};

// Helper to normalize unit status into: Inventaris, Sewa Berjalan, or Sewa Habis
const normalizeStatus = (rawStatus, startDate, endDate) => {
  if (rawStatus === "Inventaris" || rawStatus === "Sewa Berjalan" || rawStatus === "Sewa Habis") {
    return rawStatus;
  }
  if (startDate && endDate && endDate !== "-" && startDate !== "-") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    if (!isNaN(end.getTime())) {
      return end >= today ? "Sewa Berjalan" : "Sewa Habis";
    }
  }
  if (rawStatus === "Aktif" || rawStatus === "Baik" || rawStatus === "BAIK") {
    return "Sewa Berjalan";
  }
  return rawStatus || "Inventaris";
};

// Flexible search match helper (supports alphanumeric continuous search like "lq310" matching "LQ 310" or "LQ-310")
const flexibleMatch = (targetText, queryText) => {
  if (!targetText || !queryText) return false;
  const rawTarget = String(targetText).toLowerCase();
  const rawQuery = String(queryText).toLowerCase().trim();
  if (!rawQuery) return true;

  // 1. Direct substring match
  if (rawTarget.includes(rawQuery)) return true;

  // 2. Normalized alphanumeric match (removes spaces, hyphens, slashes, dots, etc.)
  const cleanTarget = rawTarget.replace(/[^a-z0-9]/g, "");
  const cleanQuery = rawQuery.replace(/[^a-z0-9]/g, "");

  if (cleanQuery && cleanTarget.includes(cleanQuery)) return true;

  // 3. Multi-token match (all words in query must exist in target)
  const tokens = rawQuery.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    const allTokensMatch = tokens.every((token) => {
      if (rawTarget.includes(token)) return true;
      const cleanToken = token.replace(/[^a-z0-9]/g, "");
      return cleanToken ? cleanTarget.includes(cleanToken) : false;
    });
    if (allTokensMatch) return true;
  }

  return false;
};

export default function PusatDataBarang({
  activeTab,
  inventory = [],
  outlets = [],
  vendors = [],
  computers = [],
  printers = [],
  laptops = [],
  meubelairs = [],
  masterMeubelairs = [],
  transactions = [],
  soppHistory = [],
  spkHistory = [],
  setView,
  setRiwayatFilter,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");

  // Dropdown Autocomplete & Search Validation states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchWarning, setSearchWarning] = useState("");
  const searchContainerRef = useRef(null);

  const resetPusatDataBarang = () => {
    setSearchTerm("");
    setActiveSearchQuery("");
    setSearchWarning("");
    setIsDropdownOpen(false);
    setUnitSearch("");
    setDocSearch("");
    setDocTypeFilter("all");
    setUnitPage(1);
    setDocPage(1);
    setSelectedUnit(null);
  };

  useEffect(() => {
    const handleReset = () => {
      resetPusatDataBarang();
    };
    window.addEventListener("reset-all-filters", handleReset);
    window.addEventListener("reset-pusat-data-barang", handleReset);
    return () => {
      window.removeEventListener("reset-all-filters", handleReset);
      window.removeEventListener("reset-pusat-data-barang", handleReset);
    };
  }, []);

  useEffect(() => {
    if (activeTab === "pusat_data_barang") {
      resetPusatDataBarang();
    }
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sub-search filters inside search result cards
  const [unitSearch, setUnitSearch] = useState("");
  const [docSearch, setDocSearch] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("all"); // 'all', 'sst', 'spk', 'sopp'

  // Pagination states
  const [unitPage, setUnitPage] = useState(1);
  const [docPage, setDocPage] = useState(1);
  const [unitPerPage, setUnitPerPage] = useState("5"); // "5", "10", "20", "all"
  const [docPerPage, setDocPerPage] = useState("5");   // "5", "10", "20", "all"

  // Selected Unit for Detail Modal
  const [selectedUnit, setSelectedUnit] = useState(null);

  // Default Overview Counts
  const defaultTotalBarangCount = inventory.length;
  const defaultTotalOutletCount = outlets.length;
  const defaultTotalKomputerCount = computers.length;
  const defaultTotalPrinterCount = printers.length;
  const defaultTotalLaptopCount = laptops.length;
  const defaultTotalMeubelairCount = useMemo(() => {
    return (meubelairs || []).reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0);
  }, [meubelairs]);
  const defaultTotalSuratCount = transactions.length + soppHistory.length + spkHistory.length;

  // Build unique system suggestions list for dropdown autocomplete
  const systemSuggestions = useMemo(() => {
    const items = [];
    const seen = new Set();

    const addSuggestion = (label, category, iconType, extraInfo = "") => {
      if (!label || label === "-" || String(label).trim().length < 2) return;
      const cleanLabel = String(label).trim();
      const key = `${category.toLowerCase()}:${cleanLabel.toLowerCase()}`;
      if (seen.has(key)) return;
      seen.add(key);
      items.push({
        label: cleanLabel,
        category,
        iconType,
        extraInfo,
      });
    };

    // 1. Computers
    (computers || []).forEach((c) => {
      const nama = c.produk || `${c.merk || "PC"} ${c.tipe || ""}`.trim();
      addSuggestion(nama, "Komputer", "komputer", c.sn ? `SN: ${c.sn}` : (c.outlet ? `Lokasi: ${c.outlet}` : "Data PC"));
      if (c.tipe && c.tipe !== "-") addSuggestion(c.tipe, "Komputer", "komputer", `Model: ${nama}`);
      if (c.merk && c.merk !== "-") addSuggestion(c.merk, "Komputer", "komputer", `Merk PC`);
      if (c.sn && c.sn !== "-") addSuggestion(c.sn, "Serial Number", "sn", `PC: ${nama}`);
      if (c.ip_address && c.ip_address !== "-") addSuggestion(c.ip_address, "IP Address", "komputer", `PC: ${nama}`);
      if (c.penyedia && c.penyedia !== "-") addSuggestion(c.penyedia, "Vendor", "vendor", `Penyedia PC`);
    });

    // 2. Printers
    (printers || []).forEach((p) => {
      const nama = p.produk || `${p.merk || "Printer"} ${p.tipe || ""}`.trim();
      addSuggestion(nama, "Printer", "printer", p.sn ? `SN: ${p.sn}` : (p.outlet ? `Lokasi: ${p.outlet}` : "Data Printer"));
      if (p.tipe && p.tipe !== "-") addSuggestion(p.tipe, "Printer", "printer", `Model: ${nama}`);
      if (p.merk && p.merk !== "-") addSuggestion(p.merk, "Printer", "printer", `Merk Printer`);
      if (p.sn && p.sn !== "-") addSuggestion(p.sn, "Serial Number", "sn", `Printer: ${nama}`);
      if (p.vendor && p.vendor !== "-") addSuggestion(p.vendor, "Vendor", "vendor", `Vendor Printer`);
    });

    // 3. Inventory Barang
    (inventory || []).forEach((inv) => {
      const namaBarang = inv.nama || inv.nama_barang || "";
      addSuggestion(namaBarang, "Barang", "barang", inv.jenis_barang ? `Jenis: ${inv.jenis_barang}` : "Data Barang");
      if (inv.kode || inv.kode_barang) addSuggestion(inv.kode || inv.kode_barang, "Kode Barang", "barang", `Barang: ${namaBarang}`);
      if (inv.jenis_barang) addSuggestion(inv.jenis_barang, "Kategori Barang", "barang", `Kategori`);
      if (inv.vendor_nama || inv.vendor) addSuggestion(inv.vendor_nama || inv.vendor, "Vendor", "vendor", `Vendor: ${namaBarang}`);
      if (inv.no_spk) addSuggestion(inv.no_spk, "Dokumen", "dokumen", `SPK: ${namaBarang}`);
      if (inv.no_pks) addSuggestion(inv.no_pks, "Dokumen", "dokumen", `PKS: ${namaBarang}`);
    });

    // 4. Outlets
    (outlets || []).forEach((o) => {
      const nama = o.nama || o.nama_outlet || o.name;
      addSuggestion(nama, "Outlet", "outlet", o.kode_outlet || o.code ? `Kode: ${o.kode_outlet || o.code}` : (o.cabang ? `Cabang: ${o.cabang}` : "Master Outlet"));
      if (o.cabang && o.cabang !== "-") addSuggestion(o.cabang, "Cabang", "outlet", `Cabang / CP`);
      if (o.area && o.area !== "-") addSuggestion(o.area, "Area", "outlet", `Area Kerja`);
      if (o.code || o.kode_outlet) addSuggestion(o.code || o.kode_outlet, "Kode Outlet", "outlet", `Outlet: ${nama}`);
    });

    // 5. Vendors
    (vendors || []).forEach((v) => {
      const nama = v.nama || v.name;
      addSuggestion(nama, "Vendor", "vendor", v.bidang ? `Bidang: ${v.bidang}` : "Master Vendor");
      if (v.pimpinan && v.pimpinan !== "-") addSuggestion(v.pimpinan, "Pimpinan Vendor", "vendor", `Vendor: ${nama}`);
    });

    // 6. Transactions (Surat Serah Terima)
    (transactions || []).forEach((t) => {
      if (t.nomor_surat) addSuggestion(t.nomor_surat, "Dokumen", "dokumen", "Surat Serah Terima");
      if (t.penerima_instansi) addSuggestion(t.penerima_instansi, "Outlet", "outlet", "Tujuan SST");
      if (t.pengirim_instansi) addSuggestion(t.pengirim_instansi, "Outlet", "outlet", "Asal SST");
      if (t.penerima_nama) addSuggestion(t.penerima_nama, "Penerima", "dokumen", `SST: ${t.nomor_surat || ""}`);
      
      const itemsList = t.items || [];
      if (Array.isArray(itemsList)) {
        itemsList.forEach((item) => {
          const itemNama = item.nama || item.nama_barang || item.produk;
          if (itemNama) addSuggestion(itemNama, "Barang", "barang", `SST: ${t.nomor_surat || "Transaksi"}`);
          if (item.sn && item.sn !== "-") addSuggestion(item.sn, "Serial Number", "sn", `SST: ${itemNama || ""}`);
        });
      }
    });

    // 7. SPK History
    (spkHistory || []).forEach((spk) => {
      const content = spk.content || (typeof spk.data === "object" ? spk.data : spk);
      const no = spk.nomor_spk || spk.no_spk || spk.nomorSpk || content.nomorSpk || content.no_spk;
      const tipe = spk.tipe_spk || spk.type || content.type || "";
      if (no) addSuggestion(no, "Dokumen", "dokumen", `SPK ${tipe.toUpperCase()}`);

      const uraian = spk.uraian || content.uraian || spk.pekerjaan || content.pekerjaan || content.projectUraian;
      if (uraian) addSuggestion(uraian, "Uraian Pekerjaan", "dokumen", `SPK: ${no || ""}`);

      const perusahaan = spk.nama_perusahaan || content.namaPerusahaan || content.perusahaan || content.sigKiriPerusahaan || spk.vendor;
      if (perusahaan) addSuggestion(perusahaan, "Vendor / Rekanan", "vendor", `SPK: ${no || ""}`);

      if (Array.isArray(content.itemsList)) {
        content.itemsList.forEach((it) => {
          if (it.uraian) addSuggestion(it.uraian, "Barang / Pekerjaan", "barang", `SPK: ${no || ""}`);
        });
      }
    });

    // 8. SOPP History
    (soppHistory || []).forEach((sopp) => {
      const content = sopp.content || (typeof sopp.data === "object" ? sopp.data : sopp);
      const no = sopp.nomor_sopp || sopp.no_sopp || sopp.nomorSopp || content.nomorSopp || content.no_sopp;
      const tipe = sopp.tipe_sopp || sopp.type || content.type || "";
      if (no) addSuggestion(no, "Dokumen", "dokumen", `SOPP ${tipe.toUpperCase()}`);

      const uraian = sopp.uraian || content.uraian;
      if (uraian) addSuggestion(uraian, "Uraian Pembayaran", "dokumen", `SOPP: ${no || ""}`);

      const dibayarkan = sopp.dibayarkan_kepada || content.dibayarkanKepada || content.atasNama || sopp.nama_vendor;
      if (dibayarkan) addSuggestion(dibayarkan, "Penerima Pembayaran", "vendor", `SOPP: ${no || ""}`);

      if (Array.isArray(content.rows)) {
        content.rows.forEach((r) => {
          const rowUraian = r.uraian;
          // Filter out generic accounting lines
          if (rowUraian && !/^(pajak\s*ppn|pajak\s*pph|ppn\s*11%|pph\s*22|pph\s*23|bank\s*bri|bank$)/i.test(rowUraian.trim())) {
            addSuggestion(rowUraian, "Uraian Pembayaran", "dokumen", `SOPP: ${no || ""}`);
          }
        });
      }
    });

    // 9. Meubelair (Inventaris & Master)
    (meubelairs || []).forEach((m) => {
      const namaBarang = m.jenis || m.nama_barang || m.type_barang || m.nama || "";
      const kategori = m.kategori || m.jenis_barang || "";
      const normKategori = kategori
        ? (kategori.toLowerCase() === "ac" ? "AC" : (kategori.charAt(0).toUpperCase() + kategori.slice(1)))
        : "Meubelair";
      const lokasi = (m.lokasi || m.outlet_rel?.nama || m.outlet_rel?.nama_outlet || "").trim();

      if (namaBarang) {
        addSuggestion(namaBarang, "Meubelair", "meubelair", lokasi ? `Lokasi: ${lokasi}` : `Kategori: ${normKategori}`);
      }
      if (normKategori && normKategori.toLowerCase() !== (namaBarang || "").toLowerCase()) {
        addSuggestion(normKategori, "Jenis Meubelair", "meubelair", "Kategori Meubelair");
      }
      if (m.keterangan && m.keterangan !== "-") {
        addSuggestion(m.keterangan, "Meubelair", "meubelair", `Ket: ${namaBarang || normKategori}`);
      }
      if (m.kode_barang || m.kode) {
        addSuggestion(m.kode_barang || m.kode, "Kode Barang", "meubelair", `Meubelair: ${namaBarang || normKategori}`);
      }
    });

    (masterMeubelairs || []).forEach((mm) => {
      const nama = mm.nama_barang || mm.jenis || mm.nama || "";
      const jenis = mm.jenis_barang || mm.kategori || "";
      if (nama) addSuggestion(nama, "Meubelair", "meubelair", jenis ? `Kategori: ${jenis}` : "Master Meubelair");
      if (jenis && jenis.toLowerCase() !== (nama || "").toLowerCase()) {
        addSuggestion(jenis, "Jenis Meubelair", "meubelair", "Kategori Meubelair");
      }
      if (mm.vendor && mm.vendor !== "-") {
        addSuggestion(mm.vendor, "Vendor", "vendor", `Vendor Meubelair: ${nama}`);
      }
    });

    // 10. Perangkat Laptop
    (laptops || []).forEach((l) => {
      const nama = l.produk || `${l.merk || "Laptop"} ${l.tipe || ""}`.trim() || "Perangkat Laptop";
      addSuggestion(nama, "Laptop", "laptop", l.sn ? `SN: ${l.sn}` : (l.nama_pengguna ? `User: ${l.nama_pengguna}` : "Data Laptop"));
      if (l.sn && l.sn !== "-") addSuggestion(l.sn, "Serial Number", "sn", `Laptop: ${nama}`);
      if (l.nama_pengguna && l.nama_pengguna !== "-") addSuggestion(l.nama_pengguna, "User Laptop", "laptop", `Pengguna: ${nama}`);
      if (l.penyedia && l.penyedia !== "-") addSuggestion(l.penyedia, "Vendor", "vendor", `Penyedia Laptop`);
      if (l.hostname && l.hostname !== "-") addSuggestion(l.hostname, "Hostname", "laptop", `Laptop: ${nama}`);
    });

    return items;
  }, [inventory, outlets, vendors, computers, printers, laptops, meubelairs, masterMeubelairs, transactions, spkHistory, soppHistory]);

  const filteredSuggestions = useMemo(() => {
    if (!searchTerm.trim()) {
      return systemSuggestions.slice(0, 15);
    }
    const q = searchTerm.trim();
    const matches = systemSuggestions.filter((s) => 
      flexibleMatch(s.label, q) || 
      flexibleMatch(s.category, q) || 
      flexibleMatch(s.extraInfo, q)
    );

    // Sort: items whose label directly matches or starts with q appear first
    matches.sort((a, b) => {
      const cleanQ = q.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanA = a.label.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanB = b.label.toLowerCase().replace(/[^a-z0-9]/g, "");

      const aStarts = cleanA.startsWith(cleanQ);
      const bStarts = cleanB.startsWith(cleanQ);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.label.localeCompare(b.label);
    });

    return matches.slice(0, 25);
  }, [systemSuggestions, searchTerm]);

  // Execute Search with minimum 2-character validation
  const handlePerformSearch = (query) => {
    const q = (query !== undefined ? query : searchTerm).trim();
    if (q.length === 1) {
      setSearchWarning("Ketik minimal 2 karakter atau pilih dari opsi dropdown yang tersedia di sistem.");
      setIsDropdownOpen(true);
      return;
    }
    setSearchWarning("");
    setIsDropdownOpen(false);
    setActiveSearchQuery(q);
    setUnitPage(1);
    setDocPage(1);
    setUnitSearch("");
    setDocSearch("");
    setDocTypeFilter("all");
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchWarning("");
    setIsDropdownOpen(false);
    setActiveSearchQuery("");
    setUnitSearch("");
    setDocSearch("");
    setDocTypeFilter("all");
  };

  // Smooth scroll helper functions with header offset
  const scrollToDaftarUnit = () => {
    const el = document.getElementById("daftar-unit-section");
    if (el) {
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - 115,
        behavior: "smooth",
      });
    }
  };

  const scrollToDokumenTerkait = () => {
    const el = document.getElementById("dokumen-terkait-section");
    if (el) {
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - 115,
        behavior: "smooth",
      });
    }
  };

  // 1. Gather all Units from Data Komputer, Data Printer, and Inventory
  const allUnits = useMemo(() => {
    const list = [];

    // Data Komputer
    (computers || []).forEach((c) => {
      const rawOutlet = (c.outlet || c.outlet_rel?.nama || c.nama_outlet || c.lokasi || "").trim() || "Kanwil VIII Jakarta";
      const nama = c.produk || `${c.merk || "PC"} ${c.tipe || ""}`.trim() || "Komputer PC";
      const sn = c.sn || c.serial_number || "-";
      const vendorName = c.penyedia || c.vendor || c.supplier || "-";
      const tglMulai = c.tanggal_mulai || c.tanggalMulai || c.tanggal_pengadaan || c.created_at || "-";
      const tglSelesai = c.tanggal_selesai || c.tanggalSelesai || c.garansi_selesai || "-";
      const status = normalizeStatus(c.status, tglMulai, tglSelesai);

      list.push({
        id: `pc-${c.id}`,
        type: "Data Komputer",
        nama,
        kode: c.kode_pc || `PC-${c.id}`,
        serial_number: sn,
        outlet: rawOutlet,
        vendor: vendorName,
        tgl_mulai: tglMulai,
        tgl_selesai: tglSelesai,
        status,
        raw: c,
      });
    });

    // Data Printer
    (printers || []).forEach((p) => {
      const rawOutlet = (p.outlet || p.outlet_rel?.nama || p.nama_outlet || p.lokasi || "").trim() || "Kanwil VIII Jakarta";
      const nama = p.produk || `${p.merk || "Printer"} ${p.tipe || ""}`.trim() || "Printer";
      const sn = p.sn || p.serial_number || "-";
      const vendorName = p.vendor || p.penyedia || p.supplier || "-";
      const tglMulai = p.tanggal_mulai || p.tanggalMulai || p.tanggal_pengadaan || p.created_at || "-";
      const tglSelesai = p.tanggal_selesai || p.tanggalSelesai || p.garansi_selesai || "-";
      const status = normalizeStatus(p.status, tglMulai, tglSelesai);

      list.push({
        id: `printer-${p.id}`,
        type: "Data Printer",
        nama,
        kode: p.kode_printer || `PRN-${p.id}`,
        serial_number: sn,
        outlet: rawOutlet,
        vendor: vendorName,
        tgl_mulai: tglMulai,
        tgl_selesai: tglSelesai,
        status,
        raw: p,
      });
    });

    // Master Inventory
    (inventory || []).forEach((item) => {
      const rawOutlet = (item.outlet?.nama || item.outlet || item.lokasi || "").trim() || "Gudang Terpadu / Kanwil VIII";
      const nama = item.nama_barang || item.nama || "";
      const kode = item.kode_barang || item.kode || "";
      const sn = item.serial_number || item.sn || "-";
      const vendorName = item.vendor || item.nama_vendor || item.vendor_nama || "-";
      const tglMulai = item.tanggal_masuk || item.created_at || "-";
      const tglSelesai = item.tanggal_garansi || "-";
      const status = normalizeStatus(item.status || item.kondisi, tglMulai, tglSelesai);

      list.push({
        id: `inv-${item.id}`,
        type: "Barang Inventaris",
        nama,
        kode,
        serial_number: sn,
        outlet: rawOutlet,
        vendor: vendorName,
        tgl_mulai: tglMulai,
        tgl_selesai: tglSelesai,
        status,
        raw: item,
      });
    });

    // Data Meubelair (Inventaris Meubelair)
    (meubelairs || []).forEach((m) => {
      const rawOutlet = (m.lokasi || m.outlet_rel?.nama || m.outlet_rel?.nama_outlet || m.outlet || "").trim() || "Kanwil VIII Jakarta";
      const nama = m.jenis || m.nama_barang || m.type_barang || m.kategori || "Meubelair";
      const kategori = m.kategori || m.jenis_barang || "Meubelair";
      const normKategori = kategori
        ? (kategori.toLowerCase() === "ac" ? "AC" : (kategori.charAt(0).toUpperCase() + kategori.slice(1)))
        : "Meubelair";
      const kode = m.kode_barang || m.kode || `MBL-${m.id}`;
      const sn = m.sn || m.serial_number || "-";
      const vendorName = m.vendor || m.penyedia || m.supplier || "-";
      const tglMulai = m.tanggal_register || m.tanggal_registrasi || m.tanggal_beli || m.created_at || "-";
      const tglSelesai = "-";
      const status = m.kondisi || "Baik";
      const quantity = Number(m.quantity) || 1;

      list.push({
        id: `mebel-${m.id}`,
        type: "Inventaris Meubelair",
        nama,
        kategori: normKategori,
        kode,
        serial_number: sn,
        outlet: rawOutlet,
        vendor: vendorName,
        tgl_mulai: tglMulai,
        tgl_selesai: tglSelesai,
        status,
        quantity,
        jenis_barang: nama,
        type_barang: m.type_barang || m.tipe || normKategori,
        keterangan: m.keterangan || "-",
        raw: m,
      });
    });

    // Data Laptop
    (laptops || []).forEach((l) => {
      const rawOutlet = (l.departemen || l.lokasi || l.cabang || "").trim() || "Kanwil VIII Jakarta";
      const nama = l.produk || `${l.merk || "Laptop"} ${l.tipe || ""}`.trim() || "Laptop";
      const sn = l.sn || l.serial_number || "-";
      const vendorName = l.penyedia || l.vendor || "-";
      const tglMulai = l.tanggal_mulai || l.tanggalMulai || l.created_at || "-";
      const tglSelesai = l.tanggal_selesai || l.tanggalSelesai || "-";
      const status = normalizeStatus(l.status, tglMulai, tglSelesai);

      list.push({
        id: `laptop-${l.id}`,
        type: "Data Laptop",
        nama,
        kode: l.hostname || `LPT-${l.id}`,
        serial_number: sn,
        outlet: rawOutlet,
        vendor: vendorName,
        tgl_mulai: tglMulai,
        tgl_selesai: tglSelesai,
        status,
        nama_pengguna: l.nama_pengguna || l.namaPengguna || "-",
        nik_pegawai: l.nik_pegawai || l.nikPegawai || "-",
        jabatan: l.jabatan || "-",
        raw: l,
      });
    });

    return list;
  }, [computers, printers, laptops, inventory, meubelairs]);

  // Filter units matching active search query (or return all units if query empty)
  const matchedUnits = useMemo(() => {
    if (!activeSearchQuery) return allUnits;
    const q = activeSearchQuery.trim();

    return allUnits.filter((u) => {
      return (
        flexibleMatch(u.nama, q) ||
        flexibleMatch(u.kode, q) ||
        flexibleMatch(u.serial_number, q) ||
        flexibleMatch(u.outlet, q) ||
        flexibleMatch(u.vendor, q) ||
        flexibleMatch(u.type, q) ||
        flexibleMatch(u.status, q) ||
        flexibleMatch(u.keterangan, q) ||
        flexibleMatch(u.jenis_barang, q) ||
        flexibleMatch(u.type_barang, q) ||
        flexibleMatch(u.nama_pengguna, q) ||
        flexibleMatch(u.nik_pegawai, q) ||
        flexibleMatch(u.jabatan, q)
      );
    });
  }, [activeSearchQuery, allUnits]);

  // 2. Gather all Authentic Documents from Transactions, SPK, and SOPP (without dummy fallbacks)
  const allDocuments = useMemo(() => {
    const list = [];

    // Transactions (Surat Serah Terima)
    (transactions || []).forEach((t) => {
      const rawNo = t.nomor_surat || t.nomorSurat || t.no_surat || "";
      if (!rawNo) return; // Skip dummy or unnumbered drafts

      const itemsList = t.items || [];
      const itemNames = Array.isArray(itemsList)
        ? itemsList.map((i) => `${i.nama_barang || i.produk || i.nama || ""} ${i.serial_number || i.sn || ""} ${i.outlet || ""}`).join(" ")
        : "";
      const penerimaName = t.penerima_nama || t.penerima || t.penerima_instansi || "Logistik Kanwil VIII";
      const pengirimName = t.pengirim_nama || t.pengirim || t.pengirim_instansi || "";
      const outletTujuan = t.outlet_tujuan || t.penerima_instansi || "";
      const outletAsal = t.outlet_asal || t.pengirim_instansi || "";

      list.push({
        id: `sst-${t.id}`,
        docCategory: "sst",
        nomor: rawNo,
        tanggal: t.tanggal || t.tanggal_surat || t.created_at || "-",
        jenis: t.jenis_transaksi || "Surat Serah Terima",
        vendor: penerimaName,
        itemSearchText: `${itemNames} ${penerimaName} ${pengirimName} ${outletTujuan} ${outletAsal} ${t.lokasi || ""}`,
        raw: t,
      });
    });

    // SPK History (Surat Perintah Kerja)
    (spkHistory || []).forEach((spk) => {
      const content = spk.content || (typeof spk.data === "object" ? spk.data : spk);
      const rawNo = spk.nomor_spk || spk.no_spk || spk.nomorSpk || content.nomorSpk || content.no_spk || "";
      if (!rawNo) return; // Skip dummy or unnumbered drafts

      const jenisSpkType = spk.tipe_spk || spk.type || content.type || content.jenis_spk || "Kerja";
      
      // Nama Barang dideteksi dari 'uraian' (atau pekerjaan/keterangan)
      const uraianText = spk.uraian || content.uraian || spk.pekerjaan || content.pekerjaan || spk.keterangan || content.keterangan || "";
      
      // Vendor dideteksi dari 'Nama Penerima/Perusahaan'
      const vendorName = spk.nama_perusahaan || content.namaPerusahaan || spk.nama_penerima || content.namaPenerima || spk.perusahaan || spk.nama_vendor || spk.vendor || content.vendor || spk.pihak_kedua || content.pihakKedua || "-";
      
      const cabangOutlet = spk.cabang || spk.lokasi || content.cabang || content.lokasi || spk.outlet || content.outlet || "";

      list.push({
        id: `spk-${spk.id}`,
        docCategory: "spk",
        nomor: rawNo,
        tanggal: spk.tanggal_spk || spk.tanggal || content.tanggal || spk.created_at || "-",
        jenis: `SPK ${jenisSpkType.toUpperCase()}`,
        vendor: vendorName,
        uraian: uraianText,
        outlet: cabangOutlet,
        itemSearchText: `${uraianText} ${vendorName} ${cabangOutlet} ${rawNo}`,
        raw: spk,
      });
    });

    // SOPP History (Surat Otorisasi Pemindahbukuan & Pembayaran)
    (soppHistory || []).forEach((sopp) => {
      const content = sopp.content || (typeof sopp.data === "object" ? sopp.data : sopp);
      const rawNo = sopp.nomor_sopp || sopp.no_sopp || sopp.nomorSopp || content.nomorSopp || content.no_sopp || "";
      if (!rawNo) return; // Skip dummy or unnumbered drafts

      const jenisSoppType = sopp.tipe_sopp || sopp.type || content.type || content.jenis_sopp || "Pembayaran";
      
      // Nama Barang dideteksi dari 'uraian' (atau perihal/rows)
      let uraianText = sopp.uraian || content.uraian || sopp.perihal || content.perihal || sopp.keterangan || content.keterangan || "";
      if (!uraianText && Array.isArray(content.rows)) {
        uraianText = content.rows.map((r) => r.uraian || r.keterangan || "").filter(Boolean).join(" ");
      }
      
      // Vendor dideteksi dari 'dibayarkan kepada'
      const vendorName = sopp.dibayarkan_kepada || content.dibayarkanKepada || sopp.nama_vendor || sopp.vendor || content.vendor || sopp.kepada || content.kepada || "-";
      
      const cabangOutlet = sopp.cabang || sopp.lokasi || content.cabang || content.lokasi || sopp.outlet || content.outlet || "";

      list.push({
        id: `sopp-${sopp.id}`,
        docCategory: "sopp",
        nomor: rawNo,
        tanggal: sopp.tanggal_sopp || sopp.tanggal || content.tanggal || sopp.created_at || "-",
        jenis: `SOPP ${jenisSoppType.toUpperCase()}`,
        vendor: vendorName,
        uraian: uraianText,
        outlet: cabangOutlet,
        itemSearchText: `${uraianText} ${vendorName} ${cabangOutlet} ${rawNo}`,
        raw: sopp,
      });
    });

    return list;
  }, [transactions, spkHistory, soppHistory]);

  // Documents matching active search query (or return all real documents if query empty)
  const matchedDocuments = useMemo(() => {
    if (!activeSearchQuery) return allDocuments;
    const q = activeSearchQuery.trim();

    return allDocuments.filter(
      (d) =>
        flexibleMatch(d.nomor, q) ||
        flexibleMatch(d.jenis, q) ||
        flexibleMatch(d.vendor, q) ||
        flexibleMatch(d.tanggal, q) ||
        flexibleMatch(d.uraian, q) ||
        flexibleMatch(d.outlet, q) ||
        flexibleMatch(d.itemSearchText, q)
    );
  }, [activeSearchQuery, allDocuments]);

  // Secondary filtering inside unit list
  const filteredUnits = useMemo(() => {
    if (!unitSearch.trim()) return matchedUnits;
    const uq = unitSearch.trim();
    return matchedUnits.filter(
      (u) =>
        flexibleMatch(u.nama, uq) ||
        flexibleMatch(u.serial_number, uq) ||
        flexibleMatch(u.outlet, uq) ||
        flexibleMatch(u.vendor, uq) ||
        flexibleMatch(u.kode, uq) ||
        flexibleMatch(u.type, uq) ||
        flexibleMatch(u.status, uq) ||
        flexibleMatch(u.keterangan, uq) ||
        flexibleMatch(u.jenis_barang, uq) ||
        flexibleMatch(u.type_barang, uq) ||
        flexibleMatch(u.nama_pengguna, uq) ||
        flexibleMatch(u.nik_pegawai, uq) ||
        flexibleMatch(u.jabatan, uq)
    );
  }, [matchedUnits, unitSearch]);

  // Secondary filtering inside document list
  const filteredDocuments = useMemo(() => {
    let docs = matchedDocuments;
    if (docTypeFilter !== "all") {
      docs = docs.filter((d) => d.docCategory === docTypeFilter);
    }
    if (!docSearch.trim()) return docs;
    const dq = docSearch.trim();
    return docs.filter(
      (d) =>
        flexibleMatch(d.nomor, dq) ||
        flexibleMatch(d.jenis, dq) ||
        flexibleMatch(d.tanggal, dq) ||
        flexibleMatch(d.vendor, dq) ||
        flexibleMatch(d.uraian, dq) ||
        flexibleMatch(d.outlet, dq) ||
        flexibleMatch(d.itemSearchText, dq)
    );
  }, [matchedDocuments, docTypeFilter, docSearch]);

  const effectiveUnitPerPage = useMemo(() => {
    if (unitPerPage === "all") return filteredUnits.length || 1;
    return parseInt(unitPerPage, 10) || 5;
  }, [unitPerPage, filteredUnits.length]);

  const effectiveDocPerPage = useMemo(() => {
    if (docPerPage === "all") return filteredDocuments.length || 1;
    return parseInt(docPerPage, 10) || 5;
  }, [docPerPage, filteredDocuments.length]);

  // Document Counts by Category
  const docCounts = useMemo(() => {
    const sst = matchedDocuments.filter((d) => d.docCategory === "sst").length;
    const spk = matchedDocuments.filter((d) => d.docCategory === "spk").length;
    const sopp = matchedDocuments.filter((d) => d.docCategory === "sopp").length;
    return { all: matchedDocuments.length, sst, spk, sopp };
  }, [matchedDocuments]);

  // Related documents for selected unit in detail modal (authentic match by Hardware Name & Vendor/Outlet)
  const unitRelatedDocs = useMemo(() => {
    if (!selectedUnit) return [];
    const unitSn = (selectedUnit.serial_number || "").toLowerCase().trim();
    const unitNama = (selectedUnit.nama || "").toLowerCase().trim();
    const unitOutlet = (selectedUnit.outlet || "").toLowerCase().trim();
    const unitVendor = (selectedUnit.vendor || "").toLowerCase().trim();

    return allDocuments.filter((d) => {
      const raw = d.raw || {};
      const targetText = `${d.nomor} ${d.jenis} ${d.vendor} ${d.uraian || ""} ${d.itemSearchText || ""}`.toLowerCase();

      // 1. Match by Serial Number (if SN exists and is not "-")
      const hasSnMatch = Boolean(
        unitSn && unitSn !== "-" && targetText.includes(unitSn)
      );
      if (hasSnMatch) return true;

      // 2. Match by Hardware Name AND Outlet Name in Surat Serah Terima (SST)
      if (d.docCategory === "sst") {
        const trxItems = Array.isArray(raw.items) ? raw.items : [];

        // Check inside items array of Surat Serah Terima
        const itemMatchInSst = trxItems.some((item) => {
          const iNama = (item.nama_barang || item.produk || item.nama || "").toLowerCase();
          const iSn = (item.serial_number || item.sn || "").toLowerCase();
          const iOutlet = (item.outlet || raw.outlet_tujuan || raw.outlet_asal || raw.penerima_instansi || raw.pengirim_instansi || "").toLowerCase();

          const nameMatch = unitNama && (iNama.includes(unitNama) || unitNama.includes(iNama));
          const snMatch = unitSn && unitSn !== "-" && iSn.includes(unitSn);
          const outletMatch = unitOutlet && (iOutlet.includes(unitOutlet) || targetText.includes(unitOutlet));

          return (snMatch || nameMatch) && outletMatch;
        });

        if (itemMatchInSst) return true;

        // Header level match: hardware name AND outlet name in target text
        const headerNameMatch = unitNama && targetText.includes(unitNama);
        const headerOutletMatch = unitOutlet && targetText.includes(unitOutlet);

        return Boolean(headerNameMatch && headerOutletMatch);
      }

      // 3. Match for SPK (dideteksi dari Uraian & Nama Penerima/Perusahaan) & SOPP (dideteksi dari Uraian & Dibayarkan Kepada)
      if (d.docCategory === "spk" || d.docCategory === "sopp") {
        const docUraian = (d.uraian || "").toLowerCase();
        const docVendor = (d.vendor || "").toLowerCase();
        const docOutlet = (d.outlet || "").toLowerCase();

        const nameMatch = unitNama && (docUraian.includes(unitNama) || targetText.includes(unitNama));
        const vendorMatch = unitVendor && unitVendor !== "-" && (docVendor.includes(unitVendor) || targetText.includes(unitVendor));
        const outletMatch = unitOutlet && (docOutlet.includes(unitOutlet) || targetText.includes(unitOutlet));

        // Jika Uraian cocok dengan nama barang, DAN (outlet/vendor cocok atau dokumen tidak membatasi outlet)
        if (nameMatch) {
          if (!unitOutlet || outletMatch || vendorMatch || !docOutlet) {
            return true;
          }
        }

        // Jika Vendor cocok DAN Outlet cocok
        if (vendorMatch && outletMatch) {
          return true;
        }

        // Fallback: pencocokan ganda Nama Barang dan Outlet/Vendor pada teks target
        const generalNameMatch = unitNama && targetText.includes(unitNama);
        const generalOutletOrVendorMatch = (unitOutlet && targetText.includes(unitOutlet)) || (unitVendor && unitVendor !== "-" && targetText.includes(unitVendor));

        return Boolean(generalNameMatch && generalOutletOrVendorMatch);
      }

      return false;
    });
  }, [selectedUnit, allDocuments]);

  // Unique Outlets & Vendors count in matched search results
  const resultMetrics = useMemo(() => {
    if (!activeSearchQuery) {
      return {
        totalBarang: defaultTotalBarangCount,
        totalOutlet: defaultTotalOutletCount,
        totalSurat: defaultTotalSuratCount,
        totalVendor: 12,
      };
    }

    const uniqueOutlets = new Set();
    const uniqueVendors = new Set();

    matchedUnits.forEach((u) => {
      if (u.outlet) uniqueOutlets.add(u.outlet);
      if (u.vendor) uniqueVendors.add(u.vendor);
    });

    matchedDocuments.forEach((d) => {
      if (d.vendor) uniqueVendors.add(d.vendor);
      if (d.outlet) uniqueOutlets.add(d.outlet);
    });

    const q = activeSearchQuery.trim();
    const matchedMasterOutlets = (outlets || []).filter(
      (o) => flexibleMatch(o.nama || o.nama_outlet || o.name || "", q)
    );
    matchedMasterOutlets.forEach((o) => {
      uniqueOutlets.add(o.nama || o.nama_outlet || o.name);
    });

    const matchedMasterVendors = (vendors || []).filter(
      (v) => flexibleMatch(v.nama || v.name || "", q) || flexibleMatch(v.pimpinan || "", q)
    );
    matchedMasterVendors.forEach((v) => {
      uniqueVendors.add(v.nama || v.name);
    });

    return {
      totalBarang: matchedUnits.length,
      totalOutlet: uniqueOutlets.size || (matchedMasterOutlets.length > 0 ? matchedMasterOutlets.length : 0),
      totalSurat: matchedDocuments.length,
      totalVendor: uniqueVendors.size || (matchedUnits.length > 0 || matchedDocuments.length > 0 ? 1 : 0),
    };
  }, [
    activeSearchQuery,
    matchedUnits,
    matchedDocuments,
    outlets,
    vendors,
    defaultTotalBarangCount,
    defaultTotalOutletCount,
    defaultTotalSuratCount,
  ]);

  // Whether data exists in the system for the active search query
  const hasSearchResults = useMemo(() => {
    if (!activeSearchQuery) return true;
    return (
      resultMetrics.totalBarang > 0 ||
      resultMetrics.totalOutlet > 0 ||
      resultMetrics.totalSurat > 0 ||
      resultMetrics.totalVendor > 0
    );
  }, [activeSearchQuery, resultMetrics]);

  // Pagination Slicing for Units
  const totalUnitPages = Math.ceil(filteredUnits.length / effectiveUnitPerPage) || 1;
  const paginatedUnits = useMemo(() => {
    const start = (unitPage - 1) * effectiveUnitPerPage;
    return filteredUnits.slice(start, start + effectiveUnitPerPage);
  }, [filteredUnits, unitPage, effectiveUnitPerPage]);

  const visibleUnitPages = useMemo(() => {
    const maxVisible = 5;
    if (totalUnitPages <= maxVisible) {
      return Array.from({ length: totalUnitPages }, (_, i) => i + 1);
    }
    let start = unitPage - 2;
    let end = unitPage + 2;
    if (start < 1) {
      start = 1;
      end = maxVisible;
    } else if (end > totalUnitPages) {
      end = totalUnitPages;
      start = totalUnitPages - maxVisible + 1;
    }
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [totalUnitPages, unitPage]);

  // Pagination Slicing for Documents
  const totalDocPages = Math.ceil(filteredDocuments.length / effectiveDocPerPage) || 1;
  const paginatedDocs = useMemo(() => {
    const start = (docPage - 1) * effectiveDocPerPage;
    return filteredDocuments.slice(start, start + effectiveDocPerPage);
  }, [filteredDocuments, docPage, effectiveDocPerPage]);

  const visibleDocPages = useMemo(() => {
    const maxVisible = 5;
    if (totalDocPages <= maxVisible) {
      return Array.from({ length: totalDocPages }, (_, i) => i + 1);
    }
    let start = docPage - 2;
    let end = docPage + 2;
    if (start < 1) {
      start = 1;
      end = maxVisible;
    } else if (end > totalDocPages) {
      end = totalDocPages;
      start = totalDocPages - maxVisible + 1;
    }
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [totalDocPages, docPage]);

  // CSV Export for Units
  const exportUnitsCSV = () => {
    if (filteredUnits.length === 0) return;
    const headers = ["No,Nama Outlet,Hardware,Serial Number,Vendor,Tgl Mulai,Tgl Selesai,Status"];
    const rows = filteredUnits.map(
      (u, i) =>
        `"${i + 1}","${u.outlet}","${u.nama}","${u.serial_number}","${u.vendor}","${formatDate(u.tgl_mulai)}","${formatDate(u.tgl_selesai)}","${u.status}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Daftar_Unit_${activeSearchQuery || "All"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export for Documents
  const exportDocsCSV = () => {
    if (filteredDocuments.length === 0) return;
    const headers = ["No,Nomor Surat,Tanggal,Jenis Surat,Vendor/Penerima"];
    const rows = filteredDocuments.map(
      (d, i) =>
        `"${i + 1}","${d.nomor}","${formatDate(d.tanggal)}","${d.jenis}","${d.vendor}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Dokumen_Terkait_${activeSearchQuery || "All"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formattedSearchTitle = activeSearchQuery.toUpperCase();

  // Dynamic header icon and category metadata based on search query
  const searchHeaderMeta = useMemo(() => {
    if (!activeSearchQuery) {
      return {
        icon: <Package className="w-7 h-7" />,
        bgClass: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
        badgeText: "Semua Data Logistik",
      };
    }
    const q = activeSearchQuery.toLowerCase().trim();
    const cleanQ = q.replace(/[^a-z0-9]/g, "");

    // 1. Check if query matches a Vendor
    const isVendorExplicit =
      q.startsWith("pt") ||
      q.startsWith("cv") ||
      q.startsWith("ud") ||
      q.includes("vendor") ||
      q.includes("supplier") ||
      q.includes("penyedia") ||
      q.includes("rekanan") ||
      q.includes("koperasi") ||
      ["poj", "eps", "gdk", "eras", "aras", "pesonna", "danakar", "imtek", "yoderindo", "prodia"].includes(cleanQ);

    const isVendorInList =
      (vendors || []).some((v) => flexibleMatch(v.nama || v.name || "", q) || flexibleMatch(v.pimpinan || "", q)) ||
      (computers || []).some((c) => c.penyedia && (flexibleMatch(c.penyedia, q) || c.penyedia.toLowerCase().trim() === q)) ||
      (printers || []).some((p) => p.vendor && (flexibleMatch(p.vendor, q) || p.vendor.toLowerCase().trim() === q)) ||
      (inventory || []).some((i) => (i.vendor || i.nama_vendor || i.vendor_nama) && flexibleMatch(i.vendor || i.nama_vendor || i.vendor_nama, q)) ||
      (spkHistory || []).some((s) => (s.nama_perusahaan || s.vendor) && flexibleMatch(s.nama_perusahaan || s.vendor, q)) ||
      (soppHistory || []).some((s) => (s.dibayarkan_kepada || s.nama_vendor) && flexibleMatch(s.dibayarkan_kepada || s.nama_vendor, q));

    const isVendorSuggestion = systemSuggestions.some(
      (s) =>
        ["Vendor", "Pimpinan Vendor", "Vendor / Rekanan", "Penerima Pembayaran"].includes(s.category) &&
        (s.label.toLowerCase().trim() === q || flexibleMatch(s.label, q))
    );

    const isVendor = isVendorExplicit || (isVendorInList && (isVendorSuggestion || (!q.includes("printer") && !q.includes("komputer") && !q.includes("outlet"))));

    if (isVendor) {
      return {
        icon: <Users className="w-7 h-7" />,
        bgClass: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
        badgeText: "Data Vendor & Rekanan",
      };
    }

    // 2. Check if query matches an Outlet / Cabang / Area
    const isOutletExplicit =
      q.includes("outlet") ||
      q.startsWith("cp ") ||
      q.startsWith("kcp ") ||
      q.startsWith("kc ") ||
      q.startsWith("kk ") ||
      q.startsWith("area ") ||
      q.startsWith("cabang ") ||
      (outlets || []).some((o) => flexibleMatch(o.nama || o.nama_outlet || o.name || "", q) || flexibleMatch(o.cabang || "", q) || flexibleMatch(o.area || "", q));

    const isOutletSuggestion = systemSuggestions.some(
      (s) =>
        ["Outlet", "Cabang", "Area", "Kode Outlet"].includes(s.category) &&
        (s.label.toLowerCase().trim() === q || flexibleMatch(s.label, q))
    );

    if ((isOutletExplicit || isOutletSuggestion) && !q.includes("pc") && !q.includes("printer")) {
      return {
        icon: <Building2 className="w-7 h-7" />,
        bgClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
        badgeText: "Data Outlet & Cabang",
      };
    }

    // 3. Check if query matches a Document (SPK, SOPP, SST)
    const isDocExplicit =
      q.includes("spk") ||
      q.includes("sopp") ||
      q.includes("sst") ||
      q.includes("surat") ||
      q.includes("bast") ||
      q.includes("bap") ||
      (q.includes("/") && (q.includes("202") || q.includes("00108")));

    const isDocSuggestion = systemSuggestions.some(
      (s) =>
        ["Dokumen", "Uraian Pekerjaan", "Uraian Pembayaran"].includes(s.category) &&
        (s.label.toLowerCase().trim() === q || flexibleMatch(s.label, q))
    );

    if (isDocExplicit || isDocSuggestion) {
      return {
        icon: <FileText className="w-7 h-7" />,
        bgClass: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
        badgeText: "Dokumen & Surat Logistik",
      };
    }

    // 4. Check if query matches Meubelair
    const isMeubelair =
      q.includes("mebel") ||
      q.includes("meubelair") ||
      q.includes("kursi") ||
      q.includes("meja") ||
      q.includes("lemari") ||
      q.includes("sofa") ||
      q.includes("ac ") ||
      q.includes("ac split") ||
      (meubelairs || []).some((m) => flexibleMatch(m.jenis || m.nama_barang || m.kategori || "", q)) ||
      (masterMeubelairs || []).some((mm) => flexibleMatch(mm.nama_barang || mm.jenis_barang || "", q)) ||
      systemSuggestions.some((s) => s.category.includes("Meubelair") && flexibleMatch(s.label, q));

    if (isMeubelair) {
      return {
        icon: <Armchair className="w-7 h-7" />,
        bgClass: "bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400",
        badgeText: "Inventaris Meubelair",
      };
    }

    // 5. Check if query matches Laptop
    const isLaptop =
      q.includes("laptop") ||
      q.includes("notebook") ||
      q.includes("thinkpad") ||
      (laptops || []).some((l) => flexibleMatch(l.produk || "", q) || flexibleMatch(l.nama_pengguna || "", q)) ||
      systemSuggestions.some((s) => s.category.includes("Laptop") && flexibleMatch(s.label, q));

    if (isLaptop) {
      return {
        icon: <Laptop className="w-7 h-7" />,
        bgClass: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
        badgeText: "Perangkat Laptop",
      };
    }

    // 6. Check if query matches a Printer
    const isPrint =
      q.includes("printer") ||
      q.includes("epson") ||
      q.includes("lq") ||
      q.includes("lx") ||
      q.includes("passbook") ||
      q.includes("sp40") ||
      q.includes("sp 40") ||
      q.includes("eco tank") ||
      q.includes("ecotank") ||
      q.includes("l3110") ||
      q.includes("l4260") ||
      q.includes("l4261") ||
      q.includes("l5590") ||
      q.includes("l3210") ||
      q.includes("l3216") ||
      q.includes("l3250") ||
      q.includes("l220") ||
      q.includes("l360") ||
      q.includes("l405") ||
      q.includes("l4150") ||
      (printers || []).some((p) => flexibleMatch(p.produk || "", q));

    if (isPrint && !q.includes("pc") && !q.includes("laptop")) {
      return {
        icon: <Printer className="w-7 h-7" />,
        bgClass: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
        badgeText: "Perangkat Printer",
      };
    }

    // 7. Check if query matches a Computer / PC
    const isComp =
      q.includes("pc") ||
      q.includes("komputer") ||
      q.includes("computer") ||
      q.includes("core") ||
      q.includes("lenovo") ||
      q.includes("optiplex") ||
      q.includes("thinkcentre") ||
      q.includes("dell") ||
      q.includes("all in one") ||
      q.includes("aio") ||
      q.includes("cpu") ||
      q.includes("ram") ||
      q.includes("intel") ||
      q.includes("monitor") ||
      (computers || []).some((c) => flexibleMatch(c.produk || "", q));

    if (isComp) {
      return {
        icon: <Monitor className="w-7 h-7" />,
        bgClass: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
        badgeText: "Perangkat Komputer / PC",
      };
    }

    // 8. Check if Serial Number
    const isSn = systemSuggestions.some(
      (s) => s.category === "Serial Number" && (s.label.toLowerCase().trim() === q || flexibleMatch(s.label, q))
    );
    if (isSn) {
      return {
        icon: <ShieldCheck className="w-7 h-7" />,
        bgClass: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400",
        badgeText: "Serial Number Perangkat",
      };
    }

    // 9. Fallback based on matched units composition
    const compCount = matchedUnits.filter((u) => u.type === "Data Komputer").length;
    const laptopCount = matchedUnits.filter((u) => u.type === "Data Laptop").length;
    const printCount = matchedUnits.filter((u) => u.type === "Data Printer").length;
    const mebelCount = matchedUnits.filter((u) => u.type === "Inventaris Meubelair").length;
    const invCount = matchedUnits.filter((u) => u.type === "Barang Inventaris").length;

    if (mebelCount > 0 && mebelCount >= compCount && mebelCount >= laptopCount && mebelCount >= printCount && mebelCount >= invCount) {
      return {
        icon: <Armchair className="w-7 h-7" />,
        bgClass: "bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400",
        badgeText: "Inventaris Meubelair",
      };
    }
    if (laptopCount > 0 && laptopCount >= compCount && laptopCount >= printCount && laptopCount >= invCount) {
      return {
        icon: <Laptop className="w-7 h-7" />,
        bgClass: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
        badgeText: "Perangkat Laptop",
      };
    }
    if (compCount > 0 && compCount >= printCount && compCount >= invCount) {
      return {
        icon: <Monitor className="w-7 h-7" />,
        bgClass: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
        badgeText: "Perangkat Komputer",
      };
    }
    if (printCount > 0 && printCount >= compCount && printCount >= invCount) {
      return {
        icon: <Printer className="w-7 h-7" />,
        bgClass: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
        badgeText: "Perangkat Printer",
      };
    }
    if (invCount > 0) {
      return {
        icon: <Package className="w-7 h-7" />,
        bgClass: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
        badgeText: "Inventaris Barang",
      };
    }

    return {
      icon: <Package className="w-7 h-7" />,
      bgClass: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
      badgeText: "Hasil Pencarian Logistik",
    };
  }, [activeSearchQuery, matchedUnits, outlets, vendors, computers, printers, laptops, meubelairs, inventory, spkHistory, soppHistory, systemSuggestions]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in duration-300">
      {/* HERO SEARCH BANNER CARD (Shrinks when search is active) */}
      <div className={`relative z-20 bg-gradient-to-br from-emerald-700 via-teal-800 to-[#0d5c3a] rounded-3xl text-white shadow-xl transition-all duration-300 ${
        activeSearchQuery ? "p-5 sm:p-6" : "p-8 sm:p-10"
      }`}>
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl" />
        </div>

        <div className={`relative z-10 max-w-3xl mx-auto text-center ${activeSearchQuery ? "space-y-3" : "space-y-6"}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-blue-100 text-xs font-extrabold uppercase tracking-wider shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" /> PUSAT DATA BARANG
          </div>

          {!activeSearchQuery && (
            <>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                Pusat Pencarian & Monitoring Informasi Logistik
              </h2>

              <p className="text-blue-100/90 font-medium text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
                Akses cepat informasi inventaris barang, lokasi outlet cabang, perangkat IT, serta riwayat dokumen dalam satu portal terpadu.
              </p>
            </>
          )}

          {/* Search Box Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePerformSearch();
            }}
            className="pt-1 max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-3"
          >
            <div ref={searchContainerRef} className="relative z-30 flex-1 w-full">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSearchWarning("");
                  setIsDropdownOpen(true);
                }}
                placeholder="Cari nama barang, tipe, serial number, atau outlet ..."
                className="w-full pl-12 pr-10 py-3.5 bg-white text-gray-900 placeholder-gray-400 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-white/30 shadow-lg transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Dropdown Suggestions List */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#132219] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#213527] overflow-hidden z-50 text-left animate-in fade-in slide-in-from-top-2 duration-200 max-h-80 overflow-y-auto custom-scrollbar">
                  {searchWarning && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{searchWarning}</span>
                    </div>
                  )}

                  <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#1a2b20] border-b border-slate-100 dark:border-[#213527] flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    <span>Opsi Pilihan Data Terdaftar ({filteredSuggestions.length})</span>
                    <span className="text-[10px] text-gray-400 font-normal">Klik opsi untuk mencari</span>
                  </div>

                  {filteredSuggestions.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
                      {filteredSuggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSearchTerm(sug.label);
                            handlePerformSearch(sug.label);
                          }}
                          className="w-full px-4 py-3 hover:bg-emerald-50/80 dark:hover:bg-[#1e3426] transition-colors flex items-center justify-between gap-3 text-left group cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#1a2b20] text-gray-700 dark:text-gray-300 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 group-hover:text-emerald-700 transition-colors shrink-0">
                              {sug.iconType === "outlet" && <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                              {sug.iconType === "barang" && <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                              {sug.iconType === "komputer" && <Monitor className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                              {sug.iconType === "laptop" && <Laptop className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
                              {sug.iconType === "meubelair" && <Armchair className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
                              {sug.iconType === "printer" && <Printer className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                              {sug.iconType === "sn" && <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
                              {sug.iconType === "vendor" && <Users className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                              {sug.iconType === "dokumen" && <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-gray-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                                {sug.label}
                              </p>
                              {sug.extraInfo && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {sug.extraInfo}
                                </p>
                              )}
                            </div>
                          </div>

                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                            sug.category === "Outlet" || sug.category === "Cabang" || sug.category === "Area" || sug.category === "Kode Outlet"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                              : sug.category === "Barang" || sug.category === "Kategori Barang" || sug.category === "Kode Barang" || sug.category === "Barang / Pekerjaan"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300"
                              : sug.category === "Meubelair" || sug.category === "Jenis Meubelair" || sug.category === "Tipe Meubelair"
                              ? "bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300"
                              : sug.category === "Laptop" || sug.category === "User Laptop"
                              ? "bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300"
                              : sug.category === "Komputer"
                              ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300"
                              : sug.category === "Printer"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300"
                              : sug.category === "Serial Number" || sug.category === "IP Address"
                              ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300"
                              : sug.category === "Vendor" || sug.category === "Pimpinan Vendor" || sug.category === "Vendor / Rekanan" || sug.category === "Penerima Pembayaran"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                          }`}>
                            {sug.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      Data tidak tersedia
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 bg-amber-400 hover:bg-amber-300 text-gray-950 font-bold text-sm rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Cari Data</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* SEARCH RESULTS INTEGRATED VIEW */}
      {activeSearchQuery ? (
        hasSearchResults ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-400">
            {/* HEADER SUMMARY CARD WITH DYNAMIC BADGE & 4 METRICS */}
          <div className="bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-6">
            <div className={`w-14 h-14 rounded-2xl ${searchHeaderMeta.bgClass} flex items-center justify-center mx-auto shadow-xs transition-colors`}>
              {searchHeaderMeta.icon}
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#16231a] text-gray-700 dark:text-gray-300">
                {searchHeaderMeta.badgeText}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight uppercase">
                {formattedSearchTitle}
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 font-medium">
                Hasil integrasi data unit barang, perangkat IT, serta seluruh riwayat dokumen terkait.
              </p>
            </div>

            {/* 4 Summary Box Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div
                onClick={scrollToDaftarUnit}
                className="bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 dark:from-[#13222e] dark:via-[#0f1712] dark:to-[#0f1712] border border-blue-200/80 dark:border-blue-900/60 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-4 text-center space-y-1 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-98 shadow-sm group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-2 shadow-md shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <Box className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">{resultMetrics.totalBarang}</div>
                <div className="text-xs text-gray-600 dark:text-slate-400 font-bold uppercase tracking-wider">Total Barang</div>
              </div>

              <div
                onClick={scrollToDaftarUnit}
                className="bg-gradient-to-br from-purple-50/80 via-white to-purple-50/30 dark:from-[#251833] dark:via-[#0f1712] dark:to-[#0f1712] border border-purple-200/80 dark:border-purple-900/60 hover:border-purple-500 dark:hover:border-purple-400 rounded-2xl p-4 text-center space-y-1 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-98 shadow-sm group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mx-auto mb-2 shadow-md shadow-purple-500/30 group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-slate-100 group-hover:text-purple-600 transition-colors">{resultMetrics.totalOutlet}</div>
                <div className="text-xs text-gray-600 dark:text-slate-400 font-bold uppercase tracking-wider">Total Outlet</div>
              </div>

              <div
                onClick={scrollToDokumenTerkait}
                className="bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 dark:from-[#132c21] dark:via-[#0f1712] dark:to-[#0f1712] border border-emerald-200/80 dark:border-emerald-900/60 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-2xl p-4 text-center space-y-1 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-98 shadow-sm group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">{resultMetrics.totalSurat}</div>
                <div className="text-xs text-gray-600 dark:text-slate-400 font-bold uppercase tracking-wider">Total Surat</div>
              </div>

              <div
                onClick={scrollToDaftarUnit}
                className="bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 dark:from-[#2d2216] dark:via-[#0f1712] dark:to-[#0f1712] border border-amber-200/80 dark:border-amber-900/60 hover:border-amber-500 dark:hover:border-amber-400 rounded-2xl p-4 text-center space-y-1 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-98 shadow-sm group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mx-auto mb-2 shadow-md shadow-amber-500/30 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-slate-100 group-hover:text-amber-600 transition-colors">{resultMetrics.totalVendor}</div>
                <div className="text-xs text-gray-600 dark:text-slate-400 font-bold uppercase tracking-wider">Total Vendor</div>
              </div>
            </div>
          </div>

          {/* CARD 1: DAFTAR UNIT TABLE */}
          <div id="daftar-unit-section" className="bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-[#1a2b20] text-blue-600 dark:text-emerald-400">
                <Box className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-gray-900 dark:text-slate-100 tracking-tight">Daftar Unit</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                  Semua unit {formattedSearchTitle}
                </p>
              </div>
            </div>

            {/* Sub-header controls: Search + Show Entries + Export */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={unitSearch}
                    onChange={(e) => {
                      setUnitSearch(e.target.value);
                      setUnitPage(1);
                    }}
                    placeholder="Pencarian..."
                    className="pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-[#16231a] border border-gray-300 dark:border-[#2b4533] rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 w-44 sm:w-60"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400 font-medium">
                  <span>Show</span>
                  <div className="relative inline-block">
                    <select
                      value={unitPerPage}
                      onChange={(e) => {
                        setUnitPerPage(e.target.value);
                        setUnitPage(1);
                      }}
                      className="appearance-none bg-white dark:bg-[#16231a] border border-gray-300 dark:border-[#2b4533] rounded-full pl-3.5 pr-7 py-1 text-xs font-bold text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="all">All</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <span>entries</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={exportUnitsCSV}
                  className="bg-[#279969] hover:bg-[#1e7a53] text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-md shadow-[#279969]/30 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" /> Export Excel
                </button>
                <span className="bg-emerald-50 text-[#0d5c3a] dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 font-bold text-xs px-4 py-2 rounded-full shrink-0">
                  Total: {filteredUnits.length}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-[#2b4533]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0d5c3a] text-white text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3 w-12 text-center">NO</th>
                    <th className="p-3">NAMA OUTLET</th>
                    <th className="p-3">HARDWARE</th>
                    <th className="p-3">SERIAL NUMBER</th>
                    <th className="p-3">VENDOR</th>
                    <th className="p-3">TGL MULAI</th>
                    <th className="p-3">TGL SELESAI</th>
                    <th className="p-3 text-center">STATUS</th>
                    <th className="p-3 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[#213527] bg-white dark:bg-[#0f1712]">
                  {paginatedUnits.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-gray-400 font-medium">
                        Tidak ditemukan unit barang yang sesuai pencarian.
                      </td>
                    </tr>
                  ) : (
                    paginatedUnits.map((u, idx) => (
                      <tr key={u.id || idx} className="hover:bg-blue-50/50 dark:hover:bg-[#1a2b20]/50 transition-colors">
                        <td className="p-3 text-center font-bold text-gray-500">
                          {(unitPage - 1) * effectiveUnitPerPage + idx + 1}
                        </td>
                        <td className="p-3 font-semibold text-gray-900 dark:text-slate-100">{u.outlet}</td>
                        <td className="p-3 font-medium text-gray-800 dark:text-slate-200">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{u.nama}</span>
                            {u.type === "Data Laptop" && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800">
                                Laptop
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-mono text-gray-600 dark:text-slate-400">{u.serial_number}</td>
                        <td className="p-3 text-gray-700 dark:text-slate-300 font-medium">{u.vendor}</td>
                        <td className="p-3 text-gray-700 dark:text-slate-300 whitespace-nowrap">{formatDate(u.tgl_mulai)}</td>
                        <td className="p-3 text-gray-700 dark:text-slate-300 whitespace-nowrap">{formatDate(u.tgl_selesai)}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase border shadow-3xs ${
                            u.status === "Sewa Berjalan" || u.status === "Baik" || u.status === "BAIK"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : u.status === "Sewa Habis" || u.status === "Rusak Berat"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : u.status === "Kurang Baik" || u.status === "Rusak Ringan"
                              ? "bg-amber-50 text-amber-700 border-amber-300"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedUnit(u)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Detail Unit"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 pt-2">
              <div>
                Menampilkan {filteredUnits.length > 0 ? (unitPage - 1) * effectiveUnitPerPage + 1 : 0} sampai{" "}
                {Math.min(unitPage * effectiveUnitPerPage, filteredUnits.length)} dari {filteredUnits.length} data
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={unitPage === 1}
                  onClick={() => setUnitPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#2b4533] bg-white dark:bg-[#16231a] text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-[#1f3226] font-semibold disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-colors shadow-2xs"
                >
                  &lt; Prev
                </button>
                {visibleUnitPages.map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setUnitPage(pg)}
                    className={`px-3 py-1 rounded-xl text-xs transition-all shadow-2xs cursor-pointer ${
                      unitPage === pg
                        ? "bg-blue-600 text-white font-bold border border-blue-600 shadow-xs"
                        : "bg-white dark:bg-[#16231a] text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-[#2b4533] hover:bg-gray-50 dark:hover:bg-[#1f3226] font-semibold"
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={unitPage === totalUnitPages || totalUnitPages === 0}
                  onClick={() => setUnitPage((p) => Math.min(p + 1, totalUnitPages))}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#2b4533] bg-white dark:bg-[#16231a] text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-[#1f3226] font-semibold disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-colors shadow-2xs"
                >
                  Next &gt;
                </button>
              </div>
            </div>
          </div>

          {/* CARD 2: DOKUMEN TERKAIT TABLE */}
          <div id="dokumen-terkait-section" className="bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-[#1a2b20] text-emerald-600 dark:text-emerald-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-gray-900 dark:text-slate-100 tracking-tight">Dokumen Terkait</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                  Semua riwayat Surat Serah Terima, SPK, dan SOPP {formattedSearchTitle}
                </p>
              </div>
            </div>

            {/* Document Tabs Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              <button
                type="button"
                onClick={() => {
                  setDocTypeFilter("all");
                  setDocPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  docTypeFilter === "all"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-gray-100 dark:bg-[#16231a] text-gray-600 dark:text-slate-300 hover:bg-gray-200"
                }`}
              >
                Semua Dokumen ({docCounts.all})
              </button>
              <button
                type="button"
                onClick={() => {
                  setDocTypeFilter("sst");
                  setDocPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  docTypeFilter === "sst"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-gray-100 dark:bg-[#16231a] text-gray-600 dark:text-slate-300 hover:bg-gray-200"
                }`}
              >
                Surat Serah Terima ({docCounts.sst})
              </button>
              <button
                type="button"
                onClick={() => {
                  setDocTypeFilter("spk");
                  setDocPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  docTypeFilter === "spk"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-gray-100 dark:bg-[#16231a] text-gray-600 dark:text-slate-300 hover:bg-gray-200"
                }`}
              >
                Surat Perintah Kerja ({docCounts.spk})
              </button>
              <button
                type="button"
                onClick={() => {
                  setDocTypeFilter("sopp");
                  setDocPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  docTypeFilter === "sopp"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-gray-100 dark:bg-[#16231a] text-gray-600 dark:text-slate-300 hover:bg-gray-200"
                }`}
              >
                SOPP ({docCounts.sopp})
              </button>
            </div>

            {/* Document Table Sub-Header Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={docSearch}
                    onChange={(e) => {
                      setDocSearch(e.target.value);
                      setDocPage(1);
                    }}
                    placeholder="Pencarian dokumen..."
                    className="pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-[#16231a] border border-gray-300 dark:border-[#2b4533] rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 w-44 sm:w-60"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400 font-medium">
                  <span>Show</span>
                  <div className="relative inline-block">
                    <select
                      value={docPerPage}
                      onChange={(e) => {
                        setDocPerPage(e.target.value);
                        setDocPage(1);
                      }}
                      className="appearance-none bg-white dark:bg-[#16231a] border border-gray-300 dark:border-[#2b4533] rounded-full pl-3.5 pr-7 py-1 text-xs font-bold text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="all">All</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <span>entries</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={exportDocsCSV}
                  className="bg-[#279969] hover:bg-[#1e7a53] text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-md shadow-[#279969]/30 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" /> Export Excel
                </button>
                <span className="bg-emerald-50 text-[#0d5c3a] dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 font-bold text-xs px-4 py-2 rounded-full shrink-0">
                  Total: {filteredDocuments.length}
                </span>
              </div>
            </div>

            {/* Document Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-[#2b4533]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0d5c3a] text-white text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3 w-12 text-center">NO</th>
                    <th className="p-3">NOMOR SURAT</th>
                    <th className="p-3">TANGGAL</th>
                    <th className="p-3">JENIS</th>
                    <th className="p-3 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[#213527] bg-white dark:bg-[#0f1712]">
                  {paginatedDocs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400 font-medium">
                        Tidak ditemukan dokumen terkait pencarian.
                      </td>
                    </tr>
                  ) : (
                    paginatedDocs.map((d, idx) => (
                      <tr key={d.id || idx} className="hover:bg-blue-50/50 dark:hover:bg-[#1a2b20]/50 transition-colors">
                        <td className="p-3 text-center font-bold text-gray-500">
                          {(docPage - 1) * effectiveDocPerPage + idx + 1}
                        </td>
                        <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">{d.nomor}</td>
                        <td className="p-3 text-gray-700 dark:text-slate-300 font-medium">{formatDate(d.tanggal)}</td>
                        <td className="p-3">
                          {d.docCategory === "sst" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                              <FileText className="w-3.5 h-3.5" />
                              {d.jenis}
                            </span>
                          ) : d.docCategory === "spk" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {d.jenis}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs">
                              <Package className="w-3.5 h-3.5" />
                              {d.jenis}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (setRiwayatFilter) {
                                setRiwayatFilter({ query: d.nomor, tab: d.docCategory });
                              }
                              if (setView) {
                                setView("riwayat");
                              }
                            }}
                            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline text-xs cursor-pointer"
                          >
                            Kelola &gt;
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 pt-2">
              <div>
                Menampilkan {filteredDocuments.length > 0 ? (docPage - 1) * effectiveDocPerPage + 1 : 0} sampai{" "}
                {Math.min(docPage * effectiveDocPerPage, filteredDocuments.length)} dari {filteredDocuments.length} data
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={docPage === 1}
                  onClick={() => setDocPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#2b4533] bg-white dark:bg-[#16231a] text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-[#1f3226] font-semibold disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-colors shadow-2xs"
                >
                  &lt; Prev
                </button>
                {visibleDocPages.map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setDocPage(pg)}
                    className={`px-3 py-1 rounded-xl text-xs transition-all shadow-2xs cursor-pointer ${
                      docPage === pg
                        ? "bg-blue-600 text-white font-bold border border-blue-600 shadow-xs"
                        : "bg-white dark:bg-[#16231a] text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-[#2b4533] hover:bg-gray-50 dark:hover:bg-[#1f3226] font-semibold"
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={docPage === totalDocPages || totalDocPages === 0}
                  onClick={() => setDocPage((p) => Math.min(p + 1, totalDocPages))}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#2b4533] bg-white dark:bg-[#16231a] text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-[#1f3226] font-semibold disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-colors shadow-2xs"
                >
                  Next &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* EMPTY STATE: DATA TIDAK TERSEDIA */
        <div className="bg-white dark:bg-[#0f1712] border border-gray-200 dark:border-[#2b4533] rounded-3xl p-12 sm:p-16 shadow-sm text-center flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-[#16231a] text-gray-400 dark:text-gray-500 flex items-center justify-center mb-4 border border-gray-100 dark:border-[#2b4533]/50 shadow-inner">
            <Box className="w-8 h-8 opacity-40 stroke-[1.5]" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 tracking-tight">
            Data tidak tersedia
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-md">
            Data dengan kata kunci pencarian "{activeSearchQuery}" tidak ditemukan di sistem.
          </p>
          <button
            type="button"
            onClick={handleClearSearch}
            className="mt-6 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#1f3325] dark:hover:bg-[#284230] text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Kembali ke Ringkasan Data</span>
          </button>
        </div>
      )) : (
        /* DEFAULT OVERVIEW CARDS (When no search active yet) */
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-gray-900 dark:text-slate-100 text-sm uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-emerald-400" />
              Ringkasan Data Logistik
            </h3>
            <span className="text-xs font-semibold text-gray-400 dark:text-slate-500">Real-time Overview</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 sm:gap-4.5">
            {/* Card 1: Total Barang -> Master Barang */}
            <div
              onClick={() => setView && setView("master_barang")}
              className="group bg-gradient-to-br from-blue-50/90 via-white to-blue-50/30 dark:from-[#13222e] dark:via-[#0f1712] dark:to-[#0f1712] border border-blue-200/80 dark:border-blue-900/60 hover:border-blue-500 dark:hover:border-blue-400 rounded-3xl p-5 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden cursor-pointer active:scale-98"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />
              <div className="flex items-center justify-between relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <Box className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800 shadow-2xs group-hover:bg-blue-600 group-hover:text-white transition-colors uppercase tracking-wider">
                  Barang
                </span>
              </div>
              <div className="mt-4 relative z-10">
                <div className="text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight group-hover:text-blue-600 transition-colors">{defaultTotalBarangCount}</div>
                <div className="text-xs text-gray-600 dark:text-slate-400 font-bold mt-1">Total Barang Master</div>
              </div>
            </div>

            {/* Card 2: Total Outlet -> Master Outlet */}
            <div
              onClick={() => setView && setView("master_outlet")}
              className="group bg-gradient-to-br from-purple-50/90 via-white to-purple-50/30 dark:from-[#251833] dark:via-[#0f1712] dark:to-[#0f1712] border border-purple-200/80 dark:border-purple-900/60 hover:border-purple-500 dark:hover:border-purple-400 rounded-3xl p-5 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden cursor-pointer active:scale-98"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />
              <div className="flex items-center justify-between relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold text-purple-700 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-950/80 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800 shadow-2xs group-hover:bg-purple-600 group-hover:text-white transition-colors uppercase tracking-wider">
                  Outlet
                </span>
              </div>
              <div className="mt-4 relative z-10">
                <div className="text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight group-hover:text-purple-600 transition-colors">{defaultTotalOutletCount}</div>
                <div className="text-xs text-gray-600 dark:text-slate-400 font-bold mt-1">Total Outlet Cabang</div>
              </div>
            </div>

            {/* Card 3: Total Perangkat Komputer -> Data Komputer */}
            <div
              onClick={() => setView && setView("perangkat_komputer")}
              className="group bg-gradient-to-br from-indigo-50/90 via-white to-indigo-50/30 dark:from-[#1d1b36] dark:via-[#0f1712] dark:to-[#0f1712] border border-indigo-200/80 dark:border-indigo-900/60 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-3xl p-5 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden cursor-pointer active:scale-98"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
              <div className="flex items-center justify-between relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                  <Monitor className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 shadow-2xs group-hover:bg-indigo-600 group-hover:text-white transition-colors uppercase tracking-wider">
                  PC
                </span>
              </div>
              <div className="mt-4 relative z-10">
                <div className="text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight group-hover:text-indigo-600 transition-colors">{defaultTotalKomputerCount}</div>
                <div className="text-xs text-gray-600 dark:text-slate-400 font-bold mt-1">Total Perangkat PC</div>
              </div>
            </div>

            {/* Card 4: Total Perangkat Laptop -> Data Laptop */}
            <div
              onClick={() => setView && setView("perangkat_laptop")}
              className="group bg-gradient-to-br from-sky-50/90 via-white to-sky-50/30 dark:from-[#0e2433] dark:via-[#0f1712] dark:to-[#0f1712] border border-sky-200/80 dark:border-sky-900/60 hover:border-sky-500 dark:hover:border-sky-400 rounded-3xl p-5 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden cursor-pointer active:scale-98"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-sky-500/20 transition-all" />
              <div className="flex items-center justify-between relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:scale-110 transition-transform">
                  <Laptop className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold text-sky-700 dark:text-sky-300 bg-sky-100/80 dark:bg-sky-950/80 px-2.5 py-1 rounded-full border border-sky-200 dark:border-sky-800 shadow-2xs group-hover:bg-sky-600 group-hover:text-white transition-colors uppercase tracking-wider">
                  Laptop
                </span>
              </div>
              <div className="mt-4 relative z-10">
                <div className="text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight group-hover:text-sky-600 transition-colors">{defaultTotalLaptopCount}</div>
                <div className="text-xs text-gray-600 dark:text-slate-400 font-bold mt-1">Total Data Laptop</div>
              </div>
            </div>

            {/* Card 5: Total Perangkat Printer -> Data Printer */}
            <div
              onClick={() => setView && setView("perangkat_printer")}
              className="group bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/30 dark:from-[#132c21] dark:via-[#0f1712] dark:to-[#0f1712] border border-emerald-200/80 dark:border-emerald-900/60 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-3xl p-5 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden cursor-pointer active:scale-98"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
              <div className="flex items-center justify-between relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <Printer className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 shadow-2xs group-hover:bg-emerald-600 group-hover:text-white transition-colors uppercase tracking-wider">
                  Printer
                </span>
              </div>
              <div className="mt-4 relative z-10">
                <div className="text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight group-hover:text-emerald-600 transition-colors">{defaultTotalPrinterCount}</div>
                <div className="text-xs text-gray-600 dark:text-slate-400 font-bold mt-1">Total Perangkat Printer</div>
              </div>
            </div>

            {/* Card 6: Total Meubelair -> Inventaris Meubelair */}
            <div
              onClick={() => setView && setView("inventaris_mebelair")}
              className="group bg-gradient-to-br from-teal-50/90 via-white to-teal-50/30 dark:from-[#0d2a24] dark:via-[#0f1712] dark:to-[#0f1712] border border-teal-200/80 dark:border-teal-900/60 hover:border-teal-500 dark:hover:border-teal-400 rounded-3xl p-5 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden cursor-pointer active:scale-98"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-teal-500/20 transition-all" />
              <div className="flex items-center justify-between relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-[#0d5c3a] text-white flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform">
                  <Armchair className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold text-teal-700 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-950/80 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800 shadow-2xs group-hover:bg-[#0d5c3a] group-hover:text-white transition-colors uppercase tracking-wider">
                  Meubelair
                </span>
              </div>
              <div className="mt-4 relative z-10">
                <div className="text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight group-hover:text-[#0d5c3a] transition-colors">{defaultTotalMeubelairCount}</div>
                <div className="text-xs text-gray-600 dark:text-slate-400 font-bold mt-1">Total Data Meubelair</div>
              </div>
            </div>

            {/* Card 7: Total Surat -> Riwayat Surat */}
            <div
              onClick={() => setView && setView("riwayat")}
              className="group bg-gradient-to-br from-amber-50/90 via-white to-amber-50/30 dark:from-[#2d2216] dark:via-[#0f1712] dark:to-[#0f1712] border border-amber-200/80 dark:border-amber-900/60 hover:border-amber-500 dark:hover:border-amber-400 rounded-3xl p-5 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden cursor-pointer active:scale-98"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
              <div className="flex items-center justify-between relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800 shadow-2xs group-hover:bg-amber-600 group-hover:text-white transition-colors uppercase tracking-wider">
                  Surat
                </span>
              </div>
              <div className="mt-4 relative z-10">
                <div className="text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight group-hover:text-amber-600 transition-colors">{defaultTotalSuratCount}</div>
                <div className="text-xs text-gray-600 dark:text-slate-400 font-bold mt-1">Total Dokumen Surat</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL FOR SELECTED UNIT (PORTAL RENDERED TO BODY FOR 100% FULLSCREEN BACKDROP COVERAGE) */}
      {selectedUnit && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedUnit(null)}
        >
          <div
            className="bg-white dark:bg-[#0f1712] rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Bar: Rich Green Gradient */}
            <div className="bg-gradient-to-r from-[#0d5c3a] via-[#137447] to-[#083c25] text-white px-6 py-4 flex items-center justify-between shadow-md">
              <h3 className="text-base font-bold tracking-wide">Detail Unit</h3>
              <button
                type="button"
                onClick={() => setSelectedUnit(null)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with Ultra-Thin Elegant Scrollbar */}
            <div className="p-6 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
              {/* Unit Info Card (Soft Green) */}
              <div className="bg-[#f0fdf4] dark:bg-[#13281b] border border-emerald-200 dark:border-[#24422e] rounded-3xl p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-gray-900 dark:text-slate-100 uppercase tracking-wide">
                    {selectedUnit.outlet || "Kanwil VIII Jakarta"}
                  </h4>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> {selectedUnit.status || "Aktif"}
                  </span>
                </div>

                {/* Inner Bordered Key-Value Box */}
                <div className="border border-emerald-200 dark:border-[#24422e] bg-[#e6f7ed] dark:bg-[#0f2115] rounded-2xl p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-slate-400 font-medium">Nama Barang</span>
                    <span className="font-bold text-gray-900 dark:text-slate-100 text-right">{selectedUnit.nama}</span>
                  </div>
                  {selectedUnit.quantity !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-slate-400 font-medium">Jumlah / Quantity</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{selectedUnit.quantity} Unit</span>
                    </div>
                  )}
                  {selectedUnit.nama_pengguna && selectedUnit.nama_pengguna !== "-" && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-slate-400 font-medium">Pengguna</span>
                      <span className="font-bold text-gray-900 dark:text-slate-100 text-right">
                        {selectedUnit.nama_pengguna} {selectedUnit.nik_pegawai && selectedUnit.nik_pegawai !== "-" ? `(${selectedUnit.nik_pegawai})` : ""}
                      </span>
                    </div>
                  )}
                  {selectedUnit.jabatan && selectedUnit.jabatan !== "-" && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-slate-400 font-medium">Jabatan</span>
                      <span className="font-semibold text-gray-800 dark:text-slate-200 text-right">{selectedUnit.jabatan}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-slate-400 font-medium">Serial Number / Kode</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-slate-100">{selectedUnit.serial_number !== "-" ? selectedUnit.serial_number : selectedUnit.kode}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-slate-400 font-medium">Outlet / Lokasi</span>
                    <span className="font-bold text-gray-900 dark:text-slate-100 text-right">{selectedUnit.outlet}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-slate-400 font-medium">Vendor / Penyedia</span>
                    <span className="font-bold text-gray-900 dark:text-slate-100 text-right">{selectedUnit.vendor}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-slate-400 font-medium">
                      {selectedUnit.type === "Inventaris Meubelair" ? "Tanggal Registrasi" : "Tanggal Mulai"}
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-slate-200">{formatDate(selectedUnit.tgl_mulai)}</span>
                  </div>
                  {selectedUnit.type !== "Inventaris Meubelair" && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-slate-400 font-medium">Tanggal Selesai</span>
                      <span className="font-semibold text-gray-800 dark:text-slate-200">{formatDate(selectedUnit.tgl_selesai)}</span>
                    </div>
                  )}
                  {selectedUnit.keterangan && selectedUnit.keterangan !== "-" && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-slate-400 font-medium">Keterangan</span>
                      <span className="font-semibold text-gray-800 dark:text-slate-200 text-right">{selectedUnit.keterangan}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-slate-400 font-medium">Status / Kondisi</span>
                    <span className="font-semibold text-gray-800 dark:text-slate-200">{selectedUnit.status}</span>
                  </div>
                </div>
              </div>

              {/* DOKUMEN TERKAIT SECTION */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-gray-900 dark:text-slate-100 uppercase tracking-wider">
                  DOKUMEN TERKAIT
                </h4>

                {unitRelatedDocs.length === 0 ? (
                  <div className="p-4 bg-gray-50 dark:bg-[#16231a] border border-gray-200 dark:border-[#2b4533] rounded-2xl text-center text-xs text-gray-500 dark:text-slate-400 font-medium">
                    Belum ada riwayat dokumen transaksi/surat terkait unit ini.
                  </div>
                ) : (
                  unitRelatedDocs.map((doc, i) => (
                    <div
                      key={doc.id || i}
                      className={`border rounded-2xl p-4 shadow-2xs flex items-center justify-between ${
                        doc.docCategory === "sst"
                          ? "bg-blue-50/90 dark:bg-[#162536] border-blue-200 dark:border-blue-900/60"
                          : doc.docCategory === "spk"
                          ? "bg-amber-50/90 dark:bg-[#2b2416] border-amber-200 dark:border-amber-900/60"
                          : "bg-purple-50/90 dark:bg-[#281b33] border-purple-200 dark:border-purple-900/60"
                      }`}
                    >
                      <div>
                        <div
                          className={`text-xs font-black ${
                            doc.docCategory === "sst"
                              ? "text-blue-600 dark:text-blue-400"
                              : doc.docCategory === "spk"
                              ? "text-amber-700 dark:text-amber-400"
                              : "text-purple-700 dark:text-purple-400"
                          }`}
                        >
                          {doc.jenis}
                        </div>
                        <div className="text-sm font-black text-gray-900 dark:text-slate-100 mt-0.5 font-mono">
                          {doc.nomor}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">
                          {formatDate(doc.tanggal)} • {doc.vendor}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUnit(null);
                          if (setRiwayatFilter) {
                            setRiwayatFilter({ query: doc.nomor, tab: doc.docCategory });
                          }
                          if (setView) {
                            setView("riwayat");
                          }
                        }}
                        className={`bg-white dark:bg-[#111c29] border px-4 py-1.5 rounded-xl font-bold text-xs hover:opacity-90 transition-colors shadow-2xs cursor-pointer shrink-0 ${
                          doc.docCategory === "sst"
                            ? "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                            : doc.docCategory === "spk"
                            ? "text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                            : "text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                        }`}
                      >
                        Kelola &gt;
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
