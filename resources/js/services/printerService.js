// resources/js/services/printerService.js
import axios from 'axios';
import { router } from '@inertiajs/react';
import { parseIndoDateToISO, parseRobustDate } from "../utils/deviceUtils";
import { downloadExcelTemplate } from '../utils/excelHelper';

/**
 * Tambah satu data printer.
 */
export const addPrinter = async (formData) => {
  const response = await axios.post('/printers', formData);
  router.reload({ only: ['printers', 'activityLogs', 'outlets'] });
  return response.data;
};

/**
 * Perbarui data printer berdasarkan id.
 */
export const updatePrinter = async (id, formData) => {
  const response = await axios.put(`/printers/${id}`, formData);
  router.reload({ only: ['printers', 'activityLogs', 'outlets'] });
  return response.data;
};

/**
 * Hapus data printer berdasarkan id.
 */
export const deletePrinter = async (id) => {
  const response = await axios.delete(`/printers/${id}`);
  router.reload({ only: ['printers', 'activityLogs'] });
  return response.data;
};

/**
 * Import massal dari array hasil parsing PapaParse.
 */
export const importPrinterCSV = async (rows) => {
  if (!rows || rows.length === 0) throw new Error("File CSV kosong");

  const normalizeKey = (key) => {
    return key
      .replace(/^\uFEFF/, "") // Remove BOM
      .trim()
      .toUpperCase();
  };

  const formattedRows = [];
  for (const row of rows) {
    let outletIdVal = "";
    let outletVal = "";
    let produkVal = "";
    let snVal = "";
    let kondisiVal = "";
    let vendorVal = "";
    let tglMulaiVal = "";
    let tglSelesaiVal = "";
    let masaSewaVal = "";
    let statusVal = "";
    let keteranganVal = "";
    let tglCekVal = "";

    for (const key of Object.keys(row)) {
      const normKey = normalizeKey(key);
      if (normKey === "ID OUTLET" || normKey === "OUTLET ID") {
        outletIdVal = row[key];
      } else if (normKey === "OUTLET" || normKey === "NAMA OUTLET") {
        outletVal = row[key];
      } else if (normKey === "PRODUK / MODEL" || normKey === "PRODUK" || normKey === "PRODUCT HARDWARE" || normKey === "MODEL") {
        produkVal = row[key];
      } else if (normKey === "SERIAL NUMBER" || normKey === "SN" || normKey === "S/N") {
        snVal = row[key];
      } else if (normKey === "KONDISI") {
        kondisiVal = row[key];
      } else if (normKey === "VENDOR" || normKey === "PENYEDIA") {
        vendorVal = row[key];
      } else if (normKey === "TGL MULAI SEWA" || normKey === "TANGGAL MULAI" || normKey === "TANGGAL MULAI SEWA") {
        tglMulaiVal = row[key];
      } else if (normKey === "TGL SELESAI SEWA" || normKey === "TANGGAL SELESAI" || normKey === "TANGGAL SELESAI SEWA") {
        tglSelesaiVal = row[key];
      } else if (normKey === "MASA SEWA") {
        masaSewaVal = row[key];
      } else if (normKey === "STATUS") {
        statusVal = row[key];
      } else if (normKey === "KETERANGAN" || normKey === "DESKRIPSI" || normKey === "CATATAN") {
        keteranganVal = row[key];
      } else if (normKey === "TGL CEK" || normKey === "TANGGAL CEK") {
        tglCekVal = row[key];
      }
    }

    if (!snVal && !outletVal) continue;

    // Resolve date mulai and selesai
    let resolvedTglMulai = null;
    let resolvedTglSelesai = null;

    if (tglMulaiVal?.trim()) {
      resolvedTglMulai = parseRobustDate(tglMulaiVal) || parseIndoDateToISO(tglMulaiVal);
    }
    if (tglSelesaiVal?.trim()) {
      resolvedTglSelesai = parseRobustDate(tglSelesaiVal) || parseIndoDateToISO(tglSelesaiVal);
    }

    // Fallback to legacy "MASA SEWA" if individual dates aren't set
    if (!resolvedTglMulai && !resolvedTglSelesai && masaSewaVal && masaSewaVal.includes("-")) {
      const [start, end] = masaSewaVal.split("-").map((p) => p.trim());
      resolvedTglMulai = parseIndoDateToISO(start);
      resolvedTglSelesai = parseIndoDateToISO(end);
    }

    // Gabungkan TGL CEK ke keterangan jika ada isinya
    let keteranganFinal = keteranganVal?.trim() || "";
    if (tglCekVal && tglCekVal.trim() !== "-") {
      keteranganFinal += keteranganFinal
        ? ` | Tgl Cek: ${tglCekVal.trim()}`
        : `Tgl Cek: ${tglCekVal.trim()}`;
    }

    formattedRows.push({
      outlet_id: (outletIdVal?.trim() && !isNaN(Number(outletIdVal))) ? Number(outletIdVal) : null,
      outlet: outletVal?.trim() || "",
      produk: produkVal?.trim() || "",
      sn: snVal?.trim() || "",
      tanggal_mulai: resolvedTglMulai,
      tanggal_selesai: resolvedTglSelesai,
      vendor: vendorVal?.trim() || "",
      status: statusVal?.trim() || "Inventaris",
      kondisi: kondisiVal?.trim() || "BAIK",
      keterangan: keteranganFinal,
    });
  }

  await axios.post('/printers/import', { rows: formattedRows });
  router.reload({ only: ['printers', 'activityLogs', 'outlets'] });
  return formattedRows.length;
};

export const importPrinterExcel = importPrinterCSV;

/**
 * Trigger download file Excel template import.
 */
export const downloadTemplate = () => {
  const headers = [
    "ID Outlet",
    "Outlet",
    "Produk / Model",
    "Serial Number",
    "Kondisi",
    "Vendor",
    "Tgl Mulai Sewa",
    "Tgl Selesai Sewa",
    "Status",
    "Keterangan",
  ];
  const contoh = [
    ["12458", "CP CIBINONG", "EPSON L4260 ECO TANK", "X8SS028432", "BAIK", "POJ", "2024-04-01", "2026-04-01", "Sewa Berjalan", "-"],
    ["60830", "UPS GALUH MAS", "LQ-310 DOT MATRIX", "R9JYJ33221", "BAIK", "POJ", "2024-04-01", "2026-04-01", "Sewa Berjalan", "-"],
  ];
  downloadExcelTemplate("Template_Import_Printer.xlsx", headers, contoh, "Data Printer");
};