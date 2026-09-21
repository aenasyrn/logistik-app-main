import axios from 'axios';
import { router } from '@inertiajs/react';
import { parseRobustDate } from "../utils/deviceUtils";
import { downloadExcelTemplate } from '../utils/excelHelper';

/**
 * Import massal dari array hasil parsing PapaParse.
 */
export const importInventoryCSV = async (appId, rows) => {
  if (!rows || rows.length === 0) throw new Error("File CSV kosong");

  const normalizeKey = (key) => {
    return key
      .replace(/^\uFEFF/, "") // Remove BOM
      .trim()
      .toUpperCase();
  };

  const formattedRows = [];
  for (const row of rows) {
    let namaVal = "";
    let kuantitasVal = "";
    let satuanVal = "Pcs";
    let vendorVal = "";
    let noSpkVal = "";
    let noPksVal = "";
    let tglMulaiVal = "";
    let tglSelesaiVal = "";
    let masaSewaVal = "";
    let statusVal = "Inventaris";
    let deskripsiVal = "";
    let biayaSewaVal = "0";

    for (const key of Object.keys(row)) {
      const normKey = normalizeKey(key);
      if (normKey === "NAMA BARANG" || normKey === "NAMA") {
        namaVal = row[key];
      } else if (normKey === "STOK" || normKey === "KUANTITAS") {
        kuantitasVal = row[key];
      } else if (normKey === "SATUAN") {
        satuanVal = row[key];
      } else if (normKey === "VENDOR" || normKey === "VENDOR NAMA") {
        vendorVal = row[key];
      } else if (normKey === "NO SPK" || normKey === "NOMOR SPK") {
        noSpkVal = row[key];
      } else if (normKey === "NO PKS" || normKey === "NOMOR PKS") {
        noPksVal = row[key];
      } else if (normKey === "TGL MULAI" || normKey === "TANGGAL MULAI") {
        tglMulaiVal = row[key];
      } else if (normKey === "TGL SELESAI" || normKey === "TANGGAL SELESAI") {
        tglSelesaiVal = row[key];
      } else if (normKey === "MASA SEWA BULAN" || normKey === "MASA SEWA") {
        masaSewaVal = row[key];
      } else if (normKey === "STATUS") {
        statusVal = row[key];
      } else if (normKey === "DESKRIPSI" || normKey === "KETERANGAN") {
        deskripsiVal = row[key];
      } else if (normKey === "BIAYA SEWA" || normKey === "BIAYA") {
        biayaSewaVal = row[key];
      }
    }

    if (!namaVal) continue;

    formattedRows.push({
      nama: namaVal?.trim() || "",
      kuantitas: kuantitasVal?.trim() ? Number(kuantitasVal) : 0,
      satuan: satuanVal?.trim() || "Pcs",
      vendor_nama: vendorVal?.trim() || null,
      no_spk: noSpkVal?.trim() || null,
      no_pks: noPksVal?.trim() || null,
      tanggal_mulai: tglMulaiVal?.trim() ? parseRobustDate(tglMulaiVal) : null,
      tanggal_selesai: tglSelesaiVal?.trim() ? parseRobustDate(tglSelesaiVal) : null,
      masa_sewa_bulan: masaSewaVal?.trim() ? Number(masaSewaVal) : 0,
      status: statusVal?.trim() || "Inventaris",
      deskripsi: deskripsiVal?.trim() || "",
      biaya_sewa: biayaSewaVal?.trim() ? Number(biayaSewaVal) : 0,
    });
  }

  if (formattedRows.length === 0) {
    throw new Error("Tidak ada data barang yang valid ditemukan. Periksa kembali nama header kolom CSV Anda.");
  }

  await axios.post('/inventory/import', { rows: formattedRows });
  router.reload({ only: ['inventory', 'activityLogs'] });
  return formattedRows.length;
};

export const importInventoryExcel = importInventoryCSV;

/**
 * Trigger download file Excel template import.
 */
export const downloadTemplate = () => {
  const headers = [
    "NAMA BARANG", "STOK", "SATUAN", "VENDOR", "NO SPK", "NO PKS",
    "TGL MULAI", "TGL SELESAI", "MASA SEWA BULAN", "STATUS", "BIAYA SEWA"
  ];
  const contoh = [
    ["Kursi Kerja", 10, "Pcs", "Penyedia Makmur", "SPK/123/2026", "PKS/456/2026", "2026-07-16", "2028-07-16", 24, "Sewa Berjalan", 50000],
    ["Meja Kantor", 5, "Unit", "-", "-", "-", "-", "-", 0, "Inventaris", 0]
  ];
  downloadExcelTemplate("Template_Import_Barang.xlsx", headers, contoh, "Master Barang");
};
