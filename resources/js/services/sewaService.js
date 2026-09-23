// resources/js/services/sewaService.js
import axios from 'axios';
import { router } from '@inertiajs/react';
import { downloadExcelTemplate } from '../utils/excelHelper';

const parseCsvDate = (dateStr) => {
  if (!dateStr) return null;
  const cleaned = dateStr.trim();
  if (!cleaned) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  const dmwParts = cleaned.split('/');
  if (dmwParts.length === 3) {
    const day = dmwParts[0].padStart(2, '0');
    const month = dmwParts[1].padStart(2, '0');
    const year = dmwParts[2];
    if (year.length === 4) {
      return `${year}-${month}-${day}`;
    }
  }

  const dateObj = new Date(cleaned);
  if (!isNaN(dateObj.getTime())) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return null;
};

export const importSewaCSV = async (rows) => {
  if (!rows || rows.length === 0) throw new Error("File CSV kosong");

  const formattedRows = [];
  for (const row of rows) {
    const getVal = (possibleKeys) => {
      for (const k of possibleKeys) {
        const cleanK = k.replace(/^\uFEFF/, "").trim().toLowerCase();
        const match = Object.keys(row).find(key => {
          const cleanKey = key.replace(/^\uFEFF/, "").trim().toLowerCase();
          return cleanKey === cleanK;
        });
        if (match) return row[match];
      }
      return undefined;
    };

    const kodeOutlet = getVal(["Kode Outlet", "KODE OUTLET"])?.trim() || "";
    const namaOutlet = getVal(["Nama Outlet", "NAMA OUTLET"])?.trim() || "";

    if (!kodeOutlet && !namaOutlet) continue;

    const typeOutlet = getVal(["Type Outlet", "TYPE OUTLET"])?.trim() || "";
    const typeBangunan = getVal(["Type Bangunan", "TYPE BANGUNAN"])?.trim() || "";
    const jenisSto = getVal(["Jenis STO", "JENIS STO"])?.trim() || "";
    const status = getVal(["Status", "STATUS"])?.trim() || "";
    const hargaSewaStr = getVal(["Harga Sewa", "HARGA SEWA"]) || "";
    const hargaSewa = hargaSewaStr ? Number(String(hargaSewaStr).replace(/[^0-9.]/g, '')) : 0;
    const statusGedung = getVal(["Status Gedung", "STATUS GEDUNG"])?.trim() || "";
    const periodeSewaRaw = getVal(["Periode Sewa", "PERIODE SEWA"])?.trim() || "";
    const periodeSewa = periodeSewaRaw ? Number(String(periodeSewaRaw).replace(/[^0-9.]/g, '')) : null;

    const tglMulai = parseCsvDate(getVal(["Tgl. Kontrak Mulai", "TGL KONTRAK MULAI", "Tanggal Kontrak Mulai"]));
    const tglBerakhir = parseCsvDate(getVal(["Tgl. Kontrak Berakhir", "TGL KONTRAK BERAKHIR", "Tanggal Kontrak Berakhir"]));
    const keterangan = getVal(["Keterangan", "KETERANGAN"])?.trim() || "";
    const alamat = getVal(["Alamat", "ALAMAT"])?.trim() || "";
    const kelurahan = getVal(["Kelurahan", "KELURAHAN"])?.trim() || "";
    const kecamatan = getVal(["Kecamatan", "KECAMATAN"])?.trim() || "";
    const kabKota = getVal(["Kab/Kota", "KAB KOTA", "Kabupaten", "Kota"])?.trim() || "";
    const provinsi = getVal(["Provinsi", "PROVINSI"])?.trim() || "";

    formattedRows.push({
      kode_outlet: kodeOutlet,
      nama_outlet: namaOutlet,
      type_outlet: typeOutlet,
      type_bangunan: typeBangunan,
      jenis_sto: jenisSto,
      status: status,
      harga_sewa: hargaSewa,
      status_gedung: statusGedung,
      periode_sewa: periodeSewa,
      tgl_kontrak_mulai: tglMulai,
      tgl_kontrak_berakhir: tglBerakhir,
      keterangan: keterangan,
      alamat: alamat,
      kelurahan: kelurahan,
      kecamatan: kecamatan,
      kab_kota: kabKota,
      provinsi: provinsi,
    });
  }

  if (formattedRows.length === 0) {
    throw new Error("Tidak ada data valid yang cocok dengan kolom template. Pastikan header CSV sesuai.");
  }

  await axios.post('/building-sewas/import', { rows: formattedRows });
  return formattedRows.length;
};

export const importSewaExcel = importSewaCSV;

export const downloadSewaTemplate = () => {
  const headers = [
    "Kode Outlet", "Nama Outlet", "Type Outlet", "Type Bangunan",
    "Jenis STO", "Sisa Waktu", "Status", "Harga Sewa", "Status Gedung",
    "Periode Sewa", "Tgl. Kontrak Mulai", "Tgl. Kontrak Berakhir",
    "Keterangan", "Alamat", "Kelurahan", "Kecamatan", "Kab/Kota", "Provinsi"
  ];
  const contoh = [
    ["10101", "KC Palembang", "Kanca", "Ruko Single", "STO A", "-", "Aktif", 12000000, "Sewa", 3, "2023-07-09", "2026-07-08", "Sewa bangunan operasional", "Jl. Jend. Sudirman No. 12", "20 Ilir D III", "Ilir Timur I", "Palembang", "Sumatera Selatan"],
    ["10102", "KC Pekanbaru", "Kanca", "Gedung Mandiri", "STO B", "-", "Aktif", 10500000, "Sewa", 3, "2023-07-22", "2026-07-21", "Sewa bangunan kantor pembantu", "Jl. Sudirman No. 45", "Simpang Empat", "Pekanbaru Kota", "Pekanbaru", "Riau"]
  ];
  downloadExcelTemplate("Template_Import_Sewa.xlsx", headers, contoh, "Sewa Bangunan");
};
