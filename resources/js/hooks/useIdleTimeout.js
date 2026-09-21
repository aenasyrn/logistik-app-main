// resources/js/hooks/useIdleTimeout.js
import { useEffect, useRef } from "react";

const STORAGE_KEY = "smartlog_last_activity";

/**
 * Hook untuk memonitor aktivitas pengguna dan menangani idle timeout.
 * Tahan banting terhadap kondisi layar mati, sleep, tab background, maupun multi-tab.
 *
 * @param {number} timeoutMinutes Durasi idle dalam menit (default 20)
 * @param {boolean} enabled Apakah timeout aktif (misalnya dinonaktifkan untuk admin)
 */
export default function useIdleTimeout(timeoutMinutes = 20, enabled = true) {
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const isLoggingOutRef = useRef(false);

  useEffect(() => {
    // Jika hook dinonaktifkan (misalnya untuk user role admin), tidak perlu memonitor timeout
    if (!enabled) {
      return;
    }

    // Inisialisasi / refresh timestamp saat komponen terautentikasi dimuat.
    // Jika timestamp belum ada, atau timestamp yang tersimpan sudah kedaluwarsa dari sesi lama (> timeoutMs),
    // perbarui ke waktu sekarang agar pengguna yang baru login tidak langsung ter-logout.
    const initTime = Date.now();
    const stored = localStorage.getItem(STORAGE_KEY);
    const lastActive = stored ? parseInt(stored, 10) : 0;

    if (!stored || isNaN(lastActive) || (initTime - lastActive) >= timeoutMs) {
      localStorage.setItem(STORAGE_KEY, initTime.toString());
    }

    const triggerLogout = () => {
      if (isLoggingOutRef.current) return;
      isLoggingOutRef.current = true;
      localStorage.removeItem(STORAGE_KEY);

      // Arahkan langsung ke /logout?timeout=1 agar sesi dibersihkan di server
      // tanpa terkena CSRF token mismatch / error 419 Page Expired
      window.location.replace("/logout?timeout=1");
    };

    // Fungsi pemeriksa apakah sesi sudah melampaui batas idle
    const checkTimeout = () => {
      if (isLoggingOutRef.current) return;

      const lastActiveStr = localStorage.getItem(STORAGE_KEY);
      const activeTime = lastActiveStr ? parseInt(lastActiveStr, 10) : Date.now();
      const idleDuration = Date.now() - activeTime;

      if (idleDuration >= timeoutMs) {
        triggerLogout();
        return true;
      }
      return false;
    };

    // Handler ketika pengguna melakukan interaksi (mouse, keyboard, click, dsb)
    let lastThrottledTime = Date.now();
    const handleUserActivity = () => {
      if (isLoggingOutRef.current) return;

      const now = Date.now();

      // Periksa terlebih dahulu apakah pengguna SUDAH idle > batas waktu sebelum interaksi ini
      const lastActiveStr = localStorage.getItem(STORAGE_KEY);
      const activeTime = lastActiveStr ? parseInt(lastActiveStr, 10) : now;

      if (now - activeTime >= timeoutMs) {
        triggerLogout();
        return;
      }

      // Jika belum lewat batas waktu, update timestamp aktivitas (dibatasi tiap 2 detik)
      if (now - lastThrottledTime > 2000) {
        lastThrottledTime = now;
        localStorage.setItem(STORAGE_KEY, now.toString());
      }
    };

    // Handler ketika layar/tab kembali aktif setelah mati/sleep/background
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        checkTimeout();
      }
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    window.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);

    // Interval checker berkala setiap 5 detik
    const interval = setInterval(() => {
      checkTimeout();
    }, 5000);

    return () => {
      clearInterval(interval);
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      window.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
    };
  }, [timeoutMs, enabled]);
}
