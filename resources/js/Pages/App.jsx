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

// Map database snake_case fields to camelCase expected by the React components
const mapComputer = (c) => ({
  ...c,
  idOutlet: c.outlet_id,
  ipAddress: c.ip_address,
  macAddress: c.mac_address,
  tanggalMulai: c.tanggal_mulai,
  tanggalSelesai: c.tanggal_selesai,
});

const mapPrinter = (p) => ({
  ...p,
  idOutlet: p.outlet_id,
  tanggalMulai: p.tanggal_mulai,
  tanggalSelesai: p.tanggal_selesai,
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

  ]);

  // Alert calculations for contracts expiring soon (< 3 months)
  const notifSewa = printers
    .filter((p) => p.tanggalSelesai && p.status === "Sewa Berjalan")
    .map((p) => ({ ...p, sisaBulan: hitungSisaBulan(p.tanggalSelesai) }))
    .filter((p) => p.sisaBulan !== null && p.sisaBulan <= 3 && p.sisaBulan >= 0)
    .sort((a, b) => a.sisaBulan - b.sisaBulan);

  const notifSewaKomputer = computers
    .filter((c) => c.tanggalSelesai && c.status === "Sewa Berjalan")
    .map((c) => ({ ...c, sisaBulan: hitungSisaBulan(c.tanggalSelesai) }))
    .filter((c) => c.sisaBulan !== null && c.sisaBulan <= 3 && c.sisaBulan >= 0)
    .sort((a, b) => a.sisaBulan - b.sisaBulan);

  // Notifications, Tabs, and Transactions hooks
  const { notif, showNotif } = useNotif();
  const { tabs, setTabs, activeTab, setActiveTab, handleSetView } = useTabs();
  
  const {
    formData, setFormData, items, setItems,
    activeTransaction, setActiveTransaction,
    startNewDocument, addItem, removeItem,
    handleInputChange, handleItemChange, handleSaveTransaction,
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 print:p-0">

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
        notifCount={notifSewa.length + notifSewaKomputer.length}
        userRole={userRole}
      />

      {/* Main Content Area */}
      <div className="pt-16 md:pt-0 md:pl-64 flex flex-col min-h-screen print:pl-0 print:pt-0">

        {/* Sticky App Header */}
        <AppHeader
          user={user}
          title={VIEW_TITLES[activeTab]}
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
            transactions={transactions}
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
            setView={handleSetView}
            handleUpdateRole={handleUpdateRole}
          />
        </div>

      </div>
    </div>
  );
}
