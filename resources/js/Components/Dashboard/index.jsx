// src/components/Dashboard/index.jsx
"use client";

import React, { useState } from "react";
import NotificationAlerts  from "./NotificationAlerts";
import TransactionActivity from "./TransactionActivity";
import ComputerStats       from "./ComputerStats";
import PrinterStats        from "./PrinterStats";
import InventoryChart      from "./InventoryChart";
import BuildingDashboardView from "./BuildingDashboardView";
import SecurityDashboardView from "./SecurityDashboardView";

const DashboardView = ({
  transactions = [],
  setView,
  inventory = [],
  notifSewa = [],
  notifSewaKomputer = [],
  printers = [],
  computers = [],
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
  printerFilter,
  setPrinterFilter,
}) => {
  const [activeSubTab, setActiveSubTab] = useState("inventaris");

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Informasi</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6 -mb-px">
          <button 
            onClick={() => setActiveSubTab("inventaris")} 
            className={`pb-3 text-sm font-medium border-b-2 transition-all ${activeSubTab === "inventaris" ? "border-blue-600 text-blue-600 font-semibold" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Dashboard Inventaris
          </button>
          <button 
            onClick={() => setActiveSubTab("bangunan")} 
            className={`pb-3 text-sm font-medium border-b-2 transition-all ${activeSubTab === "bangunan" ? "border-blue-600 text-blue-600 font-semibold" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Dashboard Bangunan
          </button>
          <button 
            onClick={() => setActiveSubTab("pengamanan")} 
            className={`pb-3 text-sm font-medium border-b-2 transition-all ${activeSubTab === "pengamanan" ? "border-blue-600 text-blue-600 font-semibold" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Dashboard Pengamanan & Korporasi
          </button>
        </div>
      </div>

      {activeSubTab === "inventaris" ? (
        <>
          {/* BLOK 1: NOTIFIKASI */}
          <NotificationAlerts
            notifSewa={notifSewa}
            notifSewaKomputer={notifSewaKomputer}
            setView={setView}
            setPrinterFilter={setPrinterFilter}
            setComputerFilter={setComputerFilter}
          />

          {/* BLOK 2: TRANSAKSI */}
          <TransactionActivity transactions={transactions} setView={setView} />

          {/* BLOK 3: KOMPUTER */}
          <ComputerStats computers={computers} setView={setView} setComputerFilter={setComputerFilter} />

          {/* BLOK 4: PRINTER */}
          <PrinterStats printers={printers} setView={setView} setPrinterFilter={setPrinterFilter} />

          {/* BLOK 5: GRAFIK */}
          <InventoryChart inventory={inventory} />
        </>
      ) : activeSubTab === "bangunan" ? (
        <BuildingDashboardView
          buildingLands={buildingLands}
          buildingSewas={buildingSewas}
          buildingRenovations={buildingRenovations}
          setView={setView}
          setLandFilter={setLandFilter}
          setSewaFilter={setSewaFilter}
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