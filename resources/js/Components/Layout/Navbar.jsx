"use client";

import { useState } from "react";
import {
  Package, LayoutDashboard, Menu, X, LogOut, ChevronDown, Box, Building2, Database,
  ArrowRightLeft, History, FileText, Server, Monitor, Printer, Bell, Shield, Activity,
  Map, Hammer, Warehouse, Key, Users, Sun, Moon, ClipboardList, List, Cpu, Car
} from "lucide-react";
import NotificationBell from "./NotificationBell";

const Navbar = ({
  view,
  setView,
  startNewDocument,
  handleLogout,
  notifCount = 0,
  userRole,
  printers = [],
  computers = [],
  buildingLands = [],
  buildingSewas = [],
  theme,
  setTheme,
  isSidebarOpen,
  setIsSidebarOpen,
  setLandFilter,
  setSewaFilter,
  setComputerFilter,
  setPrinterFilter,
  setRenovationFilter,
  setSecurityFilter,
}) => {
  // State untuk mengontrol dropdown
  const [isMasterOpen, setIsMasterOpen] = useState(view.startsWith("master_"));
  const [isPerangkatOpen, setIsPerangkatOpen] = useState(view.startsWith("perangkat_"));
  const [isBuatSuratOpen, setIsBuatSuratOpen] = useState(view.startsWith("spk_") || view.startsWith("sopp_") || view === "form");
  const [isSpkOpen, setIsSpkOpen] = useState(view.startsWith("spk_"));
  const [isSoppOpen, setIsSoppOpen] = useState(view.startsWith("sopp_"));

  const closeMenu = () => setIsSidebarOpen(false);

  const handleNavClick = (targetView) => {
    // Reset all filters when user navigates to any menu
    if (setLandFilter) setLandFilter("");
    if (setSewaFilter) setSewaFilter("");
    if (setRenovationFilter) setRenovationFilter("");
    if (setSecurityFilter) setSecurityFilter("");
    if (setComputerFilter) setComputerFilter("Semua");
    if (setPrinterFilter) setPrinterFilter("Semua");

    // Force dispatch event to reset all local component filter states
    window.dispatchEvent(new CustomEvent("reset-all-filters"));

    if (targetView.startsWith("sopp_")) {
      localStorage.setItem("selected_sopp_to_edit", "NEW");
      window.dispatchEvent(new CustomEvent("load-sopp-document", { detail: "NEW" }));
    } else if (targetView.startsWith("spk_")) {
      localStorage.setItem("selected_spk_to_edit", "NEW");
      window.dispatchEvent(new CustomEvent("load-spk-document", { detail: "NEW" }));
    }
    setView(targetView);
  };

  // Menjalankan fungsi Buat Surat Baru secara default
  const handleStartNew = () => {
    // Reset all filters when starting a new document
    if (setLandFilter) setLandFilter("");
    if (setSewaFilter) setSewaFilter("");
    if (setRenovationFilter) setRenovationFilter("");
    if (setSecurityFilter) setSecurityFilter("");
    if (setComputerFilter) setComputerFilter("Semua");
    if (setPrinterFilter) setPrinterFilter("Semua");

    window.dispatchEvent(new CustomEvent("reset-all-filters"));

    startNewDocument(); // Otomatis akan tersetting default (Barang Keluar) dari page.jsx
  };

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#1a2b20] border-b border-gray-200 dark:border-[#2b4533] flex items-center justify-between px-4 z-30 print:hidden shadow-sm transition-colors">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSidebarOpen(true)} className="p-1.5 text-gray-600 dark:text-[#ffffff] hover:bg-gray-100 dark:hover:bg-[#1a2b20] rounded-lg transition-colors cursor-pointer flex items-center justify-center">
            <List className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600 dark:text-[#48a359]" />
            <span className="font-bold text-lg text-gray-900 dark:text-[#f1f5f3] tracking-tight">LogistikKu</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl border border-gray-200 dark:border-[#2b4533] bg-white dark:bg-[#1a2b20] text-gray-600 dark:text-[#ffffff] hover:bg-gray-50 dark:hover:bg-[#243e2e] transition-all shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
            aria-label="Toggle Theme"
            type="button"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-[#48a359]" /> : <Moon className="w-4 h-4" />}
          </button>
          <NotificationBell
            printers={printers}
            computers={computers}
            buildingLands={buildingLands}
            buildingSewas={buildingSewas}
            setView={setView}
            isMobile={true}
          />
        </div>
      </div>

      {isSidebarOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-40 print:hidden transition-opacity" onClick={closeMenu} />}

      <aside className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-[#0c1410] border-r border-gray-200 dark:border-[#213527] print:hidden flex flex-col z-50 shadow-lg md:shadow-sm transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 px-4 h-16 md:h-20 border-b border-gray-100 dark:border-[#213527] shrink-0">
          <button onClick={closeMenu} className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1a2b20] rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0">
            <List className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="bg-blue-50 dark:bg-[#243e2e] p-1.5 rounded-lg">
              <Package className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-[#48a359] shrink-0" />
            </div>
            <span className="font-bold text-base md:text-lg text-gray-900 dark:text-[#f1f5f3] tracking-tight">LogistikKu</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-6 custom-scrollbar pb-6">

          {/* MENU DASHBOARD */}
          <button onClick={() => handleNavClick("dashboard")} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 text-left transition-colors ${view === "dashboard" ? "bg-blue-50 text-blue-700 dark:bg-[#48a359] dark:text-white" : "text-gray-600 dark:text-[#ffffff] hover:bg-gray-50 dark:hover:bg-[#1a2b20] dark:hover:text-[#48a359]"}`}>
            <LayoutDashboard className="w-5 h-5 shrink-0" /> Dashboard Informasi
          </button>

          {/* KATEGORI: SURAT */}
          <div className="pt-3 pb-1 border-t border-gray-100 dark:border-[#213527] mt-2">
            <span className="block text-sm font-bold text-gray-400 dark:text-[#ffffff] uppercase tracking-wider px-4">Surat</span>
          </div>

          {/* MENU DROPDOWN: BUAT SURAT */}
          <div className="space-y-1">
            <button onClick={() => setIsBuatSuratOpen(!isBuatSuratOpen)} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-between text-left transition-colors ${view.startsWith("spk_") || view.startsWith("sopp_") || view === "form" ? "bg-blue-50 text-blue-700 dark:bg-[#1a2b20] dark:text-[#48a359]" : "text-gray-600 dark:text-[#ffffff] hover:bg-gray-50 dark:hover:bg-[#1a2b20] dark:hover:text-[#48a359]"}`}>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 shrink-0" /> Buat Surat
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 shrink-0 ${isBuatSuratOpen ? "rotate-180" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isBuatSuratOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-gray-100 dark:border-[#213527] ml-6 mt-1">
                <button onClick={handleStartNew} className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-3 text-left transition-colors ${view === "form" ? "bg-blue-100 text-blue-700 dark:bg-[#243e2e] dark:text-[#48a359]" : "text-gray-500 dark:text-[#ffffff] hover:text-blue-700 dark:hover:text-[#48a359] hover:bg-blue-50 dark:hover:bg-[#1a2b20]"}`}>
                  <FileText className="w-4 h-4 shrink-0" /> Surat Serah Terima
                </button>

                {/* Collapsible Sub-Dropdown: SPK */}
                <div className="space-y-1">
                  <button onClick={() => setIsSpkOpen(!isSpkOpen)} className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm flex items-center justify-between text-left transition-colors ${view.startsWith("spk_") ? "text-blue-700 dark:text-[#48a359] bg-blue-50/50 dark:bg-[#1a2b20]/50" : "text-gray-500 dark:text-[#ffffff] hover:text-blue-700 dark:hover:text-[#48a359] hover:bg-blue-50/50 dark:hover:bg-[#1a2b20]/50"}`}>
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 shrink-0" /> SPK
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 shrink-0 ${isSpkOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSpkOpen ? "max-h-36 opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="pl-4 pr-1 py-1 space-y-1 border-l border-gray-100 dark:border-[#213527] ml-4 mt-0.5">
                      <button onClick={() => handleNavClick("spk_renovasi")} className={`w-full px-4 py-2 rounded-xl font-medium text-xs flex items-center gap-3 text-left transition-colors ${view === "spk_renovasi" ? "bg-blue-100 text-blue-700 dark:bg-[#243e2e] dark:text-[#48a359]" : "text-gray-400 dark:text-[#ffffff] hover:text-blue-700 dark:hover:text-[#48a359] hover:bg-blue-50 dark:hover:bg-[#1a2b20]"}`}>
                        Renovasi
                      </button>
                      <button onClick={() => handleNavClick("spk_elektronik")} className={`w-full px-4 py-2 rounded-xl font-medium text-xs flex items-center gap-3 text-left transition-colors ${view === "spk_elektronik" ? "bg-blue-100 text-blue-700 dark:bg-[#243e2e] dark:text-[#48a359]" : "text-gray-400 dark:text-[#ffffff] hover:text-blue-700 dark:hover:text-[#48a359] hover:bg-blue-50 dark:hover:bg-[#1a2b20]"}`}>
                        Elektronik
                      </button>
                      <button onClick={() => handleNavClick("spk_kendaraan")} className={`w-full px-4 py-2 rounded-xl font-medium text-xs flex items-center gap-3 text-left transition-colors ${view === "spk_kendaraan" ? "bg-blue-100 text-blue-700 dark:bg-[#243e2e] dark:text-[#48a359]" : "text-gray-400 dark:text-[#ffffff] hover:text-blue-700 dark:hover:text-[#48a359] hover:bg-blue-50 dark:hover:bg-[#1a2b20]"}`}>
                        Kendaraan
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible Sub-Dropdown: SOPP */}
                <div className="space-y-1">
                  <button onClick={() => setIsSoppOpen(!isSoppOpen)} className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm flex items-center justify-between text-left transition-colors ${view.startsWith("sopp_") ? "text-blue-700 dark:text-[#48a359] bg-blue-50/50 dark:bg-[#1a2b20]/50" : "text-gray-500 dark:text-[#ffffff] hover:text-blue-700 dark:hover:text-[#48a359] hover:bg-blue-50/50 dark:hover:bg-[#1a2b20]/50"}`}>
                    <div className="flex items-center gap-3">
                      <ClipboardList className="w-4 h-4 shrink-0" /> SOPP
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 shrink-0 ${isSoppOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSoppOpen ? "max-h-24 opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="pl-4 pr-1 py-1 space-y-1 border-l border-gray-100 dark:border-[#213527] ml-4 mt-0.5">
                      <button onClick={() => handleNavClick("sopp_pengadaan")} className={`w-full px-4 py-2 rounded-xl font-medium text-xs flex items-center gap-3 text-left transition-colors ${view === "sopp_pengadaan" ? "bg-blue-100 text-blue-700 dark:bg-[#243e2e] dark:text-[#48a359]" : "text-gray-400 dark:text-[#ffffff] hover:text-blue-700 dark:hover:text-[#48a359] hover:bg-blue-50 dark:hover:bg-[#1a2b20]"}`}>
                        Pengadaan
                      </button>
                      <button onClick={() => handleNavClick("sopp_sewa")} className={`w-full px-4 py-2 rounded-xl font-medium text-xs flex items-center gap-3 text-left transition-colors ${view === "sopp_sewa" ? "bg-blue-100 text-blue-700 dark:bg-[#243e2e] dark:text-[#48a359]" : "text-gray-400 dark:text-[#ffffff] hover:text-blue-700 dark:hover:text-[#48a359] hover:bg-blue-50 dark:hover:bg-[#1a2b20]"}`}>
                        Sewa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MENU FLAT: RIWAYAT SURAT */}
          <button onClick={() => handleNavClick("riwayat")} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 text-left transition-colors ${view === "riwayat" ? "bg-blue-50 text-blue-700 dark:bg-[#48a359] dark:text-white" : "text-gray-600 dark:text-[#ffffff] hover:bg-gray-50 dark:hover:bg-[#1a2b20] dark:hover:text-[#48a359]"}`}>
            <History className="w-5 h-5 shrink-0" /> Riwayat Surat
          </button>

          {/* KATEGORI: INVENTARIS */}
          <div className="pt-3 pb-1 border-t border-gray-100 dark:border-[#213527] mt-2">
            <span className="block text-sm font-bold text-gray-400 dark:text-[#ffffff] uppercase tracking-wider px-4">Inventaris</span>
          </div>



          {/* MENU DROPDOWN: DATA MASTER */}
          <div className="space-y-1 mt-2">
            <button onClick={() => setIsMasterOpen(!isMasterOpen)} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-between text-left transition-colors ${view.startsWith("master_") ? "bg-blue-50 text-blue-700 dark:bg-[#1a2b20] dark:text-[#48a359]" : "text-gray-600 dark:text-[#ffffff] hover:bg-gray-50 dark:hover:bg-[#1a2b20] dark:hover:text-[#48a359]"}`}>
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 shrink-0" /> Data Master
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 shrink-0 ${isMasterOpen ? "rotate-180" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMasterOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-gray-100 dark:border-[#213527] ml-6 mt-1">
                <button onClick={() => handleNavClick("master_barang")} className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-3 text-left transition-colors ${view === "master_barang" ? "bg-blue-100 text-blue-700 dark:bg-[#243e2e] dark:text-[#48a359]" : "text-gray-500 dark:text-[#ffffff] hover:text-blue-700 dark:hover:text-[#48a359] hover:bg-blue-50 dark:hover:bg-[#1a2b20]"}`}>
                  <Box className="w-4 h-4 shrink-0" /> Master Barang
                </button>
                <button onClick={() => handleNavClick("master_outlet")} className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-3 text-left transition-colors ${view === "master_outlet" ? "bg-blue-100 text-blue-700 dark:bg-[#243e2e] dark:text-[#48a359]" : "text-gray-500 dark:text-[#ffffff] hover:text-blue-700 dark:hover:text-[#48a359] hover:bg-blue-50 dark:hover:bg-[#1a2b20]"}`}>
                  <Building2 className="w-4 h-4 shrink-0" /> Master Instansi
                </button>
              </div>
            </div>
          </div>

          {/* MENU DROPDOWN: DATA PERANGKAT */}
          <div className="space-y-1 mt-2">
            <button onClick={() => setIsPerangkatOpen(!isPerangkatOpen)} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-between text-left transition-colors ${view.startsWith("perangkat_") ? "bg-blue-50 text-blue-700 dark:bg-[#1a2b20] dark:text-[#48a359]" : "text-gray-600 dark:text-[#ffffff] hover:bg-gray-50 dark:hover:bg-[#1a2b20] dark:hover:text-[#48a359]"}`}>
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 shrink-0" /> Data Perangkat
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 shrink-0 ${isPerangkatOpen ? "rotate-180" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isPerangkatOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-gray-100 dark:border-[#213527] ml-6 mt-1">
                <button onClick={() => handleNavClick("perangkat_komputer")} className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-3 text-left transition-colors ${view === "perangkat_komputer" ? "bg-blue-100 text-blue-700 dark:bg-[#243e2e] dark:text-[#48a359]" : "text-gray-500 dark:text-[#ffffff] hover:text-blue-700 dark:hover:text-[#48a359] hover:bg-blue-50 dark:hover:bg-[#1a2b20]"}`}>
                  <Monitor className="w-4 h-4 shrink-0" /> Data Komputer
                </button>
                <button onClick={() => handleNavClick("perangkat_printer")} className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-3 text-left transition-colors ${view === "perangkat_printer" ? "bg-green-100 text-green-700 dark:bg-[#243e2e] dark:text-[#48a359]" : "text-gray-500 dark:text-[#ffffff] hover:text-green-700 dark:hover:text-[#48a359] hover:bg-green-50 dark:hover:bg-[#1a2b20]"}`}>
                  <Printer className="w-4 h-4 shrink-0" /> Data Printer
                </button>
              </div>
            </div>
          </div>

          {/* KATEGORI: BANGUNAN */}
          <div className="pt-4 pb-1 border-t border-gray-100 dark:border-[#213527] mt-2">
            <span className="block text-sm font-bold text-gray-400 dark:text-[#ffffff] uppercase tracking-wider px-4">Bangunan</span>
          </div>

          {/* MENU FLAT: DAFTAR TANAH */}
          <button onClick={() => handleNavClick("bangunan_tanah")} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 text-left transition-colors ${view === "bangunan_tanah" ? "bg-blue-50 text-blue-700 dark:bg-[#48a359] dark:text-white" : "text-gray-600 dark:text-[#ffffff] hover:bg-gray-50 dark:hover:bg-[#1a2b20] dark:hover:text-[#48a359]"}`}>
            <Map className="w-5 h-5 shrink-0" /> Daftar Tanah
          </button>

          {/* MENU FLAT: SEWA */}
          <button onClick={() => handleNavClick("bangunan_sewa")} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 text-left transition-colors ${view === "bangunan_sewa" ? "bg-blue-50 text-blue-700 dark:bg-[#48a359] dark:text-white" : "text-gray-600 dark:text-[#ffffff] hover:bg-gray-50 dark:hover:bg-[#1a2b20] dark:hover:text-[#48a359]"}`}>
            <Key className="w-5 h-5 shrink-0" /> Sewa
          </button>

          {/* MENU FLAT: RENOVASI */}
          <button onClick={() => handleNavClick("bangunan_renovasi")} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 text-left transition-colors ${view === "bangunan_renovasi" ? "bg-blue-50 text-blue-700 dark:bg-[#48a359] dark:text-white" : "text-gray-600 dark:text-[#ffffff] hover:bg-gray-50 dark:hover:bg-[#1a2b20] dark:hover:text-[#48a359]"}`}>
            <Hammer className="w-5 h-5 shrink-0" /> Renovasi
          </button>



          {/* KATEGORI: PENGAMANAN DAN KORPORASI */}
          <div className="pt-4 pb-1 border-t border-gray-100 dark:border-[#213527] mt-2">
            <span className="block text-sm font-bold text-gray-400 dark:text-[#ffffff] uppercase tracking-wider px-4">Pengamanan dan Korporasi</span>
          </div>

          {/* MENU FLAT: PENGAMANAN DAN KORPORASI */}
          <button onClick={() => handleNavClick("bangunan_sarana")} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 text-left transition-colors ${view === "bangunan_sarana" ? "bg-blue-50 text-blue-700 dark:bg-[#48a359] dark:text-white" : "text-gray-600 dark:text-[#ffffff] hover:bg-gray-50 dark:hover:bg-[#1a2b20] dark:hover:text-[#48a359]"}`}>
            <Shield className="w-5 h-5 shrink-0" />
            <span>Pengamanan dan Korporasi</span>
          </button>

          {/* MENU MANAJEMEN USER (HANYA ADMIN) */}
          {userRole === "admin" && (
            <div className="pt-4 mt-2 border-t border-gray-100 dark:border-[#213527] space-y-1">
              <button onClick={() => handleNavClick("kelola_user")} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 text-left transition-colors ${view === "kelola_user" ? "bg-red-50 text-red-700 dark:bg-[#1a2b20] dark:text-red-450" : "text-gray-600 dark:text-[#ffffff] hover:bg-gray-50 dark:hover:bg-[#1a2b20] dark:hover:text-red-450"}`}>
                <Users className="w-5 h-5 shrink-0" /> Manajemen Akses
              </button>
              <button onClick={() => handleNavClick("log_aktivitas")} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 text-left transition-colors ${view === "log_aktivitas" ? "bg-orange-50 text-orange-700 dark:bg-[#1a2b20] dark:text-orange-450" : "text-gray-600 dark:text-[#ffffff] hover:bg-gray-50 dark:hover:bg-[#1a2b20] dark:hover:text-orange-400"}`}>
                <Activity className="w-5 h-5 shrink-0" /> Log Aktivitas
              </button>
            </div>
          )}

        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-[#213527] shrink-0 mt-auto">
          <button onClick={handleLogout} className="w-full py-2.5 px-4 mb-4 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors">
            <LogOut className="w-4 h-4" /> Keluar Sistem
          </button>
          <div className="text-xs text-center text-gray-400 dark:text-[#ffffff] font-medium leading-relaxed">
            <p>© 2026 Departemen Logistik</p>
            <p>Developed by Alzi Rahmana Putra</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
