"use client";

import { useState } from "react";
import { Search, Download, FileText, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

export default function RiwayatTransaksi({ transactions, setFormData, setItems, setActiveTransaction, setView }) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // === LOGIKA PAGINASI ===
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredTransactions = transactions.filter((trx) => {
    const query = searchQuery.toLowerCase();
    const matchSurat = trx.nomorSurat?.toLowerCase().includes(query);
    const matchPihak = 
      trx.pengirimNama?.toLowerCase().includes(query) || 
      trx.penerimaNama?.toLowerCase().includes(query) ||
      trx.pengirimInstansi?.toLowerCase().includes(query) ||
      trx.penerimaInstansi?.toLowerCase().includes(query);
    const matchJenis = trx.jenisTransaksi?.toLowerCase().includes(query);
    const matchBarang = trx.items?.some((item) => item.nama?.toLowerCase().includes(query));
    return matchSurat || matchPihak || matchJenis || matchBarang;
  });

  // Potong array berdasarkan halaman saat ini
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset ke halaman 1 saat user mengetik pencarian
  };

  const exportToExcel = () => {
    const headers = ["Tanggal", "No. Surat", "Jenis Transaksi", "Pengirim (Nama)", "Pengirim (Instansi)", "Penerima (Nama)", "Penerima (Instansi)", "Daftar Barang & Qty"];
    const rows = filteredTransactions.map(trx => {
      const itemsString = trx.items?.map(i => `${i.nama} (${i.kuantitas} ${i.satuan})`).join("; ") || "-";
      const rowData = [trx.tanggal, trx.nomorSurat, trx.jenisTransaksi, trx.pengirimNama, trx.pengirimInstansi, trx.penerimaNama, trx.penerimaInstansi, itemsString];
      return rowData.map(val => `"${(val || "").toString().replace(/"/g, '""')}"`).join(",");
    });
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Riwayat_Transaksi_Logistik_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-5 tracking-tight">Pusat Riwayat Transaksi</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div><h3 className="font-bold text-sm text-gray-800">Daftar Log Transaksi</h3></div>
          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-2 items-center">
            <div className="relative w-full sm:w-64">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
              <input type="text" placeholder="Cari data..." value={searchQuery} onChange={handleSearch} className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm transition-all" />
            </div>
            <button onClick={exportToExcel} disabled={filteredTransactions.length === 0} className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px] text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100 bg-white uppercase tracking-wide">
                <th className="py-3 px-5 font-semibold w-28">Tanggal</th>
                <th className="py-3 px-5 font-semibold w-44">No. Surat</th>
                <th className="py-3 px-5 font-semibold w-32">Jenis</th>
                <th className="py-3 px-5 font-semibold min-w-[200px]">Barang Terkait</th>
                <th className="py-3 px-5 font-semibold min-w-[200px]">Pihak Terlibat</th>
                <th className="py-3 px-5 font-semibold text-right w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.length === 0 ? (
                <tr><td colSpan="6" className="py-12 text-center text-gray-500"><FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" /><p className="font-medium text-sm">Belum ada transaksi.</p></td></tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan="6" className="py-12 text-center text-gray-500"><Search className="w-10 h-10 mx-auto text-gray-300 mb-3" /><p className="font-medium text-sm">Data tidak ditemukan</p></td></tr>
              ) : (
                paginatedData.map((trx) => (
                  <tr key={trx.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-5 text-gray-600 font-medium">{trx.tanggal}</td>
                    <td className="py-3 px-5 font-bold text-gray-800">{trx.nomorSurat}</td>
                    <td className="py-3 px-5">
                      <span className={`inline-flex px-2 py-1 rounded text-[11px] font-bold tracking-wide border ${trx.jenisTransaksi === "Barang Masuk" ? "bg-green-50 text-green-700 border-green-100" : "bg-orange-50 text-orange-700 border-orange-100"}`}>{trx.jenisTransaksi}</span>
                    </td>
                    <td className="py-3 px-5 text-gray-700">
                      {trx.items && trx.items.length > 0 ? (
                        <div className="line-clamp-2 text-xs" title={trx.items.map(i => i.nama).join(", ")}>
                          {trx.items.map((i, idx) => (
                            <span key={i.id || idx}>{i.nama} <span className="text-gray-400">({i.kuantitas})</span>{idx < trx.items.length - 1 ? ", " : ""}</span>
                          ))}
                        </div>
                      ) : <span className="text-gray-400 italic text-xs">-</span>}
                    </td>
                    <td className="py-3 px-5 text-xs">
                      <p className="text-gray-800 font-semibold truncate max-w-[200px]">{trx.pengirimNama || "?"}</p>
                      <p className="text-gray-500 flex items-center gap-1 mt-0.5 truncate max-w-[200px]"><ArrowLeft className="w-3 h-3 transform rotate-180 shrink-0" />{trx.penerimaNama || "?"}</p>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <button onClick={() => { setFormData(trx); setItems(trx.items || []); setActiveTransaction(trx); setView("preview"); }} className="text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition-colors inline-block whitespace-nowrap">
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* UI KONTROL PAGINASI TRANSAKSI */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between">
            <span className="text-sm text-gray-500 hidden sm:inline-block">
              Menampilkan <span className="font-bold text-gray-900">{startIndex + 1}</span> - <span className="font-bold text-gray-900">{Math.min(startIndex + itemsPerPage, filteredTransactions.length)}</span> dari <span className="font-bold text-gray-900">{filteredTransactions.length}</span> transaksi
            </span>
            <div className="flex gap-2 ml-auto">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg border border-gray-200">
                Hal {currentPage} / {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
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