import axios from 'axios';
import { router } from '@inertiajs/react';

/**
 * Import massal dari array hasil parsing PapaParse.
 */
export const importOutletCSV = async (appId, rows) => {
  if (!rows || rows.length === 0) throw new Error("File CSV kosong");

  const normalizeKey = (key) => {
    return key
      .replace(/^\uFEFF/, "") // Remove BOM
      .trim()
      .toUpperCase();
  };

  const formattedRows = [];
  for (const row of rows) {
    let kodeVal = "";
    let namaVal = "";
    let alamatVal = "";

    for (const key of Object.keys(row)) {
      const normKey = normalizeKey(key);
      if (normKey === "KODE OUTLET" || normKey === "KODE") {
        kodeVal = row[key];
      } else if (normKey === "NAMA OUTLET" || normKey === "NAMA" || normKey === "NAMA INSTANSI") {
        namaVal = row[key];
      } else if (normKey === "ALAMAT") {
        alamatVal = row[key];
      }
    }

    if (!namaVal) continue;

    formattedRows.push({
      kode: kodeVal?.trim() || "",
      nama: namaVal?.trim() || "",
      alamat: alamatVal?.trim() || null,
    });
  }

  if (formattedRows.length === 0) {
    throw new Error("Tidak ada data instansi yang valid ditemukan. Periksa kembali nama header kolom CSV Anda.");
  }

  await axios.post('/outlets/import', { rows: formattedRows });
  return formattedRows.length;
};

/**
 * Trigger download file CSV template import.
 */
export const downloadTemplate = () => {
  const headers = ["KODE OUTLET", "NAMA OUTLET"];
  const contoh = [
    "12350,UPC BOJONG RAWALUMBU",
    "12458,CP CIBINONG"
  ];
  const csv  = headers.join(",") + "\n" + contoh.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.setAttribute("download", "Template_Import_Outlet.csv");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
