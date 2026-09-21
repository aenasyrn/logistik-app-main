// resources/js/services/securityService.js
import axios from 'axios';
import { router } from '@inertiajs/react';
import { downloadExcelTemplate } from '../utils/excelHelper';

export const importSecurityCSV = async (appId, rows) => {
  if (!rows || rows.length === 0) throw new Error("File CSV kosong");

  const formattedRows = [];
  for (const row of rows) {
    const normalizedRow = {};
    for (const key of Object.keys(row)) {
      const cleanKey = key.replace(/^\uFEFF/, "").trim().toLowerCase();
      normalizedRow[cleanKey] = row[key];
    }

    const namaUnit = normalizedRow["nama unit kerja"] || normalizedRow["nama_unit_kerja"];
    const kodeUnit = normalizedRow["kode unit kerja"] || normalizedRow["kode_unit_kerja"];

    if (!namaUnit && !kodeUnit) continue;

    formattedRows.push({
      no_urut: normalizedRow["no."] || normalizedRow["no"] || normalizedRow["no_urut"] || null,
      kantor_wilayah: normalizedRow["kantor wilayah"] || normalizedRow["kantor_wilayah"] || "",
      kantor_area: normalizedRow["kantor area"] || normalizedRow["kantor_area"] || "",
      kantor_cabang: normalizedRow["kantor cabang"] || normalizedRow["kantor_cabang"] || "",
      kode_unit_kerja: kodeUnit || "",
      nama_unit_kerja: namaUnit || "",
      status: normalizedRow["status"] || "",
      vendor: normalizedRow["vendor"] || "",
      jumlah_kamera: (normalizedRow["jumlah kamera"] || normalizedRow["jumlah_kamera"]) ? Number(String(normalizedRow["jumlah kamera"] || normalizedRow["jumlah_kamera"]).replace(/[^0-9.]/g, '')) : null,
      aplikasi: normalizedRow["aplikasi"] || "",
      nama_aplikasi: normalizedRow["nama aplikasi"] || normalizedRow["nama_aplikasi"] || "",
      keterangan: normalizedRow["keterangan"] || normalizedRow["keterangan (jika offline)"] || "",
    });
  }

  await axios.post('/security-facilities/import', { rows: formattedRows });
  return formattedRows.length;
};

export const importSecurityExcel = importSecurityCSV;

export const downloadSecurityTemplate = () => {
  const headers = [
    "NO.", "KANTOR WILAYAH", "KANTOR AREA", "KANTOR CABANG",
    "KODE UNIT KERJA", "NAMA UNIT KERJA", "STATUS", "VENDOR",
    "JUMLAH KAMERA", "APLIKASI", "NAMA APLIKASI", "KETERANGAN"
  ];
  const contoh = [
    [1, "KANWIL JAKARTA 1", "AREA SENEN", "CP PETAMBURAN", "12293", "CP PETAMBURAN", "Online", "Teknisi CCTV Perorangan", 10, "Mobile APP", "Hik-Connect", ""],
    [2, "KANWIL JAKARTA 1", "AREA SENEN", "CP PETAMBURAN", "12294", "UPC GANG LONTAR", "Offline", "Teknisi CCTV Perorangan", 4, "Mobile APP", "DMSS", "Kamera Rusak"]
  ];
  downloadExcelTemplate("Template_Import_Pengamanan_Korporasi.xlsx", headers, contoh, "Sarana Pengamanan");
};
