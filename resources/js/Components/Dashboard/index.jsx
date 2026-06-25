// src/components/Dashboard/index.jsx
"use client";

import NotificationAlerts  from "./NotificationAlerts";
import TransactionActivity from "./TransactionActivity";
import ComputerStats       from "./ComputerStats";
import PrinterStats        from "./PrinterStats";
import InventoryChart      from "./InventoryChart";

const DashboardView = ({
  transactions = [],
  setView,
  inventory = [],
  notifSewa = [],
  notifSewaKomputer = [],
  printers = [],
  computers = [],
}) => {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">

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

    </div>
  );
};

export default DashboardView;