// resources/js/services/renovationService.js
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

export const importRenovationCSV = async (appId, rows) => {
  if (!rows || rows.length === 0) throw new Error("File CSV kosong");

  const formattedRows = [];
  for (const row of rows) {
    if (!row["NAMA PEKERJAAN"]) continue;

    // Parse nilai pembayaran (persentase)
    let nilaiPembayaran = 0;
    const rawNilai = row["NILAI PEMBAYARAN"]?.trim();
    if (rawNilai) {
      const cleanVal = parseFloat(rawNilai.replace(/[^0-9.]/g, ''));
      if (!isNaN(cleanVal)) {
        if (rawNilai.includes('%') || cleanVal > 1) {
          nilaiPembayaran = cleanVal / 100;
        } else {
          nilaiPembayaran = cleanVal;
        }
      }
    }

    formattedRows.push({
      no_memo: row["NO MEMO"]?.trim() || "",
      tgl_memo: parseCsvDate(row["TGL MEMO"]),
      nama_pekerjaan: row["NAMA PEKERJAAN"]?.trim() || "",
      nilai_pembayaran: nilaiPembayaran,
      nama_outlet: row["NAMA OUTLET"]?.trim() || "",
      cabang: row["CABANG"]?.trim() || "",
      status_gedung: row["STATUS GEDUNG"]?.trim() || "",
      norek: row["NO REKENING"]?.trim() || "",
      bank: row["BANK"]?.trim() || "",
      pelaksana_pekerjaan: row["PELAKSANA PEKERJAAN"]?.trim() || "",
      tgl_tagihan: parseCsvDate(row["TGL TAGIHAN"]),
      nilai_spk_pelaksanaan: row["NILAI SPK PELAKSANAAN"]?.trim() ? Number(row["NILAI SPK PELAKSANAAN"].replace(/[^0-9.]/g, '')) : 0,
      nilai_addendum_spk: row["NILAI ADDENDUM SPK"]?.trim() ? Number(row["NILAI ADDENDUM SPK"].replace(/[^0-9.]/g, '')) : 0,
      tgl_spk: parseCsvDate(row["TGL SPK"]),
      no_spk: row["NO SPK"]?.trim() || "",
      pajak_pph: row["PAJAK PPH"]?.trim() ? Number(row["PAJAK PPH"].replace(/[^0-9.]/g, '')) : 0,
      tgl_bap_bast: parseCsvDate(row["TGL BAP BAST"]),
      tagihan_nilai: row["TAGIHAN NILAI"]?.trim() ? Number(row["TAGIHAN NILAI"].replace(/[^0-9.]/g, '')) : 0,
      tagihan_dpp: row["TAGIHAN DPP"]?.trim() ? Number(row["TAGIHAN DPP"].replace(/[^0-9.]/g, '')) : 0,
      tagihan_ppn: row["TAGIHAN PPN"]?.trim() ? Number(row["TAGIHAN PPN"].replace(/[^0-9.]/g, '')) : 0,
      tagihan_pph: row["TAGIHAN PPH"]?.trim() ? Number(row["TAGIHAN PPH"].replace(/[^0-9.]/g, '')) : 0,
      tagihan_retensi: row["TAGIHAN RETENSI"]?.trim() ? Number(row["TAGIHAN RETENSI"].replace(/[^0-9.]/g, '')) : 0,
      tagihan_transfer: row["TAGIHAN TRANSFER"]?.trim() ? Number(row["TAGIHAN TRANSFER"].replace(/[^0-9.]/g, '')) : 0,
      retensi_nilai: row["RETENSI NILAI"]?.trim() ? Number(row["RETENSI NILAI"].replace(/[^0-9.]/g, '')) : 0,
      retensi_dpp: row["RETENSI DPP"]?.trim() ? Number(row["RETENSI DPP"].replace(/[^0-9.]/g, '')) : 0,
      retensi_ppn: row["RETENSI PPN"]?.trim() ? Number(row["RETENSI PPN"].replace(/[^0-9.]/g, '')) : 0,
      retensi_pph: row["RETENSI PPH"]?.trim() ? Number(row["RETENSI PPH"].replace(/[^0-9.]/g, '')) : 0,
      retensi_transfer: row["RETENSI TRANSFER"]?.trim() ? Number(row["RETENSI TRANSFER"].replace(/[^0-9.]/g, '')) : 0,
      status: row["STATUS"]?.trim() || "Dalam Proses",
      deskripsi: row["DESKRIPSI"]?.trim() || "",
    });
  }

  await axios.post('/building-renovations/import', { rows: formattedRows });
  router.reload({ only: ['buildingRenovations'] });
  return formattedRows.length;
};

export const downloadRenovationTemplate = () => {
  const headers = [
    "NO MEMO", "TGL MEMO", "NAMA PEKERJAAN", "NILAI PEMBAYARAN", "NAMA OUTLET",
    "CABANG", "STATUS GEDUNG", "NO REKENING", "BANK", "PELAKSANA PEKERJAAN",
    "TGL TAGIHAN", "NILAI SPK PELAKSANAAN", "NILAI ADDENDUM SPK", "TGL SPK", "NO SPK",
    "PAJAK PPH", "TGL BAP BAST", "TAGIHAN NILAI", "TAGIHAN DPP", "TAGIHAN PPN",
    "TAGIHAN PPH", "TAGIHAN RETENSI", "TAGIHAN TRANSFER", "RETENSI NILAI", "RETENSI DPP",
    "RETENSI PPN", "RETENSI PPH", "RETENSI TRANSFER", "STATUS", "DESKRIPSI"
  ];
  const contoh = [
    "MEMO-001,2023-08-10,Renovasi Atap KC Palembang,95%,KC Palembang,Palembang,Sewa,1234567890,BRI,CV Karya Mulia,2023-09-01,150000000,10000000,2023-08-15,SPK-001,3000000,2023-08-30,160000000,145454545,14545454,2909090,8000000,149090909,8000000,7272727,727272,145454,7854545,Selesai,Renovasi bocor atap dan perbaikan plafon",
    "MEMO-002,2023-09-05,Pengecatan Gedung KC Pekanbaru,0.50,KC Pekanbaru,Pekanbaru,Milik Sendiri,0987654321,Mandiri,PT Warna Indah,2023-09-20,50000000,0,2023-09-10,SPK-002,1000000,,50000000,45454545,4545454,909090,2500000,46545454,,,,,,Dalam Proses,"
  ];
  const csv  = headers.join(",") + "\n" + contoh.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.setAttribute("download", "Template_Import_Renovasi.csv");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
