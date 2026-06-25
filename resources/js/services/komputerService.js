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

  const formattedRows = [];
  for (const row of rows) {
    // Lewati baris kosong
    if (!row["NAMA OUTLET"] && !row["SERIAL NUMBER"]) continue;

    // Pecah kolom "MASA SEWA" → tanggalMulai & tanggalSelesai
    let tglMulai = null;
    let tglSelesai = null;
    const rawMasaSewa = row["MASA SEWA"]?.trim() || "";
    if (rawMasaSewa.includes("-")) {
      const [start, end] = rawMasaSewa.split("-").map((p) => p.trim());
      tglMulai = parseIndoDateToISO(start);
      tglSelesai = parseIndoDateToISO(end);
    }

    formattedRows.push({
      outlet_id: row["OUTLET ID"]?.trim() ? Number(row["OUTLET ID"]) : null,
      outlet: row["NAMA OUTLET"]?.trim() || "",
      ip_address: row["IP ADDRESS"]?.trim() || "",
      mac_address: row["MAC"]?.trim() || "",
      ram: row["RAM"]?.trim() || "",
      storage: row["PHYSICAL DISK"]?.trim() || "",
      cpu: row["CPU"]?.trim() || "",
      os: row["OS NAME"]?.trim() || "",
      produk: row["PRODUCT HARDWARE"]?.trim() || "",
      sn: row["SERIAL NUMBER"]?.trim() || "",
      tanggal_mulai: tglMulai,
      tanggal_selesai: tglSelesai,
      penyedia: row["PENYEDIA"]?.trim() || "",
      status: row["STATUS"]?.trim() || "Inventaris",
      deskripsi: row["DESKRIPSI"]?.trim() || "",
      kondisi: "BAIK",
    });
  }

  await axios.post('/computers/import', { rows: formattedRows });
  router.reload({ only: ['computers', 'activityLogs', 'outlets'] });
  return formattedRows.length;
};

/**
 * Trigger download file CSV template import.
 */
export const downloadTemplate = () => {
  const headers = [
    "OUTLET ID", "NAMA OUTLET", "IP ADDRESS", "PRODUCT HARDWARE",
    "SERIAL NUMBER", "MASA SEWA", "PENYEDIA", "STATUS",
    "DESKRIPSI", "MAC", "RAM", "PHYSICAL DISK", "CPU", "OS NAME",
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