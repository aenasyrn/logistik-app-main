// resources/js/services/sewaService.js
import axios from 'axios';
import { router } from '@inertiajs/react';

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

export const importSewaCSV = async (appId, rows) => {
  if (!rows || rows.length === 0) throw new Error("File CSV kosong");

  const formattedRows = [];
  for (const row of rows) {
    // Lewati baris kosong
    if (!row["KODE OUTLET"] && !row["NAMA OUTLET"]) continue;

    formattedRows.push({
      outlet_id: row["OUTLET ID"]?.trim() ? Number(row["OUTLET ID"]) : null,
      kode_outlet: row["KODE OUTLET"]?.trim() || "",
      nama_outlet: row["NAMA OUTLET"]?.trim() || "",
      type_outlet: row["TYPE OUTLET"]?.trim() || "",
      type_bangunan: row["TYPE BANGUNAN"]?.trim() || "",
      jenis_sto: row["JENIS STO"]?.trim() || "",
      status_gedung: row["STATUS GEDUNG"]?.trim() || "",
      periode_sewa: row["PERIODE SEWA"]?.trim() || "",
      tgl_kontrak_mulai: parseCsvDate(row["TGL KONTRAK MULAI"]),
      tgl_kontrak_berakhir: parseCsvDate(row["TGL KONTRAK BERAKHIR"]),
      harga_sewa: row["HARGA SEWA"]?.trim() ? Number(row["HARGA SEWA"].replace(/[^0-9.]/g, '')) : 0,
      keterangan: row["KETERANGAN"]?.trim() || "",
      alamat: row["ALAMAT"]?.trim() || "",
      kelurahan: row["KELURAHAN"]?.trim() || "",
      kecamatan: row["KECAMATAN"]?.trim() || "",
      kab_kota: row["KAB KOTA"]?.trim() || "",
      provinsi: row["PROVINSI"]?.trim() || "",
    });
  }

  await axios.post('/building-sewas/import', { rows: formattedRows });
  router.reload({ only: ['buildingSewas', 'activityLogs', 'outlets'] });
  return formattedRows.length;
};

export const downloadSewaTemplate = () => {
  const headers = [
    "OUTLET ID", "KODE OUTLET", "NAMA OUTLET", "TYPE OUTLET",
    "TYPE BANGUNAN", "JENIS STO", "STATUS GEDUNG", "PERIODE SEWA",
    "TGL KONTRAK MULAI", "TGL KONTRAK BERAKHIR", "HARGA SEWA",
    "KETERANGAN", "ALAMAT", "KELURAHAN", "KECAMATAN", "KAB KOTA", "PROVINSI"
  ];
  const contoh = [
    "10101,10101,KC Palembang,Kanca,Ruko Single,STO A,Sewa,3 Tahun,2023-07-09,2026-07-08,12000000,Sewa bangunan operasional,Jl. Jend. Sudirman No. 12,20 Ilir D III,Ilir Timur I,Palembang,Sumatera Selatan",
    "10102,10102,KC Pekanbaru,Kanca,Gedung Mandiri,STO B,Sewa,3 Tahun,2023-07-22,2026-07-21,10500000,Sewa bangunan kantor pembantu,Jl. Sudirman No. 45,Simpang Empat,Pekanbaru Kota,Pekanbaru,Riau"
  ];
  const csv  = headers.join(",") + "\n" + contoh.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.setAttribute("download", "Template_Import_Sewa.csv");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
