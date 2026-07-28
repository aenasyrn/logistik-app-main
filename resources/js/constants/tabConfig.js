// src/constants/tabConfig.js
// Konfigurasi tab: judul, tab awal, dan tab permanen

/** Mapping viewId → judul tab yang tampil di UI */
export const VIEW_TITLES = {
  dashboard:          "Dashboard",
  riwayat:            "Riwayat Transaksi",
  master_barang:      "Master Barang",
  master_outlet:      "Master Instansi",
  form:               "Buat Surat",
  preview:            "Preview Surat",
  perangkat_printer:  "Data Printer",
  perangkat_komputer: "Data PC",
  kelola_user:        "Kelola Akses",
  log_aktivitas:      "Log Aktivitas",
  bangunan_tanah:     "Daftar Tanah",

  bangunan_sewa:      "Sewa Bangunan",
  bangunan_renovasi:  "Renovasi Gedung",
  bangunan_sarana:    "Pengamanan dan Korporasi",
  bangunan_spk:       "Buat Surat SPK",
};

/** Tab awal saat aplikasi pertama kali dibuka */
export const INITIAL_TABS = [{ id: "dashboard", title: VIEW_TITLES.dashboard }];

/** Tab yang tidak bisa ditutup */
export const PERMANENT_TABS = ["dashboard"];