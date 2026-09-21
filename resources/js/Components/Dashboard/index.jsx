// src/components/Dashboard/index.jsx
"use client";

import React, { useState } from "react";
import NotificationAlerts  from "./NotificationAlerts";
import TransactionActivity from "./TransactionActivity";
import ComputerStats       from "./ComputerStats";
import LaptopStats         from "./LaptopStats";
import PrinterStats        from "./PrinterStats";
import MeubelairStats      from "./MeubelairStats";
import BuildingDashboardView from "./BuildingDashboardView";
import SecurityDashboardView from "./SecurityDashboardView";

const DashboardView = ({
  transactions = [],
  setView,
  activeTab,
  inventory = [],
  notifSewa = [],
  notifSewaKomputer = [],
  notifSewaLaptop = [],
  printers = [],
  computers = [],
  laptops = [],
  meubelairs = [],
  jenisMeubelairs = [],
  buildingLands = [],
  buildingSewas = [],
  buildingRenovations = [],
  securityFacilities = [],
  landFilter,
  setLandFilter,
  sewaFilter,
  setSewaFilter,
  securityFilter,
  setSecurityFilter,
  computerFilter,
  setComputerFilter,
  laptopFilter,
  setLaptopFilter,
  printerFilter,
  setPrinterFilter,
  landSearch,
  setLandSearch,
  sewaSearch,
  setSewaSearch,
  printerSearch,
  setPrinterSearch,
  computerSearch,
  setComputerSearch,
  laptopSearch,
  setLaptopSearch,
  notificationCategoryFilter,
  setNotificationCategoryFilter,
}) => {
  const [activeSubTab, setActiveSubTab] = useState(() => {
    if (activeTab === "dashboard_bangunan") return "bangunan";
    if (activeTab === "dashboard_pengamanan") return "pengamanan";
    return "inventaris";
  });

  React.useEffect(() => {
    if (activeTab === "dashboard_bangunan") setActiveSubTab("bangunan");
    else if (activeTab === "dashboard_pengamanan") setActiveSubTab("pengamanan");
    else if (activeTab === "dashboard_inventaris" || activeTab === "dashboard") setActiveSubTab("inventaris");
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      {activeSubTab === "inventaris" ? (
        <>
          {/* BLOK 1: NOTIFIKASI */}
          <NotificationAlerts
            notifSewa={notifSewa}
            notifSewaKomputer={notifSewaKomputer}
            notifSewaLaptop={notifSewaLaptop}
            setView={setView}
            setPrinterFilter={setPrinterFilter}
            setComputerFilter={setComputerFilter}
            setLaptopFilter={setLaptopFilter}
            setPrinterSearch={setPrinterSearch}
            setComputerSearch={setComputerSearch}
            setLaptopSearch={setLaptopSearch}
            setNotificationCategoryFilter={setNotificationCategoryFilter}
          />

          {/* BLOK 2: TRANSAKSI */}
          <TransactionActivity transactions={transactions} setView={setView} />

          {/* BLOK 3: KOMPUTER */}
          <ComputerStats computers={computers} setView={setView} setComputerFilter={setComputerFilter} />

          {/* BLOK 4: LAPTOP */}
          <LaptopStats laptops={laptops} setView={setView} setLaptopFilter={setLaptopFilter} />

          {/* BLOK 5: PRINTER */}
          <PrinterStats printers={printers} setView={setView} setPrinterFilter={setPrinterFilter} />

          {/* BLOK 6: MEUBELAIR */}
          <MeubelairStats meubelairs={meubelairs} jenisMeubelairs={jenisMeubelairs} setView={setView} />
        </>
      ) : activeSubTab === "bangunan" ? (
        <BuildingDashboardView
          buildingLands={buildingLands}
          buildingSewas={buildingSewas}
          buildingRenovations={buildingRenovations}
          setView={setView}
          setLandFilter={setLandFilter}
          setSewaFilter={setSewaFilter}
          setLandSearch={setLandSearch}
          setSewaSearch={setSewaSearch}
          setNotificationCategoryFilter={setNotificationCategoryFilter}
        />
      ) : (
        <SecurityDashboardView
          securityFacilities={securityFacilities}
          setView={setView}
          setSecurityFilter={setSecurityFilter}
        />
      )}

    </div>
  );
};

export default DashboardView;