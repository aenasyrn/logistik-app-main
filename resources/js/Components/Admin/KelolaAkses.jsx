// resources/js/Components/Admin/KelolaAkses.jsx
"use client";

import { useState } from "react";
import {
  Users, Search, Shield, UserCheck, Loader2, Plus, Edit, Trash2,
  X, Mail, Lock, User as UserIcon, AlertTriangle, CheckCircle2,
  Eye, EyeOff, ShieldCheck, AlertCircle
} from "lucide-react";
import axios from "axios";
import { router } from "@inertiajs/react";

export default function KelolaAkses({ usersList = [], handleUpdateRole }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // === PAGINATION ===
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // === MODAL STATES ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "logistic_officer",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Password strength helper
  const getPasswordStrength = (pass) => {
    if (!pass) return null;
    if (pass.length < 6) {
      return {
        label: "Tidak Aman (Minimal 6 Karakter)",
        color: "text-red-600",
        bgColor: "bg-red-500",
        score: 1,
      };
    }
    const hasLetters = /[a-zA-Z]/.test(pass);
    const hasNumbers = /[0-9]/.test(pass);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pass);

    if (pass.length >= 8 && hasLetters && (hasNumbers || hasSpecial)) {
      return {
        label: "Aman (Password Kuat)",
        color: "text-emerald-600",
        bgColor: "bg-emerald-500",
        score: 3,
      };
    }

    return {
      label: "Cukup Aman",
      color: "text-amber-600",
      bgColor: "bg-amber-500",
      score: 2,
    };
  };

  // === DELETE CONFIRMATION STATE ===
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, user: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // === TOAST STATE ===
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  // Open modal for adding a new user
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", password_confirmation: "", role: "logistic_officer" });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for editing an existing user
  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      password_confirmation: "",
      role: user.role || "logistic_officer",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Handle submit form (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    if (formData.password && formData.password !== formData.password_confirmation) {
      setFormErrors({ password_confirmation: ["Konfirmasi password baru tidak cocok dengan password baru!"] });
      return;
    }

    setIsSaving(true);
    setFormErrors({});

    try {
      if (editingUser) {
        // Edit existing user
        await axios.put(`/users/${editingUser.id}`, formData);
        showToast("Data user berhasil diperbarui!");
      } else {
        // Add new user
        await axios.post("/users", formData);
        showToast("User baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      router.reload({ only: ["usersList"] });
    } catch (error) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || "Terjadi kesalahan saat menyimpan data");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!deleteConfirm.user) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/users/${deleteConfirm.user.id}`);
      showToast(`User "${deleteConfirm.user.name || deleteConfirm.user.email}" berhasil dihapus!`);
      setDeleteConfirm({ show: false, user: null });
      router.reload({ only: ["usersList"] });
    } catch (error) {
      alert(error.response?.data?.error || error.response?.data?.message || "Gagal menghapus user");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle inline role change dropdown
  const onRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      if (handleUpdateRole) {
        await handleUpdateRole(userId, newRole);
      } else {
        await axios.put(`/users/${userId}/role`, { role: newRole });
        router.reload({ only: ["usersList"] });
      }
      showToast("Hak akses user berhasil diperbarui!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal memperbarui hak akses");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter
  const filteredUsers = usersList.filter(
    (u) =>
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-[999] flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-white bg-[#279969] animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#0d5c3a] dark:text-emerald-400" /> Manajemen User
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data akun pengguna, peran, dan hak akses sistem.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-[#279969] hover:bg-[#1e7a53] text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-[#279969]/20 transition-all text-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Tambah User Baru
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap justify-between items-center gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
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
                <option value={10000}>All</option>
              </select>
              <span>entries</span>
            </div>
          </div>

          <div className="bg-emerald-50 text-[#0d5c3a] dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 px-4 py-2 rounded-xl text-xs font-bold shrink-0">
            Total User: {filteredUsers.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0d5c3a] text-slate-100 text-xs font-bold uppercase tracking-wider">
                <th className="p-4 w-16 text-center border-r border-[#0a4228]">No</th>
                <th className="p-4 border-r border-[#0a4228]">Nama Pengguna</th>
                <th className="p-4 border-r border-[#0a4228]">Email</th>
                <th className="p-4 w-48 text-center border-r border-[#0a4228]">Hak Akses (Role)</th>
                <th className="p-4 w-36 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 bg-white">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    Tidak ada data pengguna.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u, index) => {
                  const globalIndex = startIndex + index + 1;
                  const isUpdating = updatingId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-center text-gray-500 font-medium">
                        {globalIndex}
                      </td>
                      <td className="p-4 font-semibold text-gray-900">
                        {u.name || "-"}
                      </td>
                      <td className="p-4 text-gray-600 font-mono text-xs">
                        {u.email}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isUpdating && (
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                          )}
                          <select
                            value={u.role}
                            disabled={isUpdating}
                            onChange={(e) => onRoleChange(u.id, e.target.value)}
                            className="pl-3 pr-7 py-1.5 min-w-[130px] bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-[#0d5c3a] focus:border-[#0d5c3a] cursor-pointer shadow-2xs transition-all"
                          >
                            <option value="admin">🛡️ Admin</option>
                            <option value="logistic_officer">📦 Logistik Officer</option>
                            <option value="guest">👁️ Guest</option>
                            {u.role === "user" && <option value="user">👤 User (Legacy)</option>}
                          </select>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm({ show: true, user: u })}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="Hapus User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-slate-50/30 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Menampilkan {startIndex + 1} sampai {Math.min(startIndex + itemsPerPage, filteredUsers.length)} dari {filteredUsers.length} data
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors text-gray-600"
              >
                &lt; Prev
              </button>
              {getVisiblePages().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
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
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors text-gray-600"
              >
                Next &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* === ADD / EDIT USER MODAL === */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0d5c3a] text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-xl">
                  <Users className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingUser ? "Edit Data User" : "Tambah User Baru"}
                  </h3>
                  <p className="text-xs text-emerald-100/80">
                    {editingUser ? "Perbarui informasi dan hak akses user" : "Lengkapi data untuk membuat akun pengguna baru"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1.5">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama lengkap"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d5c3a] text-sm font-medium"
                    />
                  </div>
                  {formErrors.name && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.name[0]}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="contoh@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d5c3a] text-sm font-medium"
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.email[0]}</p>
                  )}
                </div>

                {/* Password Baru */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1.5">
                    Password Baru {editingUser ? "(Opsional)" : <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required={!editingUser}
                      placeholder={editingUser ? "Kosongkan jika tidak diubah" : "Masukkan password baru (min. 6 karakter)"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d5c3a] text-sm font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      tabIndex={-1}
                      title={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {formData.password && (() => {
                    const strength = getPasswordStrength(formData.password);
                    return (
                      <div className="mt-2 space-y-1 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-gray-500">Status Keamanan Password:</span>
                          <span className={`font-bold ${strength.color} flex items-center gap-1`}>
                            {strength.score === 3 ? (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5" />
                            )}
                            {strength.label}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden flex gap-1 mt-1">
                          <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.bgColor : "bg-gray-200"}`} />
                          <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.bgColor : "bg-gray-200"}`} />
                          <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.bgColor : "bg-gray-200"}`} />
                        </div>
                      </div>
                    );
                  })()}

                  {editingUser && (
                    <p className="text-[11px] text-gray-400 mt-1 italic">
                      Biarkan kosong jika tidak ingin mengganti password user ini.
                    </p>
                  )}
                  {formErrors.password && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.password[0]}</p>
                  )}
                </div>

                {/* Konfirmasi Password Baru */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1.5">
                    Konfirmasi Password Baru {editingUser ? "(Opsional)" : <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required={!editingUser && !!formData.password}
                      placeholder="Ulangi password baru Anda"
                      value={formData.password_confirmation}
                      onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d5c3a] text-sm font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      tabIndex={-1}
                      title={showConfirmPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formData.password_confirmation && formData.password !== formData.password_confirmation && (
                    <p className="text-xs text-red-500 mt-1 font-medium">Konfirmasi password tidak cocok!</p>
                  )}
                  {formErrors.password_confirmation && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.password_confirmation[0]}</p>
                  )}
                </div>

                {/* Hak Akses / Role */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1.5">
                    Hak Akses (Role) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d5c3a] text-sm font-semibold text-gray-800 cursor-pointer"
                  >
                    <option value="admin">🛡️ Admin (Akses Penuh)</option>
                    <option value="logistic_officer">📦 Logistik Officer (Tambah Data & Buat Surat)</option>
                    <option value="guest">👁️ Guest (Hanya Melihat Data)</option>
                    {editingUser && editingUser.role === "user" && (
                      <option value="user">👤 User (Legacy)</option>
                    )}
                  </select>
                  {formErrors.role && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.role[0]}</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#0d5c3a] hover:bg-[#0a4228] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-[#0d5c3a]/20"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    editingUser ? "Simpan Perubahan" : "Tambah User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === CONFIRM DELETE MODAL === */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Hapus User</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun <span className="font-semibold text-slate-800">"{deleteConfirm.user?.name || deleteConfirm.user?.email}"</span>? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ show: false, user: null })}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  "Ya, Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

