// resources/js/Components/Bangunan/Sewa/SewaTable.jsx
import React, { useState } from "react";
import { Edit, Trash2, Calendar, User, DollarSign, Building, Eye } from "lucide-react";
import DetailHistoryModal from "@/Components/Common/DetailHistoryModal";

export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatPeriodeSewa = (val) => {
  if (!val) return "-";
  const str = String(val).trim();
  if (!str) return "-";

  // If it contains alphabetic text, return it but normalize common terms
  if (/[a-zA-Z]/.test(str)) {
    return str
      .replace(/tahun/gi, "Thn")
      .replace(/bulan/gi, "Bln")
      .replace(/hari/gi, "Hari");
  }

  const num = parseFloat(str);
  if (isNaN(num)) return str;

  const years = Math.floor(num);
  const fraction = num - years;
  const months = Math.round(fraction * 12);

  const result = [];
  if (years > 0) result.push(`${years} Thn`);
  if (months > 0) result.push(`${months} Bln`);
  if (result.length === 0 && num > 0) {
    const totalDays = Math.round(num * 365.25);
    if (totalDays > 0) return `${totalDays} Hari`;
  }
  return result.join(" ") || "-";
};

export const hitungSisaWaktu = (tanggalSelesai) => {
  if (!tanggalSelesai) return "—";
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);
  const tglSelesai = new Date(tanggalSelesai);
  tglSelesai.setHours(0, 0, 0, 0);

  if (tglSelesai < hariIni) {
    const diffTime = hariIni.getTime() - tglSelesai.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 30) {
      return `> ${diffDays} hari`;
    } else {
      const diffMonths = (hariIni.getFullYear() - tglSelesai.getFullYear()) * 12 + (hariIni.getMonth() - tglSelesai.getMonth());
      return `> ${diffMonths > 0 ? diffMonths : 0} bln`;
    }
  }

  const diffTime = tglSelesai.getTime() - hariIni.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 30) {
    return `< ${diffDays} hari`;
  } else {
    const diffMonths = (tglSelesai.getFullYear() - hariIni.getFullYear()) * 12 + (tglSelesai.getMonth() - hariIni.getMonth());
    return `${diffMonths > 0 ? diffMonths : 0} bln`;
  }
};

export const getStatusInfo = (sewa) => {
  if (sewa.status === "Done" || sewa.status === "Selesai") return "Selesai";
  if (!sewa.tgl_kontrak_berakhir && !sewa.tanggal_kontrak_berakhir) return "Aktif";
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);
  const tglSelesai = new Date(sewa.tgl_kontrak_berakhir || sewa.tanggal_kontrak_berakhir);
  tglSelesai.setHours(0, 0, 0, 0);

  if (tglSelesai < hariIni) return "Sewa Habis";

  const diffTime = tglSelesai.getTime() - hariIni.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 30) return "Hampir Habis";
  return "Aktif";
};

