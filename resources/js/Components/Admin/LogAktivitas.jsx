"use client";

import { useState } from "react";
import {
  Activity,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";

export default function LogAktivitas({ logs }) {
  const [searchQuery, setSearchQuery] = useState("");

  // === LOGIKA PAGINASI ===
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Jumlah data per halaman

  // Filter pencarian
  const filteredLogs = logs.filter(
    (log) =>
      log.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.aksi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.modul?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.keterangan?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Kalkulasi Paginasi
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Format Tanggal
  const formatDateTime = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Reset halaman ke 1 setiap kali mencari
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" /> Log Aktivitas Sistem
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Pantau rekam jejak aktivitas pengguna.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari aktivitas, email, atau modul..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="text-sm font-medium text-gray-500">
            Total Data: {filteredLogs.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="text-xs uppercase text-gray-500 border-b border-gray-100 bg-white tracking-wider">
                <th className="p-4 font-semibold w-48">Waktu Kejadian</th>
                <th className="p-4 font-semibold w-56">Pengguna (Email)</th>
                <th className="p-4 font-semibold w-32">Aksi</th>
                <th className="p-4 font-semibold w-40">Modul</th>
                <th className="p-4 font-semibold">Keterangan</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    Tidak ada catatan log aktivitas.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="p-4 text-gray-500 text-xs flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />{" "}
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="p-4 font-medium text-gray-800">
                      {log.user_email}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold ${log.aksi === "TAMBAH" || log.aksi === "BUAT" ? "bg-green-100 text-green-700" : log.aksi === "HAPUS" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}
                      >
                        {log.aksi}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 font-medium text-xs">
                      {log.modul}
                    </td>
                    <td className="p-4 text-gray-700">{log.keterangan}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* UI KONTROL PAGINASI */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Menampilkan{" "}
              <span className="font-bold text-gray-900">{startIndex + 1}</span>{" "}
              -{" "}
              <span className="font-bold text-gray-900">
                {Math.min(startIndex + itemsPerPage, filteredLogs.length)}
              </span>{" "}
              dari{" "}
              <span className="font-bold text-gray-900">
                {filteredLogs.length}
              </span>{" "}
              data
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg border border-gray-200">
                Hal {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
