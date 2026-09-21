// resources/js/utils/meubelairColors.js

const PRESET_COLORS = {
  meja: "bg-blue-50 text-blue-700 border-blue-200/90 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  kursi: "bg-emerald-50 text-emerald-700 border-emerald-200/90 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  lemari: "bg-amber-50 text-amber-700 border-amber-200/90 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  sofa: "bg-purple-50 text-purple-700 border-purple-200/90 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
  ac: "bg-cyan-50 text-cyan-700 border-cyan-200/90 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800",
};

const EXTRA_PALETTES = [
  "bg-indigo-50 text-indigo-700 border-indigo-200/90 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
  "bg-rose-50 text-rose-700 border-rose-200/90 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
  "bg-teal-50 text-teal-700 border-teal-200/90 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
  "bg-orange-50 text-orange-700 border-orange-200/90 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
  "bg-violet-50 text-violet-700 border-violet-200/90 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800",
  "bg-pink-50 text-pink-700 border-pink-200/90 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800",
  "bg-lime-50 text-lime-700 border-lime-200/90 dark:bg-lime-950/40 dark:text-lime-300 dark:border-lime-800",
];

/**
 * Returns badge class styling for meubelair categories/types consistently across
 * Master Barang Meubelair and Inventaris Meubelair.
 */
export function getMeubelairBadgeClass(jenis) {
  const norm = (jenis || "").toLowerCase().trim();
  if (!norm) {
    return "bg-slate-100 text-slate-700 border-slate-200/90 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800";
  }

  if (PRESET_COLORS[norm]) {
    return PRESET_COLORS[norm];
  }

  // Consistent deterministic hash for any custom jenis barang
  let hash = 0;
  for (let i = 0; i < norm.length; i++) {
    hash = (hash << 5) - hash + norm.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % EXTRA_PALETTES.length;
  return EXTRA_PALETTES[idx];
}
