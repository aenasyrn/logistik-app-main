// resources/js/Components/DataMaster/MasterBarang.jsx
"use client";

import { useState, useEffect } from "react";
import {
  Database, Plus, Box, Hash, Scale, Building2,
  CalendarDays, Clock, Search, Edit, Trash2
} from "lucide-react";
import axios from "axios";
import { router } from "@inertiajs/react";
import BarangFormModal    from "./BarangFormModal";
import ConfirmDeleteModal from "../Modal/ConfirmDeleteModal";
import ToastNotif         from "../Modal/ToastNotif";

export default function MasterBarang({ inventory, userRole }) {
  const [searchQuery, setSearchQuery]           = useState("");
  const [calculatedStatus, setCalculatedStatus] = useState("Inventaris");
  const [localInventory, setLocalInventory]     = useState([]);
  const [isModalOpen, setIsModalOpen]           = useState(false);
  const [deleteConfirm, setDeleteConfirm]       = useState({ show: false, id: null, name: "" });
  const [editingInv, setEditingInv]             = useState(null);
  const [isSaving, setIsSaving]                 = useState(false);
  const [notif, setNotif]                       = useState({ show: false, message: "", type: "success" });

  useEffect(() => { setLocalInventory(inventory || []); }, [inventory]);

  const showNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  const handleDateChange = () => {
    const form = document.getElementById("formBarang");
    if (!form) return;
    const start = form.tanggal_mulai?.value;
    const end   = form.tanggal_selesai?.value;
    if (start && end) {
      const d1 = new Date(start);
      const d2 = new Date(end);
      let months = (d2.getFullYear() - d1.getFullYear()) * 12;
      months -= d1.getMonth();
      months += d2.getMonth();
      if (form.masa_sewa_bulan) form.masa_sewa_bulan.value = months > 0 ? months : 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setCalculatedStatus(new Date(end) >= today ? "Sewa Berjalan" : "Sewa Habis");
    } else {
      setCalculatedStatus("Inventaris");
      if (form.masa_sewa_bulan) form.masa_sewa_bulan.value = "";
    }
  };

  const getStatusInfo = (inv) => {
    if (inv.status) return inv.status;
    if (!inv.tanggal_mulai || !inv.tanggal_selesai) return "Inventaris";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(inv.tanggal_selesai) >= today ? "Sewa Berjalan" : "Sewa Habis";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Inventaris":    return "bg-blue-100 text-blue-700 border-blue-200";
      case "Sewa Berjalan": return "bg-green-100 text-green-700 border-green-200";
      case "Sewa Habis":    return "bg-red-100 text-red-700 border-red-200";
      default:              return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const filteredInventory = localInventory.filter((inv) => {
    const q = searchQuery.toLowerCase();
    const statusVal = getStatusInfo(inv);
    return (
      inv.nama?.toLowerCase().includes(q) ||
      inv.vendor_nama?.toLowerCase().includes(q) ||
      inv.no_spk?.toLowerCase().includes(q) ||
      statusVal.toLowerCase().includes(q) ||
      inv.deskripsi?.toLowerCase().includes(q)
    );
  });

  // ── Modal helpers ─────────────────────────────────────────────────────
  const openAdd   = () => { setEditingInv(null); setCalculatedStatus("Inventaris"); setIsModalOpen(true); };
  const openEdit  = (inv) => { setEditingInv(inv); setCalculatedStatus(getStatusInfo(inv)); setIsModalOpen(true); };
  const askDelete = (inv) => setDeleteConfirm({ show: true, id: inv.id, name: inv.nama });

  // ── DELETE ────────────────────────────────────────────────────────────
  const confirmDeleteAction = async () => {
    setIsSaving(true);
    try {
      await axios.delete(`/inventory/${deleteConfirm.id}`);
      router.reload({ only: ["inventory", "activityLogs"] });
      showNotif("Barang berhasil dihapus!");
    } catch (e) {
      const errorMsg = e.response?.data?.message || "Gagal menghapus data.";
      showNotif(errorMsg, "error");
    } finally {
      setIsSaving(false);
      setDeleteConfirm({ show: false, id: null, name: "" });
    }
  };

  // ── SUBMIT (ADD & EDIT) ───────────────────────────────────────────────
  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const form = new FormData(e.target);
    const payload = {
      nama: form.get("nama"),
      kuantitas: Number(form.get("kuantitas")) || 0,
      satuan: form.get("satuan") || "Pcs",
      vendor_nama: form.get("vendor_nama") || "",
      no_spk: form.get("no_spk") || "",
      no_pks: form.get("no_pks") || "",
      tanggal_mulai: form.get("tanggal_mulai") || "",
      tanggal_selesai: form.get("tanggal_selesai") || "",
      masa_sewa_bulan: Number(form.get("masa_sewa_bulan")) || 0,
      status: form.get("status") || "Inventaris",
      deskripsi: form.get("deskripsi") || "",
    };
    try {
      if (editingInv) {
        await axios.put(`/inventory/${editingInv.id}`, payload);
        router.reload({ only: ["inventory", "activityLogs"] });
        showNotif("Data barang berhasil diperbarui!");
      } else {
        await axios.post("/inventory", payload);
        router.reload({ only: ["inventory", "activityLogs"] });
        showNotif("Barang baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || (editingInv ? "Gagal mengupdate barang!" : "Gagal menambah barang!");
      showNotif(errorMsg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-300 relative">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" /> Ketersediaan Stok Barang
          </h3>
          <div className="flex flex-wrap w-full lg:w-auto gap-3 items-center">
            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari barang atau status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="bg-blue-50 text-blue-700 px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0">
              Total: {filteredInventory.length}
            </div>
            {userRole === "admin" && (
              <button
                onClick={openAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" /> Tambah Barang
              </button>
            )}
          </div>
        </div>

        {/* Tabel */}
        <div className="px-4 py-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1100px]">
              <thead>
                <tr className="border-b-2 text-gray-500 text-xs">
                  <th className="pb-2 w-10 text-center">No</th>
                  <th className="pb-2"><Box className="w-3 h-3 inline mr-1" /> Nama Barang</th>
                  <th className="pb-2"><Hash className="w-3 h-3 inline mr-1" /> Stok</th>
                  <th className="pb-2"><Scale className="w-3 h-3 inline mr-1" /> Satuan</th>
                  <th className="pb-2"><Building2 className="w-3 h-3 inline mr-1" /> Vendor & Kontrak</th>
                  <th className="pb-2"><CalendarDays className="w-3 h-3 inline mr-1" /> Mulai</th>
                  <th className="pb-2"><CalendarDays className="w-3 h-3 inline mr-1" /> Selesai</th>
                  <th className="pb-2 text-center"><Clock className="w-3 h-3 inline mr-1" /> Durasi</th>
                  <th className="pb-2 text-center">Status</th>
                  {userRole === "admin" && <th className="pb-2 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {filteredInventory.map((inv, index) => {
                  const statusVal = getStatusInfo(inv);
                  const stokVal = inv.kuantitas !== undefined ? inv.kuantitas : (inv.stok || 0);
                  return (
                    <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/80">
                      <td className="py-2 text-center text-xs">{index + 1}</td>
                      <td className="py-2 text-sm font-medium overflow-visible">
                        <div className="relative group cursor-default">
                          {inv.nama}
                          <div className="absolute left-0 top-full mt-1 z-[999] hidden group-hover:block bg-gray-900 text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl pointer-events-none">
                            <p className="!text-gray-400 mb-0.5">Database ID</p>
                            <p className="font-mono !text-white">{inv.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${stokVal <= 5 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
                          {stokVal}
                        </span>
                      </td>
                      <td className="py-2 text-xs">{inv.satuan}</td>
                      <td className="py-2 text-xs">
                        {inv.vendor_nama ? (
                          <div>
                            <p className="font-medium text-blue-700">{inv.vendor_nama}</p>
                            <p className="text-xs text-gray-500">SPK: {inv.no_spk || "-"}</p>
                          </div>
                        ) : "-"}
                      </td>
                      <td className="py-2 text-xs">{formatDate(inv.tanggal_mulai)}</td>
                      <td className="py-2 text-xs">{formatDate(inv.tanggal_selesai)}</td>
                      <td className="py-2 text-center text-xs">{inv.masa_sewa_bulan ? `${inv.masa_sewa_bulan} Bln` : "-"}</td>
                      <td className="py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadge(statusVal)}`}>
                          {statusVal}
                        </span>
                      </td>
                      {userRole === "admin" && (
                        <td className="py-2 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => openEdit(inv)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => askDelete(inv)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modal Form ── */}
      {userRole === "admin" && (
        <BarangFormModal
          isOpen={isModalOpen}
          editingInv={editingInv}
          isSaving={isSaving}
          calculatedStatus={calculatedStatus}
          onClose={() => setIsModalOpen(false)}
          onSubmit={onSubmit}
          onDateChange={handleDateChange}
        />
      )}

      {/* ── Modal Konfirmasi Hapus ── */}
      <ConfirmDeleteModal
        show={deleteConfirm.show}
        name={deleteConfirm.name}
        isSaving={isSaving}
        onConfirm={confirmDeleteAction}
        onCancel={() => setDeleteConfirm({ show: false, id: null, name: "" })}
      />

      {/* ── Toast Notifikasi ── */}
      <ToastNotif
        show={notif.show}
        message={notif.message}
        type={notif.type}
        onClose={() => setNotif({ show: false, message: "", type: "" })}
      />
    </div>
  );
}