// resources/js/Components/DataMaster/MasterOutlet.jsx
"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  MapPin,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { router } from "@inertiajs/react";
import OutletFormModal from "./OutletFormModal";

export default function MasterOutlet({ outlets, userRole }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [localOutlets, setLocalOutlets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    id: null,
    name: "",
  });
  const [editingOutlet, setEditingOutlet] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notif, setNotif] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    setLocalOutlets(outlets || []);
  }, [outlets]);

  const showLocalNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
    setTimeout(() => setNotif({ show: false, message: "", type: "" }), 2500);
  };

  const filteredOutlets = localOutlets.filter((out) => {
    const q = searchQuery.toLowerCase();
    return (
      out.nama?.toLowerCase().includes(q) || out.code?.toLowerCase().includes(q)
    );
  });

  const openAdd = () => {
    setEditingOutlet(null);
    setIsModalOpen(true);
  };
  const openEdit = (out) => {
    setEditingOutlet(out);
    setIsModalOpen(true);
  };
  const askDelete = (out) => {
    setDeleteConfirm({ show: true, id: out.id, name: out.nama });
  };

  const confirmDeleteAction = () => {
    setIsSaving(true);
    router.delete(`/outlets/${deleteConfirm.id}`, {
      onSuccess: () => {
        showLocalNotif("Instansi berhasil dihapus!", "success");
        setDeleteConfirm({ show: false, id: null, name: "" });
      },
      onError: (err) => {
        console.error(err);
        showLocalNotif("Gagal menghapus data instansi.", "error");
      },
      onFinish: () => {
        setIsSaving(false);
      }
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const codeVal = form.get("kode");
    const namaVal = form.get("nama");

    setIsSaving(true);
    const payload = {
      kode: codeVal,
      nama: namaVal,
    };

    if (editingOutlet) {
      router.post(`/outlets/${editingOutlet.id}`, { ...payload, _method: "PUT" }, {
        onSuccess: () => {
          setIsModalOpen(false);
          showLocalNotif("Instansi diperbarui!", "success");
        },
        onError: (err) => {
          console.error(err);
          showLocalNotif("Gagal mengupdate instansi!", "error");
        },
        onFinish: () => {
          setIsSaving(false);
        }
      });
    } else {
      router.post("/outlets", payload, {
        onSuccess: () => {
          setIsModalOpen(false);
          showLocalNotif("Instansi berhasil ditambahkan!", "success");
        },
        onError: (err) => {
          console.error(err);
          showLocalNotif("Gagal menambahkan instansi!", "error");
        },
        onFinish: () => {
          setIsSaving(false);
        }
      });
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-300 relative">
      {/* ==================== TABEL UTAMA ==================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600" /> Daftar Instansi Terdaftar
          </h3>
          <div className="flex flex-wrap w-full lg:w-auto gap-3 items-center">
            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari nama atau kode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="bg-purple-50 text-purple-700 px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0">
              Total: {filteredOutlets.length}
            </div>
            {userRole === "admin" && (
              <button
                onClick={openAdd}
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" /> Tambah Outlet
              </button>
            )}
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-blue-900 text-slate-100 text-[11px] font-bold uppercase tracking-wider text-center">
                  <th className="p-2.5 w-12 text-center align-middle border border-blue-800 bg-blue-900">
                    No
                  </th>
                  <th className="p-2.5 w-40 text-left align-middle border border-blue-800 bg-blue-900">
                    Kode Outlet
                  </th>
                  <th className="p-2.5 text-left align-middle border border-blue-800 bg-blue-900">
                    Nama Outlet / Instansi
                  </th>
                  {userRole === "admin" && (
                    <th className="p-2.5 text-center align-middle border border-blue-800 bg-blue-900">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="text-xs text-gray-800 bg-white">
                {filteredOutlets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={userRole === "admin" ? "4" : "3"}
                      className="p-4 text-center text-gray-400 border border-slate-200 bg-white"
                    >
                      Belum ada data instansi.
                    </td>
                  </tr>
                ) : (
                  filteredOutlets.map((out, index) => {
                    const isEven = index % 2 !== 0;
                    const isSelected = selectedId === out.id;
                    const isHovered = hoveredId === out.id;

                    let bgClass = "";
                    if (isSelected) {
                      bgClass = isHovered ? "bg-blue-200 text-blue-950" : "bg-blue-100 text-blue-900";
                    } else if (isHovered) {
                      bgClass = "bg-slate-200 text-gray-900";
                    } else {
                      bgClass = isEven ? "bg-slate-100 text-gray-800" : "bg-white text-gray-800";
                    }

                    return (
                      <tr
                        key={out.id}
                        onMouseEnter={() => setHoveredId(out.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => setSelectedId((prev) => (prev === out.id ? null : out.id))}
                        className={`transition-colors duration-150 cursor-pointer ${bgClass}`}
                      >
                        <td className="p-2 border border-slate-200 text-center align-middle font-medium text-gray-500">
                          {index + 1}
                        </td>
                        <td className="p-2 border border-slate-200 align-middle font-mono text-xs text-gray-700">
                          {out.code || "-"}
                        </td>
                        <td className="p-2 border border-slate-200 align-middle font-semibold text-gray-900">
                          {out.nama}
                        </td>
                        {userRole === "admin" && (
                          <td className="p-2 border border-slate-200 text-center align-middle">
                            <div className="flex justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => openEdit(out)}
                                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => askDelete(out)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
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
        </div>
      </div>

      {/* ==================== MODAL TAMBAH/EDIT (DIPANGGIL DARI FILE LAIN) ==================== */}
      {userRole === "admin" && (
        <OutletFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingOutlet={editingOutlet}
          onSubmit={onSubmit}
          isSaving={isSaving}
        />
      )}

      {/* ==================== MODAL KONFIRMASI HAPUS ==================== */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Konfirmasi Hapus</h3>
              <p className="text-sm text-gray-500">
                Yakin hapus{" "}
                <span className="font-bold">{deleteConfirm.name}</span>?
              </p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={() =>
                  setDeleteConfirm({ show: false, id: null, name: "" })
                }
                disabled={isSaving}
                className="flex-1 px-4 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50 border-r"
              >
                BATAL
              </button>
              <button
                onClick={confirmDeleteAction}
                disabled={isSaving}
                className="flex-1 px-4 py-4 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "YA, HAPUS"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TOAST NOTIFICATION ==================== */}
      {notif.show && (
        <div
          className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm text-white animate-in slide-in-from-bottom-8 duration-300 ${notif.type === "success" ? "bg-green-600" : "bg-red-600"}`}
        >
          {notif.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          {notif.message}
        </div>
      )}
    </div>
  );
}
