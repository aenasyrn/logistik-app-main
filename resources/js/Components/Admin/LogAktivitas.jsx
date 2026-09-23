import { useState } from "react";
import {
  Activity,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock
} from "lucide-react";

export default function LogAktivitas({ logs = [], currentUser, userRole = "user" }) {
  const [searchQuery, setSearchQuery] = useState("");

  // === LOGIKA PAGINASI ===
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Helper untuk cek apakah log milik admin
  const isLogAdmin = (log) => {
    if (log.is_admin) return true;
    const email = log.user_email?.toLowerCase() || "";
    return email.startsWith("admin@") || email === "admin@logistik.co.id" || email === "admin@system.com";
  };

  // Base logs: Jika role bukan admin, hilangkan semua aktivitas admin
  const baseLogs = userRole === "admin"
    ? logs
    : logs.filter((l) => !isLogAdmin(l));

  // Filter pencarian
  const filteredLogs = baseLogs.filter(
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Activity className="w-6 h-6 text-[#0d5c3a] dark:text-emerald-400" />
              {userRole === "admin" ? "Log Aktivitas Sistem" : "Log Aktivitas"}
            </h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {userRole === "admin"
              ? "Pantau rekam jejak riwayat aktivitas pengguna dan administrator di sistem."
              : "Menampilkan riwayat rekam jejak aktivitas operasional pengguna."}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap justify-between items-center gap-3">
          <div className="flex flex-wrap items-center gap-3">
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

            {/* Show Entries Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <span>Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="pl-3 pr-8 py-1.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs cursor-pointer font-medium shadow-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={10000}>All</option>
              </select>
              <span>entries</span>
            </div>
          </div>

          <div className="bg-emerald-50 text-[#0d5c3a] dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 px-4 py-2 rounded-xl text-xs font-bold shrink-0 max-w-fit">
            Total Data: {filteredLogs.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="text-xs uppercase text-gray-500 border-b border-gray-100 bg-white tracking-wider">
                <th className="p-4 font-semibold w-48">Waktu</th>
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
                        className={`inline-block w-16 text-center py-1 rounded text-[10px] font-bold ${(log.aksi?.toUpperCase() === "TAMBAH" || log.aksi?.toUpperCase() === "BUAT")
                            ? "bg-green-100 text-green-700"
                            : log.aksi?.toUpperCase() === "HAPUS"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
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
          <div className="px-6 py-4 border-t border-gray-100 bg-slate-50/30 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Menampilkan {startIndex + 1} sampai {Math.min(startIndex + itemsPerPage, filteredLogs.length)} dari {filteredLogs.length} data
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 cursor-pointer"
              >
                &lt; Prev
              </button>
              {getVisiblePages().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${currentPage === page
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
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 cursor-pointer"
              >
                Next &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
