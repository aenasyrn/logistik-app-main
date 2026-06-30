"use client";

import { useState } from "react";
import { Users, Shield, User, Loader2, Search, CheckCircle, XCircle, X } from "lucide-react";

export default function KelolaUser({ usersList, handleUpdateRole }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [notif, setNotif] = useState({ show: false, message: "", type: "" });

  const showNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
    setTimeout(() => setNotif({ show: false, message: "", type: "" }), 3000);
  };

  const changeRole = async (userId, newRole) => {
    setLoadingId(userId);
    try {
      await handleUpdateRole(userId, newRole);
      showNotif(`Role berhasil diubah menjadi ${newRole.toUpperCase()}`, "success");
    } catch (error) {
      showNotif("Gagal mengubah role", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" /> Manajemen Akses Pengguna
          </h2>
          <p className="text-sm text-gray-500 mt-1">Atur siapa saja yang berhak menjadi Admin di aplikasi ini.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
            <input type="text" placeholder="Cari email pengguna..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold">Total: {filteredUsers.length} Akun</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase text-gray-500 border-b border-gray-100 bg-white tracking-wider">
                <th className="p-4 font-semibold">Informasi Akun</th>
                <th className="p-4 font-semibold text-center w-40">Hak Akses (Role)</th>
                <th className="p-4 font-semibold text-right w-48">Ubah Akses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredUsers.length === 0 ? (
                <tr><td colSpan="3" className="p-8 text-center text-gray-500">Pengguna tidak ditemukan.</td></tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${u.role === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                          {u.role === 'admin' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{u.email}</p>
                          <p className="text-xs text-gray-400">UID: <span className="font-mono">{u.id}</span></p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${u.role === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {u.role === 'admin' ? 'ADMINISTRATOR' : 'USER BIASA'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {loadingId === u.id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-4" />
                        ) : (
                          <select 
                            value={u.role} 
                            onChange={(e) => changeRole(u.id, e.target.value)}
                            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                          >
                            <option value="user">Jadikan User</option>
                            <option value="admin">Jadikan Admin</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOAST NOTIFIKASI */}
      {notif.show && (
        <div className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl font-medium text-sm text-white animate-in slide-in-from-bottom-8 duration-300 ${notif.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {notif.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {notif.message}
          <button onClick={() => setNotif({ show: false, message: "", type: "" })} className="ml-2 hover:bg-white/20 p-1 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}