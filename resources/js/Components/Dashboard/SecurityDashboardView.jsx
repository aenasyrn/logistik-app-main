// resources/js/Components/Dashboard/SecurityDashboardView.jsx
"use client";

import React from "react";
import { Shield, CheckCircle2, AlertTriangle, Video, BarChart3, Clock, ArrowRight } from "lucide-react";

export default function SecurityDashboardView({ securityFacilities = [], setView, setSecurityFilter }) {
  // 1. Calculate online & offline cctv counts
  const onlineCount = React.useMemo(() => {
    return securityFacilities
      .filter((f) => f.status && f.status.toLowerCase() === "online")
      .reduce((sum, f) => sum + (Number(f.jumlah_kamera) || 0), 0);
  }, [securityFacilities]);

  const offlineCount = React.useMemo(() => {
    return securityFacilities
      .filter((f) => f.status && f.status.toLowerCase() === "offline")
      .reduce((sum, f) => sum + (Number(f.jumlah_kamera) || 0), 0);
  }, [securityFacilities]);

  // 2. Group cctv by branch (cabang)
  const branchData = React.useMemo(() => {
    const groups = {};
    securityFacilities.forEach((f) => {
      const branch = f.kantor_cabang || "Lainnya";
      const cameras = Number(f.jumlah_kamera) || 0;
      if (!groups[branch]) {
        groups[branch] = 0;
      }
      groups[branch] += cameras;
    });

    return Object.entries(groups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort descending
  }, [securityFacilities]);

  // Helper for status badge
  const getStatusBadge = (status) => {
    if (status && status.toLowerCase() === "online") {
      return "bg-green-50 text-green-700 border border-green-200";
    }
    return "bg-red-50 text-red-700 border border-red-200";
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Upper Grid: Stats Cards & Latest Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: CCTV Stats Cards (takes 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-gray-800">Pemantauan CCTV</h3>
            </div>
            
            {/* Stats Grid container like user's request */}
            <div className="grid grid-cols-2 gap-4">
              {/* CCTV Online Card */}
              <div 
                onClick={() => {
                  if (setSecurityFilter) setSecurityFilter("online");
                  setView("bangunan_sarana");
                }}
                className="bg-green-50/85 hover:bg-green-100/70 p-4 rounded-xl border border-green-200 transition-all duration-200 flex flex-col justify-between h-28 shadow-3xs cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-800 font-extrabold tracking-wide">CCTV Online</span>
                  <div className="p-2 bg-white text-green-600 rounded-lg shadow-3xs border border-green-100">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <h4 className="text-3xl font-extrabold text-green-900 tracking-tight">{onlineCount}</h4>
              </div>

              {/* CCTV Offline Card */}
              <div 
                onClick={() => {
                  if (setSecurityFilter) setSecurityFilter("offline");
                  setView("bangunan_sarana");
                }}
                className="bg-red-50/85 hover:bg-red-100/70 p-4 rounded-xl border border-red-200 transition-all duration-200 flex flex-col justify-between h-28 shadow-3xs cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-red-800 font-extrabold tracking-wide">CCTV Offline</span>
                  <div className="p-2 bg-white text-red-500 rounded-lg shadow-3xs border border-red-100">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
                <h4 className="text-3xl font-extrabold text-red-900 tracking-tight">{offlineCount}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Latest CCTV Data Table (takes 7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-white rounded-xl shadow-sm border border-gray-150 flex flex-col overflow-hidden h-full">
            <div className="px-5 py-3.5 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 p-1.5 rounded-lg">
                  <Video className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-bold text-sm text-gray-800">Data CCTV Terbaru</h3>
              </div>
              <button
                onClick={() => setView("bangunan_sarana")}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                Lihat Selengkapnya <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="text-gray-700 bg-gray-50 border-b border-gray-100 font-semibold">
                  <tr>
                    <th className="px-5 py-3 w-12 text-center">No</th>
                    <th className="px-5 py-3">Nama Unit Kerja</th>
                    <th className="px-5 py-3">Kantor Cabang</th>
                    <th className="px-5 py-3">Vendor</th>
                    <th className="px-5 py-3 text-right">Jumlah Kamera</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {securityFacilities.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-4 text-center text-gray-400 italic">Belum ada data CCTV.</td>
                    </tr>
                  ) : (
                    securityFacilities.slice(0, 3).map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-2.5 text-center text-gray-500 font-medium">{index + 1}</td>
                        <td className="px-5 py-2.5 font-semibold text-gray-900">{item.nama_unit_kerja || "—"}</td>
                        <td className="px-5 py-2.5 text-gray-700">{item.kantor_cabang || "—"}</td>
                        <td className="px-5 py-2.5 text-gray-700 truncate max-w-[150px]" title={item.vendor}>{item.vendor || "—"}</td>
                        <td className="px-5 py-2.5 text-right font-medium text-gray-800">{item.jumlah_kamera ?? 0}</td>
                        <td className="px-5 py-2.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${getStatusBadge(item.status)}`}>
                            {item.status || "Offline"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Lower Section: Diagram Batang CCTV per Cabang */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-5">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
          <BarChart3 className="w-4.5 h-4.5 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-800">
            Jumlah CCTV di Setiap Kantor Cabang
          </h3>
        </div>

        {branchData.length === 0 ? (
          <div className="py-8 text-center text-gray-400 italic text-xs">Belum ada data cabang untuk ditampilkan.</div>
        ) : (
          <div className="h-56 flex items-end gap-3 sm:gap-5 px-2 pt-6 pb-2 overflow-x-auto custom-scrollbar">
            {branchData.map((d, idx) => {
              const maxVal = Math.max(...branchData.map(item => item.value), 1);
              const heightPct = (d.value / maxVal) * 80; // Scale to max 80% to leave room for value label above
              return (
                <div key={idx} className="flex flex-col items-center flex-1 min-w-[75px] max-w-[120px] group h-full">
                  <div className="w-full flex-1 flex flex-col justify-end relative">
                    <div
                      className="w-full bg-[#10b981] hover:bg-emerald-600 rounded-t-sm transition-all duration-300 relative flex flex-col justify-end shadow-3xs cursor-pointer"
                      style={{ height: `${heightPct}%`, minHeight: '4px' }}
                    >
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-extrabold text-gray-750 bg-white border border-gray-150 px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap pointer-events-none">
                        {d.value} CCTV
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-2 font-bold truncate w-full text-center tracking-tight" title={d.name}>
                    {d.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
