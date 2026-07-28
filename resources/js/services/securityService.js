// resources/js/services/securityService.js
import axios from 'axios';
import { router } from '@inertiajs/react';

export const importSecurityCSV = async (appId, rows) => {
  if (!rows || rows.length === 0) throw new Error("File CSV kosong");

  const formattedRows = [];
  for (const row of rows) {
    // Skip empty rows
    if (!row["KODE UNIT KERJA"] && !row["NAMA UNIT KERJA"]) continue;

    formattedRows.push({
      no_urut: row["NO."]?.trim() || row["NO_URUT"]?.trim() || null,
      kantor_wilayah: row["KANTOR WILAYAH"]?.trim() || "",
      kantor_area: row["KANTOR AREA"]?.trim() || "",
      kantor_cabang: row["KANTOR CABANG"]?.trim() || "",
      kode_unit_kerja: row["KODE UNIT KERJA"]?.trim() || "",
      nama_unit_kerja: row["NAMA UNIT KERJA"]?.trim() || "",
      status: row["STATUS"]?.trim() || "",
      vendor: row["VENDOR"]?.trim() || "",
      jumlah_kamera: row["JUMLAH KAMERA"]?.trim() ? Number(row["JUMLAH KAMERA"].replace(/[^0-9.]/g, '')) : null,
      aplikasi: row["APLIKASI"]?.trim() || "",
      nama_aplikasi: row["NAMA APLIKASI"]?.trim() || "",
      keterangan: row["KETERANGAN"]?.trim() || row["KETERANGAN (JIKA OFFLINE)"]?.trim() || "",
    });
  }

  await axios.post('/security-facilities/import', { rows: formattedRows });
  router.reload({ only: ['securityFacilities', 'activityLogs'] });
  return formattedRows.length;
};

export const downloadSecurityTemplate = () => {
  const headers = [
    "NO.", "KANTOR WILAYAH", "KANTOR AREA", "KANTOR CABANG",
    "KODE UNIT KERJA", "NAMA UNIT KERJA", "STATUS", "VENDOR",
    "JUMLAH KAMERA", "APLIKASI", "NAMA APLIKASI", "KETERANGAN"
  ];
  const contoh = [
    "1,KANWIL JAKARTA 1,AREA SENEN,CP PETAMBURAN,12293,CP PETAMBURAN,Online,Teknisi CCTV Perorangan,10,Mobile APP,Hik-Connect,",
    "2,KANWIL JAKARTA 1,AREA SENEN,CP PETAMBURAN,12294,UPC GANG LONTAR,Offline,Teknisi CCTV Perorangan,4,Mobile APP,DMSS,Kamera Rusak"
  ];
  const csv  = headers.join(",") + "\n" + contoh.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.setAttribute("download", "Template_Import_Pengamanan_Korporasi.csv");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
