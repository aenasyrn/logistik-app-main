"use client";

import { useState } from "react";
import {
  Package, LayoutDashboard, Menu, X, LogOut, ChevronDown, Box, Building2, Database, 
  ArrowRightLeft, History, FileText, Server, Monitor, Printer, Bell, Shield, Activity,
  Map, Hammer, Warehouse, Key, Users
} from "lucide-react";

const Navbar = ({ view, setView, startNewDocument, handleLogout, notifCount = 0, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // State untuk mengontrol dropdown
  const [isMasterOpen, setIsMasterOpen] = useState(view.startsWith("master_"));
  const [isTransaksiOpen, setIsTransaksiOpen] = useState(view === "riwayat" || view === "form");
  const [isPerangkatOpen, setIsPerangkatOpen] = useState(view.startsWith("perangkat_"));

  const closeMenu = () => setIsOpen(false);

  const handleNavClick = (targetView) => {
    setView(targetView);
    closeMenu();
  };

  // Menjalankan fungsi Buat Surat Baru secara default
  const handleStartNew = () => {
    startNewDocument(); // Otomatis akan tersetting default (Barang Keluar) dari page.jsx
    closeMenu();
  };

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-30 print:hidden shadow-sm">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-lg text-gray-900 tracking-tight">LogistikKu</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setView("dashboard")} className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-6 h-6" />
            {notifCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {notifCount}
              </span>
            )}
          </button>
          <button onClick={() => setIsOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {isOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-40 print:hidden transition-opacity" onClick={closeMenu} />}

      <aside className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 print:hidden flex flex-col z-50 shadow-lg md:shadow-sm transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="flex items-center justify-between px-6 h-16 md:h-20 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Package className="w-6 h-6 md:w-7 md:h-7 text-blue-600 shrink-0" />
            </div>
            <span className="font-bold text-lg md:text-xl text-gray-900 tracking-tight">LogistikKu</span>
          </div>
          <button 
            onClick={() => handleNavClick("dashboard")}
            title="Lihat Peringatan di Dashboard"
            className="hidden md:flex relative p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                {notifCount}
              </span>
            )}
          </button>

          <button onClick={closeMenu} className="md:hidden p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-6 custom-scrollbar pb-6">
          
          {/* MENU DASHBOARD */}
          <button onClick={() => handleNavClick("dashboard")} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${view === "dashboard" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}>
            <LayoutDashboard className="w-5 h-5" /> Dashboard Informasi
          </button>

          {/* KATEGORI: INVENTARIS */}
          <div className="pt-3 pb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4">Inventaris</span>
          </div>

          {/* MENU DROPDOWN: TRANSAKSI (Semua User Bisa Akses) */}
          <div className="space-y-1">
            <button onClick={() => setIsTransaksiOpen(!isTransaksiOpen)} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-between transition-colors ${view === "riwayat" || view === "form" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}>
              <div className="flex items-center gap-3">
                <ArrowRightLeft className="w-5 h-5" /> Transaksi
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isTransaksiOpen ? "rotate-180" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isTransaksiOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-gray-100 ml-6 mt-1">
                <button onClick={() => handleNavClick("riwayat")} className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${view === "riwayat" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-blue-700 hover:bg-blue-50"}`}>
                  <History className="w-4 h-4" /> Riwayat Transaksi
                </button>
                <button onClick={handleStartNew} className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${view === "form" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:text-indigo-700 hover:bg-indigo-50"}`}>
                  <FileText className="w-4 h-4" /> Buat Surat Baru
                </button>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* MENU DROPDOWN: DATA MASTER (Kini Semua Bisa Akses) */}
          {/* ================================================= */}
          <div className="space-y-1 mt-2">
            <button onClick={() => setIsMasterOpen(!isMasterOpen)} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-between transition-colors ${view.startsWith("master_") ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}>
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5" /> Data Master
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isMasterOpen ? "rotate-180" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMasterOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-gray-100 ml-6 mt-1">
                <button onClick={() => handleNavClick("master_barang")} className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${view === "master_barang" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-blue-700 hover:bg-blue-50"}`}>
                  <Box className="w-4 h-4" /> Master Barang
                </button>
                <button onClick={() => handleNavClick("master_outlet")} className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${view === "master_outlet" ? "bg-purple-100 text-purple-700" : "text-gray-500 hover:text-purple-700 hover:bg-purple-50"}`}>
                  <Building2 className="w-4 h-4" /> Master Instansi
                </button>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* MENU DROPDOWN: DATA PERANGKAT (Kini Semua Bisa Akses) */}
          {/* ================================================= */}
          <div className="space-y-1 mt-2">
            <button onClick={() => setIsPerangkatOpen(!isPerangkatOpen)} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-between transition-colors ${view.startsWith("perangkat_") ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}>
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5" /> Data Perangkat
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isPerangkatOpen ? "rotate-180" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isPerangkatOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-gray-100 ml-6 mt-1">
                <button onClick={() => handleNavClick("perangkat_komputer")} className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${view === "perangkat_komputer" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-blue-700 hover:bg-blue-50"}`}>
                  <Monitor className="w-4 h-4" /> Data Komputer
                </button>
                <button onClick={() => handleNavClick("perangkat_printer")} className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${view === "perangkat_printer" ? "bg-green-100 text-green-700" : "text-gray-500 hover:text-green-700 hover:bg-green-50"}`}>
                  <Printer className="w-4 h-4" /> Data Printer
                </button>
              </div>
            </div>
          </div>

          {/* KATEGORI: BANGUNAN */}
          <div className="pt-4 pb-1 border-t border-gray-100 mt-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4">Bangunan</span>
          </div>

          {/* MENU FLAT: DAFTAR TANAH */}
          <button onClick={() => handleNavClick("bangunan_tanah")} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${view === "bangunan_tanah" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}>
            <Map className="w-5 h-5" /> Daftar Tanah
          </button>

          {/* MENU FLAT: DAFTAR GEDUNG */}
          <button onClick={() => handleNavClick("bangunan_gedung")} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${view === "bangunan_gedung" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}>
            <Building2 className="w-5 h-5" /> Daftar Gedung
          </button>

          {/* MENU FLAT: SEWA */}
          <button onClick={() => handleNavClick("bangunan_sewa")} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${view === "bangunan_sewa" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}>
            <Key className="w-5 h-5" /> Sewa
          </button>

          {/* MENU FLAT: RENOVASI */}
          <button onClick={() => handleNavClick("bangunan_renovasi")} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${view === "bangunan_renovasi" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}>
            <Hammer className="w-5 h-5" /> Renovasi
          </button>

          {/* MENU FLAT: GUDANG TERPADU */}
          <button onClick={() => handleNavClick("bangunan_gudang")} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${view === "bangunan_gudang" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}>
            <Warehouse className="w-5 h-5" /> Gudang Terpadu
          </button>

          {/* KATEGORI: PENGAMANAN DAN KORPORASI */}
          <div className="pt-4 pb-1 border-t border-gray-100 mt-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4">Pengamanan dan Korporasi</span>
          </div>

          {/* MENU FLAT: PENGAMANAN DAN KORPORASI */}
          <button onClick={() => handleNavClick("bangunan_sarana")} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 text-left transition-colors ${view === "bangunan_sarana" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}>
            <Shield className="w-5 h-5 shrink-0" />
            <span>Pengamanan dan Korporasi</span>
          </button>

          {/* ================================================= */}
          {/* MENU MANAJEMEN USER (HANYA ADMIN)                 */}
          {/* ================================================= */}
          {userRole === "admin" && (
            <div className="pt-4 mt-2 border-t border-gray-100 space-y-1">
              <button onClick={() => handleNavClick("kelola_user")} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${view === "kelola_user" ? "bg-red-50 text-red-700" : "text-gray-600 hover:bg-gray-50"}`}>
                <Users className="w-5 h-5" /> Manajemen Akses
              </button>
              {/* TOMBOL LOG AKTIVITAS BARU */}
              <button onClick={() => handleNavClick("log_aktivitas")} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${view === "log_aktivitas" ? "bg-orange-50 text-orange-700" : "text-gray-600 hover:bg-gray-50"}`}>
                <Activity className="w-5 h-5" /> Log Aktivitas
              </button>
            </div>
          )}

        </nav>

        <div className="p-4 border-t border-gray-100 shrink-0 mt-auto">
          <button onClick={handleLogout} className="w-full py-2.5 px-4 mb-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors">
            <LogOut className="w-4 h-4" /> Keluar Sistem
          </button>
          <div className="text-xs text-center text-gray-400 font-medium leading-relaxed">
            <p>© 2026 Departemen Logistik</p>
            <p>Developed by Alzi Rahmana Putra</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navbar;