// resources/js/Components/Common/DetailHistoryModal.jsx
import { X, Calendar, History, Clock, Building2, CalendarPlus, ExternalLink, Box, CheckCircle2, AlertCircle } from "lucide-react";

export default function DetailHistoryModal({
  isOpen,
  onClose,
  item,
  type = "sewa",
  inventoryList = [],
  onNavigateToMasterBarang,
  onPerpanjang,
  onEditItem,
}) {
  if (!isOpen || !item) return null;

  // Robust date parser (handles DD/MM/YYYY, YYYY-MM-DD, ISO, etc.)
  const parseDate = (val) => {
    if (!val || val === "-" || val === "0000-00-00") return null;
    if (val instanceof Date && !isNaN(val.getTime())) return val;
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
        const [d, m, y] = trimmed.split("/").map(Number);
        const date = new Date(y, m - 1, d);
        return isNaN(date.getTime()) ? null : date;
      }
      const date = new Date(trimmed);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  };

  // Helper date formatter
  const formatDate = (dateString) => {
    if (!dateString || dateString === "-" || dateString === "0000-00-00") return "-";
    const date = parseDate(dateString);
    if (!date) return String(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Helper date time formatter
  const formatDateTime = (isoString) => {
    if (!isoString) return "-";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  // Format currency
  const formatHarga = (value) => {
    if (value === null || value === undefined || value === "" || value === "-") return "-";
    const num = typeof value === "string" ? Number(value.replace(/[^0-9]/g, "")) : Number(value);
    if (isNaN(num) || num === 0) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const titleMap = {
    sewa: "Riwayat Perpanjangan Sewa Bangunan",
    tanah: "Riwayat Perpanjangan Sertifikat SHGB Tanah",
    komputer: "Riwayat Perpanjangan Sewa Komputer",
    printer: "Riwayat Perpanjangan Sewa Printer",
    laptop: "Riwayat Perpanjangan Sewa Laptop",
  };

  const isPerangkatOrInventory = type === "komputer" || type === "printer" || type === "laptop" || type === "inventory" || type === "barang";

  const getItemName = () => {
    if (type === "sewa") return item.nama_outlet || item.kode_outlet || "Sewa Bangunan";
    if (type === "tanah") return item.unit_kerja || "Daftar Tanah";
    if (type === "inventory" || type === "barang") return item.nama || "Master Barang";
    if (type === "laptop") return `${item.produk || "Laptop"} - ${item.namaPengguna || item.nama_pengguna || item.hostname || item.sn || ""}`;
    return item.produk || item.sn || "Perangkat";
  };

  const getModalTitle = () => {
    if (type === "inventory" || type === "barang") {
      const jenis = (item.jenis_barang || "").toLowerCase();
      if (jenis.includes("komputer")) return "Riwayat Perpanjangan Sewa Komputer";
      if (jenis.includes("printer")) return "Riwayat Perpanjangan Sewa Printer";
      if (jenis.includes("laptop")) return "Riwayat Perpanjangan Sewa Laptop";
      return item.jenis_barang ? `Riwayat Perpanjangan Sewa ${item.jenis_barang}` : "Riwayat Perpanjangan Sewa Barang";
    }
    return titleMap[type] || "Riwayat Perpanjangan Data";
  };

  // Single Source of Truth: untuk Komputer, Printer, Laptop, atau Inventory
  let matchedInventory = null;
  if (type === "komputer" || type === "printer" || type === "laptop") {
    if (item.inventory) {
      matchedInventory = item.inventory;
    } else if (inventoryList && inventoryList.length > 0) {
      matchedInventory = inventoryList.find((inv) =>
        (item.inventory_id && Number(inv.id) === Number(item.inventory_id)) ||
        (item.produk && inv.nama && inv.nama.trim().toLowerCase() === item.produk.trim().toLowerCase())
      );
    }
  } else if (type === "inventory" || type === "barang") {
    matchedInventory = item;
  }

  // Gunakan histories dari Master Barang jika ada, atau fallback ke item.histories
  const histories = (matchedInventory?.histories && matchedInventory.histories.length > 0)
    ? matchedInventory.histories
    : (item.histories || []);

  // Data periode aktif saat ini (hasil perpanjangan terbaru)
  let currentStart = "";
  let currentEnd = "";
  let currentVendor = "-";
  let currentNoSpk = "";
  let currentNoPks = "";
  let currentKuantitas = null;
  let currentSatuan = "Unit";
  let currentHargaSatuan = null;
  let currentBiayaSewa = null;
  let currentStatus = "Aktif";
  let currentNoDokumen = "-";
  let currentDeskripsi = "";

  if (isPerangkatOrInventory) {
    currentStart = matchedInventory?.tanggal_mulai || item.tanggal_mulai || item.tanggalMulai || "";
    currentEnd = matchedInventory?.tanggal_selesai || item.tanggal_selesai || item.tanggalSelesai || "";
    currentVendor = matchedInventory?.vendor_nama || item.penyedia || item.vendor || item.vendor_nama || "-";
    currentNoSpk = matchedInventory?.no_spk || item.no_spk || "";
    currentNoPks = matchedInventory?.no_pks || item.no_pks || "";
    const totalLinkedDevices = (Number(matchedInventory?.computers_count) || 0) + (Number(matchedInventory?.printers_count) || 0);
    const rawQty = matchedInventory?.kuantitas !== undefined && matchedInventory?.kuantitas !== null
      ? Number(matchedInventory.kuantitas)
      : (item.kuantitas !== undefined && item.kuantitas !== null ? Number(item.kuantitas) : null);

    currentKuantitas = (rawQty !== null && rawQty > 0)
      ? rawQty
      : (totalLinkedDevices > 0 ? totalLinkedDevices : (rawQty !== null && rawQty > 0 ? rawQty : "-"));

    currentSatuan = matchedInventory?.satuan || item.satuan || "Unit";
    currentHargaSatuan = (matchedInventory?.harga_satuan !== undefined && matchedInventory?.harga_satuan !== null)
      ? matchedInventory.harga_satuan
      : (item.harga_satuan || null);
    currentBiayaSewa = (matchedInventory?.biaya_sewa !== undefined && matchedInventory?.biaya_sewa !== null)
      ? matchedInventory.biaya_sewa
      : (item.biaya_sewa || item.biaya || null);
    currentStatus = matchedInventory?.status || item.status || "Aktif";
    currentNoDokumen = currentNoSpk || currentNoPks || "-";
    currentDeskripsi = matchedInventory?.deskripsi || item.keterangan || item.deskripsi || "";
  } else if (type === "sewa") {
    currentStart = item.tgl_kontrak_mulai || item.tanggal_kontrak_mulai || item.tgl_mulai || item.tanggal_mulai || "";
    currentEnd = item.tgl_kontrak_berakhir || item.tanggal_kontrak_berakhir || item.tgl_akhir || item.tanggal_selesai || "";
    currentVendor = item.nama_outlet || item.outlet || item.pemilik || item.vendor || "-";
    currentBiayaSewa = item.harga_sewa || item.biaya || item.biaya_sewa || item.nominal || null;
    currentStatus = item.status || item.status_sewa || "Aktif";
    currentNoDokumen = item.no_spk || item.no_pks || item.no_sertifikat || (item.periode_sewa ? `${item.periode_sewa} Thn` : "-");
    currentDeskripsi = item.keterangan || "";
  } else if (type === "tanah") {
    currentStart = item.tgl_mulai_shgb || item.tgl_shgb_mulai || item.tgl_terbit || item.tanggal_mulai || "";
    currentEnd = item.tgl_berakhir_shgb || item.tgl_shgb_berakhir || item.jatuh_tempo || item.tanggal_selesai || "";
    currentVendor = item.atas_nama || item.unit_kerja || "-";
    currentStatus = item.status || "Aktif";
    currentNoDokumen = item.no_sertifikat_gabungan || item.no_sertifikat || item.no_shgb || "-";
    currentDeskripsi = item.keterangan || "";
  }

  const hasCurrentContract = Boolean(currentStart || currentEnd);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let sisaHari = null;
  let isExpired = false;
  let isExpiringSoon = false; // sisa 1 minggu (<= 7 hari)

  if (currentEnd) {
    const endD = parseDate(currentEnd);
    if (endD) {
      endD.setHours(0, 0, 0, 0);
      const diffMs = endD.getTime() - today.getTime();
      sisaHari = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      isExpired = sisaHari < 0;
      isExpiringSoon = sisaHari >= 0 && sisaHari <= 7;
    }
  }

  const isInventaris = (
    (!currentStart && !currentEnd) ||
    (!currentEnd && (currentStatus?.toLowerCase() === "inventaris" || item?.status?.toLowerCase() === "inventaris"))
  );

  const handlePerpanjangClick = () => {
    if (onPerpanjang) {
      onPerpanjang(matchedInventory || item);
    } else if (onNavigateToMasterBarang) {
      onNavigateToMasterBarang(item, matchedInventory);
    } else if (onEditItem) {
      onClose();
      onEditItem(item);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1a2b20] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 dark:border-[#213527]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0d5c3a] via-[#137447] to-[#083c25] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <History className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{getModalTitle()}</h3>
              <p className="text-xs text-emerald-100 mt-0.5">{getItemName()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1 bg-slate-50/50 dark:bg-[#15231a]">

          {/* Master Item Reference Banner (for Komputer, Printer, & Master Barang) */}
          {isPerangkatOrInventory && (
            <div className="bg-emerald-50/80 dark:bg-[#14261c] border border-emerald-200/80 dark:border-[#263e2f] rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <Box className="w-5 h-5 text-[#0d5c3a] dark:text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                    <span>Sumber Data Master:</span>
                    <span className="font-extrabold text-[#0d5c3a] dark:text-emerald-400">
                      {matchedInventory ? matchedInventory.nama : (item.nama || item.produk || "-")}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Vendor: {currentVendor} • No SPK: {currentNoDokumen}
                  </div>
                </div>
              </div>

              {(onNavigateToMasterBarang || onPerpanjang) && (
                <button
                  type="button"
                  onClick={handlePerpanjangClick}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0d5c3a] hover:bg-[#156e49] text-white text-xs font-bold rounded-lg shadow-sm transition-all shrink-0 cursor-pointer"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  Perpanjang Sewa
                </button>
              )}
            </div>
          )}

          {/* ── BAGIAN ATAS: Sewa / Perpanjangan Sedang Berlangsung ── */}
          <div className="bg-white dark:bg-[#1d3024] rounded-2xl border border-emerald-200/90 dark:border-[#2a4a34] p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-emerald-100 dark:border-[#263e2f] pb-3 mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${
                  isExpired 
                    ? "bg-red-100 dark:bg-red-900/60" 
                    : "bg-emerald-100 dark:bg-emerald-900/60"
                }`}>
                  {isExpired ? (
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                  )}
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 dark:text-gray-100 text-sm flex items-center gap-2">
                    Sewa yang Sedang Berlangsung
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      isExpired
                        ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700"
                    }`}>
                      {isExpired ? "Masa Sewa Berakhir" : "Aktif"}
                    </span>
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {isExpired 
                      ? `Periode sewa telah berakhir pada ${formatDate(currentEnd)} (${Math.abs(sisaHari)} hari yang lalu)`
                      : "Periode sewa kontrak berjalan hasil perpanjangan terbaru"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {hasCurrentContract && (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${
                    isExpired
                      ? "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border-red-300/80 dark:border-red-700/80"
                      : "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300/80 dark:border-emerald-700/80"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      isExpired ? "bg-red-500" : "bg-emerald-500 animate-pulse"
                    }`} />
                    {isExpired ? "Sewa Habis" : "Sedang Berjalan"}
                  </span>
                )}
                {(onEditItem || (onPerpanjang && !isPerangkatOrInventory)) && (
                  <button
                    type="button"
                    onClick={handlePerpanjangClick}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#0d5c3a] hover:bg-[#156e49] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                    title="Perpanjang Sewa"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    Perpanjang Sewa
                  </button>
                )}
              </div>
            </div>

            {!hasCurrentContract ? (
              <div className="p-6 text-center bg-slate-50 dark:bg-[#16251b] rounded-xl border border-dashed border-gray-200 dark:border-[#263e2f]">
                <Calendar className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Belum ada kontrak sewa yang sedang aktif</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-emerald-50/80 dark:bg-[#223d2b] text-emerald-950 dark:text-emerald-100 font-bold border-b border-emerald-200/80 dark:border-[#2a4a34]">
                      <th className="p-3 w-32">Tgl Mulai</th>
                      <th className="p-3 w-32">Tgl Berakhir</th>
                      {type === "tanah" ? (
                        <>
                          <th className="p-3 w-40">No. SHGB</th>
                          <th className="p-3 w-40">No. Sertifikat</th>
                          <th className="p-3 w-40">No. IMB</th>
                        </>
                      ) : (
                        <th className="p-3 w-48">
                          {isPerangkatOrInventory ? "Vendor" : "Biaya / Dokumen"}
                        </th>
                      )}
                      {isPerangkatOrInventory && (
                        <>
                          <th className="p-3 w-28 text-center">Jumlah Barang</th>
                          <th className="p-3 w-32">Harga Satuan</th>
                          <th className="p-3 w-32">Biaya Sewa</th>
                        </>
                      )}
                      {!isPerangkatOrInventory && type !== "tanah" && <th className="p-3">Keterangan Catatan</th>}
                      <th className="p-3 w-36 text-right">Status Kontrak</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white dark:bg-[#1d3024] hover:bg-emerald-50/40 dark:hover:bg-[#223d2b] transition-colors">
                      <td className="p-3 font-bold text-emerald-950 dark:text-emerald-100 whitespace-nowrap">
                        {formatDate(currentStart)}
                      </td>
                      <td className="p-3 font-bold text-emerald-950 dark:text-emerald-100 whitespace-nowrap">
                        {formatDate(currentEnd)}
                      </td>
                      {type === "tanah" ? (
                        <>
                          <td className="p-3 font-medium text-gray-800 dark:text-gray-200 whitespace-pre-line leading-tight">
                            {item.no_shgb || currentNoDokumen || "-"}
                          </td>
                          <td className="p-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                            {item.no_sertifikat || item.no_sertifikat_gabungan || item.no_sertifikat_gabung || "-"}
                          </td>
                          <td className="p-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                            {item.no_imb || "-"}
                          </td>
                        </>
                      ) : (
                        <td className="p-3">
                          {isPerangkatOrInventory ? (
                            <div>
                              <p className="font-bold text-blue-900 dark:text-blue-300">{currentVendor}</p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">SPK: {currentNoSpk || "-"}</p>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">PKS: {currentNoPks || "-"}</p>
                            </div>
                          ) : (
                            currentBiayaSewa ? formatHarga(currentBiayaSewa) : (currentNoDokumen || currentVendor || "-")
                          )}
                        </td>
                      )}
                      {isPerangkatOrInventory && (
                        <>
                          <td className="p-3 text-center font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                            {currentKuantitas !== null && currentKuantitas !== undefined && currentKuantitas !== ""
                              ? `${currentKuantitas} ${currentSatuan}`
                              : "-"}
                          </td>
                          <td className="p-3 font-bold text-emerald-900 dark:text-emerald-200 whitespace-nowrap">
                            {formatHarga(currentHargaSatuan)}
                          </td>
                          <td className="p-3 font-bold text-emerald-900 dark:text-emerald-200 whitespace-nowrap">
                            {formatHarga(currentBiayaSewa)}
                          </td>
                        </>
                      )}
                      {!isPerangkatOrInventory && type !== "tanah" && (
                        <td className="p-3 text-gray-600 dark:text-gray-300 text-xs">
                          {currentDeskripsi || "-"}
                        </td>
                      )}
                      <td className="p-3 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md border ${
                          isExpired
                            ? "text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/60 border-red-300/80 dark:border-red-700/80"
                            : "text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 border-emerald-300/80 dark:border-emerald-700/80"
                        }`}>
                          ● {isExpired ? "Sewa Habis" : "Sedang Berjalan"}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── BAGIAN BAWAH: Riwayat Sewa Sebelumnya (Diarsip) ── */}
          <div className="bg-white dark:bg-[#1d3024] rounded-2xl border border-gray-200 dark:border-[#263e2f] p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#263e2f] pb-3 mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-50 dark:bg-blue-950/60 rounded-lg">
                  <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 dark:text-gray-100 text-sm flex items-center gap-2">
                    Riwayat Periode Sewa Sebelumnya
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#243e2e] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#2d4b38]">
                      {histories.length} Periode
                    </span>
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Daftar arsip periode kontrak terdahulu yang telah selesai atau diperpanjang
                  </p>
                </div>
              </div>
            </div>

            {histories.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/70 dark:bg-[#16251b] rounded-xl border border-dashed border-gray-200 dark:border-[#263e2f]">
                <Clock className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Belum ada riwayat periode sewa sebelumnya</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                  Ketika sewa diperpanjang kembali di masa depan, periode sebelumnya otomatis diarsipkan ke sini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-[#243e2e] text-gray-700 dark:text-gray-200 font-bold border-b border-gray-200 dark:border-[#263e2f]">
                      <th className="p-3 w-14 text-center">No</th>
                      <th className="p-3 w-28">Tgl Mulai</th>
                      <th className="p-3 w-28">Tgl Berakhir</th>
                      {type === "tanah" ? (
                        <>
                          <th className="p-3 w-40">No. SHGB</th>
                          <th className="p-3 w-40">No. Sertifikat</th>
                          <th className="p-3 w-40">No. IMB</th>
                        </>
                      ) : (
                        <th className="p-3 w-48">
                          {isPerangkatOrInventory ? "Vendor" : "Biaya / Dokumen"}
                        </th>
                      )}
                      {isPerangkatOrInventory && (
                        <>
                          <th className="p-3 w-28 text-center">Jumlah Barang</th>
                          <th className="p-3 w-32">Harga Satuan</th>
                          <th className="p-3 w-32">Biaya Sewa</th>
                        </>
                      )}
                      {!isPerangkatOrInventory && type !== "tanah" && <th className="p-3">Keterangan Catatan</th>}
                      <th className="p-3 w-36 text-right">Diarsip Pada / Oleh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#263e2f]">
                    {histories.map((h, idx) => {
                      const hQtyNum = (h.kuantitas !== null && h.kuantitas !== undefined && h.kuantitas !== "") ? Number(h.kuantitas) : null;
                      const finalQty = (hQtyNum !== null && hQtyNum > 0)
                        ? hQtyNum
                        : (currentKuantitas !== "-" && Number(currentKuantitas) > 0 ? currentKuantitas : (hQtyNum !== null && hQtyNum > 0 ? hQtyNum : "-"));

                      return (
                        <tr key={h.id || idx} className="hover:bg-slate-50 dark:hover:bg-[#22392b] transition-colors">
                          <td className="p-3 text-center font-semibold text-gray-500">
                            {histories.length - idx}
                          </td>
                          <td className="p-3 font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                            {formatDate(h.tgl_mulai)}
                          </td>
                          <td className="p-3 font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                            {formatDate(h.tgl_selesai)}
                          </td>
                          {type === "tanah" ? (
                            <>
                              <td className="p-3 font-medium text-gray-800 dark:text-gray-200 whitespace-pre-line leading-tight">
                                {h.no_shgb || h.no_dokumen || "-"}
                              </td>
                              <td className="p-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                {h.no_sertifikat || item.no_sertifikat || item.no_sertifikat_gabungan || item.no_sertifikat_gabung || "-"}
                              </td>
                              <td className="p-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                {h.no_imb || item.no_imb || "-"}
                              </td>
                            </>
                          ) : (
                            <td className="p-3">
                              {isPerangkatOrInventory ? (
                                <div>
                                  <p className="font-semibold text-blue-900 dark:text-blue-300">{h.vendor || h.penyedia || h.vendor_nama || "-"}</p>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">SPK: {h.no_spk || (h.no_dokumen && !h.no_pks ? h.no_dokumen : "-")}</p>
                                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">PKS: {h.no_pks || "-"}</p>
                                </div>
                              ) : (
                                h.biaya ? formatHarga(h.biaya) : (h.no_dokumen || h.vendor || "-")
                              )}
                            </td>
                          )}
                          {isPerangkatOrInventory && (
                            <>
                              <td className="p-3 text-center font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                {finalQty !== "-" ? `${finalQty} ${h.satuan || currentSatuan}` : "-"}
                              </td>
                              <td className="p-3 font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                {formatHarga(h.harga_satuan)}
                              </td>
                              <td className="p-3 font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                {formatHarga(h.biaya)}
                              </td>
                            </>
                          )}
                          {!isPerangkatOrInventory && type !== "tanah" && (
                            <td className="p-3 text-gray-600 dark:text-gray-300 text-xs">
                              {h.keterangan || "-"}
                            </td>
                          )}
                          <td className="p-3 text-right text-gray-400 font-mono text-[11px] whitespace-nowrap">
                            <div>{formatDateTime(h.created_at)}</div>
                            {h.user_email && <div className="text-[10px] text-gray-500">{h.user_email}</div>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white dark:bg-[#1a2b20] border-t border-gray-100 dark:border-[#213527] flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#243e2e] dark:hover:bg-[#2e4f3b] text-gray-700 dark:text-gray-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
