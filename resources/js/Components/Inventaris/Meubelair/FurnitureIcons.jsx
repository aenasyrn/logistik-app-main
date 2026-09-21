// resources/js/Components/Inventaris/Meubelair/FurnitureIcons.jsx
import React from "react";
import { Armchair, Sofa, AirVent } from "lucide-react";

/**
 * Ikon Meja Kerja / Meja Kantor (Desk)
 */
export function MejaIcon({ className = "w-6 h-6", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Permukaan Meja */}
      <path d="M3 8h18" />
      <path d="M4 8l1.5-3.5h13L20 8" />
      {/* Kaki Meja Kiri & Kanan */}
      <path d="M5 8v12" />
      <path d="M19 8v12" />
      {/* Laci / Drawer Meja Kantor */}
      <rect x="13" y="8" width="6" height="6.5" rx="0.5" />
      <line x1="15" y1="11.2" x2="17" y2="11.2" />
      {/* Palang Penyangga */}
      <line x1="5" y1="13.5" x2="13" y2="13.5" />
    </svg>
  );
}

/**
 * Ikon Lemari Arsip / Filing Cabinet / Cupboard
 */
export function LemariIcon({ className = "w-6 h-6", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Badan Lemari */}
      <rect x="4" y="3" width="16" height="16.5" rx="1.5" />
      {/* Pemisah 2 Pintu */}
      <line x1="12" y1="3" x2="12" y2="15" />
      {/* Gagang Pintu Kiri & Kanan */}
      <line x1="9.5" y1="8.5" x2="9.5" y2="11" />
      <line x1="14.5" y1="8.5" x2="14.5" y2="11" />
      {/* Laci Bawah */}
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10.5" y1="17.2" x2="13.5" y2="17.2" />
      {/* Kaki Lemari */}
      <line x1="6.5" y1="19.5" x2="6.5" y2="21.5" />
      <line x1="17.5" y1="19.5" x2="17.5" y2="21.5" />
    </svg>
  );
}

/**
 * Ikon Kursi (Armchair)
 */
export const KursiIcon = Armchair;

/**
 * Ikon Sofa
 */
export const SofaIcon = Sofa;

/**
 * Ikon AC (Air Conditioning / AirVent)
 */
export const ACIcon = AirVent;

/**
 * Helper untuk mengambil ikon sesuai kategori meubelair
 */
export function getMeubelairIcon(kategori = "meja", className = "w-6 h-6") {
  const kat = (kategori || "").toLowerCase();
  if (kat === "meja") return <MejaIcon className={className} />;
  if (kat === "lemari") return <LemariIcon className={className} />;
  if (kat === "sofa") return <SofaIcon className={className} />;
  if (kat === "ac") return <ACIcon className={className} />;
  return <KursiIcon className={className} />;
}
