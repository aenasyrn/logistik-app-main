// src/components/Layout/AppHeader.jsx
import UserBadge from "./UserBadge";
import NotificationBell from "./NotificationBell";
import { Sun, Moon } from "lucide-react";
import { VIEW_BREADCRUMBS } from "../../constants/tabConfig";

export default function AppHeader({
  user,
  title,
  activeTab,
  printers = [],
  computers = [],
  laptops = [],
  notifSewaLaptop = null,
  buildingLands = [],
  buildingSewas = [],
  setView,
  theme,
  setTheme,
  isSidebarOpen,
  setIsSidebarOpen,
  handleLogout,
}) {
  const currentNav = VIEW_BREADCRUMBS[activeTab] || {
    category: "DASHBOARD",
    breadcrumb: title || "Utama",
  };

  const renderBreadcrumb = (b) => {
    if (b.includes(">")) {
      const parts = b.split(">").map((p) => p.trim());
      return (
        <span className="text-xs sm:text-sm font-medium">
          <span className="text-gray-400 font-semibold">{parts[0]} &gt; </span>
          <span className="text-[#0d5c3a] dark:text-emerald-400 font-bold">{parts[1]}</span>
        </span>
      );
    }
    return <span className="text-[#0d5c3a] dark:text-emerald-400 font-bold text-xs sm:text-sm">{b}</span>;
  };

  return (
    <div className="hidden md:flex flex-col sticky md:top-0 z-30 bg-[#ffffff] dark:bg-[#061910] border-b border-gray-200 dark:border-[#213527] shadow-2xs print:hidden shrink-0 transition-colors">
      {/* Top White Bar */}
      <div className="h-16 w-full flex items-center justify-between px-6 bg-[#ffffff] dark:bg-[#061910]">
        <div className="flex items-center gap-4">
          <div className="flex flex-col justify-center">
            <h1 className="text-[11px] font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider leading-none mb-1">
              {currentNav.category}
            </h1>
            <div className="leading-none">
              {renderBreadcrumb(currentNav.breadcrumb)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl border border-gray-200 dark:border-[#2b4533] bg-white dark:bg-[#1a2b20] text-gray-600 dark:text-[#ffffff] hover:bg-gray-50 dark:hover:bg-[#243e2e] transition-all shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
            aria-label="Toggle Theme"
            type="button"
          >
            {theme === "dark" ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-gray-600" />}
          </button>
          <NotificationBell
            printers={printers}
            computers={computers}
            laptops={laptops}
            notifSewaLaptop={notifSewaLaptop}
            buildingLands={buildingLands}
            buildingSewas={buildingSewas}
            setView={setView}
            activeTab={activeTab}
          />
          <UserBadge user={user} handleLogout={handleLogout} />
        </div>
      </div>
    </div>
  );
}
