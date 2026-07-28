// resources/js/Pages/App.jsx
import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { router } from '@inertiajs/react';
import AppHeader from "../Components/Layout/AppHeader";
import Navbar from "../Components/Layout/Navbar";
import TabBar from "../Components/Layout/TabBar";
import TabContent from "../Components/Layout/TabContent";
import { VIEW_TITLES } from "../constants/tabConfig";
import { useNotif } from "../hooks/useNotif";
import { useTabs } from "../hooks/useTabs";
import { useTransaksi } from "../hooks/useTransaksi";
import axios from 'axios';

import { calculateAutoStatus } from "../utils/deviceUtils";

// Helper to calculate months left for rental contracts
const hitungSisaBulan = (tanggalSelesai) => {
  if (!tanggalSelesai) return null;
  const hariIni = new Date();
  const tglSelesai = new Date(tanggalSelesai);
  if (isNaN(tglSelesai)) return null;
  return (
    (tglSelesai.getFullYear() - hariIni.getFullYear()) * 12 +
    (tglSelesai.getMonth() - hariIni.getMonth())
  );
};

// Helper to calculate days left
const hitungSisaHari = (tanggalSelesai) => {
  if (!tanggalSelesai) return null;
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);
  const tglSelesai = new Date(tanggalSelesai);
  tglSelesai.setHours(0, 0, 0, 0);
  const diffTime = tglSelesai.getTime() - hariIni.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Map database snake_case fields to camelCase expected by the React components
const mapComputer = (c) => ({
  ...c,
  idOutlet: c.outlet_id,
  ipAddress: c.ip_address,
  macAddress: c.mac_address,
  tanggalMulai: c.tanggal_mulai,
  tanggalSelesai: c.tanggal_selesai,
  status: calculateAutoStatus(c.tanggal_mulai, c.tanggal_selesai),
});

const mapPrinter = (p) => ({
  ...p,
  idOutlet: p.outlet_id,
  tanggalMulai: p.tanggal_mulai,
  tanggalSelesai: p.tanggal_selesai,
  status: calculateAutoStatus(p.tanggal_mulai, p.tanggal_selesai),
});

const mapTransactionItem = (item) => ({
  ...item,
  outlet_id: item.outlet_id,
  outlet: item.outlet,
});

const mapTransaction = (t) => ({
  ...t,
  nomorSurat: t.nomor_surat,
  jenisTransaksi: t.jenis_transaksi,
  penerimaNama: t.penerima_nama,
  penerimaJabatan: t.penerima_jabatan,
  penerimaInstansi: t.penerima_instansi,
  pengirimNama: t.pengirim_nama,
  pengirimJabatan: t.pengirim_jabatan,
  pengirimInstansi: t.pengirim_instansi,
  mengetahuiNama: t.mengetahui_nama,
  mengetahuiJabatan: t.mengetahui_jabatan,
  createdAt: t.created_at,
  items: t.items ? t.items.map(mapTransactionItem) : [],
});

const mapActivityLog = (log) => ({
  ...log,
  aksi: log.action,
  modul: log.module,
  keterangan: log.details,
  timestamp: log.timestamp || log.created_at,
});

