// src/components/Layout/TabBar.jsx
"use client";

import { X } from "lucide-react";
import { VIEW_TITLES, PERMANENT_TABS } from "../../constants/tabConfig";

export default function TabBar({ tabs, activeTab, setActiveTab, setTabs }) {
  const handleTabClick = (tabId) => setActiveTab(tabId);

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
      className="sticky z-20 bg-gray-100 border-b border-gray-200 px-4 pt-3 flex gap-1 overflow-x-auto custom-scrollbar print:hidden shrink-0"
      style={{ top: "var(--tabbar-top, 128px)" }}
    >
      <style>{`
        :root { --tabbar-top: 64px; }
        @media (min-width: 768px) { :root { --tabbar-top: 80px; } }
      `}</style>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={`group flex items-center gap-2 px-4 py-2 min-w-max border-t border-x rounded-t-xl cursor-pointer transition-all select-none ${
            activeTab === tab.id
              ? "bg-white border-gray-200 text-blue-700 font-bold shadow-[0_2px_0_0_white]"
              : "bg-gray-200/50 border-transparent text-gray-500 hover:bg-gray-200"
          }`}
        >
          <span className="text-xs">{tab.title}</span>
          {!PERMANENT_TABS.includes(tab.id) && (
            <button
              onClick={(e) => closeTab(e, tab.id)}
              className={`p-0.5 rounded-md transition-colors ${
                activeTab === tab.id
                  ? "hover:bg-blue-100 text-gray-400 hover:text-red-500"
                  : "hover:bg-gray-300 text-gray-400"
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