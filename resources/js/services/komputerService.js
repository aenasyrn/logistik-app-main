// resources/js/services/komputerService.js
import axios from 'axios';
import { router } from '@inertiajs/react';
import { parseIndoDateToISO, parseRobustDate } from "../utils/deviceUtils";
import { downloadExcelTemplate } from '../utils/excelHelper';

/**
 * Tambah satu data komputer.
 */
export const addKomputer = async (appId, formData) => {
  const response = await axios.post('/computers', formData);
  router.reload({ only: ['computers', 'activityLogs', 'outlets'] });
  return response.data;
};

/**
 * Perbarui data komputer berdasarkan id.
 */
export const updateKomputer = async (appId, id, formData) => {
  const response = await axios.put(`/computers/${id}`, formData);
  router.reload({ only: ['computers', 'activityLogs', 'outlets'] });
  return response.data;
};

/**
 * Hapus data komputer berdasarkan id.
 */
export const deleteKomputer = async (appId, id) => {
  const response = await axios.delete(`/computers/${id}`);
  router.reload({ only: ['computers', 'activityLogs'] });
  return response.data;
};

/**
 * Import massal dari array hasil parsing PapaParse.
 */
export const importKomputerCSV = async (appId, rows) => {
  if (!rows || rows.length === 0) throw new Error("File CSV kosong");

  const normalizeKey = (key) => {
    return key
      .replace(/^\uFEFF/, "") // Remove BOM
      .trim()
      .toUpperCase();
  };

  const formattedRows = [];
  for (const row of rows) {
    let outletVal = "";
    let idOutletVal = "";
    let produkVal = "";
    let serialNumberVal = "";
    let kondisiVal = "";
    let ipAddressVal = "";
    let macAddressVal = "";
    let cpuVal = "";
    let ramVal = "";
    let storageVal = "";
    let osVal = "";
    let vendorVal = "";
    let tglMulaiVal = "";
    let tglSelesaiVal = "";
    let masaSewaVal = "";
    let statusVal = "";
    let keteranganVal = "";

    for (const key of Object.keys(row)) {
      const normKey = normalizeKey(key);
      if (normKey === "OUTLET" || normKey === "NAMA OUTLET") {
        outletVal = row[key];
      } else if (normKey === "ID OUTLET" || normKey === "OUTLET ID") {
        idOutletVal = row[key];
      } else if (normKey === "PRODUK / MODEL" || normKey === "PRODUK" || normKey === "MODEL" || normKey === "PRODUCT HARDWARE") {
        produkVal = row[key];
      } else if (normKey === "SERIAL NUMBER" || normKey === "SN" || normKey === "S/N") {
        serialNumberVal = row[key];
      } else if (normKey === "KONDISI") {
        kondisiVal = row[key];
      } else if (normKey === "IP ADDRESS" || normKey === "IP") {
        ipAddressVal = row[key];
      } else if (normKey === "MAC ADDRESS" || normKey === "MAC") {
        macAddressVal = row[key];
      } else if (normKey === "CPU") {
        cpuVal = row[key];
      } else if (normKey === "RAM") {
        ramVal = row[key];
      } else if (normKey === "STORAGE" || normKey === "PHYSICAL DISK") {
        storageVal = row[key];
      } else if (normKey === "OS" || normKey === "OS NAME") {
        osVal = row[key];
      } else if (normKey === "VENDOR" || normKey === "PENYEDIA") {
        vendorVal = row[key];
      } else if (normKey === "TGL MULAI SEWA" || normKey === "TANGGAL MULAI") {
        tglMulaiVal = row[key];
      } else if (normKey === "TGL SELESAI SEWA" || normKey === "TANGGAL SELESAI") {
        tglSelesaiVal = row[key];
      } else if (normKey === "MASA SEWA") {
        masaSewaVal = row[key];
      } else if (normKey === "STATUS") {
        statusVal = row[key];
      } else if (normKey === "KETERANGAN" || normKey === "DESKRIPSI" || normKey === "CATATAN") {
        keteranganVal = row[key];
      }
    }

    if (!serialNumberVal && !outletVal) continue;

    // Resolve date mulai and selesai
    let resolvedTglMulai = null;
    let resolvedTglSelesai = null;

    if (tglMulaiVal?.trim()) {
      const parsed = parseRobustDate(tglMulaiVal);
      if (parsed) resolvedTglMulai = parsed;
    }
    if (tglSelesaiVal?.trim()) {
      const parsed = parseRobustDate(tglSelesaiVal);
      if (parsed) resolvedTglSelesai = parsed;
    }

    // Fallback to legacy "MASA SEWA" if individual dates aren't set
    if (!resolvedTglMulai && !resolvedTglSelesai && masaSewaVal && masaSewaVal.includes("-")) {
      const [start, end] = masaSewaVal.split("-").map((p) => p.trim());
      resolvedTglMulai = parseIndoDateToISO(start);
      resolvedTglSelesai = parseIndoDateToISO(end);
    }

    formattedRows.push({
      outlet_id: (idOutletVal?.trim() && !isNaN(Number(idOutletVal))) ? Number(idOutletVal) : null,
      outlet: outletVal?.trim() || "",
      ip_address: ipAddressVal?.trim() || "",
      mac_address: macAddressVal?.trim() || "",
      ram: ramVal?.trim() || "",
      storage: storageVal?.trim() || "",
      cpu: cpuVal?.trim() || "",
      os: osVal?.trim() || "",
      produk: produkVal?.trim() || "",
      sn: serialNumberVal?.trim() || "",
      tanggal_mulai: resolvedTglMulai,
      tanggal_selesai: resolvedTglSelesai,
      penyedia: vendorVal?.trim() || "",
      status: statusVal?.trim() || "Inventaris",
      keterangan: keteranganVal?.trim() || "",
      kondisi: kondisiVal?.trim() || "BAIK",
    });
  }

  if (formattedRows.length === 0) {
    throw new Error("Tidak ada data komputer yang valid ditemukan. Periksa kembali nama header kolom CSV Anda.");
  }

  await axios.post('/computers/import', { rows: formattedRows });
  return formattedRows.length;
};

export const importKomputerExcel = importKomputerCSV;

/**
 * Trigger download file Excel template import.
 */
export const downloadTemplate = () => {
  const headers = [
    "Outlet",
    "ID Outlet",
    "Produk / Model",
    "Serial Number",
    "Kondisi",
    "IP Address",
    "MAC Address",
    "CPU",
    "RAM",
    "Storage",
    "OS",
    "Vendor",
    "Tgl Mulai Sewa",
    "Tgl Selesai Sewa",
    "Status",
    "Keterangan",
  ];
  const contoh = [
    ["UPC BOJONG RAWALUMBU", "12350", "OptiPlex SFF 7010", "8B9BVZ3", "BAIK", "10.81.58.23", "cc:96:e5:3f:af:e8", "13th Gen Intel(R) Core(TM) i5-13600", "7 GB", "503GB", "Ubuntu Pegadaian", "POJ", "2024-04-01", "2026-04-01", "Sewa Berjalan", "-"],
    ["CP CIBINONG", "12458", "OptiPlex SFF 7010", "GMYMS44", "BAIK", "10.81.167.60", "4c:d7:17:9e:23:22", "13th Gen Intel(R) Core(TM) i5-13600", "7 GB", "503GB", "Ubuntu Pegadaian V.22", "EPS", "2025-01-15", "2028-01-15", "Sewa Berjalan", "-"],
  ];
  downloadExcelTemplate("Template_Import_Komputer.xlsx", headers, contoh, "Data Komputer");
};