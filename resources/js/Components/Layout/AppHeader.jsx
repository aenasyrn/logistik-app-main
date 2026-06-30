// src/components/Layout/AppHeader.jsx
"use client";

import UserBadge from "./UserBadge";

/**
 * Header tetap — pakai sticky di dalam flex column.
 * Agar bekerja: wrapper di page.jsx TIDAK boleh overflow-hidden,
 * dan scroll terjadi di level window (body), bukan di div wrapper.
 */
export default function AppHeader({ user, title }) {
  return (
    <div className="hidden md:flex sticky md:top-0 z-30 h-16 md:h-20 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 sm:px-6 print:hidden shrink-0">
      <p className="text-sm font-semibold text-gray-700 truncate">
        {title || "Dashboard Logistik"}
      </p>
      <UserBadge user={user} />
    </div>
  );
}