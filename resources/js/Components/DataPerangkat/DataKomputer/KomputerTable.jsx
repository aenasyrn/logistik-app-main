// src/components/DataPerangkat/DataKomputer/KomputerTable.jsx
"use client";

import React, { useState } from "react";
import {
  Loader2, Network, Cpu, HardDrive, AlertTriangle,
  QrCode, Edit, Trash2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { formatBulanTahun, hitungSisaBulan, hitungSisaHari, getStatusBadge } from "../../../utils/deviceUtils";

export default function KomputerTable({
  isLoading, paginatedData, filteredData, userRole,
  currentPage, totalPages, startIndex, itemsPerPage,
  setCurrentPage, onEdit, onDelete, onQr,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

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
        <table className="w-full text-left border-collapse border border-slate-200 min-w-[1200px]">
          <thead>
            <tr className="bg-blue-900 text-slate-100 text-[11px] font-bold uppercase tracking-wider text-center">
              <th className="p-2.5 w-12 text-center align-middle border border-blue-800 bg-blue-900">No</th>
              <th className="p-2.5 text-left align-middle border border-blue-800 bg-blue-900">Lokasi / Outlet</th>
              <th className="p-2.5 text-left align-middle border border-blue-800 bg-blue-900">Hardware & S/N</th>
              <th className="p-2.5 text-left align-middle border border-blue-800 bg-blue-900">Informasi Jaringan</th>
              <th className="p-2.5 text-left align-middle border border-blue-800 bg-blue-900 w-56">Spesifikasi Sistem</th>
              <th className="p-2.5 text-left align-middle border border-blue-800 bg-blue-900">Vendor & Sewa</th>
              <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Status & Kondisi</th>
              <th className="p-2.5 text-left align-middle border border-blue-800 bg-blue-900">Keterangan</th>
              {userRole === "admin" && (
                <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">Aksi</th>
              )}
            </tr>
          </thead>

          <tbody className="text-xs text-gray-800 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={userRole === "admin" ? "9" : "8"} className="p-10 text-center text-blue-500 border border-slate-200 bg-white">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  <p className="mt-2 text-gray-500 text-xs">Memuat data...</p>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={userRole === "admin" ? "9" : "8"} className="p-6 text-center text-gray-500 text-xs border border-slate-200 bg-white">
                  Tidak ada data komputer ditemukan.
                </td>
              </tr>
            ) : (
              paginatedData.map((comp, index) => {
                const globalIndex = startIndex + index + 1;
                const sisaBulan      = hitungSisaBulan(comp.tanggalSelesai);
                const sisaHari       = hitungSisaHari(comp.tanggalSelesai);
                const isExpiringSoon =
                  comp.status === "Sewa Berjalan" &&
                  sisaBulan !== null && sisaBulan <= 3 && sisaBulan >= 0;
                const isExpired = comp.status === "Sewa Habis";

                const isEven = index % 2 !== 0;
                const isSelected = selectedId === comp.id;
                const isHovered = hoveredId === comp.id;

                let bgClass = "";
                if (isSelected) {
                  bgClass = isHovered ? "bg-blue-200 text-blue-950" : "bg-blue-100 text-blue-900";
                } else if (isHovered) {
                  bgClass = "bg-slate-200 text-gray-900";
                } else if (isExpired) {
                  bgClass = "bg-red-50/70 text-gray-800";
                } else if (isExpiringSoon) {
                  bgClass = "bg-orange-50/70 text-gray-800";
                } else {
                  bgClass = isEven ? "bg-slate-100 text-gray-800" : "bg-white text-gray-800";
                }

                return (
                  <tr
                    key={comp.id}
                    onMouseEnter={() => setHoveredId(comp.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => setSelectedId((prev) => (prev === comp.id ? null : comp.id))}
                    className={`transition-colors duration-150 cursor-pointer ${bgClass}`}
                  >
                    {/* No */}
                    <td className="p-2 border border-slate-200 text-center align-middle font-medium text-gray-500">{globalIndex}</td>
                    
                    {/* Lokasi */}
                    <td className="p-2 border border-slate-200 align-middle">
                      <p className="font-semibold text-gray-800 text-xs">{comp.outlet}</p>
                      <p className="text-[10px] text-gray-500">ID: {comp.idOutlet}</p>
                    </td>

                    {/* Hardware */}
                    <td className="p-2 border border-slate-200 align-middle">
                      <div className="relative group cursor-default">
                        <p className="font-bold text-gray-800 text-xs">{comp.produk}</p>
                        <div className="absolute left-0 top-full mt-1 z-[999] hidden group-hover:block bg-gray-900 text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl pointer-events-none">
                          <p className="font-mono !text-white">{comp.id}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">SN: {comp.sn}</p>
                    </td>

                    {/* Jaringan */}
                    <td className="p-2 border border-slate-200 align-middle">
                      <p className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                        <Network className="w-3 h-3" /> {comp.ipAddress || "-"}
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                        MAC: {comp.macAddress || "-"}
                      </p>
                    </td>

                    {/* Spesifikasi */}
                    <td className="p-2 border border-slate-200 align-middle">
                      <p className="text-[11px] font-semibold text-gray-800 flex items-center gap-1 mb-0.5 truncate" title={comp.cpu}>
                        <Cpu className="w-3 h-3 text-gray-400 shrink-0" />
                        {comp.cpu || "-"}
                      </p>
                      <div className="flex gap-1.5 text-[10px] text-gray-600 mb-0.5">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded font-medium border border-gray-200/50">
                          RAM: {comp.ram || "-"}
                        </span>
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 border border-gray-200/50">
                          <HardDrive className="w-2.5 h-2.5" /> {comp.storage || "-"}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 truncate" title={comp.os}>
                        {comp.os || "OS Tidak Diketahui"}
                      </p>
                    </td>

                    {/* Vendor & Sewa */}
                    <td className="p-2 border border-slate-200 align-middle">
                      <p className="font-semibold text-gray-900 text-[11px] mb-0.5">{comp.penyedia}</p>
                      <div className={`text-[10px] flex items-center gap-1 ${isExpiringSoon || isExpired ? "text-gray-800 font-medium" : "text-gray-500"}`}>
                        {comp.tanggalMulai || comp.tanggalSelesai
                          ? `${formatBulanTahun(comp.tanggalMulai)} - ${formatBulanTahun(comp.tanggalSelesai)}`
                          : "-"}
                        {(isExpiringSoon || isExpired) && (
                          <AlertTriangle className={`w-3 h-3 shrink-0 ${isExpired ? "text-red-500" : "text-orange-500"}`} title={isExpired ? "Sewa Habis" : "Segera Habis"} />
                        )}
                      </div>
                      {isExpiringSoon && (
                        <p className="text-[10px] text-orange-600 font-bold mt-0.5 bg-orange-100/50 w-max px-1.5 py-0.5 rounded">
                          {sisaBulan === 0 ? `Sisa ${sisaHari} hari` : `Sisa ${sisaBulan} bln`}
                        </p>
                      )}
                      {isExpired && (
                        <p className="text-[10px] text-red-600 font-bold mt-0.5 bg-red-100/60 w-max px-1.5 py-0.5 rounded border border-red-200">
                          {sisaBulan === 0
                            ? `Habis Masa Sewa ${sisaHari !== null ? Math.abs(sisaHari) : 0} hari`
                            : `Habis Masa Sewa ${sisaBulan !== null ? Math.abs(sisaBulan) : 0} bln`}
                        </p>
                      )}
                    </td>

                    {/* Status & Kondisi */}
                    <td className="p-2 border border-slate-200 text-center align-middle">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(comp.status)}`}>
                          {comp.status}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          comp.kondisi === "BAIK"
                            ? "text-green-600 bg-green-50 border-green-100"
                            : "text-orange-600 bg-orange-50 border-orange-100"
                        }`}>
                          {comp.kondisi}
                        </span>
                      </div>
                    </td>
                    
                    {/* Keterangan */}
                    <td className="p-2 border border-slate-200 align-middle">
                      <p className="text-[10px] text-gray-500 truncate" title={comp.keterangan}>
                        {comp.keterangan || "-"}
                      </p>
                    </td>

                    {/* Aksi */}
                    {userRole === "admin" && (
                      <td className="p-2 border border-slate-200 text-center align-middle">
                        <div className="flex justify-center items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => onQr(comp)} title="Cetak Label QR Code"
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-200">
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <div className="w-px h-5 bg-gray-200 my-auto mx-0.5" />
                          <button onClick={() => onEdit(comp)} title="Edit Data"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(comp.id, comp.produk || comp.sn)}
                            title="Hapus Data"
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
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
    </div>
  );
}