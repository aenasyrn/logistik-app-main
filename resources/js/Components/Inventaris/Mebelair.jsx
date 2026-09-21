// resources/js/Components/Inventaris/Mebelair.jsx
import React from "react";
import { Armchair, ArrowRight } from "lucide-react";
import { MejaIcon, KursiIcon, LemariIcon, SofaIcon, ACIcon } from "./Meubelair/FurnitureIcons";

export default function Mebelair({ setView }) {
  const subModules = [
    {
      id: "mebelair_meja",
      name: "Data Meja",
      desc: "Manajemen inventaris meja kerja, meja rapat, meja pelayanan, dsb.",
      icon: MejaIcon,
      color: "from-blue-600 to-indigo-700",
    },
    {
      id: "mebelair_kursi",
      name: "Data Kursi",
      desc: "Manajemen inventaris kursi putar staff, kursi tunggu, kursi rapat, dsb.",
      icon: KursiIcon,
      color: "from-emerald-600 to-teal-700",
    },
    {
      id: "mebelair_lemari",
      name: "Data Lemari",
      desc: "Manajemen inventaris lemari arsip, filling cabinet, locker, dsb.",
      icon: LemariIcon,
      color: "from-amber-600 to-orange-700",
    },
    {
      id: "mebelair_sofa",
      name: "Data Sofa",
      desc: "Manajemen inventaris sofa tamu, sofa tunggu, sofa lobi, dsb.",
      icon: SofaIcon,
      color: "from-purple-600 to-indigo-700",
    },
    {
      id: "mebelair_ac",
      name: "Data AC",
      desc: "Manajemen inventaris pendingin ruangan AC split, standing, cassette, dsb.",
      icon: ACIcon,
      color: "from-cyan-600 to-blue-700",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          <span>INVENTARIS</span>
          <span>/</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold">Meubelair</span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <Armchair className="w-6 h-6 text-[#0d5c3a] dark:text-emerald-400" />
            Inventaris Meubelair
          </h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Pilih kategori meubelair untuk mengelola inventaris, jumlah unit, kondisi fisik, dan lokasi penempatan aset.
        </p>
      </div>

      {/* Grid Sub-Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subModules.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => setView && setView(item.id)}
              className="bg-white dark:bg-[#16251c] rounded-2xl p-6 border border-gray-200 dark:border-[#213527] shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 group-hover:text-[#0d5c3a] dark:group-hover:text-emerald-400 transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-[#213527] flex items-center justify-between text-xs font-bold text-[#0d5c3a] dark:text-emerald-400">
                <span>Buka {item.name}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
