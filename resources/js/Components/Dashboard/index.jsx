// src/components/Dashboard/index.jsx
"use client";

import React, { useState } from "react";
import NotificationAlerts  from "./NotificationAlerts";
import TransactionActivity from "./TransactionActivity";
import ComputerStats       from "./ComputerStats";
import PrinterStats        from "./PrinterStats";
import InventoryChart      from "./InventoryChart";
import BuildingDashboardView from "./BuildingDashboardView";

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
  landFilter,
  setLandFilter,
  sewaFilter,
  setSewaFilter,
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
        </div>
      </div>

      {activeSubTab === "inventaris" ? (
        <>
          {/* BLOK 1: NOTIFIKASI */}
          <NotificationAlerts
            notifSewa={notifSewa}
            notifSewaKomputer={notifSewaKomputer}
            setView={setView}
          />

          {/* BLOK 2: TRANSAKSI */}
          <TransactionActivity transactions={transactions} setView={setView} />

          {/* BLOK 3: KOMPUTER */}
          <ComputerStats computers={computers} setView={setView} />

          {/* BLOK 4: PRINTER */}
          <PrinterStats printers={printers} setView={setView} />

          {/* BLOK 5: GRAFIK */}
          <InventoryChart inventory={inventory} />
        </>
      ) : (
        <BuildingDashboardView
          buildingLands={buildingLands}
          buildingSewas={buildingSewas}
          buildingRenovations={buildingRenovations}
          setView={setView}
          setLandFilter={setLandFilter}
          setSewaFilter={setSewaFilter}
        />
      )}

    </div>
  );
};

export default DashboardView;