// src/hooks/printer/usePrinterActions.js
import { useRef } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { importPrinterCSV, downloadTemplate } from "../../services/printerService";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID || "logistikku_app_01";

export function usePrinterActions({ filteredData, setIsSaving, showNotif }) {
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsSaving(true);
    showNotif("Sedang memproses dan mengunggah CSV...");
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async ({ data }) => {
        try {
          const total = await importPrinterCSV(APP_ID, data);
          showNotif(`Sukses! ${total} data printer berhasil di-import. Memuat ulang...`);
          setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
          console.error(err);
          showNotif("Gagal import! Pastikan kolom header persis seperti template.", "error");
        } finally {
          setIsSaving(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
      error: (err) => {
        console.error(err);
        showNotif("Gagal membaca file CSV.", "error");
        setIsSaving(false);
      },
    });
  };

  const exportToExcel = () => {
    const rows = filteredData.map((item) => ({
      "Outlet":           item.outlet         || "",
      "ID Outlet":        item.idOutlet       || "",
      "Produk / Model":   item.produk         || "",
      "Serial Number":    item.sn             || "",
      "Kondisi":          item.kondisi        || "",
      "Vendor":           item.penyedia       || "",
      "Tgl Mulai Sewa":   item.tanggalMulai   || "",
      "Tgl Selesai Sewa": item.tanggalSelesai || "",
      "Status":           item.status         || "",
      "Catatan":          item.deskripsi      || "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Printer");
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...rows.map((r) => String(r[key]).length)) + 2,
    }));
    ws["!cols"] = colWidths;
    XLSX.writeFile(wb, `Data_Printer_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return {
    fileInputRef,
    handleFileUpload,
    exportToExcel,
    downloadTemplate,
  };
}
