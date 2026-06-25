// resources/js/services/printerService.js
import axios from 'axios';
import { router } from '@inertiajs/react';
import { parseIndoDateToISO } from "../utils/deviceUtils";

/**
 * Tambah satu data printer.
 */
export const addPrinter = async (appId, formData) => {
  const response = await axios.post('/printers', formData);
  router.reload({ only: ['printers', 'activityLogs', 'outlets'] });
  return response.data;
};

/**
 * Perbarui data printer berdasarkan id.
 */
export const updatePrinter = async (appId, id, formData) => {
  const response = await axios.put(`/printers/${id}`, formData);
  router.reload({ only: ['printers', 'activityLogs', 'outlets'] });
  return response.data;
};

/**
 * Hapus data printer berdasarkan id.
 */
export const deletePrinter = async (appId, id) => {
  const response = await axios.delete(`/printers/${id}`);
  router.reload({ only: ['printers', 'activityLogs'] });
  return response.data;
};

/**
 * Import massal dari array hasil parsing PapaParse.
 */
export const importPrinterCSV = async (appId, rows) => {
  if (!rows || rows.length === 0) throw new Error("File CSV kosong");

  const formattedRows = [];
  for (const row of rows) {
    if (!row["Outlet"] && !row["Serial Number"]) continue;

    // Pecah kolom "MASA SEWA" → tanggalMulai & tanggalSelesai
    let tglMulai = null;
    let tglSelesai = null;
    const rawMasaSewa = row["MASA SEWA"]?.trim() || "";
    if (rawMasaSewa.includes("-")) {
      const [start, end] = rawMasaSewa.split("-").map((p) => p.trim());
      tglMulai = parseIndoDateToISO(start);
      tglSelesai = parseIndoDateToISO(end);
    }

    // Gabungkan TGL CEK ke deskripsi jika ada isinya
    let deskripsiFinal = row["DESKRIPSI"]?.trim() || "";
    const tglCek = row["TGL CEK"]?.trim();
    if (tglCek && tglCek !== "-") {
      deskripsiFinal += deskripsiFinal
        ? ` | Tgl Cek: ${tglCek}`
        : `Tgl Cek: ${tglCek}`;
    }

    formattedRows.push({
      outlet_id: row["Outlet Id"]?.trim() ? Number(row["Outlet Id"]) : null,
      outlet: row["Outlet"]?.trim() || "",
      produk: row["Product Hardware"]?.trim() || "",
      sn: row["Serial Number"]?.trim() || "",
      tanggal_mulai: tglMulai,
      tanggal_selesai: tglSelesai,
      penyedia: row["PENYEDIA"]?.trim() || "",
      status: row["STATUS"]?.trim() || "Inventaris",
      kondisi: row["KONDISI"]?.trim() || "BAIK",
      deskripsi: deskripsiFinal,
    });
  }

  await axios.post('/printers/import', { rows: formattedRows });
  router.reload({ only: ['printers', 'activityLogs', 'outlets'] });
  return formattedRows.length;
};

/**
 * Trigger download file CSV template import.
 */
export const downloadTemplate = () => {
  const headers = [
    "Outlet Id", "Outlet", "Product Hardware", "Serial Number",
    "PENYEDIA", "MASA SEWA", "STATUS", "KONDISI", "DESKRIPSI", "TGL CEK",
  ];
  const contoh = [
    "12458,CP CIBINONG,EPSON L4260 ECO TANK,X8SS028432,POJ,April 2024 - April 2026,Sewa Berjalan,KURANG BAIK,Mikro,-",
    "60830,UPS GALUH MAS,LQ-310 DOT MATRIX,R9JYJ33221,POJ,April 2024 - April 2026,Sewa Berjalan,BAIK,-,-",
  ];
  const csv  = headers.join(",") + "\n" + contoh.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.setAttribute("download", "Template_Import_Printer.csv");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};