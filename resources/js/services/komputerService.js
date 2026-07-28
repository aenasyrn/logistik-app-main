// resources/js/services/komputerService.js
import axios from 'axios';
import { router } from '@inertiajs/react';
import { parseIndoDateToISO } from "../utils/deviceUtils";

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
    let outletIdVal = "";
    let namaOutletVal = "";
    let ipAddressVal = "";
    let productHardwareVal = "";
    let serialNumberVal = "";
    let masaSewaVal = "";
    let penyediaVal = "";
    let statusVal = "";
    let keteranganVal = "";
    let macVal = "";
    let ramVal = "";
    let physicalDiskVal = "";
    let cpuVal = "";
    let osNameVal = "";

    for (const key of Object.keys(row)) {
      const normKey = normalizeKey(key);
      if (normKey === "OUTLET ID" || normKey === "ID OUTLET") {
        outletIdVal = row[key];
      } else if (normKey === "NAMA OUTLET" || normKey === "OUTLET") {
        namaOutletVal = row[key];
      } else if (normKey === "IP ADDRESS" || normKey === "IP") {
        ipAddressVal = row[key];
      } else if (normKey === "PRODUCT HARDWARE" || normKey === "PRODUK" || normKey === "PRODUK / MODEL") {
        productHardwareVal = row[key];
      } else if (normKey === "SERIAL NUMBER" || normKey === "SN" || normKey === "S/N") {
        serialNumberVal = row[key];
      } else if (normKey === "MASA SEWA") {
        masaSewaVal = row[key];
      } else if (normKey === "PENYEDIA" || normKey === "VENDOR") {
        penyediaVal = row[key];
      } else if (normKey === "STATUS") {
        statusVal = row[key];
      } else if (normKey === "KETERANGAN" || normKey === "DESKRIPSI" || normKey === "CATATAN") {
        keteranganVal = row[key];
      } else if (normKey === "MAC" || normKey === "MAC ADDRESS") {
        macVal = row[key];
      } else if (normKey === "RAM") {
        ramVal = row[key];
      } else if (normKey === "PHYSICAL DISK" || normKey === "STORAGE") {
        physicalDiskVal = row[key];
      } else if (normKey === "CPU") {
        cpuVal = row[key];
      } else if (normKey === "OS NAME" || normKey === "OS") {
        osNameVal = row[key];
      }
    }

    if (!serialNumberVal && !namaOutletVal) continue;

    // Pecah kolom "MASA SEWA" → tanggalMulai & tanggalSelesai
    let tglMulai = null;
    let tglSelesai = null;
    if (masaSewaVal && masaSewaVal.includes("-")) {
      const [start, end] = masaSewaVal.split("-").map((p) => p.trim());
      tglMulai = parseIndoDateToISO(start);
      tglSelesai = parseIndoDateToISO(end);
    }

    formattedRows.push({
      outlet_id: outletIdVal?.trim() ? Number(outletIdVal) : null,
      outlet: namaOutletVal?.trim() || "",
      ip_address: ipAddressVal?.trim() || "",
      mac_address: macVal?.trim() || "",
      ram: ramVal?.trim() || "",
      storage: physicalDiskVal?.trim() || "",
      cpu: cpuVal?.trim() || "",
      os: osNameVal?.trim() || "",
      produk: productHardwareVal?.trim() || "",
      sn: serialNumberVal?.trim() || "",
      tanggal_mulai: tglMulai,
      tanggal_selesai: tglSelesai,
      penyedia: penyediaVal?.trim() || "",
      status: statusVal?.trim() || "Inventaris",
      keterangan: keteranganVal?.trim() || "",
      kondisi: "BAIK",
    });
  }

  if (formattedRows.length === 0) {
    throw new Error("Tidak ada data komputer yang valid ditemukan. Periksa kembali nama header kolom CSV Anda.");
  }

  await axios.post('/computers/import', { rows: formattedRows });
  return formattedRows.length;
};

/**
 * Trigger download file CSV template import.
 */
export const downloadTemplate = () => {
  const headers = [
    "OUTLET ID", "NAMA OUTLET", "IP ADDRESS", "PRODUCT HARDWARE",
    "SERIAL NUMBER", "MASA SEWA", "PENYEDIA", "STATUS",
    "KETERANGAN", "MAC", "RAM", "PHYSICAL DISK", "CPU", "OS NAME",
  ];
  const contoh = [
    "12350,UPC BOJONG RAWALUMBU,10.81.58.23,OptiPlex SFF 7010,8B9BVZ3,April 2024 - April 2026,POJ,Sewa Berjalan,-,cc:96:e5:3f:af:e8,7 GB,503GB,13th Gen Intel(R) Core(TM) i5-13600,Ubuntu Pegadaian",
    "12458,CP CIBINONG,10.81.167.60,OptiPlex SFF 7010,GMYMS44,Januari 2025 - Januari 2028,EPS,Sewa Berjalan,-,4c:d7:17:9e:23:22,7 GB,503GB,13th Gen Intel(R) Core(TM) i5-13600,Ubuntu Pegadaian V.22 Build 2024.11.01",
  ];
  const csv  = headers.join(",") + "\n" + contoh.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.setAttribute("download", "Template_Import_Komputer.csv");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};