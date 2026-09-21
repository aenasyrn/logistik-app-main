"use client";

import { useState } from "react";
import {
  Package, LayoutDashboard, Menu, X, LogOut, ChevronDown, Box, Building2, Database,
  History, FileText, Monitor, Printer, Laptop, Shield, Activity, Map, Hammer, Warehouse,
  Users, Sun, Moon, List, ClipboardList, Cpu, Columns, Home as HomeIcon, Settings
} from "lucide-react";
import NotificationBell from "./NotificationBell";
import { MejaIcon, KursiIcon, LemariIcon, SofaIcon, ACIcon } from "../Inventaris/Meubelair/FurnitureIcons";

const Navbar = ({
  view,
  setView,
  startNewDocument,
  handleLogout,
  notifCount = 0,
  userRole,
  printers = [],
  computers = [],
  laptops = [],
  notifSewaLaptop = null,
  buildingLands = [],
  buildingSewas = [],
  theme,
  setTheme,
  user,
  isSidebarOpen,
  setIsSidebarOpen,
  setLandFilter,
  setSewaFilter,
  setComputerFilter,
  setLaptopFilter,
  setPrinterFilter,
  setRenovationFilter,
  setSecurityFilter,
}) => {
  // Helper to determine primary category based on current view
  const getPrimaryCategory = (v) => {
    if (v.startsWith("dashboard") || v === "dashboard") return "home";
    if (v.startsWith("spk_") || v.startsWith("sopp_") || v === "form" || v === "riwayat") return "surat";
    if (v.startsWith("master_")) return "data_master";
    if (v.startsWith("perangkat_") || v.startsWith("inventaris_") || v.startsWith("mebelair_") || v === "pusat_data_barang") return "inventaris";
    if (v.startsWith("bangunan_")) return "bangunan";
    if (v === "log_aktivitas" || v === "kelola_user") return "pengaturan";
    return "home";
  };

  const [activePrimary, setActivePrimary] = useState(getPrimaryCategory(view));

  // State for sub-dropdowns
  const [isSpkOpen, setIsSpkOpen] = useState(view.startsWith("spk_"));
  const [isSoppOpen, setIsSoppOpen] = useState(view.startsWith("sopp_"));
  const [isMebelairOpen, setIsMebelairOpen] = useState(view.startsWith("mebelair_") || view === "inventaris_mebelair");
  const [isNonMebelairOpen, setIsNonMebelairOpen] = useState(view.startsWith("perangkat_"));
  const [isDaftarBangunanOpen, setIsDaftarBangunanOpen] = useState(view === "bangunan_sewa" || view === "bangunan_renovasi");
  const [isMasterBarangOpen, setIsMasterBarangOpen] = useState(
    view === "master_barang" || view === "master_barang_meubelair" || view === "master_barang_non_meubelair"
  );

  const closeMenu = () => setIsSidebarOpen(false);

  // Accordion toggle helpers: membuka satu sub-fitur akan otomatis menutup sub-fitur lainnya
  const toggleSpk = () => {
    setIsSpkOpen((prev) => {
      const next = !prev;
      if (next) {
        setIsSoppOpen(false);
        setIsMebelairOpen(false);
        setIsNonMebelairOpen(false);
        setIsDaftarBangunanOpen(false);
      }
      return next;
    });
  };

  const toggleSopp = () => {
    setIsSoppOpen((prev) => {
      const next = !prev;
      if (next) {
        setIsSpkOpen(false);
        setIsMebelairOpen(false);
        setIsNonMebelairOpen(false);
        setIsDaftarBangunanOpen(false);
      }
      return next;
    });
  };

  const toggleMebelair = () => {
    setIsMebelairOpen((prev) => {
      const next = !prev;
      if (next) {
        setIsNonMebelairOpen(false);
        setIsSpkOpen(false);
        setIsSoppOpen(false);
        setIsDaftarBangunanOpen(false);
      }
      return next;
    });
  };

  const toggleNonMebelair = () => {
    setIsNonMebelairOpen((prev) => {
      const next = !prev;
      if (next) {
        setIsMebelairOpen(false);
        setIsSpkOpen(false);
        setIsSoppOpen(false);
        setIsDaftarBangunanOpen(false);
      }
      return next;
    });
  };

  const toggleDaftarBangunan = () => {
    setIsDaftarBangunanOpen((prev) => {
      const next = !prev;
      if (next) {
        setIsMebelairOpen(false);
        setIsNonMebelairOpen(false);
        setIsSpkOpen(false);
        setIsSoppOpen(false);
      }
      return next;
    });
  };

  const toggleMasterBarang = () => {
    setIsMasterBarangOpen((prev) => !prev);
  };

  const handleNavClick = (targetView) => {
    // Reset filters when user navigates
    if (setLandFilter) setLandFilter("");
    if (setSewaFilter) setSewaFilter("");
    if (setRenovationFilter) setRenovationFilter("");
    if (setSecurityFilter) setSecurityFilter("");
    if (setComputerFilter) setComputerFilter("Semua");
    if (setPrinterFilter) setPrinterFilter("Semua");

    window.dispatchEvent(new CustomEvent("reset-all-filters"));

    if (targetView.startsWith("sopp_")) {
      localStorage.setItem("selected_sopp_to_edit", "NEW");
      window.dispatchEvent(new CustomEvent("load-sopp-document", { detail: "NEW" }));
      setIsSoppOpen(true);
      setIsSpkOpen(false);
      setIsMebelairOpen(false);
      setIsNonMebelairOpen(false);
      setIsDaftarBangunanOpen(false);
    } else if (targetView.startsWith("spk_")) {
      localStorage.setItem("selected_spk_to_edit", "NEW");
      window.dispatchEvent(new CustomEvent("load-spk-document", { detail: "NEW" }));
      setIsSpkOpen(true);
      setIsSoppOpen(false);
      setIsMebelairOpen(false);
      setIsNonMebelairOpen(false);
      setIsDaftarBangunanOpen(false);
    } else if (targetView.startsWith("mebelair_") || targetView === "inventaris_mebelair") {
      setIsMebelairOpen(true);
      setIsNonMebelairOpen(false);
      setIsSpkOpen(false);
      setIsSoppOpen(false);
      setIsDaftarBangunanOpen(false);
    } else if (targetView.startsWith("perangkat_")) {
      setIsNonMebelairOpen(true);
      setIsMebelairOpen(false);
      setIsSpkOpen(false);
      setIsSoppOpen(false);
      setIsDaftarBangunanOpen(false);
    } else if (targetView === "bangunan_sewa" || targetView === "bangunan_renovasi") {
      setIsDaftarBangunanOpen(true);
      setIsMebelairOpen(false);
      setIsNonMebelairOpen(false);
      setIsSpkOpen(false);
      setIsSoppOpen(false);
    } else if (targetView.startsWith("master_barang")) {
      setIsMasterBarangOpen(true);
      setIsMebelairOpen(false);
      setIsNonMebelairOpen(false);
      setIsSpkOpen(false);
      setIsSoppOpen(false);
      setIsDaftarBangunanOpen(false);
    } else {
      setIsMebelairOpen(false);
      setIsNonMebelairOpen(false);
      setIsSpkOpen(false);
      setIsSoppOpen(false);
      setIsDaftarBangunanOpen(false);
    }
    setView(targetView);
    setActivePrimary(getPrimaryCategory(targetView));
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleStartNew = () => {
    if (setLandFilter) setLandFilter("");
    if (setSewaFilter) setSewaFilter("");
    if (setRenovationFilter) setRenovationFilter("");
    if (setSecurityFilter) setSecurityFilter("");
    if (setComputerFilter) setComputerFilter("Semua");
    if (setPrinterFilter) setPrinterFilter("Semua");

    window.dispatchEvent(new CustomEvent("reset-all-filters"));
    startNewDocument();
    setActivePrimary("surat");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const primaryCategory = activePrimary || getPrimaryCategory(view);

  const primaryNavItems = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "surat", label: "Surat", icon: FileText },
    { id: "data_master", label: "Data Master", icon: Database },
    { id: "inventaris", label: "Inventaris", icon: ClipboardList },
    { id: "bangunan", label: "Bangunan", icon: Building2 },
    ...(userRole !== "guest" ? [{ id: "pengaturan", label: "Pengaturan", icon: Settings }] : []),
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#061910] text-gray-900 dark:text-white flex items-center justify-between px-4 z-30 print:hidden shadow-sm border-b border-gray-200 dark:border-[#213527] transition-colors">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2.5">
            <img src="/logo-smartlog.png" alt="SMARTLOG Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
            <div className="flex items-center text-lg font-bold tracking-tight">
              <span className="text-[#0d5c3a] dark:text-[#22c55e]">SMART</span>
              <span className="text-[#4ade80] dark:text-[#86efac]">LOG</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl border border-gray-200 dark:border-[#2b4533] bg-white dark:bg-[#1a2b20] text-gray-600 dark:text-[#ffffff] hover:bg-gray-50 dark:hover:bg-[#243e2e] transition-all shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
            aria-label="Toggle Theme"
            type="button"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-gray-600" />}
          </button>
          <NotificationBell
            printers={printers}
            computers={computers}
            laptops={laptops}
            notifSewaLaptop={notifSewaLaptop}
            buildingLands={buildingLands}
            buildingSewas={buildingSewas}
            setView={handleNavClick}
            activeTab={view}
            isMobile={true}
          />
        </div>
      </div>

      {/* Backdrop for Mobile */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40 print:hidden transition-opacity" onClick={closeMenu} />
      )}

      {/* Main Sidebar Wrapper */}
      <aside
        className={`fixed top-0 left-0 h-screen z-50 print:hidden flex transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* PRIMARY LEFT ICON SIDEBAR (Rich Modern Dark Green Gradient) */}
        <div className="w-[84px] bg-gradient-to-b from-[#0d5c3a] via-[#137447] to-[#083c25] dark:from-[#052819] dark:via-[#073622] dark:to-[#03140d] flex flex-col items-center shrink-0 shadow-xl text-white">
          {/* Top Menu / Logo Icon */}
          <div className="h-16 flex items-center justify-center w-full border-b border-white/10 shrink-0">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
              title={isSidebarOpen ? "Sembunyikan Sub-Navigasi" : "Buka Sub-Navigasi"}
            >
              {isSidebarOpen ? (
                <Menu className="w-6 h-6 text-white" />
              ) : (
                <div className="w-11 h-11 bg-white dark:bg-[#1a2b20] rounded-xl flex items-center justify-center shadow-md p-1">
                  <img src="/logo-smartlog.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
              )}
            </button>
          </div>

          {/* Primary Nav Icons */}
          <nav className="flex-1 w-full space-y-1 pb-2">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = primaryCategory === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePrimary(item.id);
                    if (userRole === "guest" && item.id === "surat") {
                      handleNavClick("riwayat");
                    }
                    if (!isSidebarOpen) setIsSidebarOpen(true);
                  }}
                  className={`w-full flex flex-col items-center justify-center py-4 px-1 text-center transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#ffffff] dark:bg-[#061910] text-[#0d5c3a] dark:text-emerald-400 font-bold shadow-sm"
                      : "text-white hover:bg-white/10"
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-7 h-7 mb-1.5 ${isActive ? "text-[#0d5c3a] dark:text-emerald-400" : "text-white"}`} />
                  <span className={`text-[11px] leading-tight tracking-tight font-semibold px-0.5 ${isActive ? "text-[#0d5c3a] dark:text-emerald-400" : "text-white"}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* SECONDARY SUB-NAV SIDEBAR */}
        <div
          className={`w-[260px] bg-slate-50/90 dark:bg-[#0c1410]/95 backdrop-blur-md border-r border-gray-200/80 dark:border-[#213527] flex flex-col h-full shadow-lg transition-all duration-300 ${
            isSidebarOpen ? "block" : "hidden"
          }`}
        >
          {/* Top Logo & Title area */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-gray-200/80 dark:border-[#213527]">
            <div className="flex items-center gap-2.5">
              <img src="/logo-smartlog.png" alt="Logo" className="w-9 h-9 object-contain drop-shadow-sm" />
              <div>
                <span className="text-sm font-extrabold tracking-tight text-[#0d5c3a] dark:text-[#22c55e]">
                  SMART<span className="text-[#4ade80] dark:text-[#86efac]">LOG</span>
                </span>
                <span className="block text-[9px] font-semibold text-gray-500 uppercase tracking-widest leading-none mt-0.5">
                  Logistik & Umum
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Tutup Sub-Navigasi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-menu Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1 scrollbar-thin">
            {/* SUB-MENU FOR HOME */}
            {primaryCategory === "home" && (
              <div className="space-y-1">
                <button
                  onClick={() => handleNavClick("dashboard")}
                  className={`w-full px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-3 text-left transition-all ${
                    view === "dashboard" || view === "dashboard_inventaris"
                      ? "bg-[#279969]/20 text-[#0d5c3a] border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-200 shadow-2xs font-bold"
                      : "text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#1a2b20]"
                  }`}
                >
                  <HomeIcon className="w-5 h-5 shrink-0" />
                  <span>Dashboard Inventaris</span>
                </button>

                <button
                  onClick={() => handleNavClick("dashboard_bangunan")}
                  className={`w-full px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-3 text-left transition-all ${
                    view === "dashboard_bangunan"
                      ? "bg-[#279969]/20 text-[#0d5c3a] border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-200 shadow-2xs font-bold"
                      : "text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#1a2b20]"
                  }`}
                >
                  <Building2 className="w-5 h-5 shrink-0" />
                  <span>Dashboard Bangunan</span>
                </button>

                <button
                  onClick={() => handleNavClick("dashboard_pengamanan")}
                  className={`w-full px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-3 text-left transition-all ${
                    view === "dashboard_pengamanan"
                      ? "bg-[#279969]/20 text-[#0d5c3a] border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-200 shadow-2xs font-bold"
                      : "text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#1a2b20]"
                  }`}
                >
                  <Shield className="w-5 h-5 shrink-0" />
                  <span>Dashboard Pengamanan & Korporasi</span>
                </button>
              </div>
            )}

            {/* SUB-MENU FOR SURAT */}
            {primaryCategory === "surat" && (
              <div className="space-y-2">
                <button
                  onClick={handleStartNew}
                  className={`w-full px-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-between text-left transition-all ${
                    view === "form"
                      ? "bg-[#279969]/20 text-[#0d5c3a] border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-200 shadow-2xs font-bold"
                      : "text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#1a2b20]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 shrink-0" />
                    <span>Surat Serah Terima</span>
                  </div>
                </button>

                {/* SPK Dropdown */}
                <div className="space-y-1">
                  <button
                    onClick={toggleSpk}
                    className={`w-full px-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-between text-left transition-all ${
                      view.startsWith("spk_")
                        ? "bg-[#279969]/20 text-[#0d5c3a] border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-200 shadow-2xs font-bold"
                        : "text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#1a2b20]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 shrink-0" />
                      <span>SPK</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isSpkOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isSpkOpen && (
                    <div className="pl-6 space-y-1.5 border-l-2 border-gray-200 dark:border-[#213527] ml-5 mt-1">
                      <button
                        onClick={() => handleNavClick("spk_renovasi")}
                        className={`w-full px-3 py-2 rounded-lg font-semibold text-sm text-left transition-colors ${
                          view === "spk_renovasi"
                            ? "text-[#0d5c3a] font-bold bg-[#279969]/20 border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-300"
                            : "text-gray-700 dark:text-slate-300 hover:text-gray-900"
                        }`}
                      >
                        Renovasi
                      </button>
                      <button
                        onClick={() => handleNavClick("spk_elektronik")}
                        className={`w-full px-3 py-2 rounded-lg font-semibold text-sm text-left transition-colors ${
                          view === "spk_elektronik"
                            ? "text-[#0d5c3a] font-bold bg-[#279969]/20 border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-300"
                            : "text-gray-700 dark:text-slate-300 hover:text-gray-900"
                        }`}
                      >
                        Elektronik
                      </button>
                      <button
                        onClick={() => handleNavClick("spk_kendaraan")}
                        className={`w-full px-3 py-2 rounded-lg font-semibold text-sm text-left transition-colors ${
                          view === "spk_kendaraan"
                            ? "text-[#0d5c3a] font-bold bg-[#279969]/20 border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-300"
                            : "text-gray-700 dark:text-slate-300 hover:text-gray-900"
                        }`}
                      >
                        Kendaraan
                      </button>
                    </div>
                  )}
                </div>

                {/* SOPP Dropdown */}
                <div className="space-y-1">
                  <button
                    onClick={toggleSopp}
                    className={`w-full px-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-between text-left transition-all ${
                      view.startsWith("sopp_")
                        ? "bg-[#279969]/20 text-[#0d5c3a] border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-200 shadow-2xs font-bold"
                        : "text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#1a2b20]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 shrink-0" />
                      <span>SOPP</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isSoppOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isSoppOpen && (
                    <div className="pl-6 space-y-1.5 border-l-2 border-gray-200 dark:border-[#213527] ml-5 mt-1">
                      <button
                        onClick={() => handleNavClick("sopp_pengadaan")}
                        className={`w-full px-3 py-2 rounded-lg font-semibold text-sm text-left transition-colors ${
                          view === "sopp_pengadaan"
                            ? "text-[#0d5c3a] font-bold bg-[#279969]/20 border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-300"
                            : "text-gray-700 dark:text-slate-300 hover:text-gray-900"
                        }`}
                      >
                        Pengadaan
                      </button>
                      <button
                        onClick={() => handleNavClick("sopp_sewa")}
                        className={`w-full px-3 py-2 rounded-lg font-semibold text-sm text-left transition-colors ${
                          view === "sopp_sewa"
                            ? "text-[#0d5c3a] font-bold bg-[#279969]/20 border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-300"
                            : "text-gray-700 dark:text-slate-300 hover:text-gray-900"
                        }`}
                      >
                        Sewa
                      </button>
                      <button
                        onClick={() => handleNavClick("sopp_renovasi")}
                        className={`w-full px-3 py-2 rounded-lg font-semibold text-sm text-left transition-colors ${
                          view === "sopp_renovasi"
                            ? "text-[#0d5c3a] font-bold bg-[#279969]/20 border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-300"
                            : "text-gray-700 dark:text-slate-300 hover:text-gray-900"
                        }`}
                      >
                        Renovasi
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleNavClick("riwayat")}
                  className={`w-full px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-3 text-left transition-all ${
                    view === "riwayat"
                      ? "bg-[#279969]/20 text-[#0d5c3a] border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-200 shadow-2xs font-bold"
                      : "text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#1a2b20]"
                  }`}
                >
                  <History className="w-5 h-5 shrink-0" />
                  <span>Riwayat Surat</span>
                </button>
              </div>
            )}

            {/* SUB-MENU FOR DATA MASTER */}
            {primaryCategory === "data_master" && (
              <div className="space-y-2">
                {/* Master Barang Dropdown */}
                <div className="space-y-1">
                  <button
                    onClick={toggleMasterBarang}
                    className={`w-full px-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-between text-left transition-all ${
                      view === "master_barang" || view === "master_barang_meubelair" || view === "master_barang_non_meubelair"
                        ? "bg-[#279969]/20 text-[#0d5c3a] border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-200 shadow-2xs font-bold"
                        : "text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#1a2b20]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Box className="w-5 h-5 shrink-0" />
                      <span>Master Barang</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isMasterBarangOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isMasterBarangOpen && (
                    <div className="pl-6 space-y-1.5 border-l-2 border-gray-200 dark:border-[#213527] ml-5 mt-1">
                      <button
                        onClick={() => handleNavClick("master_barang_meubelair")}
                        className={`w-full px-3 py-2 rounded-lg font-semibold text-sm text-left transition-colors flex items-center gap-2.5 ${
                          view === "master_barang_meubelair" || (view === "master_barang" && !view.includes("non_meubelair"))
                            ? "text-[#0d5c3a] font-bold bg-[#279969]/20 border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-300"
                            : "text-gray-700 dark:text-slate-300 hover:text-gray-900"
                        }`}
                      >
                        <Warehouse className="w-4 h-4 shrink-0" />
                        <span>Meubelair</span>
                      </button>
                      <button
                        onClick={() => handleNavClick("master_barang_non_meubelair")}
                        className={`w-full px-3 py-2 rounded-lg font-semibold text-sm text-left transition-colors flex items-center gap-2.5 ${
                          view === "master_barang_non_meubelair"
                            ? "text-[#0d5c3a] font-bold bg-[#279969]/20 border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-300"
                            : "text-gray-700 dark:text-slate-300 hover:text-gray-900"
                        }`}
                      >
                        <Box className="w-4 h-4 shrink-0" />
                        <span>Non Meubelair</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleNavClick("master_outlet")}
                  className={`w-full px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-3 text-left transition-all ${
                    view === "master_outlet"
                      ? "bg-[#279969]/20 text-[#0d5c3a] border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-200 shadow-2xs font-bold"
                      : "text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#1a2b20]"
                  }`}
                >
                  <Building2 className="w-5 h-5 shrink-0" />
                  <span>Master Outlet</span>
                </button>
                <button
                  onClick={() => handleNavClick("master_vendor")}
                  className={`w-full px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-3 text-left transition-all ${
                    view === "master_vendor"
                      ? "bg-[#279969]/20 text-[#0d5c3a] border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-200 shadow-2xs font-bold"
                      : "text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#1a2b20]"
                  }`}
                >
                  <Users className="w-5 h-5 shrink-0" />
                  <span>Master Vendor</span>
                </button>
              </div>
            )}

            {/* SUB-MENU FOR INVENTARIS */}
            {primaryCategory === "inventaris" && (
              <div className="space-y-2">
                <button
                  onClick={() => handleNavClick("pusat_data_barang")}
                  className={`w-full px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-3 text-left transition-all ${
                    view === "pusat_data_barang"
                      ? "bg-[#279969]/20 text-[#0d5c3a] border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-200 shadow-2xs font-bold"
                      : "text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#1a2b20]"
                  }`}
                >
                  <FileText className="w-5 h-5 shrink-0" />
                  <span>Pusat Data Barang</span>
                </button>
                {/* Meubelair Single Link */}
                <button
                  onClick={() => handleNavClick("inventaris_mebelair")}
                  className={`w-full px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-3 text-left transition-all ${
                    view === "inventaris_mebelair" || view.startsWith("mebelair_")
                      ? "bg-[#279969]/20 text-[#0d5c3a] border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-200 shadow-2xs font-bold"
                      : "text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#1a2b20]"
                  }`}
                >
                  <Warehouse className="w-5 h-5 shrink-0" />
                  <span>Meubelair</span>
                </button>

                {/* Non Meubelair Dropdown */}
                <div className="space-y-1">
                  <button
                    onClick={toggleNonMebelair}
                    className={`w-full px-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-between text-left transition-all ${
                      view.startsWith("perangkat_")
                        ? "bg-[#279969]/20 text-[#0d5c3a] border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-200 shadow-2xs font-bold"
                        : "text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#1a2b20]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Cpu className="w-5 h-5 shrink-0" />
                      <span>Non Meubelair</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isNonMebelairOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isNonMebelairOpen && (
                    <div className="pl-6 space-y-1.5 border-l-2 border-gray-200 dark:border-[#213527] ml-5 mt-1">
                      <button
                        onClick={() => handleNavClick("perangkat_komputer")}
                        className={`w-full px-3 py-2 rounded-lg font-semibold text-sm text-left transition-colors flex items-center gap-2.5 ${
                          view === "perangkat_komputer"
                            ? "text-[#0d5c3a] font-bold bg-[#279969]/20 border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-300"
                            : "text-gray-700 dark:text-slate-300 hover:text-gray-900"
                        }`}
                      >
                        <Monitor className="w-4 h-4 shrink-0" />
                        <span>Data Komputer</span>
                      </button>
                      <button
                        onClick={() => handleNavClick("perangkat_printer")}
                        className={`w-full px-3 py-2 rounded-lg font-semibold text-sm text-left transition-colors flex items-center gap-2.5 ${
                          view === "perangkat_printer"
                            ? "text-[#0d5c3a] font-bold bg-[#279969]/20 border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-300"
                            : "text-gray-700 dark:text-slate-300 hover:text-gray-900"
                        }`}
                      >
                        <Printer className="w-4 h-4 shrink-0" />
                        <span>Data Printer</span>
                      </button>
                      <button
                        onClick={() => handleNavClick("perangkat_laptop")}
                        className={`w-full px-3 py-2 rounded-lg font-semibold text-sm text-left transition-colors flex items-center gap-2.5 ${
                          view === "perangkat_laptop"
                            ? "text-[#0d5c3a] font-bold bg-[#279969]/20 border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-300"
                            : "text-gray-700 dark:text-slate-300 hover:text-gray-900"
                        }`}
                      >
                        <Laptop className="w-4 h-4 shrink-0" />
                        <span>Data Laptop</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-MENU FOR BANGUNAN */}
            {primaryCategory === "bangunan" && (
              <div className="space-y-2">
                <button
                  onClick={() => handleNavClick("bangunan_tanah")}
                  className={`w-full px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-3 text-left transition-all ${
                    view === "bangunan_tanah"
                      ? "bg-[#279969]/20 text-[#0d5c3a] border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-200 shadow-2xs font-bold"
                      : "text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#1a2b20]"
                  }`}
                >
                  <Map className="w-5 h-5 shrink-0" />
                  <span>Daftar Tanah</span>
                </button>

                {/* Daftar Bangunan Dropdown */}
                <div className="space-y-1">
                  <button
                    onClick={toggleDaftarBangunan}
                    className={`w-full px-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-between text-left transition-all ${
                      view === "bangunan_sewa" || view === "bangunan_renovasi"
                        ? "bg-[#279969]/20 text-[#0d5c3a] border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-200 shadow-2xs font-bold"
                        : "text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#1a2b20]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 shrink-0" />
                      <span>Daftar Bangunan</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDaftarBangunanOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isDaftarBangunanOpen && (
                    <div className="pl-6 space-y-1.5 border-l-2 border-gray-200 dark:border-[#213527] ml-5 mt-1">
                      <button
                        onClick={() => handleNavClick("bangunan_sewa")}
                        className={`w-full px-3 py-2 rounded-lg font-semibold text-sm text-left transition-colors ${
                          view === "bangunan_sewa"
                            ? "text-[#0d5c3a] font-bold bg-[#279969]/20 border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-300"
                            : "text-gray-700 dark:text-slate-300 hover:text-gray-900"
                        }`}
                      >
                        Sewa Bangunan
                      </button>
                      <button
                        onClick={() => handleNavClick("bangunan_renovasi")}
                        className={`w-full px-3 py-2 rounded-lg font-semibold text-sm text-left transition-colors ${
                          view === "bangunan_renovasi"
                            ? "text-[#0d5c3a] font-bold bg-[#279969]/20 border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-300"
                            : "text-gray-700 dark:text-slate-300 hover:text-gray-900"
                        }`}
                      >
                        Renovasi
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleNavClick("bangunan_sarana")}
                  className={`w-full px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-3 text-left transition-all ${
                    view === "bangunan_sarana"
                      ? "bg-[#279969]/20 text-[#0d5c3a] border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-200 shadow-2xs font-bold"
                      : "text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#1a2b20]"
                  }`}
                >
                  <Shield className="w-5 h-5 shrink-0" />
                  <span>Pengamanan dan Korporasi</span>
                </button>
              </div>
            )}

            {/* SUB-MENU FOR PENGATURAN */}
            {primaryCategory === "pengaturan" && (
              <div className="space-y-2">
                {userRole !== "guest" && (
                  <button
                    onClick={() => handleNavClick("log_aktivitas")}
                    className={`w-full px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-3 text-left transition-all ${
                      view === "log_aktivitas"
                        ? "bg-[#279969]/20 text-[#0d5c3a] border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-200 shadow-2xs font-bold"
                        : "text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#1a2b20]"
                    }`}
                  >
                    <Activity className="w-5 h-5 shrink-0" />
                    <span>Log Aktivitas</span>
                  </button>
                )}
                {userRole === "admin" && (
                  <button
                    onClick={() => handleNavClick("kelola_user")}
                    className={`w-full px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-3 text-left transition-all ${
                      view === "kelola_user"
                        ? "bg-[#279969]/20 text-[#0d5c3a] border border-[#279969]/30 dark:bg-[#279969]/30 dark:text-emerald-200 shadow-2xs font-bold"
                        : "text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#1a2b20]"
                    }`}
                  >
                    <Users className="w-5 h-5 shrink-0" />
                    <span>Manajemen Akses</span>
                  </button>
                )}
              </div>
            )}
          </nav>

          {/* Bottom Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-[#213527] shrink-0 mt-auto">
            <div className="text-[10px] text-center text-gray-400 dark:text-slate-500 font-medium leading-tight">
              <p>© {new Date().getFullYear()} Departemen Logistik dan Umum</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
