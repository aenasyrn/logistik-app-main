// resources/js/Components/Dashboard/MeubelairStats.jsx
"use client";

import React, { useState, useMemo } from "react";
import { Armchair, MapPin, Package, ChevronDown, Filter } from "lucide-react";

export default function MeubelairStats({ meubelairs = [], jenisMeubelairs = [], setView }) {
  const [filterJenis, setFilterJenis] = useState("Semua");

  // Dynamic unique Jenis list from master DB and existing meubelairs
  const uniqueJenisList = useMemo(() => {
    const set = new Set();
    const defaults = ["Meja", "Kursi", "Lemari", "Sofa", "AC"];
    defaults.forEach((d) => set.add(d));

    (jenisMeubelairs || []).forEach((j) => {
      const name = typeof j === "string" ? j : j.nama;
      if (name) set.add(name);
    });

    (meubelairs || []).forEach((m) => {
      if (m && m.kategori) {
        const kStr = String(m.kategori).trim();
        if (kStr) {
          const norm = kStr.toLowerCase() === "ac"
            ? "AC"
            : kStr.charAt(0).toUpperCase() + kStr.slice(1).toLowerCase();
          set.add(norm);
        }
      }
    });

    return Array.from(set).sort();
  }, [jenisMeubelairs, meubelairs]);

  // Grouped by category for breakdown on the right column
  const groupedCategories = useMemo(() => {
    const map = {};
    meubelairs.forEach((m) => {
      const kStr = String(m.kategori || "").trim();
      const kat = kStr
        ? (kStr.toLowerCase() === "ac"
            ? "AC"
            : kStr.charAt(0).toUpperCase() + kStr.slice(1).toLowerCase())
        : (m.jenis || "Lainnya");
      map[kat] = (map[kat] || 0) + (Number(m.quantity) || 1);
    });
    return map;
  }, [meubelairs]);

  // Filtered meubelair items based on selected Jenis Barang
  const filteredMeubelairs = useMemo(() => {
    if (filterJenis === "Semua") return meubelairs;
    return meubelairs.filter((m) => {
      const kStr = String(m.kategori || "").trim();
      const kat = kStr
        ? (kStr.toLowerCase() === "ac"
            ? "AC"
            : kStr.charAt(0).toUpperCase() + kStr.slice(1).toLowerCase())
        : (m.jenis || "Lainnya");
      return kat.toLowerCase() === filterJenis.toLowerCase();
    });
  }, [meubelairs, filterJenis]);

  // 1. Calculate unique locations / outlets for filtered data
  const uniqueOutletsCount = useMemo(() => {
    const outletsSet = new Set();
    filteredMeubelairs.forEach((m) => {
      const loc =
        m.lokasi ||
        (m.outlet_rel ? (m.outlet_rel.nama || m.outlet_rel.nama_outlet) : null) ||
        (m.outlet_id ? String(m.outlet_id) : null);
      if (loc && String(loc).trim() !== "" && String(loc).trim() !== "-") {
        outletsSet.add(String(loc).trim().toUpperCase());
      }
    });
    return outletsSet.size;
  }, [filteredMeubelairs]);

  // 2. Calculate total stok / quantity of meubelair items for filtered data
  const currentStokBarang = useMemo(() => {
    return filteredMeubelairs.reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0);
  }, [filteredMeubelairs]);

  // Grand total across all items
  const grandTotalStok = useMemo(() => {
    return meubelairs.reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0);
  }, [meubelairs]);

  return (
    <div className="mb-6">
      {/* Header bar with title and Jenis Barang Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 pl-1 gap-2">
        <div className="flex items-center gap-2">
          <Armchair className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <h3 className="text-sm font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wide">
            Data Meubelair (Total:{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              {filterJenis === "Semua" ? `${grandTotalStok} Barang` : `${currentStokBarang} Unit (${filterJenis})`}
            </span>
            )
          </h3>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Filter Jenis:
          </span>
          <div className="relative">
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              aria-label="Filter jenis barang meubelair"
              className="pl-3 pr-8 py-1.5 bg-white dark:bg-[#16251c] border border-emerald-300/90 dark:border-emerald-700/80 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-2xs outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none transition-all hover:border-emerald-500"
            >
              <option value="Semua">Semua Jenis</option>
              {uniqueJenisList.map((jenis) => (
                <option key={jenis} value={jenis}>
                  {jenis}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-emerald-600 dark:text-emerald-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Dua Card: Lokasi / Outlet dan Stok Barang */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Lokasi / Outlet */}
          <div
            onClick={() => {
              if (setView) setView("inventaris_mebelair");
            }}
            className="bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 dark:from-[#132c21] dark:via-[#0f1712] dark:to-[#0f1712] p-5 rounded-2xl shadow-sm border border-emerald-200/80 dark:border-emerald-900/60 flex items-center gap-4 cursor-pointer hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="bg-emerald-600 p-3.5 rounded-2xl text-white shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                Lokasi / Outlet
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-black text-gray-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
                  {uniqueOutletsCount}
                </span>
                <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  {filterJenis === "Semua" ? "Titik Outlet" : `Titik (${filterJenis})`}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Stok Barang */}
          <div
            onClick={() => {
              if (setView) setView("inventaris_mebelair");
            }}
            className="bg-gradient-to-br from-teal-50/80 via-white to-teal-50/30 dark:from-[#102d2b] dark:via-[#0f1712] dark:to-[#0f1712] p-5 rounded-2xl shadow-sm border border-teal-200/80 dark:border-teal-900/60 flex items-center gap-4 cursor-pointer hover:border-teal-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="bg-teal-600 p-3.5 rounded-2xl text-white shadow-md shadow-teal-500/30 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                Stok Barang
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-black text-gray-900 dark:text-slate-100 group-hover:text-teal-600 transition-colors">
                  {currentStokBarang}
                </span>
                <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  {filterJenis === "Semua" ? "Total Unit" : `Unit (${filterJenis})`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Rincian Kategori Barang */}
        <div className="lg:col-span-1 bg-white dark:bg-[#0f1712] rounded-2xl shadow-sm border border-gray-200 dark:border-[#2b4533] p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2 border-b border-gray-100 dark:border-[#2b4533] pb-2">
            <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400">
              Rincian Kategori
            </h4>
            {filterJenis !== "Semua" && (
              <button
                type="button"
                onClick={() => setFilterJenis("Semua")}
                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          <div className="overflow-y-auto custom-scrollbar flex-1 max-h-[88px] pr-1">
            {Object.keys(groupedCategories).length === 0 ? (
              <p className="text-xs text-gray-400 italic">Belum ada data Meubelair.</p>
            ) : (
              <ul className="space-y-1.5">
                {Object.entries(groupedCategories)
                  .sort((a, b) => b[1] - a[1])
                  .map(([kat, jumlah]) => {
                    const isSelected = filterJenis.toLowerCase() === kat.toLowerCase();
                    return (
                      <li
                        key={kat}
                        onClick={() => setFilterJenis((prev) => (prev.toLowerCase() === kat.toLowerCase() ? "Semua" : kat))}
                        className={`flex justify-between items-center text-xs p-1 rounded-lg transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 font-bold"
                            : "hover:bg-gray-50 dark:hover:bg-[#16251c] text-gray-700 dark:text-slate-300"
                        }`}
                        title={`Klik untuk memfilter: ${kat}`}
                      >
                        <span className="truncate pr-2 font-medium" title={kat}>
                          {kat}
                        </span>
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                              : "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900/40"
                          }`}
                        >
                          {jumlah}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
