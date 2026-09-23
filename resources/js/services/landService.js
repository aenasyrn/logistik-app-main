// resources/js/services/landService.js
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

export const importLandCSV = async (rows) => {
  if (!rows || rows.length === 0) throw new Error("File CSV kosong");

  const formattedRows = [];
  let lastUnitKerja = "";

  for (const row of rows) {
    const rawUnit = row["UNIT KERJA"]?.trim() || "";
    const unitKerja = rawUnit || lastUnitKerja;

    const hasData = Boolean(
      unitKerja ||
      row["NO SERTIFIKAT"] ||
      row["NO SHGB"] ||
      row["NO SERTIFIKAT GABUNGAN"]
    );
    if (!hasData) continue;

    if (rawUnit) {
      lastUnitKerja = rawUnit;
    }

    formattedRows.push({
      unit_kerja: unitKerja,
      alamat: row["ALAMAT"]?.trim() || "",
      peruntukan: row["PERUNTUKAN"]?.trim() || "",
      aset_sap: row["ASET SAP"]?.trim() || "",
      no_shgb: row["NO SHGB"]?.trim() || "",
      no_sertifikat: row["NO SERTIFIKAT"]?.trim() || "",
      no_sertifikat_gabungan: row["NO SERTIFIKAT GABUNGAN"]?.trim() || "",
      no_imb: row["NO IMB"]?.trim() || "",
      nama_pemilik_imb: row["NAMA PEMILIK IMB"]?.trim() || "",
      tgl_mulai_shgb: parseCsvDate(row["TGL MULAI SHGB"]),
      tgl_berakhir_shgb: parseCsvDate(row["TGL BERAKHIR SHGB"]),
      tahun_perolehan: row["TAHUN PEROLEHAN"]?.trim() ? Number(row["TAHUN PEROLEHAN"].replace(/[^0-9]/g, '')) : null,
      luas_tanah: row["LUAS TANAH"]?.trim() ? Number(row["LUAS TANAH"].replace(/[^0-9.]/g, '')) : null,
      luas_pagar: row["LUAS PAGAR"]?.trim() ? Number(row["LUAS PAGAR"].replace(/[^0-9.]/g, '')) : null,
      luas_bangunan: row["LUAS BANGUNAN"]?.trim() ? Number(row["LUAS BANGUNAN"].replace(/[^0-9.]/g, '')) : null,
      keterangan: row["KETERANGAN"]?.trim() || "",
    });
  }

  const res = await axios.post('/building-lands/import', { rows: formattedRows });
  return res.data?.imported_count ?? formattedRows.length;
};

export const importLandExcel = importLandCSV;

export const downloadLandTemplate = () => {
  const headers = [
    "UNIT KERJA", "ALAMAT", "PERUNTUKAN", "ASET SAP", "NO SHGB", "NO SERTIFIKAT",
    "NO SERTIFIKAT GABUNGAN", "NO IMB", "NAMA PEMILIK IMB", "TGL MULAI SHGB",
    "TGL BERAKHIR SHGB", "TAHUN PEROLEHAN", "LUAS TANAH", "LUAS PAGAR", "LUAS BANGUNAN", "KETERANGAN"
  ];
  const contoh = [
    ["Kanca Palembang", "Jl. Jend. Sudirman No. 12", "Kantor Cabang", "Aset 001", "SHGB 12345", "CERT-9988", "CERT-GAB-01", "IMB-5678", "PT Bank Rakyat Indonesia", "2015-05-10", "2035-05-09", 2015, 500, 100, 350, "Aset bersertifikat lengkap"],
    ["Unit Kerja Pekanbaru", "Jl. Sudirman No. 45", "Kantor Cabang Pembantu", "Aset 002", "", "CERT-9989", "", "IMB-5679", "PT Bank Rakyat Indonesia", "", "", 2018, 400, "", 250, ""]
  ];
  downloadExcelTemplate("Template_Import_Tanah.xlsx", headers, contoh, "Daftar Tanah");
};
