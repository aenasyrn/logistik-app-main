// src/hooks/komputer/useKomputerActions.js
import { useRef } from "react";
import * as XLSX from "xlsx";
import { router } from "@inertiajs/react";
import { importKomputerCSV, downloadTemplate } from "../../services/komputerService";
import { parseExcelFile } from "../../utils/excelHelper";

export function useKomputerActions({ filteredData, setIsSaving, showNotif }) {
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsSaving(true);
    try {
      const data = await parseExcelFile(file);
      const total = await importKomputerCSV(data);
      showNotif(`Sukses! ${total} data komputer berhasil di-import.`, "success", () => {
        router.reload({ only: ['computers', 'activityLogs', 'outlets'] });
      });
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
      "Outlet":           item.outlet         || "",
      "ID Outlet":        item.idOutlet       || "",
      "Produk / Model":   item.produk         || "",
      "Serial Number":    item.sn             || "",
      "Kondisi":          item.kondisi        || "",
      "IP Address":       item.ipAddress      || "",
      "MAC Address":      item.macAddress     || "",
      "CPU":              item.cpu            || "",
      "RAM":              item.ram            || "",
      "Storage":          item.storage        || "",
      "OS":               item.os             || "",
      "Vendor":           item.penyedia       || "",
      "Tgl Mulai Sewa":   item.tanggalMulai   || "",
      "Tgl Selesai Sewa": item.tanggalSelesai || "",
      "Status":           item.status         || "",
      "Keterangan":       item.keterangan     || "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Komputer");
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...rows.map((r) => String(r[key]).length)) + 2,
    }));
    ws["!cols"] = colWidths;
    XLSX.writeFile(wb, `Data_Komputer_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return {
    fileInputRef,
    handleFileUpload,
    exportToExcel,
    downloadTemplate,
  };
}