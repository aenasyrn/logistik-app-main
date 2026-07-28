// src/utils/deviceUtils.js
// Utilitas bersama untuk modul Komputer dan Printer.
// Menggabungkan komputerUtils.js dan printerUtils.js yang sebelumnya duplikat.

/**
 * Format tanggal ISO ke format pendek bahasa Indonesia, misal: "Jan 2025".
 * @param {string} dateString
 * @returns {string}
 */
export const formatBulanTahun = (dateString) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("id-ID", {
      month: "short",
      year:  "numeric",
    });
  } catch {
    return dateString;
  }
};

/**
 * Hitung selisih bulan dari hari ini ke tanggal selesai.
 * Nilai positif = masih ada sisa, negatif = sudah lewat.
 * @param {string} tanggalSelesai — ISO date string
 * @returns {number|null}
 */
export const hitungSisaBulan = (tanggalSelesai) => {
  if (!tanggalSelesai) return null;
  const tglSelesai = new Date(tanggalSelesai);
  if (isNaN(tglSelesai)) return null;
  const hariIni = new Date();
  return (
    (tglSelesai.getFullYear() - hariIni.getFullYear()) * 12 +
    (tglSelesai.getMonth()   - hariIni.getMonth())
  );
};

/**
 * Hitung selisih hari dari hari ini ke tanggal selesai.
 * Nilai positif = masih ada sisa, negatif = sudah lewat.
 * @param {string} tanggalSelesai — ISO date string
 * @returns {number|null}
 */
export const hitungSisaHari = (tanggalSelesai) => {
  if (!tanggalSelesai) return null;
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);
  const tglSelesai = new Date(tanggalSelesai);
  tglSelesai.setHours(0, 0, 0, 0);
  if (isNaN(tglSelesai)) return null;
  const diffTime = tglSelesai.getTime() - hariIni.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Hitung status otomatis berdasarkan rentang tanggal sewa.
 * @param {string} startDate — ISO date string
 * @param {string} endDate   — ISO date string
 * @returns {"Inventaris"|"Sewa Berjalan"|"Sewa Habis"}
 */
export const calculateAutoStatus = (startDate, endDate) => {
  if (!startDate || !endDate) return "Inventaris";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(endDate) >= today ? "Sewa Berjalan" : "Sewa Habis";
};

/**
 * Parse string bulan-tahun bahasa Indonesia (misal: "April 2024") ke "YYYY-MM-01".
 * @param {string} dateStr
 * @returns {string}
 */
export const parseIndoDateToISO = (dateStr) => {
  if (!dateStr) return "";
  const monthMap = {
    januari: "01", jan: "01",
    februari: "02", feb: "02",
    maret: "03",   mar: "03",
    april: "04",   apr: "04",
    mei: "05",     may: "05",
    juni: "06",    jun: "06",
    juli: "07",    jul: "07",
    agustus: "08", agu: "08", aug: "08",
    september: "09", sep: "09",
    oktober: "10", okt: "10", oct: "10",
    november: "11", nov: "11",
    desember: "12", des: "12", dec: "12",
  };
  const parts = dateStr.trim().toLowerCase().split(" ");
  if (parts.length === 2) {
    const m = monthMap[parts[0]] || "01";
    const y = parts[1];
    if (y.length === 4) return `${y}-${m}-01`;
  }
  return "";
};

/**
 * Robust date parsing supporting YYYY-MM-DD (including swapped MM-DD), DD/MM/YYYY, and Month-Year strings.
 * @param {string} dateStr
 * @returns {string|null}
 */
export const parseRobustDate = (dateStr) => {
  if (!dateStr) return null;
  const cleanStr = dateStr.trim();
  
  // 1. If matches YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
    const [y, m, d] = cleanStr.split("-").map(Number);
    if (m > 12) {
      // Swapped month and day! (e.g. 2020-15-04 -> 2020-04-15)
      return `${y}-${String(d).padStart(2, "0")}-${String(m).padStart(2, "0")}`;
    }
    return cleanStr;
  }
  
  // 2. If matches DD/MM/YYYY, MM/DD/YYYY, DD-MM-YYYY, MM-DD-YYYY
  const match = cleanStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (match) {
    const part1 = Number(match[1]);
    const part2 = Number(match[2]);
    const y = match[3];
    
    let d = part1;
    let m = part2;
    if (part1 > 12) {
      d = part1;
      m = part2;
    } else if (part2 > 12) {
      d = part2;
      m = part1;
    } else {
      // Default to DD-MM-YYYY (Indonesian standard)
      d = part1;
      m = part2;
    }
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  // 3. Fallback to Indo Month Name
  const parsedIndo = parseIndoDateToISO(cleanStr);
  if (parsedIndo) return parsedIndo;

  return null;
};

/**
 * Kembalikan class Tailwind untuk badge status perangkat.
 * @param {"Inventaris"|"Sewa Berjalan"|"Sewa Habis"|string} status
 * @returns {string}
 */
export const getStatusBadge = (status) => {
  switch (status) {
    case "Inventaris":    return "bg-blue-100 text-blue-700 border-blue-200";
    case "Sewa Berjalan": return "bg-green-100 text-green-700 border-green-200";
    case "Sewa Habis":    return "bg-red-100 text-red-700 border-red-200";
    default:              return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

/** Nilai awal formData kosong untuk Komputer. */
export const emptyFormKomputer = {
  idOutlet: "", outlet: "", ipAddress: "", produk: "", sn: "",
  penyedia: "", tanggalMulai: "", tanggalSelesai: "",
  status: "Inventaris", kondisi: "BAIK",
  keterangan: "", macAddress: "", ram: "", storage: "", cpu: "", os: "",
};

/** Nilai awal formData kosong untuk Printer. */
export const emptyFormPrinter = {
  idOutlet: "", outlet: "", produk: "", sn: "",
  penyedia: "", tanggalMulai: "", tanggalSelesai: "",
  status: "Inventaris", kondisi: "BAIK", deskripsi: "",
};