export default function SewaTable({
  isLoading,
  paginatedData,
  filteredData,
  userRole,
  currentPage,
  totalPages,
  startIndex,
  itemsPerPage,
  setCurrentPage,
  onEdit,
  onDelete,
  onDetail,
  localStatuses = {},
  onStatusChange,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [detailItem, setDetailItem] = useState(null);

  React.useEffect(() => {
    const handleReset = () => {
      setSelectedId(null);
      setHoveredId(null);
    };
    window.addEventListener("reset-all-filters", handleReset);
    return () => window.removeEventListener("reset-all-filters", handleReset);
  }, []);

  const formatHarga = (harga) => {
    if (!harga) return "—";
    return `Rp\u00A0${Number(harga).toLocaleString("id-ID")}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Selesai":
      case "Done":
        return "bg-blue-100 text-blue-800 border-blue-300 font-extrabold shadow-sm";
      case "Aktif":
        return "bg-green-50 text-green-700 border-green-200";
      case "Hampir Habis":
        return "bg-red-50 text-red-700 border-red-200";
      case "Sewa Habis":
      case "Expired":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

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
        <table className="w-full text-left border-collapse min-w-[2200px] table-fixed">
          <thead>
            <tr className="bg-[#0d5c3a] text-slate-100 text-[11px] font-bold uppercase tracking-wider text-center">
              <th className="p-2.5 w-[50px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">No</th>
              <th className="p-2.5 w-[100px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Kode Outlet</th>
              <th className="p-2.5 w-[200px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Nama Outlet</th>
              <th className="p-2.5 w-[100px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Type Outlet</th>
              <th className="p-2.5 w-[120px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Type Bangunan</th>
              <th className="p-2.5 w-[90px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Jenis STO</th>
              <th className="p-2.5 w-[80px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Sisa Waktu</th>
              <th className="p-2.5 w-[150px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Status</th>
              <th className="p-2.5 w-[120px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Harga Sewa</th>
              <th className="p-2.5 w-[110px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Status Gedung</th>
              <th className="p-2.5 w-[110px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Periode Sewa</th>
              <th className="p-2.5 w-[130px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Tgl. Kontrak Mulai</th>
              <th className="p-2.5 w-[130px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Tgl. Kontrak Berakhir</th>
              <th className="p-2.5 w-[180px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Keterangan</th>
              <th className="p-2.5 w-[220px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Alamat</th>
              <th className="p-2.5 w-[130px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Kelurahan</th>
              <th className="p-2.5 w-[130px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Kecamatan</th>
              <th className="p-2.5 w-[130px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Kab/Kota</th>
              <th className="p-2.5 w-[130px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Provinsi</th>
              <th className="p-2.5 w-[100px] text-center align-middle border border-[#0a4228] bg-[#0d5c3a]">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-xs text-gray-800 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan="20" className="p-4 text-center text-gray-400 border border-slate-200 bg-white">
                  Memuat data...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan="20" className="p-4 text-center text-gray-400 border border-slate-200 bg-white">
                  Tidak ada data sewa ditemukan.
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => {
                const globalIndex = startIndex + index + 1;
                const status = getStatusInfo(item);
                const isEven = index % 2 !== 0;
                
                const isSelected = selectedId === item.id;
                const isHovered = hoveredId === item.id;

                let bgClass = "";
                if (isSelected) {
                  bgClass = isHovered 
                    ? "bg-blue-200 text-blue-950 dark:bg-[#2e4c37] dark:text-[#f1f5f3]" 
                    : "bg-blue-100 text-blue-900 dark:bg-[#1f3526] dark:text-[#48a359]";
                } else if (isHovered) {
                  bgClass = "bg-slate-200 text-gray-900 dark:bg-[#273f2f] dark:text-[#f1f5f3]";
                } else {
                  bgClass = isEven 
                    ? "bg-slate-100 text-gray-800 dark:bg-[#213527] dark:text-[#d1dcd4]" 
                    : "bg-white text-gray-800 dark:bg-[#1a2b20] dark:text-[#d1dcd4]";
                }

                return (
                  <tr
                    key={item.id}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => setSelectedId((prev) => (prev === item.id ? null : item.id))}
                    className={`transition-colors duration-150 cursor-pointer ${bgClass}`}
                  >
                    <td className="p-2 border border-slate-200 text-center align-middle text-xs font-medium">{globalIndex}</td>
                    <td className="p-2 border border-slate-200 align-middle font-semibold text-gray-900">
                      {item.kode_outlet && item.kode_outlet.startsWith("OT_") ? "-" : item.kode_outlet || "-"}
                    </td>
                    <td className="p-2 border border-slate-200 align-middle font-semibold text-gray-900">{item.nama_outlet || "-"}</td>
                    <td className="p-2 border border-slate-200 align-middle text-gray-600">{item.type_outlet || "-"}</td>
                    <td className="p-2 border border-slate-200 align-middle text-gray-600">{item.type_bangunan || "-"}</td>
                    <td className="p-2 border border-slate-200 align-middle text-gray-600">{item.jenis_sto || "-"}</td>
                    <td className="p-2 border border-slate-200 text-center align-middle font-medium text-xs">
                      <span className={(status === "Hampir Habis" || status === "Sewa Habis") ? "text-red-600 font-bold" : "text-gray-700"}>
                        {hitungSisaWaktu(item.tgl_kontrak_berakhir || item.tanggal_kontrak_berakhir)}
                      </span>
                    </td>
                    <td className="p-2 border border-slate-200 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                      {(() => {
                        const originalStatus = item.status === "Done" || item.status === "Selesai" ? "Selesai" : status;
                        const currentStatus = localStatuses[item.id] !== undefined 
                          ? localStatuses[item.id] 
                          : originalStatus;

                        const displayStatus = currentStatus === "Done" || currentStatus === "Selesai" 
                          ? "Selesai" 
                          : (currentStatus === "Expired" ? "Sewa Habis" : currentStatus);

                        if (userRole === "guest") {
                          return (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${getStatusBadge(currentStatus)}`} style={{ minWidth: '105px', textAlign: 'center' }}>
                              {displayStatus}
                            </span>
                          );
                        }

                        if (originalStatus === "Expired" || originalStatus === "Sewa Habis") {
                          return (
                            <select
                              value={displayStatus}
                              onChange={(e) => onStatusChange(item.id, e.target.value)}
                              className={`text-center pl-2 pr-5 py-0.5 rounded text-[10px] font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${getStatusBadge(currentStatus)}`}
                              style={{ minWidth: '105px', textAlignLast: 'center' }}
                            >
                              <option value="Sewa Habis" className="bg-white text-gray-800">Sewa Habis</option>
                              <option value="Selesai" className="bg-white text-gray-800">Selesai</option>
                            </select>
                          );
                        } else if (originalStatus === "Hampir Habis") {
                          return (
                            <select
                              value={displayStatus}
                              onChange={(e) => onStatusChange(item.id, e.target.value)}
                              className={`text-center pl-2 pr-5 py-0.5 rounded text-[10px] font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${getStatusBadge(currentStatus)}`}
                              style={{ minWidth: '105px', textAlignLast: 'center' }}
                            >
                              <option value="Hampir Habis" className="bg-white text-gray-800">Hampir Habis</option>
                              <option value="Selesai" className="bg-white text-gray-800">Selesai</option>
                            </select>
                          );
                        } else if (originalStatus === "Selesai") {
                          const naturalStatus = getStatusInfo({ ...item, status: null });
                          return (
                            <select
                              value={displayStatus}
                              onChange={(e) => onStatusChange(item.id, e.target.value)}
                              className={`text-center pl-2 pr-5 py-0.5 rounded text-[10px] font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${getStatusBadge(currentStatus)}`}
                              style={{ minWidth: '105px', textAlignLast: 'center' }}
                            >
                              <option value="Selesai" className="bg-white text-gray-800">Selesai</option>
                              <option value={naturalStatus} className="bg-white text-gray-800">
                                {naturalStatus === "Expired" || naturalStatus === "Sewa Habis" ? "Sewa Habis" : naturalStatus}
                              </option>
                            </select>
                          );
                        } else {
                          return (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${getStatusBadge(currentStatus)}`} style={{ minWidth: '105px', textAlign: 'center' }}>
                              {displayStatus}
                            </span>
                          );
                        }
                      })()}
                    </td>
                    <td className="p-2 border border-slate-200 align-middle text-gray-900 font-medium whitespace-nowrap">{formatHarga(item.harga_sewa)}</td>
                    <td className="p-2 border border-slate-200 align-middle text-gray-600">{item.status_gedung || "-"}</td>
                    <td className="p-2 border border-slate-200 text-center align-middle text-gray-600">
                      {formatPeriodeSewa(item.periode_sewa)}
                    </td>
                    <td className="p-2 border border-slate-200 align-middle text-xs text-gray-600">{formatDate(item.tgl_kontrak_mulai || item.tanggal_kontrak_mulai)}</td>
                    <td className="p-2 border border-slate-200 align-middle text-xs text-gray-600">{formatDate(item.tgl_kontrak_berakhir || item.tanggal_kontrak_berakhir)}</td>
                    <td className="p-2 border border-slate-200 align-middle text-gray-600 truncate max-w-xs" title={item.keterangan}>{item.keterangan || "-"}</td>
                    <td className="p-2 border border-slate-200 align-middle text-gray-600 truncate max-w-xs" title={item.alamat}>{item.alamat || "-"}</td>
                    <td className="p-2 border border-slate-200 align-middle text-gray-600">{item.kelurahan || "-"}</td>
                    <td className="p-2 border border-slate-200 align-middle text-gray-600">{item.kecamatan || "-"}</td>
                    <td className="p-2 border border-slate-200 align-middle text-gray-600">{item.kab_kota || "-"}</td>
                    <td className="p-2 border border-slate-200 align-middle text-gray-600">{item.provinsi || "-"}</td>
                    <td className="p-2 border border-slate-200 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setDetailItem(item)}
                          title="Detail & Riwayat Periode"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {userRole === "admin" && (
                          <>
                            <button
                              type="button"
                              onClick={() => onEdit(item)}
                              title="Edit Data"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(item.id, item.nama_outlet)}
                              title="Hapus Data"
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
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
        <div className="px-6 py-4 border-t border-slate-200/85 flex items-center justify-between bg-slate-50/30">
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
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  currentPage === page
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
        type="sewa"
        onEditItem={onEdit}
      />
    </div>
  );
}
