import React from "react";
import { Building2, Calendar, History, PackagePlus, PlusCircle, ShieldCheck } from "lucide-react";

export default function DashboardHero({ user = {}, userRole, setView, startNewDocument }) {
  const currentDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const userName = user?.name || user?.email?.split("@")[0] || "Petugas Logistik";
  const roleLabel = String(userRole || user?.role || "Pengguna").replaceAll("_", " ").toUpperCase();

  const createDocument = () => {
    if (typeof startNewDocument === "function") {
      startNewDocument("Barang Keluar");
    } else {
      setView?.("form");
    }
  };

  const quickLinks = [
    { label: "Master Barang", icon: PackagePlus, view: "master_barang" },
    { label: "Instansi / Outlet", icon: Building2, view: "master_outlet" },
    { label: "Riwayat BAST", icon: History, view: "riwayat" },
  ];

  return (
    <section className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#005a2b] via-[#00753a] to-emerald-700 p-5 text-white shadow-lg sm:p-6">
      <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[11px] font-bold text-emerald-50">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
              {roleLabel}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-100">
              <Calendar className="h-3.5 w-3.5" />
              {currentDate}
            </span>
          </div>
          <h1 className="text-xl font-extrabold sm:text-2xl lg:text-3xl">
            Selamat Datang, <span className="text-emerald-200">{userName}</span>
          </h1>
          <p className="max-w-xl text-xs leading-relaxed text-emerald-100/90 sm:text-sm">
            Pusat Komando Manajemen Inventaris, Perangkat TI, dan Administrasi Berita Acara Serah Terima.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={createDocument} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2.5 text-xs font-bold text-[#00753a] shadow-md transition hover:bg-emerald-50">
            <PlusCircle className="h-4 w-4" /> Buat Surat BAST
          </button>
          {quickLinks.map(({ label, icon: Icon, view }) => (
            <button key={view} type="button" onClick={() => setView?.(view)} className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/15 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-white/25">
              <Icon className="h-4 w-4 text-emerald-200" /> {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
