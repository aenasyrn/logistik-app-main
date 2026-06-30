// src/hooks/useNotif.js
// Toast notifikasi global
"use client";

import { useState } from "react";

/**
 * Notifikasi toast sederhana.
 * @returns {{ notif, showNotif }}
 */
export function useNotif() {
  const [notif, setNotif] = useState({ show: false, message: "", type: "success" });

  const showNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
    setTimeout(
      () => setNotif({ show: false, message: "", type: "success" }),
      3500
    );
  };

  return { notif, showNotif };
}