export default function App(props) {
  const user = props.auth.user;
  const userRole = props.currentUserRole || "user";
  const appId = "logistikku_app_01";

  // State management populated from Laravel props
  const [inventory, setInventory] = useState(props.inventory);
  const [outlets, setOutlets] = useState(props.outlets);
  const [transactions, setTransactions] = useState(() => props.transactions.map(mapTransaction));
  const [computers, setComputers] = useState(() => props.computers.map(mapComputer));
  const [printers, setPrinters] = useState(() => props.printers.map(mapPrinter));
  const [usersList, setUsersList] = useState(props.usersList);
  const [activityLogs, setActivityLogs] = useState(() => props.activityLogs.map(mapActivityLog));
  const [buildingLands, setBuildingLands] = useState(props.buildingLands || []);

  const [buildingSewas, setBuildingSewas] = useState(props.buildingSewas || []);
  const [buildingRenovations, setBuildingRenovations] = useState(props.buildingRenovations || []);
  const [securityFacilities, setSecurityFacilities] = useState(props.securityFacilities || []);
  const [spkHistory, setSpkHistory] = useState(props.spkHistory || []);
  const [soppHistory, setSoppHistory] = useState(props.soppHistory || []);

  const [landFilter, setLandFilter] = useState("");
  const [sewaFilter, setSewaFilter] = useState("");
  const [renovationFilter, setRenovationFilter] = useState("");
  const [securityFilter, setSecurityFilter] = useState("");
  const [printerFilter, setPrinterFilter] = useState("Semua");
  const [computerFilter, setComputerFilter] = useState("Semua");

  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);


  // Sync state whenever props update (via Inertia reloading)
  useEffect(() => {
    setInventory(props.inventory);
    setOutlets(props.outlets);
    setTransactions(props.transactions.map(mapTransaction));
    setComputers(props.computers.map(mapComputer));
    setPrinters(props.printers.map(mapPrinter));
    setUsersList(props.usersList);
    setActivityLogs(props.activityLogs.map(mapActivityLog));
    setBuildingLands(props.buildingLands || []);

    setBuildingSewas(props.buildingSewas || []);
    setBuildingRenovations(props.buildingRenovations || []);
    setSecurityFacilities(props.securityFacilities || []);
    setSpkHistory(props.spkHistory || []);
    setSoppHistory(props.soppHistory || []);

  }, [
    props.inventory,
    props.outlets,
    props.transactions,
    props.computers,
    props.printers,
    props.usersList,
    props.activityLogs,
    props.buildingLands,

    props.buildingSewas,
    props.buildingRenovations,
    props.securityFacilities,
    props.spkHistory,
    props.soppHistory
  ]);

  // Alert calculations for contracts expiring soon (< 3 months) or already expired
  const notifSewa = printers
    .filter((p) => p.tanggalSelesai && p.status !== "Inventaris")
    .map((p) => ({
      ...p,
      sisaBulan: hitungSisaBulan(p.tanggalSelesai),
      sisaHari: hitungSisaHari(p.tanggalSelesai),
    }))
    .filter((p) => p.sisaBulan !== null && p.sisaBulan <= 3)
    .sort((a, b) => a.sisaHari - b.sisaHari);

  const notifSewaKomputer = computers
    .filter((c) => c.tanggalSelesai && c.status !== "Inventaris")
    .map((c) => ({
      ...c,
      sisaBulan: hitungSisaBulan(c.tanggalSelesai),
      sisaHari: hitungSisaHari(c.tanggalSelesai),
    }))
    .filter((c) => c.sisaBulan !== null && c.sisaBulan <= 3)
    .sort((a, b) => a.sisaHari - b.sisaHari);

  const notifLand = buildingLands
    .filter((item) => item.tgl_berakhir_shgb && item.status !== "Done")
    .map((item) => ({ ...item, sisaHari: hitungSisaHari(item.tgl_berakhir_shgb) }))
    .filter((item) => item.sisaHari !== null && item.sisaHari <= 30);

  const notifBuildingSewa = buildingSewas
    .filter((item) => (item.tgl_kontrak_berakhir || item.tanggal_kontrak_berakhir) && item.status !== "Done" && item.status !== "Selesai")
    .map((item) => {
      const tglAkhir = item.tgl_kontrak_berakhir || item.tanggal_kontrak_berakhir;
      return { ...item, sisaHari: hitungSisaHari(tglAkhir) };
    })
    .filter((item) => item.sisaHari !== null && item.sisaHari <= 30);

  // Notifications, Tabs, and Transactions hooks
  const { notif, showNotif } = useNotif();
  const { tabs, setTabs, activeTab, setActiveTab, handleSetView } = useTabs();
  
  // Scroll to top on active tab view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);
  
  const {
    formData, setFormData, items, setItems,
    activeTransaction, setActiveTransaction,
    startNewDocument, addItem, removeItem,
    handleInputChange, handleItemChange, handleSaveTransaction,
    isSaving,
  } = useTransaksi({
    user, appId, transactions, inventory,
    setTransactions, setInventory, setActivityLogs,
    showNotif, navigateTo: handleSetView,
  });

  // Handle Logout via Laravel Session
  const handleLogout = (e) => {
    e?.preventDefault();
    router.post(route('logout'));
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSidebarOpen(window.innerWidth >= 768);
    }
  }, []);

  // Sidebar swipe gestures
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      const duration = Date.now() - startTime;

      // Ensure it is a quick swipe (less than 300ms) and mostly horizontal
      if (duration < 300 && Math.abs(deltaY) < 100) {
        if (!isSidebarOpen && startX < 50 && deltaX > 60) {
          // Swipe right from left edge: open sidebar
          setIsSidebarOpen(true);
        } else if (isSidebarOpen && deltaX < -60) {
          // Swipe left anywhere when sidebar is open: close sidebar
          setIsSidebarOpen(false);
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isSidebarOpen]);

  // Handle User Role update via Laravel API
  const handleUpdateRole = async (userId, newRole) => {
    try {
      await axios.put(`/users/${userId}/role`, { role: newRole });
      router.reload({ only: ['usersList', 'activityLogs'] });
      showNotif(`Role berhasil diubah menjadi ${newRole.toUpperCase()}`, "success");
    } catch (error) {
      const msg = error.response?.data?.message || "Gagal mengubah role";
      showNotif(msg, "error");
      throw error;
    }
  };

  // Swipe back navigation gesture (left-to-right swipe)
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let isSwipeCandidate = false;

    const handleStart = (clientX, clientY, target) => {
      // Do not trigger swipe on inputs, buttons, scrollable blocks, or links
      const tagName = target?.tagName?.toLowerCase();
      if (
        !tagName ||
        ["input", "textarea", "select", "button", "a"].includes(tagName) ||
        target.closest("button") ||
        target.closest("a")
      ) {
        isSwipeCandidate = false;
        return;
      }
      // Allow swipe starting in the left 150px of the screen to bypass native edge gestures
      if (clientX < 150) {
        startX = clientX;
        startY = clientY;
        isSwipeCandidate = true;
      } else {
        isSwipeCandidate = false;
      }
    };

    const handleMove = (clientX, clientY) => {
      if (!isSwipeCandidate) return;
      const deltaX = clientX - startX;
      const deltaY = clientY - startY;

      // Trigger if swiped right more than 80px horizontally with minimal vertical movement
      if (deltaX > 80 && Math.abs(deltaY) < 45) {
        isSwipeCandidate = false; // Prevent double-triggering

        // Back transition logic
        if (activeTab === "preview") {
          handleSetView("form");
        } else if (activeTab === "form") {
          handleSetView("riwayat");
        } else if (["sopp_sewa", "sopp_pengadaan", "spk_renovasi", "spk_elektronik", "spk_kendaraan"].includes(activeTab)) {
          handleSetView("riwayat");
        } else if (activeTab !== "dashboard") {
          handleSetView("dashboard");
        }
      }
    };

    const handleEnd = () => {
      isSwipeCandidate = false;
    };

    // Touch events for mobile/tablet
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY, e.target);
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    };

    // Mouse events for desktop testing
    const handleMouseDown = (e) => {
      handleStart(e.clientX, e.clientY, e.target);
    };

    const handleMouseMove = (e) => {
      if (e.buttons === 1) { // Left mouse button must be held down
        handleMove(e.clientX, e.clientY);
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleEnd, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseup", handleEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
    };
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1712] font-sans text-gray-900 dark:text-slate-100 print:p-0">

      {/* Notification Toast */}
      {notif.show && (
        <div className={`fixed top-4 right-4 z-[999] flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-white ${notif.type === "success" ? "bg-green-600" : "bg-red-500"}`}>
          <CheckCircle className="w-5 h-5" />
          <span>{notif.message}</span>
        </div>
      )}

      {/* Sidebar/Navbar */}
      <Navbar
        view={activeTab}
        setView={handleSetView}
        startNewDocument={startNewDocument}
        handleLogout={handleLogout}
        notifCount={notifSewa.length + notifSewaKomputer.length + notifLand.length + notifBuildingSewa.length}
        userRole={userRole}
        printers={printers}
        computers={computers}
        buildingLands={buildingLands}
        buildingSewas={buildingSewas}
        theme={theme}
        setTheme={setTheme}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        setLandFilter={setLandFilter}
        setSewaFilter={setSewaFilter}
        setComputerFilter={setComputerFilter}
        setPrinterFilter={setPrinterFilter}
        setRenovationFilter={setRenovationFilter}
        setSecurityFilter={setSecurityFilter}
      />

      {/* Main Content Area */}
      <div className={`pt-16 md:pt-0 ${isSidebarOpen ? "md:pl-64" : "md:pl-0"} flex flex-col min-h-screen print:pl-0 print:pt-0 transition-all duration-300`}>

        {/* Sticky App Header */}
        <AppHeader
          user={user}
          title={VIEW_TITLES[activeTab]}
          printers={printers}
          computers={computers}
          buildingLands={buildingLands}
          buildingSewas={buildingSewas}
          setView={handleSetView}
          theme={theme}
          setTheme={setTheme}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Sticky Tab Bar */}
        <TabBar
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setTabs={setTabs}
        />

        {/* Tab content renderer */}
        <div className="flex-1 bg-white pb-12">
          <TabContent
            tabs={tabs}
            activeTab={activeTab}
            userRole={userRole}
            user={user}
            spkHistory={spkHistory}
            soppHistory={soppHistory}
            transactions={transactions}
            setTransactions={setTransactions}
            inventory={inventory}
            outlets={outlets}
            printers={printers}
            computers={computers}
            notifSewa={notifSewa}
            notifSewaKomputer={notifSewaKomputer}
            usersList={usersList}
            activityLogs={activityLogs}
            buildingLands={buildingLands}

            buildingSewas={buildingSewas}
            buildingRenovations={buildingRenovations}
            securityFacilities={securityFacilities}

            formData={formData}
            setFormData={setFormData}
            items={items}
            setItems={setItems}
            activeTransaction={activeTransaction}
            setActiveTransaction={setActiveTransaction}
            handleInputChange={handleInputChange}
            handleItemChange={handleItemChange}
            addItem={addItem}
            removeItem={removeItem}
            handleSaveTransaction={handleSaveTransaction}
            isSaving={isSaving}
            setView={handleSetView}
            handleUpdateRole={handleUpdateRole}
            landFilter={landFilter}
            setLandFilter={setLandFilter}
            sewaFilter={sewaFilter}
            setSewaFilter={setSewaFilter}
            renovationFilter={renovationFilter}
            setRenovationFilter={setRenovationFilter}
            securityFilter={securityFilter}
            setSecurityFilter={setSecurityFilter}
            printerFilter={printerFilter}
            setPrinterFilter={setPrinterFilter}
            computerFilter={computerFilter}
            setComputerFilter={setComputerFilter}
          />
        </div>

      </div>
    </div>
  );
}
