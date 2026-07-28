// src/components/Layout/AppHeader.jsx
"use client";

import UserBadge from "./UserBadge";
import NotificationBell from "./NotificationBell";
import { Sun, Moon, List, Package } from "lucide-react";

/**
 * Header tetap — pakai sticky di dalam flex column.
 * Agar bekerja: wrapper di page.jsx TIDAK boleh overflow-hidden,
 * dan scroll terjadi di level window (body), bukan di div wrapper.
 */
export default function AppHeader({
  user,
  title,
  printers = [],
  computers = [],
  buildingLands = [],
  buildingSewas = [],
  setView,
  theme,
  setTheme,
  isSidebarOpen,
  setIsSidebarOpen,
}) {
  return (
    <div className="hidden md:flex sticky md:top-0 z-30 h-16 md:h-20 bg-white dark:bg-[#1a2b20] border-b border-gray-200 dark:border-[#2b4533] shadow-sm flex items-center justify-between px-4 sm:px-6 print:hidden shrink-0 transition-colors">
      <div className="flex items-center gap-4">
        {!isSidebarOpen ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 text-gray-600 dark:text-[#ffffff] hover:bg-gray-100 dark:hover:bg-[#1a2b20] rounded-lg transition-all border border-gray-200 dark:border-[#2b4533] cursor-pointer flex items-center justify-center"
              title="Tampilkan Sidebar"
            >
              <List className="w-5 h-5 text-gray-700 dark:text-slate-300" />
            </button>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600 dark:text-[#48a359]" />
              <span className="font-bold text-base text-gray-900 dark:text-[#f1f5f3] tracking-tight">LogistikKu</span>
            </div>
          </div>
        ) : (
          <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 truncate">
            {title || "Dashboard Logistik"}
          </p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-xl border border-gray-200 dark:border-[#2b4533] bg-white dark:bg-[#1a2b20] text-gray-600 dark:text-[#ffffff] hover:bg-gray-50 dark:hover:bg-[#243e2e] transition-all shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
          aria-label="Toggle Theme"
          type="button"
        >
          {theme === "dark" ? <Sun className="w-5 h-5 text-[#48a359]" /> : <Moon className="w-5 h-5" />}
        </button>
        <NotificationBell
          printers={printers}
          computers={computers}
          buildingLands={buildingLands}
          buildingSewas={buildingSewas}
          setView={setView}
        />
        <UserBadge user={user} />
      </div>
    </div>
  );
}
