import * as XLSX from "xlsx";

/**
 * Trigger download of an Excel (.xlsx) template with column headers and optional sample rows.
 * @param {string} filename - e.g. "Template_Import_Barang.xlsx"
 * @param {Array<string>} headers - e.g. ["NAMA BARANG", "STOK", "SATUAN"]
 * @param {Array<Array<any>>} sampleRows - optional 2D array of sample data rows
 * @param {string} sheetName - optional sheet name
 */
export const downloadExcelTemplate = (
  filename,
  headers = [],
  sampleRows = [],
  sheetName = "Template"
) => {
  const data = [headers, ...sampleRows];
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Auto calculate column widths
  const colWidths = headers.map((h, i) => {
    let maxLen = String(h || "").length;
    sampleRows.forEach((r) => {
      const cellLen = String(r[i] !== undefined && r[i] !== null ? r[i] : "").length;
      if (cellLen > maxLen) maxLen = cellLen;
    });
    return { wch: Math.max(maxLen + 4, 12) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const cleanFilename = filename.toLowerCase().endsWith(".xlsx")
    ? filename
    : `${filename}.xlsx`;

  XLSX.writeFile(wb, cleanFilename);
};

/**
 * Parse an uploaded Excel (.xlsx, .xls) or CSV file into an array of object rows.
 * Uses SheetJS to read file as ArrayBuffer, ensuring full compatibility.
 * @param {File} file - uploaded file object from input[type="file"]
 * @returns {Promise<Array<Object>>} - array of objects keyed by header names
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("File tidak ditemukan."));
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const wb = XLSX.read(buffer, {
          type: "array",
          cellDates: true,
          dateNF: "YYYY-MM-DD",
        });

        if (!wb.SheetNames || wb.SheetNames.length === 0) {
          return reject(new Error("File Excel kosong atau tidak memiliki lembar kerja (sheet)."));
        }

        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];

        // sheet_to_json with defval to preserve blank fields as empty string
        const rawRows = XLSX.utils.sheet_to_json(ws, {
          defval: "",
          raw: false,
        });

        if (!rawRows || rawRows.length === 0) {
          return reject(new Error("File Excel tidak berisi data baris atau hanya berisi baris kosong."));
        }

        resolve(rawRows);
      } catch (err) {
        console.error("Gagal mem-parsing file Excel:", err);
        reject(err);
      }
    };

    reader.onerror = (err) => {
      reject(err);
    };

    reader.readAsArrayBuffer(file);
  });
};
