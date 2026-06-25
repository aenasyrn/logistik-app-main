// src/components/modal/ToastNotif.jsx
"use client";

import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

/**
 * Modal notifikasi reusable untuk seluruh halaman.
 *
 * @param {boolean}  show     — tampilkan modal atau tidak
 * @param {string}   message  — pesan yang ditampilkan
 * @param {"success"|"error"|"warning"|"info"} type — jenis notifikasi
 * @param {function} onClose  — callback saat tombol "OK" diklik
 *
 * Cara pakai:
 * 1. Tambah state:
 *    const [notif, setNotif] = useState({ show: false, message: "", type: "success" });
 *
 * 2. Buat helper:
 *    const showNotif = (message, type = "success") => {
 *      setNotif({ show: true, message, type });
 *    };
 *
 * 3. Render:
 *    <ToastNotif
 *      show={notif.show}
 *      message={notif.message}
 *      type={notif.type}
 *      onClose={() => setNotif({ show: false, message: "", type: "" })}
 *    />
 */

const config = {
  success: {
    iconBg:    "bg-green-100",
    iconColor: "text-green-600",
    btnColor:  "text-green-600 hover:bg-green-50",
    icon:      <CheckCircle className="w-8 h-8" />,
    title:     "Berhasil!",
  },
  error: {
    iconBg:    "bg-red-100",
    iconColor: "text-red-600",
    btnColor:  "text-red-600 hover:bg-red-50",
    icon:      <XCircle className="w-8 h-8" />,
    title:     "Gagal!",
  },
  warning: {
    iconBg:    "bg-yellow-100",
    iconColor: "text-yellow-600",
    btnColor:  "text-yellow-600 hover:bg-yellow-50",
    icon:      <AlertTriangle className="w-8 h-8" />,
    title:     "Perhatian!",
  },
  info: {
    iconBg:    "bg-blue-100",
    iconColor: "text-blue-600",
    btnColor:  "text-blue-600 hover:bg-blue-50",
    icon:      <Info className="w-8 h-8" />,
    title:     "Informasi",
  },
};

export default function ToastNotif({ show, message, type = "success", onClose }) {
  if (!show) return null;

  const { iconBg, iconColor, btnColor, icon, title } = config[type] ?? config.success;

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className={`w-16 h-16 ${iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <span className={iconColor}>{icon}</span>
          </div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
        <div className="border-t border-gray-100">
          <button
            onClick={onClose}
            className={`w-full px-4 py-4 text-sm font-bold ${btnColor} transition-colors`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}