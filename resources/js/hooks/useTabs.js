import { useState, useEffect } from "react";
import { INITIAL_TABS, VIEW_TITLES, TAB_URL_MAP, URL_TAB_MAP } from "../constants/tabConfig";

/**
 * Menangani logika sistem tab bergaya browser:
 * - Buka tab baru jika belum ada
 * - Switch ke tab yang sudah ada
 * - Tutup tab dan kembali ke tab sebelumnya
 * - Sinkronkan URL browser dengan tab yang sedang aktif
 */
export function useTabs() {
  const initialPath = typeof window !== "undefined" ? window.location.pathname : "/";
  const initialViewId = URL_TAB_MAP[initialPath] || "dashboard";

  const [tabs, setTabs] = useState(() => {
    if (initialViewId !== "dashboard") {
      return [
        ...INITIAL_TABS,
        { id: initialViewId, title: VIEW_TITLES[initialViewId] || initialViewId },
      ];
    }
    return INITIAL_TABS;
  });

  const [activeTab, setActiveTabState] = useState(initialViewId);

  /** Helper untuk mengubah activeTab dan memperbarui URL browser */
  const setActiveTab = (viewId, updateHistory = true) => {
    setActiveTabState(viewId);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("app-view-selected", { detail: { viewId } }));
    }
    if (updateHistory && typeof window !== "undefined") {
      const targetUrl = TAB_URL_MAP[viewId] || "/";
      if (window.location.pathname !== targetUrl) {
        window.history.pushState({ viewId }, "", targetUrl);
      }
    }
  };

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

  // Sinkronkan tombol back/forward browser (popstate)
  useEffect(() => {
    const handlePopState = (e) => {
      const path = window.location.pathname;
      const targetViewId = e.state?.viewId || URL_TAB_MAP[path] || "dashboard";
      const isOpen = tabs.some((t) => t.id === targetViewId);
      if (!isOpen && targetViewId !== "dashboard") {
        setTabs((prev) => [
          ...prev,
          { id: targetViewId, title: VIEW_TITLES[targetViewId] || targetViewId },
        ]);
      }
      setActiveTabState(targetViewId);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [tabs]);

  return { tabs, setTabs, activeTab, setActiveTab, handleSetView };
}