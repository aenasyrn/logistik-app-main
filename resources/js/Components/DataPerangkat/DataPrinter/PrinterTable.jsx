// src/components/DataPerangkat/DataPrinter/PrinterTable.jsx
import React, { useState } from "react";
import {
  Loader2, AlertTriangle, QrCode, Edit, Trash2,
  ChevronLeft, ChevronRight, Eye,
} from "lucide-react";
import { formatBulanTahun, hitungSisaBulan, hitungSisaHari, getStatusBadge } from "../../../utils/deviceUtils";
import DetailHistoryModal from "@/Components/Common/DetailHistoryModal";

export default function PrinterTable({
  isLoading, paginatedData, filteredData, userRole,
  currentPage, totalPages, startIndex, itemsPerPage,
  setCurrentPage, onEdit, onDelete, onQr,
  inventoryList = [], onNavigateToMasterBarang,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [detailItem, setDetailItem] = useState(null);

  const getVisiblePages = () => {
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      return [...Array(totalPages)].map((_, i) => i + 1);
    }
    let start = currentPage - 2;
    let end = currentPage + 2;
    if (start < 1) {
      start = 1;
      end = maxVisible;
    } else if (end > totalPages) {
      end = totalPages;
      start = totalPages - maxVisible + 1;
    }
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse border border-slate-200 min-w-[1150px] table-fixed">
          <thead>
            <tr className="bg-[#0d5c3a] text-slate-100 text-[11px] font-bold uppercase tracking-wider text-center">
              <th className="p-2.5 w-[4%] text-center align-middle border border-[#0a4228] bg-[#0d5c3a] whitespace-nowrap">No</th>
              <th className="p-2.5 w-[18%] text-center align-middle border border-[#0a4228] bg-[#0d5c3a] whitespace-nowrap">Outlet</th>
              <th className="p-2.5 w-[18%] text-center align-middle border border-[#0a4228] bg-[#0d5c3a] whitespace-nowrap">Hardware & S/N</th>
              <th className="p-2.5 w-[13%] text-center align-middle border border-[#0a4228] bg-[#0d5c3a] whitespace-nowrap">Vendor</th>
              <th className="p-2.5 w-[14%] text-center align-middle border border-[#0a4228] bg-[#0d5c3a] whitespace-nowrap">Masa Sewa</th>
              <th className="p-2.5 w-[11%] text-center align-middle border border-[#0a4228] bg-[#0d5c3a] whitespace-nowrap">Status & Kondisi</th>
              <th className="p-2.5 w-[12%] text-center align-middle border border-[#0a4228] bg-[#0d5c3a] whitespace-nowrap">Keterangan</th>
              <th className="p-2.5 w-[10%] min-w-[140px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a] whitespace-nowrap">Aksi</th>
            </tr>
          </thead>

          <tbody className="text-xs text-gray-800 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan="8" className="p-10 text-center text-blue-500 border border-slate-200 bg-white">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  <p className="mt-2 text-gray-500 text-xs">Memuat data...</p>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500 text-xs border border-slate-200 bg-white">
                  Tidak ada data printer ditemukan.
                </td>
              </tr>
            ) : (
              paginatedData.map((printer, index) => {
                const globalIndex = startIndex + index + 1;
                const sisaBulan      = hitungSisaBulan(printer.tanggalSelesai);
                const sisaHari       = hitungSisaHari(printer.tanggalSelesai);

                // Status real-time: jika tanggal selesai sudah lewat -> Sewa Habis!
                const isExpired = sisaHari !== null && sisaHari < 0;
                // Sisa 1 minggu (0 sampai 7 hari)
                const isExpiringWithinWeek = sisaHari !== null && sisaHari >= 0 && sisaHari <= 7;
                // Segera berakhir (< 3 bulan)
                const isExpiringSoon =
                  !isExpired &&
                  sisaBulan !== null && sisaBulan <= 3 && sisaBulan >= 0;

                const realStatus = (!printer.tanggalMulai && !printer.tanggalSelesai)
                  ? "Inventaris"
                  : (isExpired ? "Sewa Habis" : "Sewa Berjalan");

                const isInventaris = realStatus === "Inventaris";

                const isEven = index % 2 !== 0;
                const isSelected = selectedId === printer.id;

                let bgClass = "";
                if (isSelected) {
                  bgClass = "bg-blue-100 text-blue-900 hover:bg-blue-200 hover:text-blue-950";
                } else {
                  const baseHover = "hover:bg-slate-200 hover:text-gray-900";
                  if (isExpired) {
                    bgClass = `bg-red-50/70 text-gray-800 ${baseHover}`;
                  } else if (isExpiringWithinWeek) {
                    bgClass = `bg-amber-50/70 text-gray-800 ${baseHover}`;
                  } else if (isExpiringSoon) {
                    bgClass = `bg-orange-50/70 text-gray-800 ${baseHover}`;
                  } else {
                    bgClass = `${isEven ? "bg-slate-100 text-gray-800" : "bg-white text-gray-800"} ${baseHover}`;
                  }
                }

                return (
                  <tr
                    key={printer.id}
                    onClick={() => setSelectedId((prev) => (prev === printer.id ? null : printer.id))}
                    className={`transition-colors duration-150 cursor-pointer ${bgClass}`}
                  >
                    {/* No */}
                    <td className="p-2 border border-slate-200 text-center align-middle font-medium text-gray-500">{globalIndex}</td>

                    {/* Outlet */}
                    <td className="p-2 border border-slate-200 align-middle">
                      <p className="font-semibold text-gray-800 text-xs">{printer.outlet || "-"}</p>
                      <p className="text-[10px] text-gray-500">
                        ID: {printer.idOutlet || printer.outlet_id || printer.outlet_rel?.code || printer.outlet_rel?.id || "-"}
                      </p>
                    </td>

                    {/* Hardware */}
                    <td className="p-2 border border-slate-200 align-middle">
                      <div className="relative group cursor-default">
                        <p className="font-medium text-gray-800 text-xs">{printer.produk}</p>
                        <div className="absolute left-0 top-full mt-1 z-[999] hidden group-hover:block bg-gray-900 text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl pointer-events-none">
                          <p className="!text-gray-400 mb-0.5">Document ID</p>
                          <p className="font-mono !text-white">{printer.id}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">SN: {printer.sn}</p>
                    </td>

                    {/* Vendor */}
                    <td className="p-2 border border-slate-200 align-middle text-xs font-semibold text-gray-700">
                      {printer.vendor}
                    </td>

                    {/* Masa Sewa */}
                    <td className="p-2 border border-slate-200 align-middle">
                      <div className={`text-[10px] flex items-center gap-1 ${isExpiringWithinWeek || isExpired ? "text-gray-800 font-medium" : "text-gray-600"}`}>
                        {printer.tanggalMulai || printer.tanggalSelesai ? (
                          `${formatBulanTahun(printer.tanggalMulai)} - ${formatBulanTahun(printer.tanggalSelesai)}`
                        ) : (
                          <span className="italic text-gray-400">Tidak ada data</span>
                        )}
                        {(isExpiringWithinWeek || isExpired) && (
                          <AlertTriangle className={`w-3 h-3 shrink-0 ${isExpired ? "text-red-500" : "text-amber-500"}`} title={isExpired ? "Sewa Habis" : "Segera Habis"} />
                        )}
                      </div>

                      {/* Notifikasi Masa Sewa jika sisa <= 1 minggu atau habis */}
                      {isExpiringWithinWeek && (
                        <div className="mt-1">
                          <p className="text-[10px] text-amber-700 font-bold bg-amber-100/70 w-max px-1.5 py-0.5 rounded border border-amber-300 animate-pulse">
                            {sisaHari === 0 ? "Habis Hari Ini!" : `Sisa ${sisaHari} hari lagi`}
                          </p>
                        </div>
                      )}

                      {isExpired && (
                        <div className="mt-1">
                          <p className="text-[10px] text-red-600 font-bold bg-red-100/60 w-max px-1.5 py-0.5 rounded border border-red-200">
                            {`Habis Masa Sewa ${sisaHari !== null ? Math.abs(sisaHari) : 0} hari lalu`}
                          </p>
                        </div>
                      )}

                      {!isExpired && !isExpiringWithinWeek && isExpiringSoon && (
                        <p className="text-[10px] text-orange-600 font-bold mt-0.5 bg-orange-100/50 w-max px-1.5 py-0.5 rounded">
                          {sisaBulan === 0 ? `Sisa ${sisaHari} hari` : `Sisa ${sisaBulan} bln`}
                        </p>
                      )}
                    </td>

                    {/* Status & Kondisi */}
                    <td className="p-2 border border-slate-200 text-center align-middle">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className={`inline-block w-24 text-center px-2 py-0.5 rounded text-[10px] font-bold border status-badge ${
                          realStatus === "Inventaris" ? "status-badge-inventaris" :
                          realStatus === "Sewa Berjalan" ? "status-badge-sewa-berjalan" :
                          "status-badge-sewa-habis"
                        } ${getStatusBadge(realStatus)}`}>
                          {realStatus}
                        </span>
                        <span className={`inline-block w-24 text-center px-1.5 py-0.5 rounded text-[10px] font-bold border kondisi-badge ${
                          printer.kondisi === "BAIK" ? "kondisi-badge-baik" : "kondisi-badge-rusak"
                        } ${
                          printer.kondisi === "BAIK"
                            ? "text-green-600 bg-green-50 border-green-100"
                            : "text-orange-600 bg-orange-50 border-orange-100"
                        }`}>
                          {printer.kondisi}
                        </span>
                      </div>
                    </td>

                    {/* Keterangan */}
                    <td className="p-2 border border-slate-200 align-middle">
                      <p className="text-[10px] text-gray-500 truncate" title={printer.keterangan}>
                        {printer.keterangan || "-"}
                      </p>
                    </td>

                    {/* Aksi */}
                    <td className="px-3 py-2 border border-slate-200 text-center align-middle">
                      <div className="flex justify-center items-center gap-1.5 whitespace-nowrap px-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setDetailItem(printer)}
                          title="Detail & Riwayat Periode"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {userRole === "admin" && (
                          <>
                            <button onClick={() => onEdit(printer)} title="Edit Data"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onDelete(printer.id, printer.produk || printer.sn);
                              }}
                              title="Hapus Data"
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/30">
          <span className="text-xs text-gray-500">
            Menampilkan {startIndex + 1} sampai {Math.min(startIndex + itemsPerPage, filteredData.length)} dari {filteredData.length} data
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              &lt; Prev
            </button>
            {getVisiblePages().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${currentPage === page
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                  }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next &gt;
            </button>
          </div>
        </div>
      )}
      {/* Detail & History Modal */}
      <DetailHistoryModal
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
        item={detailItem}
        type="printer"
        inventoryList={inventoryList}
        onNavigateToMasterBarang={onNavigateToMasterBarang}
      />
    </div>
  );
}