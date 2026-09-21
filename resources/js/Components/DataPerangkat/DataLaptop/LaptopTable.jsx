import React, { useState } from "react";
import { Eye, Edit, Trash2, Laptop, Calendar, Building, Cpu, Layers } from "lucide-react";
import DetailHistoryModal from "@/Components/Common/DetailHistoryModal";

// Helper hitung sisa bulan
const hitungSisaBulan = (tanggalSelesai) => {
  if (!tanggalSelesai) return null;
  const hariIni = new Date();
  const tglSelesai = new Date(tanggalSelesai);
  if (isNaN(tglSelesai)) return null;
  return (
    (tglSelesai.getFullYear() - hariIni.getFullYear()) * 12 +
    (tglSelesai.getMonth() - hariIni.getMonth())
  );
};

// Helper hitung sisa hari
const hitungSisaHari = (tanggalSelesai) => {
  if (!tanggalSelesai) return null;
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);
  const tglSelesai = new Date(tanggalSelesai);
  tglSelesai.setHours(0, 0, 0, 0);
  const diffTime = tglSelesai.getTime() - hariIni.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function LaptopTable({
  userRole,
  filteredData = [],
  onEdit,
  onDelete,
  inventoryList = [],
  onNavigateToMasterBarang,
  currentPage = 1,
  itemsPerPage = 10,
  setCurrentPage,
  totalPages = 1,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [detailItem, setDetailItem] = useState(null);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Sewa Berjalan":
        return "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700";
      case "Sewa Habis":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800";
    }
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse border border-slate-200 dark:border-[#213527] min-w-[1050px] table-fixed">
          <thead>
            <tr className="bg-[#0d5c3a] text-white text-[11px] font-bold uppercase tracking-wider text-center">
              <th className="p-2.5 w-[4%] text-center align-middle border border-[#0a4228] bg-[#0d5c3a] whitespace-nowrap">NO</th>
              <th className="p-2.5 w-[20%] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">PENGGUNA & JABATAN</th>
              <th className="p-2.5 w-[18%] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">HOSTNAME & S/N</th>
              <th className="p-2.5 w-[18%] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">DEPARTEMEN</th>
              <th className="p-2.5 w-[16%] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">OS & VENDOR</th>
              <th className="p-2.5 w-[14%] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">SEWA & STATUS</th>
              <th className="p-2.5 w-[10%] min-w-[110px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a] whitespace-nowrap">AKSI</th>
            </tr>
          </thead>
          <tbody className="text-xs text-gray-800 bg-white">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-400 dark:text-gray-500 bg-white dark:bg-[#16251b]">
                  <Laptop className="w-10 h-10 mx-auto mb-2 opacity-30 text-gray-400" />
                  <p className="font-semibold text-xs">Belum ada data laptop yang ditemukan.</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => {
                const globalIndex = startIndex + idx + 1;
                const isSelected = selectedId === item.id;
                const isEven = idx % 2 === 0;

                const sisaBulan = hitungSisaBulan(item.tanggalSelesai || item.tanggal_selesai);
                const sisaHari = hitungSisaHari(item.tanggalSelesai || item.tanggal_selesai);
                const status = item.status || "Inventaris";
                const isInventaris = status.trim().toLowerCase() === "inventaris" || (!item.tanggalMulai && !item.tanggal_mulai && !item.tanggalSelesai && !item.tanggal_selesai);

                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedId((p) => (p === item.id ? null : item.id))}
                    className={`transition-colors duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50/70 text-emerald-950 dark:bg-[#203a29] dark:text-emerald-100"
                        : isEven
                        ? "bg-white dark:bg-[#16251b] text-gray-800 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-[#1c3023]"
                        : "bg-slate-50/60 dark:bg-[#192b1f] text-gray-800 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-[#203627]"
                    }`}
                  >
                    {/* No */}
                    <td className="p-3 border border-slate-200 dark:border-[#243d2c] text-center font-semibold text-gray-500">
                      {globalIndex}
                    </td>

                    {/* 1. PENGGUNA & JABATAN */}
                    <td className="p-3 border border-slate-200 dark:border-[#243d2c] align-middle">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-gray-900 dark:text-gray-100 text-xs">
                          {item.namaPengguna || item.nama_pengguna || "-"}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-[#213527] text-gray-600 dark:text-gray-300 rounded border border-gray-200 dark:border-[#2d4b38]">
                            NIK: {item.nikPegawai || item.nik_pegawai || "-"}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                          {item.jabatan || "-"}
                        </span>
                      </div>
                    </td>

                    {/* 2. HOSTNAME & S/N */}
                    <td className="p-3 border border-slate-200 dark:border-[#243d2c] align-middle">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold font-mono text-xs text-[#0d5c3a] dark:text-emerald-400">
                          {item.hostname || "-"}
                        </span>
                        <span className="text-[11px] font-mono text-gray-600 dark:text-gray-300">
                          SN: {item.sn || "-"}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate" title={item.produk}>
                          Model: {item.produk || "-"}
                        </span>
                      </div>
                    </td>

                    {/* 3. DEPARTEMEN */}
                    <td className="p-3 border border-slate-200 dark:border-[#243d2c] align-middle">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-[#203627] text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-[#2d4b38]">
                        {item.departemen || "-"}
                      </span>
                    </td>

                    {/* 4. OS & VENDOR */}
                    <td className="p-3 border border-slate-200 dark:border-[#243d2c] align-middle">
                      <div className="flex flex-col gap-1">
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                            {item.os || "-"}
                          </span>
                        </div>
                        <span className="font-semibold text-xs text-blue-900 dark:text-blue-300 truncate" title={item.penyedia || item.vendor}>
                          {item.penyedia || item.vendor || "-"}
                        </span>
                      </div>
                    </td>

                    {/* 5. SEWA & STATUS */}
                    <td className="p-3 border border-slate-200 dark:border-[#243d2c] align-middle">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold border ${getStatusBadge(status)}`}>
                            {status}
                          </span>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                            (item.kondisi || "BAIK").toUpperCase() === "BAIK"
                              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/60 dark:text-green-300"
                              : "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300"
                          }`}>
                            {item.kondisi || "BAIK"}
                          </span>
                        </div>

                        {!isInventaris && (item.tanggalMulai || item.tanggal_mulai) && (
                          <div className="text-[10px] text-gray-500 dark:text-gray-400">
                            <span>{formatDate(item.tanggalMulai || item.tanggal_mulai)}</span> s/d{" "}
                            <span>{formatDate(item.tanggalSelesai || item.tanggal_selesai)}</span>
                            {sisaBulan !== null && sisaBulan >= 0 && (
                              <span className="block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                Sisa: {sisaBulan} bln ({sisaHari} hari)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 6. AKSI */}
                    <td className="p-3 border border-slate-200 dark:border-[#243d2c] text-center align-middle">
                      <div className="flex justify-center items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {!isInventaris && (
                          <button
                            type="button"
                            onClick={() => setDetailItem(item)}
                            title="Detail & Riwayat Periode"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {userRole === "admin" && (
                          <>
                            <button
                              type="button"
                              onClick={() => onEdit(item)}
                              title="Edit Data Laptop"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(item.id, item.sn || item.namaPengguna || "Laptop")}
                              title="Hapus Data Laptop"
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 cursor-pointer"
                            >
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

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200 dark:border-[#213527] flex items-center justify-between bg-slate-50/40 dark:bg-[#15241b]">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Menampilkan {startIndex + 1} sampai {Math.min(startIndex + itemsPerPage, filteredData.length)} dari {filteredData.length} data
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-[#2a4a34] bg-white dark:bg-[#1a2e22] hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              &lt; Prev
            </button>
            {getVisiblePages().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  currentPage === page
                    ? "bg-[#0d5c3a] border-[#0d5c3a] text-white font-bold"
                    : "border-gray-200 dark:border-[#2a4a34] bg-white dark:bg-[#1a2e22] hover:bg-gray-50 text-gray-700 dark:text-gray-300"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-[#2a4a34] bg-white dark:bg-[#1a2e22] hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              Next &gt;
            </button>
          </div>
        </div>
      )}

      {/* Modal Detail & Riwayat Periode Sewa */}
      <DetailHistoryModal
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
        item={detailItem}
        type="laptop"
        inventoryList={inventoryList}
        onNavigateToMasterBarang={onNavigateToMasterBarang}
      />
    </div>
  );
}
