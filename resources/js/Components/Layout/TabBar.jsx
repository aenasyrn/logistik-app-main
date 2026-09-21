// src/components/Layout/TabBar.jsx
"use client";

import { X } from "lucide-react";
import { VIEW_TITLES, PERMANENT_TABS } from "../../constants/tabConfig";

export default function TabBar({ tabs, activeTab, setActiveTab, setTabs }) {
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const closeTab = (e, tabId) => {
    e.stopPropagation();
    const newTabs = tabs.filter((t) => t.id !== tabId);
    if (newTabs.length === 0) {
      setTabs([{ id: "dashboard", title: VIEW_TITLES.dashboard }]);
      setActiveTab("dashboard");
    } else {
      if (activeTab === tabId) setActiveTab(newTabs[newTabs.length - 1].id);
      setTabs(newTabs);
    }
  };

  return (
    /*
      top mobile  : Navbar h-16 (fixed, dikompensasi pt-16 di wrapper)
                    + AppHeader h-16 sticky → total dari atas viewport = 16+16 = 32 → top-[128px]
      top desktop : AppHeader h-20 sticky dari top-0 → top-[80px] = top-20
    */
    <div
      className="sticky z-20 bg-[#f4faf6] dark:bg-[#061910] border-b border-[#279969]/20 dark:border-[#213527] px-4 pt-2.5 flex gap-1.5 overflow-x-auto custom-scrollbar print:hidden shrink-0 transition-colors"
      style={{ top: "var(--tabbar-top, 128px)" }}
    >
      <style>{`
        :root { --tabbar-top: 64px; }
        @media (min-width: 768px) { :root { --tabbar-top: 64px; } }
      `}</style>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={`group flex items-center gap-2 px-4 py-2 min-w-max border-t border-x rounded-t-xl cursor-pointer transition-all select-none ${
            activeTab === tab.id
              ? "bg-[#279969]/20 dark:bg-[#279969]/30 border-[#279969]/40 dark:border-[#279969]/50 text-[#0d5c3a] dark:text-emerald-200 font-bold shadow-[0_2px_0_0_#f4faf6] dark:shadow-[0_2px_0_0_#061910]"
              : "bg-white/70 dark:bg-[#1a2b20]/40 border-gray-200/80 dark:border-transparent text-gray-500 dark:text-[#86988c] hover:bg-white dark:hover:bg-[#1a2b20]/85"
          }`}
        >
          <span className="text-xs">{tab.title}</span>
          {!PERMANENT_TABS.includes(tab.id) && (
            <button
              onClick={(e) => closeTab(e, tab.id)}
              className={`p-0.5 rounded-md transition-colors ${
                activeTab === tab.id
                  ? "hover:bg-[#279969]/30 text-[#0d5c3a] hover:text-red-500 dark:text-emerald-200 dark:hover:text-red-400"
                  : "hover:bg-gray-200 dark:hover:bg-[#2b4533] text-gray-400 dark:text-[#86988c]"
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}