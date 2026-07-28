// src/constants/tabConfig.js
// Konfigurasi tab: judul, tab awal, dan tab permanen

/** Mapping viewId → judul tab yang tampil di UI */
export const VIEW_TITLES = {
  dashboard: "Dashboard",
  notifikasi: "Notifikasi Peringatan",
  riwayat: "Riwayat Surat",
  master_barang: "Master Barang",
  master_outlet: "Master Instansi",
  form: "Surat Serah Terima",
  preview: "Preview Surat",
  perangkat_printer: "Data Printer",
  perangkat_komputer: "Data PC",
  kelola_user: "Kelola Akses",
  log_aktivitas: "Log Aktivitas",
  bangunan_tanah: "Daftar Tanah",

  bangunan_sewa: "Sewa Bangunan",
  bangunan_renovasi: "Renovasi Gedung",
  bangunan_sarana: "Pengamanan dan Korporasi",
  spk_renovasi: "SPK - Renovasi",
  spk_elektronik: "SPK - Elektronik",
  spk_kendaraan: "SPK - Kendaraan",
  sopp_pengadaan: "SOPP - Pengadaan",
  sopp_sewa: "SOPP - Sewa",
};

/** Tab awal saat aplikasi pertama kali dibuka */
export const INITIAL_TABS = [{ id: "dashboard", title: VIEW_TITLES.dashboard }];

/** Tab yang tidak bisa ditutup */
export const PERMANENT_TABS = ["dashboard"];