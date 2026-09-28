// src/components/Dashboard/index.jsx
import React, { useState } from "react";
import DashboardHero from "./DashboardHero";
import InventoryKpiCards from "./InventoryKpiCards";
import InventoryChart from "./InventoryChart";
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
  startNewDocument,
  activeTab,
  inventory = [],
  user = {},
  userRole,
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
    <div className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 animate-in fade-in duration-300">
      {activeSubTab === "inventaris" ? (
        <div className="space-y-6">
          <DashboardHero user={user} userRole={userRole} setView={setView} startNewDocument={startNewDocument} />

          <InventoryKpiCards
            inventory={inventory}
            transactions={transactions}
            computers={computers}
            laptops={laptops}
            printers={printers}
            notifSewa={notifSewa}
            notifSewaKomputer={notifSewaKomputer}
            notifSewaLaptop={notifSewaLaptop}
            setView={setView}
          />

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

          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
            <div className="min-w-0 xl:col-span-7">
              <InventoryChart inventory={inventory} setView={setView} />
            </div>
            <div className="min-w-0 xl:col-span-5">
              <TransactionActivity transactions={transactions} setView={setView} startNewDocument={startNewDocument} />
            </div>
          </div>

          <section className="space-y-4 border-t border-slate-200 pt-5 dark:border-slate-800">
            <div>
              <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Monitoring Perangkat & Inventaris</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Status perangkat TI dan meubelair yang tercatat.</p>
            </div>
            <ComputerStats computers={computers} setView={setView} setComputerFilter={setComputerFilter} />
            <LaptopStats laptops={laptops} setView={setView} setLaptopFilter={setLaptopFilter} />
            <PrinterStats printers={printers} setView={setView} setPrinterFilter={setPrinterFilter} />
            <MeubelairStats meubelairs={meubelairs} jenisMeubelairs={jenisMeubelairs} setView={setView} />
          </section>
        </div>
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