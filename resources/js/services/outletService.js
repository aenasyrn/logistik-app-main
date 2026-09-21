import axios from 'axios';
import { router } from '@inertiajs/react';
import { downloadExcelTemplate } from '../utils/excelHelper';

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
    let typeOutletVal = "";
    let typeBangunanVal = "";
    let statusGedungVal = "";
    let kelurahanVal = "";
    let kecamatanVal = "";
    let kabKotaVal = "";
    let provinsiVal = "";

    for (const key of Object.keys(row)) {
      const normKey = normalizeKey(key);
      if (normKey === "KODE OUTLET" || normKey === "KODE") {
        kodeVal = row[key];
      } else if (normKey === "NAMA OUTLET" || normKey === "NAMA" || normKey === "NAMA INSTANSI") {
        namaVal = row[key];
      } else if (normKey === "ALAMAT") {
        alamatVal = row[key];
      } else if (normKey === "TYPE OUTLET" || normKey === "TIPE OUTLET") {
        typeOutletVal = row[key];
      } else if (normKey === "TYPE BANGUNAN" || normKey === "TIPE BANGUNAN") {
        typeBangunanVal = row[key];
      } else if (normKey === "STATUS GEDUNG" || normKey === "STATUS") {
        statusGedungVal = row[key];
      } else if (normKey === "KELURAHAN") {
        kelurahanVal = row[key];
      } else if (normKey === "KECAMATAN") {
        kecamatanVal = row[key];
      } else if (normKey === "KAB/KOTA" || normKey === "KAB KOTA" || normKey === "KABUPATEN/KOTA" || normKey === "KABUPATEN" || normKey === "KOTA") {
        kabKotaVal = row[key];
      } else if (normKey === "PROVINSI") {
        provinsiVal = row[key];
      }
    }

    if (!namaVal) continue;

    formattedRows.push({
      kode: kodeVal?.trim() || "",
      nama: namaVal?.trim() || "",
      alamat: alamatVal?.trim() || null,
      type_outlet: typeOutletVal?.trim() || null,
      type_bangunan: typeBangunanVal?.trim() || null,
      status_gedung: statusGedungVal?.trim() || null,
      kelurahan: kelurahanVal?.trim() || null,
      kecamatan: kecamatanVal?.trim() || null,
      kab_kota: kabKotaVal?.trim() || null,
      provinsi: provinsiVal?.trim() || null,
    });
  }

  if (formattedRows.length === 0) {
    throw new Error("Tidak ada data instansi yang valid ditemukan. Periksa kembali nama header kolom CSV Anda.");
  }

  await axios.post('/outlets/import', { rows: formattedRows });
  return formattedRows.length;
};

export const importOutletExcel = importOutletCSV;

/**
 * Trigger download file Excel template import.
 */
export const downloadTemplate = () => {
  const headers = ["KODE OUTLET", "NAMA OUTLET", "TYPE OUTLET", "TYPE BANGUNAN", "STATUS GEDUNG", "ALAMAT", "KELURAHAN", "KECAMATAN", "KAB/KOTA", "PROVINSI"];
  const contoh = [
    ["12350", "UPC BOJONG RAWALUMBU", "Induk Cluster", "Ruko Single", "Sewa", "Jl. Bojong Rawalumbu No. 12", "Bojong Rawalumbu", "Rawalumbu", "Kota Bekasi", "Jawa Barat"],
    ["12458", "CP CIBINONG", "Anggota Cluster", "Stand Alone", "Milik Sendiri", "Jl. Cibinong No. 45", "Cibinong", "Cibinong", "Kab. Bogor", "Jawa Barat"]
  ];
  downloadExcelTemplate("Template_Import_Outlet.xlsx", headers, contoh, "Outlet");
};
