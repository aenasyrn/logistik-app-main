// resources/js/services/meubelairService.js
import axios from 'axios';
import { router } from '@inertiajs/react';
import { downloadExcelTemplate } from '../utils/excelHelper';

/**
 * Tambah satu data meubelair (meja/kursi/lemari).
 */
export const addMeubelair = async (formData) => {
  const response = await axios.post('/meubelairs', formData);
  router.reload({ only: ['meubelairs', 'activityLogs'] });
  return response.data;
};

/**
 * Perbarui data meubelair berdasarkan id.
 */
export const updateMeubelair = async (id, formData) => {
  const response = await axios.put(`/meubelairs/${id}`, formData);
  router.reload({ only: ['meubelairs', 'activityLogs'] });
  return response.data;
};

/**
 * Hapus data meubelair berdasarkan id.
 */
export const deleteMeubelair = async (id) => {
  const response = await axios.delete(`/meubelairs/${id}`);
  router.reload({ only: ['meubelairs', 'activityLogs'] });
  return response.data;
};

/**
 * Dapatkan daftar jenis barang meubelair
 */
export const fetchJenisMeubelair = async () => {
  const response = await axios.get('/jenis-meubelairs');
  return response.data;
};

/**
 * Tambah jenis barang meubelair baru (khusus admin)
 */
export const addJenisMeubelair = async (nama) => {
  const response = await axios.post('/jenis-meubelairs', { nama });
  router.reload({ only: ['jenisMeubelairs'] });
  return response.data;
};

/**
 * Hapus jenis barang meubelair (khusus admin)
 */
export const deleteJenisMeubelair = async (id) => {
  const response = await axios.delete(`/jenis-meubelairs/${id}`);
  router.reload({ only: ['jenisMeubelairs'] });
  return response.data;
};

/**
 * Import massal dari array hasil parsing PapaParse.
 */
export const importMeubelairCSV = async (defaultKategori, rows) => {
  if (!rows || rows.length === 0) throw new Error("File CSV kosong");

  const normalizeKey = (key) => {
    return key
      .replace(/^\uFEFF/, "") // Remove BOM
      .trim()
      .toUpperCase();
  };

  const formattedRows = [];
  for (const row of rows) {
    let kategoriVal = defaultKategori || "Meja";
    let jenisVal = "";
    let quantityVal = 1;
    let kodeOutletVal = "";
    let lokasiVal = "";
    let kondisiVal = "BAIK";
    let tanggalRegisterVal = "";
    let keteranganVal = "";

    for (const key of Object.keys(row)) {
      const normKey = normalizeKey(key);
      if (
        normKey === "JENIS BARANG" ||
        normKey === "KATEGORI" ||
        normKey === "JENIS_BARANG"
      ) {
        if (row[key] && String(row[key]).trim()) {
          kategoriVal = String(row[key]).trim();
        }
      } else if (
        normKey === "TYPE" ||
        normKey === "TYPE BARANG" ||
        normKey === "TYPE_BARANG" ||
        normKey === "JENIS" ||
        normKey === "NAMA" ||
        normKey === "NAMA BARANG" ||
        normKey.startsWith("TYPE ") ||
        normKey.startsWith("JENIS ")
      ) {
        jenisVal = row[key];
      } else if (normKey === "QUANTITY" || normKey === "QTY" || normKey === "JUMLAH") {
        const parsedQty = parseInt(row[key], 10);
        if (!isNaN(parsedQty) && parsedQty > 0) {
          quantityVal = parsedQty;
        }
      } else if (
        normKey === "KODE OUTLET" ||
        normKey === "ID OUTLET" ||
        normKey === "KODE" ||
        normKey === "OUTLET ID" ||
        normKey === "KODE_OUTLET" ||
        normKey === "ID_OUTLET" ||
        normKey === "KODE CABANG"
      ) {
        kodeOutletVal = row[key];
      } else if (
        normKey === "LOKASI" ||
        normKey === "OUTLET" ||
        normKey === "NAMA OUTLET" ||
        normKey === "UNIT KERJA" ||
        normKey === "LOKASI / OUTLET" ||
        normKey === "LOKASI/OUTLET"
      ) {
        lokasiVal = row[key];
      } else if (normKey === "KONDISI") {
        kondisiVal = row[key];
      } else if (
        normKey === "TANGGAL REGISTER" ||
        normKey === "TGL REGISTER" ||
        normKey === "TANGGAL_REGISTER" ||
        normKey === "TGL_REGISTER" ||
        normKey === "TANGGAL REGISTRASI" ||
        normKey === "REGISTER DATE" ||
        normKey === "TANGGAL"
      ) {
        tanggalRegisterVal = row[key];
      } else if (normKey === "KETERANGAN" || normKey === "DESKRIPSI" || normKey === "CATATAN") {
        keteranganVal = row[key];
      }
    }

    if (!jenisVal || !jenisVal.trim()) continue;

    // Normalisasi kondisi: hanya "Baik" atau "Kurang Baik"
    const rawKondisi = (kondisiVal || "").toLowerCase();
    const cleanKondisi = (rawKondisi.includes("kurang") || rawKondisi.includes("rusak")) 
      ? "Kurang Baik" 
      : "Baik";

    formattedRows.push({
      jenis: jenisVal.trim(),
      quantity: quantityVal,
      kode_outlet: kodeOutletVal ? String(kodeOutletVal).trim() : "",
      lokasi: lokasiVal ? lokasiVal.trim() : "",
      kondisi: cleanKondisi,
      tanggal_register: tanggalRegisterVal ? String(tanggalRegisterVal).trim() : null,
      keterangan: keteranganVal ? keteranganVal.trim() : "",
    });
  }

  if (formattedRows.length === 0) {
    throw new Error(`Tidak ada data ${kategori} yang valid ditemukan. Periksa kembali kolom CSV Anda.`);
  }

  const response = await axios.post('/meubelairs/import', {
    kategori,
    rows: formattedRows,
  });

  router.reload({ only: ['meubelairs', 'activityLogs'] });
  return response.data;
};

export const importMeubelairExcel = importMeubelairCSV;

/**
 * Trigger download file Excel template import.
 */
export const downloadTemplate = (kategori = 'Meubelair') => {
  const headers = [
    "Lokasi / Outlet",
    "Jenis Barang",
    "Type Barang",
    "Quantity",
    "Kondisi",
    "Tanggal Registrasi",
    "Keterangan",
    "Kode Outlet",
  ];

  const contoh = [
    ["Kantor Cabang Bekasi", "Meja", "Meja Kerja 1 Biro Kayu Jati", 2, "Baik", "2024-05-15", "-", "0735"],
    ["UPC Rawalumbu", "Kursi", "Kursi Putar Staff Hidrolik", 5, "Baik", "2024-06-20", "-", "0736"],
    ["UPC Pondok Kelapa", "Lemari", "Lemari Arsip Besi 2 Pintu", 1, "Kurang Baik", "2024-07-10", "-", "0734"],
    ["UPC Cibinong", "Sofa", "Sofa Tamu Minimalis 3 Seater", 1, "Baik", "2024-08-01", "-", "0737"],
    ["Kantor Cabang Bekasi", "AC", "AC Split 1.5 PK Daikin Inverter", 2, "Baik", "2024-09-01", "-", "0735"],
  ];

  downloadExcelTemplate("Template_Import_Data_Meubelair.xlsx", headers, contoh, "Data Meubelair");
};

