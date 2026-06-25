// src/components/Layout/UserBadge.jsx
"use client";

import { User } from "lucide-react";

export default function UserBadge({ user }) {
  if (!user) return null;

  return (
    <div className="flex items-center gap-2.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
      <div className="bg-blue-100 p-1.5 rounded-full flex-shrink-0">
        <User className="w-4 h-4 text-blue-600" />
      </div>
      <div className="text-sm pr-1">
        <p className="text-gray-500 text-[10px] font-medium leading-tight uppercase tracking-wide">
          Admin Aktif
        </p>
        <p className="font-bold text-gray-800 text-xs leading-tight truncate max-w-[160px]">
          {user.email}
        </p>
      </div>
    </div>
  );
}