// resources/js/Components/Bangunan/SaranaPengamanan/index.jsx
"use client";

import React, { useState } from "react";
import { Shield, Search, Plus, FileSpreadsheet, Edit, Trash2, X, Loader2 } from "lucide-react";
import axios from "axios";
import { router } from "@inertiajs/react";
import * as XLSX from "xlsx";

import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";
import ToastNotif from "../../Modal/ToastNotif";

export default function SaranaPengamanan({ userRole, facilities = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    nama_fasilitas: "",
    lokasi: "",
    jenis: "CCTV",
    jumlah: "1",
    kondisi: "BAIK",
    deskripsi: "",
  });

  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: "" });
  const [notif, setNotif] = useState({ show: false, message: "", type: "success" });

  const showNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
  };

  // Filter
  const filteredFacilities = facilities.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      (item.nama_fasilitas && item.nama_fasilitas.toLowerCase().includes(q)) ||
      (item.lokasi && item.lokasi.toLowerCase().includes(q)) ||
      (item.jenis && item.jenis.toLowerCase().includes(q)) ||
      (item.kondisi && item.kondisi.toLowerCase().includes(q)) ||
      (item.jumlah && String(item.jumlah).includes(q)) ||
      (item.deskripsi && item.deskripsi.toLowerCase().includes(q)) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(q))
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredFacilities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredFacilities.slice(startIndex, startIndex + itemsPerPage);

  const openAdd = () => {
    setEditingId(null);
    setFormData({
      nama_fasilitas: "",
      lokasi: "",
      jenis: "CCTV",
      jumlah: "1",
      kondisi: "BAIK",
      deskripsi: "",
    });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      nama_fasilitas: item.nama_fasilitas || "",
      lokasi: item.lokasi || "",
      jenis: item.jenis || "CCTV",
      jumlah: item.jumlah || "1",
      kondisi: item.kondisi || "BAIK",
      deskripsi: item.deskripsi || "",
    });
    setIsModalOpen(true);
  };

  const askDelete = (id, nama) => {
    setDeleteConfirm({ show: true, id, name: nama });
  };

  const confirmDelete = async () => {
    setIsSaving(true);
    try {
      await axios.delete(`/security-facilities/${deleteConfirm.id}`);
      router.reload({ only: ["securityFacilities", "activityLogs"] });
      showNotif("Data pengamanan & korporasi berhasil dihapus!");
    } catch (e) {
      console.error(e);
      showNotif("Gagal menghapus data pengamanan & korporasi.", "error");
    } finally {
      setIsSaving(false);
      setDeleteConfirm({ show: false, id: null, name: "" });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      nama_fasilitas: formData.nama_fasilitas,
      lokasi: formData.lokasi,
      jenis: formData.jenis,
      jumlah: Number(formData.jumlah) || 1,
      kondisi: formData.kondisi,
      deskripsi: formData.deskripsi,
    };

    try {
      if (editingId) {
        await axios.put(`/security-facilities/${editingId}`, payload);
        router.reload({ only: ["securityFacilities", "activityLogs"] });
        showNotif("Data pengamanan & korporasi berhasil diperbarui!");
      } else {
        await axios.post("/security-facilities", payload);
        router.reload({ only: ["securityFacilities", "activityLogs"] });
        showNotif("Data pengamanan & korporasi baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showNotif("Gagal menyimpan data pengamanan & korporasi.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const exportToExcel = () => {
    const rows = filteredFacilities.map((item, idx) => ({
      "No": idx + 1,
      "Nama Fasilitas": item.nama_fasilitas || "",
      "Lokasi": item.lokasi || "",
      "Jenis": item.jenis || "",
      "Jumlah Unit": item.jumlah || 1,
      "Kondisi": item.kondisi || "",
      "Keterangan": item.deskripsi || "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pengamanan dan Korporasi");
    XLSX.writeFile(wb, `Pengamanan_dan_Korporasi_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const getStatusBadge = (kondisi) => {
    return kondisi === "BAIK" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200";
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300 relative print:hidden">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
              <Shield className="w-6 h-6 text-indigo-500" /> Pengamanan dan Korporasi
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Pantau ketersediaan CCTV, sistem alarm, pagar pengamanan, pos satpam, dan perangkat keselamatan korporasi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={exportToExcel}
              disabled={filteredFacilities.length === 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-colors text-sm"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>
            {userRole === "admin" && (
              <button
                type="button"
                onClick={openAdd}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-colors text-sm"
              >
                <Plus className="w-4 h-4" /> Tambah Sarana
              </button>
            )}
          </div>
        </div>

        {/* Tabel Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Search Toolbar */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Cari sarana keamanan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-semibold">
              Total Data: {filteredFacilities.length}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase bg-gray-50/70">
                  <th className="py-4 px-6 w-12 text-center">#</th>
                  <th className="py-4 px-6">Nama Fasilitas / Alat</th>
                  <th className="py-4 px-6">Lokasi</th>
                  <th className="py-4 px-6">Jenis</th>
                  <th className="py-4 px-6 text-center">Jumlah Unit</th>
                  <th className="py-4 px-6 text-center">Kondisi</th>
                  <th className="py-4 px-6">Keterangan</th>
                  {userRole === "admin" && <th className="py-4 px-6 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-10 text-center text-gray-400">
                      Tidak ada data sarana pengamanan ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 text-center text-xs font-medium text-gray-400">{startIndex + index + 1}</td>
                      <td className="py-4 px-6 font-semibold text-gray-900">{item.nama_fasilitas}</td>
                      <td className="py-4 px-6 text-xs text-gray-600">{item.lokasi || "-"}</td>
                      <td className="py-4 px-6">
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-xs font-medium">
                          {item.jenis || "CCTV"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-semibold">{item.jumlah || 1}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(item.kondisi)}`}>
                          {item.kondisi || "BAIK"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-500">{item.deskripsi || "-"}</td>
                      {userRole === "admin" && (
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => askDelete(item.id, item.nama_fasilitas)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
              <span className="text-xs text-gray-500">
                Menampilkan {startIndex + 1} sampai {Math.min(startIndex + itemsPerPage, filteredFacilities.length)} dari {filteredFacilities.length} data
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  &lt; Prev
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      currentPage === i + 1
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {i + 1}
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
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-lg text-gray-800">
                {editingId ? "Edit Pengamanan & Korporasi" : "Tambah Pengamanan & Korporasi Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 overflow-y-auto flex-1 custom-scrollbar gap-4 flex flex-col">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Fasilitas / Alat *</label>
                  <input
                    required
                    type="text"
                    value={formData.nama_fasilitas}
                    onChange={(e) => setFormData((p) => ({ ...p, nama_fasilitas: e.target.value }))}
                    disabled={isSaving}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Contoh: CCTV Hikvision Dome 2MP..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Lokasi Penempatan *</label>
                  <input
                    required
                    type="text"
                    value={formData.lokasi}
                    onChange={(e) => setFormData((p) => ({ ...p, lokasi: e.target.value }))}
                    disabled={isSaving}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Contoh: Ruang Kasir, Halaman Depan..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis Alat *</label>
                    <select
                      value={formData.jenis}
                      onChange={(e) => setFormData((p) => ({ ...p, jenis: e.target.value }))}
                      disabled={isSaving}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none bg-white text-sm"
                    >
                      <option value="CCTV">CCTV</option>
                      <option value="Pagar">Pagar Pengaman</option>
                      <option value="Alarm">Sistem Alarm</option>
                      <option value="APAR">Pemadam Api (APAR)</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Jumlah Unit *</label>
                    <input
                      required
                      type="number"
                      value={formData.jumlah}
                      onChange={(e) => setFormData((p) => ({ ...p, jumlah: e.target.value }))}
                      disabled={isSaving}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Contoh: 4"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kondisi *</label>
                  <select
                    value={formData.kondisi}
                    onChange={(e) => setFormData((p) => ({ ...p, kondisi: e.target.value }))}
                    disabled={isSaving}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none bg-white text-sm"
                  >
                    <option value="BAIK">BAIK</option>
                    <option value="RUSAK">RUSAK</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi / Spesifikasi</label>
                  <textarea
                    rows="2"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData((p) => ({ ...p, deskripsi: e.target.value }))}
                    disabled={isSaving}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Catatan tambahan (merek, seri, dll)..."
                  />
                </div>
              </div>
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmDeleteModal
        show={deleteConfirm.show}
        name={deleteConfirm.name}
        isSaving={isSaving}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: null, name: "" })}
      />

      {/* Toast Notif */}
      <ToastNotif
        show={notif.show}
        message={notif.message}
        type={notif.type}
        onClose={() => setNotif({ show: false, message: "", type: "" })}
      />
    </>
  );
}
