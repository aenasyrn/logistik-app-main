// src/hooks/printer/usePrinterActions.js
import { useRef } from "react";
import * as XLSX from "xlsx";
import { importPrinterCSV, downloadTemplate } from "../../services/printerService";
import { parseExcelFile } from "../../utils/excelHelper";

export function usePrinterActions({ filteredData, setIsSaving, showNotif }) {
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsSaving(true);
    try {
      const data = await parseExcelFile(file);
      const total = await importPrinterCSV(data);
      showNotif(`Sukses! ${total} data printer berhasil di-import.`, "success");
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.message || "Gagal import! Pastikan file Excel valid dan kolom header sesuai template.";
      showNotif(errorMsg, "error");
    } finally {
      setIsSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const exportToExcel = () => {
    const rows = filteredData.map((item) => ({
      "ID Outlet":        item.idOutlet       || "",
      "Outlet":           item.outlet         || "",
      "Produk / Model":   item.produk         || "",
      "Serial Number":    item.sn             || "",
      "Kondisi":          item.kondisi        || "",
      "Vendor":           item.vendor         || "",
      "Tgl Mulai Sewa":   item.tanggalMulai   || "",
      "Tgl Selesai Sewa": item.tanggalSelesai || "",
      "Status":           item.status         || "",
      "Keterangan":       item.keterangan     || "",
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
