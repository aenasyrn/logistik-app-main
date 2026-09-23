// src/components/Layout/UserBadge.jsx
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  User, ChevronDown, Settings, LogOut, X, Shield, Lock, Mail,
  Eye, EyeOff, ShieldCheck, AlertCircle, Loader2, CheckCircle2,
  Sparkles, KeyRound, UserCheck, ShieldAlert
} from "lucide-react";
import axios from "axios";
import { router } from "@inertiajs/react";

export default function UserBadge({ user, handleLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Profile Form State
  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "password"
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  // Eye Toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [successModal, setSuccessModal] = useState({ show: false, title: "", message: "" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  // User Initial Letter
  const getInitial = (name, email) => {
    const str = name || email || "U";
    return str.charAt(0).toUpperCase();
  };

  const getRoleLabel = (role) => {
    if (role === "admin") return "Administrator";
    if (role === "logistic_officer" || role === "user") return "Logistik Officer";
    if (role === "guest") return "Guest";
    return role || "User";
  };

  const getRoleBadge = (role) => {
    if (role === "admin") return "🛡️ ADMIN";
    if (role === "logistic_officer" || role === "user") return "📦 LOGISTIK";
    if (role === "guest") return "👁️ GUEST";
    return "👤 USER";
  };

  // Password Strength helper
  const getPasswordStrength = (pass) => {
    if (!pass) return null;
    if (pass.length < 6) {
      return {
        label: "Tidak Aman (Kurang dari 6 karakter)",
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});
    try {
      const res = await axios.patch("/profile", profileData, {
        headers: { Accept: "application/json" },
      });
      showToast(res.data?.message || "Detail profil berhasil diperbarui!");
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || "Gagal memperbarui profil");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.password_confirmation) {
      setErrors({ password_confirmation: ["Konfirmasi password tidak cocok dengan password baru"] });
      return;
    }

    setIsSaving(true);
    setErrors({});
    try {
      const res = await axios.put("/password", passwordData, {
        headers: { Accept: "application/json" },
      });
      setIsSettingsOpen(false);
      setSuccessModal({
        show: true,
        title: "Password Berhasil Diubah!",
        message: res.data?.message || "Password akun Anda telah berhasil diperbarui. Silakan gunakan password baru ini untuk login berikutnya.",
      });
      setPasswordData({ current_password: "", password: "", password_confirmation: "" });
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || "Gagal mengubah password");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  const initial = getInitial(user.name, user.email);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Top Right Profile Badge Trigger */}
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 bg-white dark:bg-[#1a2b20] pl-2 pr-3.5 py-1.5 rounded-full shadow-xs border border-gray-200/80 dark:border-[#2b4533] hover:border-[#0d5c3a]/40 dark:hover:border-[#385942] hover:shadow-md transition-all cursor-pointer select-none group"
      >
        {/* Avatar Circle with Initial & Active Pulse */}
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0d5c3a] via-[#1b7a50] to-[#279969] text-white font-extrabold text-sm flex items-center justify-center shadow-xs border border-white/20">
            {initial}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#1a2b20] rounded-full animate-pulse" />
        </div>

        <div className="text-left pr-0.5 hidden sm:block">
          <div className="flex items-center gap-1">
            <span className="font-bold text-gray-800 dark:text-slate-100 text-xs leading-tight truncate max-w-[140px] group-hover:text-[#0d5c3a] dark:group-hover:text-emerald-400 transition-colors">
              {user.name || user.email}
            </span>
          </div>
          <p className="text-[10px] font-bold text-[#0d5c3a] dark:text-emerald-400 leading-tight uppercase tracking-wider mt-0.5">
            {getRoleLabel(user.role)}
          </p>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-slate-200 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2.5 w-64 bg-white dark:bg-[#18271e] border border-gray-100 dark:border-[#284231] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0d5c3a] via-[#156e49] to-[#279969] p-4 text-white relative overflow-hidden">
            <div className="absolute -right-4 -bottom-6 w-20 h-20 bg-white/10 rounded-full blur-xs pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md text-white font-black text-base flex items-center justify-center border border-white/30 shadow-inner">
                {initial}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-sm leading-tight truncate drop-shadow-xs">
                  {user.name || "Pengguna"}
                </p>
                <p className="text-[11px] text-emerald-100/90 truncate font-mono mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/15">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-white border border-white/20">
                {getRoleBadge(user.role)}
              </span>
              <span className="text-[10px] font-semibold text-emerald-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-ping" /> Online
              </span>
            </div>
          </div>

          <div className="p-2 space-y-1">
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(false);
                setIsSettingsOpen(true);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-emerald-50/80 dark:hover:bg-[#243e2e] hover:text-[#0d5c3a] dark:hover:text-emerald-300 flex items-center gap-3 transition-all cursor-pointer group"
            >
              <div className="p-1.5 bg-gray-100 dark:bg-emerald-950/60 rounded-lg group-hover:bg-[#0d5c3a] group-hover:text-white transition-colors">
                <Settings className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="leading-tight">Pengaturan Akun</p>
                <p className="text-[10px] font-normal text-gray-400 dark:text-slate-400 mt-0.5">Profil & Keamanan Password</p>
              </div>
            </button>

            <div className="h-px bg-gray-100 dark:bg-[#284231] my-1" />

            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(false);
                localStorage.removeItem("smartlog_last_activity");
                if (handleLogout) {
                  handleLogout();
                } else {
                  router.post("/logout");
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-3 transition-all cursor-pointer group"
            >
              <div className="p-1.5 bg-red-50 dark:bg-red-950/60 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                <LogOut className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="leading-tight">Keluar Akun</p>
                <p className="text-[10px] font-normal text-red-400 dark:text-red-300 mt-0.5">Logout dari sistem</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Account Settings Modal */}
      {isSettingsOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#16251c] rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 text-left border border-gray-100 dark:border-[#263e2e]">
              {/* Modal Hero Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-[#0d5c3a] via-[#156e49] to-[#279969] text-white flex justify-between items-center shrink-0 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-md pointer-events-none" />
                <div className="flex items-center gap-3.5 relative z-10">
                  <div className="w-11 h-11 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                    <Settings className="w-6 h-6 text-emerald-200" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg leading-tight flex items-center gap-2">
                      Pengaturan Akun <Sparkles className="w-4 h-4 text-amber-300" />
                    </h3>
                    <p className="text-xs text-emerald-100/90 mt-0.5">
                      Kelola identitas akun dan perbarui keamanan sandi Anda.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/15 transition-all cursor-pointer relative z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

            {/* Profile Summary Card Banner */}
            <div className="bg-slate-50 dark:bg-[#111e16] px-6 py-4 border-b border-gray-100 dark:border-[#223b2c] flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0d5c3a] to-[#279969] text-white font-black text-xl flex items-center justify-center shadow-md shadow-[#0d5c3a]/20 border-2 border-white dark:border-[#16251c] shrink-0">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-slate-100 truncate">
                  {user.name || "Pengguna System"}
                </h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-mono truncate mt-0.5">
                  {user.email}
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-100 text-[#0d5c3a] dark:bg-emerald-950 dark:text-emerald-300 text-xs font-extrabold uppercase border border-emerald-200/60 dark:border-emerald-800/40 shrink-0">
                {getRoleBadge(user.role)}
              </span>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-100 dark:border-[#263e2e] bg-white dark:bg-[#16251c] px-6 pt-2 gap-3 shrink-0">
              <button
                type="button"
                onClick={() => { setActiveTab("profile"); setErrors({}); }}
                className={`pb-3 px-4 text-xs font-extrabold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                  activeTab === "profile"
                    ? "border-[#0d5c3a] text-[#0d5c3a] dark:text-emerald-400"
                    : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                }`}
              >
                <UserCheck className="w-4 h-4" /> Detail Profil
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab("password"); setErrors({}); }}
                className={`pb-3 px-4 text-xs font-extrabold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                  activeTab === "password"
                    ? "border-[#0d5c3a] text-[#0d5c3a] dark:text-emerald-400"
                    : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> Keamanan Password
              </button>
            </div>

            {/* Toast Notification Inside Modal */}
            {toast.show && (
              <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-emerald-50 text-[#0d5c3a] dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                {toast.message}
              </div>
            )}

            {/* Modal Body: Detail Profile Tab */}
            {activeTab === "profile" && (
              <form onSubmit={handleUpdateProfile} className="flex flex-col flex-1 overflow-hidden min-h-0">
                <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-slate-200 mb-1.5">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        placeholder="Masukkan nama lengkap Anda"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#1f3326] border border-gray-200 dark:border-[#2a4533] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d5c3a] text-sm font-semibold text-gray-900 dark:text-slate-100 transition-all"
                      />
                    </div>
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-slate-200 mb-1.5">
                      Alamat Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        placeholder="contoh@email.com"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#1f3326] border border-gray-200 dark:border-[#2a4533] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d5c3a] text-sm font-semibold text-gray-900 dark:text-slate-100 transition-all"
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-slate-200 mb-1.5">
                      Hak Akses (Role Akses)
                    </label>
                    <div className="px-4 py-3 bg-slate-50 dark:bg-[#1b2b20] border border-gray-200 dark:border-[#294231] rounded-2xl text-sm font-bold text-gray-800 dark:text-slate-200 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#0d5c3a] dark:text-emerald-400" />
                        {getRoleLabel(user.role)}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-xl bg-emerald-100 text-[#0d5c3a] dark:bg-emerald-950 dark:text-emerald-300 font-black uppercase">
                        {getRoleBadge(user.role)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-[#121f17] border-t border-gray-100 dark:border-[#243b2c] flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-4 py-2.5 bg-white dark:bg-[#1c2e22] border border-gray-200 dark:border-[#2b4734] text-gray-700 dark:text-slate-300 hover:bg-gray-100 rounded-xl text-xs font-bold transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-[#0d5c3a] hover:bg-[#0a4228] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50 shadow-md shadow-[#0d5c3a]/20 cursor-pointer"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Perubahan Profil"}
                  </button>
                </div>
              </form>
            )}

            {/* Modal Body: Password Security Tab */}
            {activeTab === "password" && (
              <form onSubmit={handleUpdatePassword} className="flex flex-col flex-1 overflow-hidden min-h-0">
                <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                  {/* Security Tip Box */}
                  <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-[#0d5c3a] dark:text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                      <strong className="font-bold">Tips Keamanan:</strong> Gunakan password minimal 6–8 karakter dengan kombinasi huruf besar, angka, atau simbol agar akun Anda selalu aman.
                    </p>
                  </div>

                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-slate-200 mb-1.5">
                      Password Saat Ini <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        required
                        placeholder="Masukkan password Anda saat ini"
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-[#1f3326] border border-gray-200 dark:border-[#2a4533] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d5c3a] text-sm font-medium text-gray-900 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        tabIndex={-1}
                        title={showCurrentPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.current_password && <p className="text-xs text-red-500 mt-1">{errors.current_password[0]}</p>}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-slate-200 mb-1.5">
                      Password Baru <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        placeholder="Masukkan password baru (min. 6 karakter)"
                        value={passwordData.password}
                        onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-[#1f3326] border border-gray-200 dark:border-[#2a4533] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d5c3a] text-sm font-medium text-gray-900 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        tabIndex={-1}
                        title={showNewPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {passwordData.password && (() => {
                      const strength = getPasswordStrength(passwordData.password);
                      return (
                        <div className="mt-2 space-y-1 bg-gray-50 dark:bg-[#132219] p-3 rounded-2xl border border-gray-100 dark:border-[#223b2b]">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-gray-500 dark:text-slate-400">Status Keamanan Password:</span>
                            <span className={`font-bold ${strength.color} flex items-center gap-1`}>
                              {strength.score === 3 ? (
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <AlertCircle className="w-3.5 h-3.5" />
                              )}
                              {strength.label}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden flex gap-1 mt-1.5">
                            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.bgColor : "bg-gray-200 dark:bg-gray-700"}`} />
                            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.bgColor : "bg-gray-200 dark:bg-gray-700"}`} />
                            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.bgColor : "bg-gray-200 dark:bg-gray-700"}`} />
                          </div>
                        </div>
                      );
                    })()}
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password[0]}</p>}
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-slate-200 mb-1.5">
                      Konfirmasi Password Baru <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        placeholder="Ulangi password baru Anda"
                        value={passwordData.password_confirmation}
                        onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-[#1f3326] border border-gray-200 dark:border-[#2a4533] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d5c3a] text-sm font-medium text-gray-900 dark:text-slate-100"
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
                    {passwordData.password_confirmation && passwordData.password !== passwordData.password_confirmation && (
                      <p className="text-xs text-red-500 mt-1 font-medium">Konfirmasi password tidak cocok dengan password baru!</p>
                    )}
                    {errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation[0]}</p>}
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-[#121f17] border-t border-gray-100 dark:border-[#243b2c] flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-4 py-2.5 bg-white dark:bg-[#1c2e22] border border-gray-200 dark:border-[#2b4734] text-gray-700 dark:text-slate-300 hover:bg-gray-100 rounded-xl text-xs font-bold transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-[#0d5c3a] hover:bg-[#0a4228] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50 shadow-md shadow-[#0d5c3a]/20 cursor-pointer"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Perbarui Password Akun"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Success Notification Popup Modal */}
      {successModal.show &&
        createPortal(
          <div 
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setSuccessModal({ show: false, title: "", message: "" })}
          >
            <div 
              className="bg-white dark:bg-[#16251c] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 text-center border border-gray-100 dark:border-[#263e2e]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 sm:p-7">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/70 border-2 border-emerald-200 dark:border-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4 text-[#0d5c3a] dark:text-emerald-400 shadow-lg shadow-[#0d5c3a]/10">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2">
                  {successModal.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-300 leading-relaxed">
                  {successModal.message}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-[#121f17] border-t border-gray-100 dark:border-[#243b2c]">
                <button
                  type="button"
                  onClick={() => setSuccessModal({ show: false, title: "", message: "" })}
                  className="w-full py-2.5 px-4 bg-[#0d5c3a] hover:bg-[#0a4228] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#0d5c3a]/20 cursor-pointer"
                >
                  OK, Mengerti
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}