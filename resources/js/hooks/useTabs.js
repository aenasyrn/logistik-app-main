// src/hooks/useTabs.js
// Buka, tutup, switch tab
"use client";

import { useState } from "react";
import { INITIAL_TABS, VIEW_TITLES } from "../constants/tabConfig";

/**
 * Menangani logika sistem tab bergaya browser:
 * - Buka tab baru jika belum ada
 * - Switch ke tab yang sudah ada
 * - Tutup tab dan kembali ke tab sebelumnya
 */
export function useTabs() {
  const [tabs, setTabs]           = useState(INITIAL_TABS);
  const [activeTab, setActiveTab] = useState("dashboard");

  /** Buka atau switch ke tab dengan viewId tertentu */
  const handleSetView = (viewId) => {
    const isOpen = tabs.some((t) => t.id === viewId);
    if (!isOpen) {
      setTabs((prev) => [
        ...prev,
        { id: viewId, title: VIEW_TITLES[viewId] || viewId },
      ]);
    }
    setActiveTab(viewId);
  };

  return { tabs, setTabs, activeTab, setActiveTab, handleSetView };
}