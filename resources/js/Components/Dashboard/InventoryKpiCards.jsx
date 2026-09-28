import React from "react";
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, Boxes, CheckCircle2, ChevronRight, Laptop } from "lucide-react";

export default function InventoryKpiCards({ inventory = [], transactions = [], computers = [], laptops = [], printers = [], notifSewa = [], notifSewaKomputer = [], notifSewaLaptop = [], setView }) {
  const stock = inventory.reduce((total, item) => total + (Number(item.kuantitas ?? item.stok) || 0), 0);
  const incoming = transactions.filter((item) => String(item.jenisTransaksi || "").toLowerCase().includes("masuk"));
  const outgoing = transactions.filter((item) => String(item.jenisTransaksi || "").toLowerCase().includes("keluar"));
  const devices = computers.length + laptops.length + printers.length;
  const warnings = notifSewa.length + notifSewaKomputer.length + notifSewaLaptop.length;
  const cards = [
    { label: "Stok Master Barang", value: stock.toLocaleString("id-ID"), detail: `${inventory.length} jenis SKU`, icon: Boxes, color: "emerald", action: () => setView?.("master_barang") },
    { label: "Surat Barang Keluar", value: outgoing.length, detail: "Riwayat serah terima", icon: ArrowUpRight, color: "rose", action: () => { localStorage.setItem("riwayat_active_tab", "serah_terima"); setView?.("riwayat"); } },
    { label: "Surat Barang Masuk", value: incoming.length, detail: "Riwayat penerimaan", icon: ArrowDownLeft, color: "blue", action: () => { localStorage.setItem("riwayat_active_tab", "serah_terima"); setView?.("riwayat"); } },
    { label: "Perangkat TI Terdata", value: devices, detail: `${Math.max(0, devices - warnings)} aktif · ${warnings} perlu tindakan`, icon: Laptop, color: "indigo", action: () => setView?.("perangkat_komputer") },
  ];
  const colors = {
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/50",
    rose: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20 hover:border-rose-500/50",
    blue: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20 hover:border-blue-500/50",
    indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/50",
  };

  return (
    <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, detail, icon: Icon, color, action }) => (
        <button key={label} type="button" onClick={action} className={`group flex min-h-36 flex-col justify-between rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 ${colors[color]}`}>
          <span className="flex items-start justify-between gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
            <span className={`rounded-xl border p-2.5 ${colors[color]}`}><Icon className="h-5 w-5" /></span>
          </span>
          <span className="mt-2 flex items-end justify-between gap-2">
            <span>
              <span className="block text-2xl font-black text-slate-900 dark:text-slate-100">{value}</span>
              <span className="mt-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{detail}</span>
            </span>
            <ChevronRight className="mb-1 h-4 w-4 shrink-0 opacity-50 transition group-hover:translate-x-1" />
          </span>
        </button>
      ))}
    </section>
  );
}
