// src/constants/tabConfig.js
// Konfigurasi tab: judul, breadcrumb, tab awal, dan tab permanen

/** Mapping viewId → judul tab yang tampil di UI */
export const VIEW_TITLES = {
  dashboard: "Dashboard",
  dashboard_inventaris: "Dashboard Inventaris",
  dashboard_bangunan: "Dashboard Bangunan",
  dashboard_pengamanan: "Dashboard Pengamanan & Korporasi",
  notifikasi: "Notifikasi Peringatan",
  riwayat: "Riwayat Surat",
  master_barang: "Master Barang",
  master_barang_meubelair: "Master Barang - Meubelair",
  master_barang_non_meubelair: "Master Barang - Non Meubelair",
  master_outlet: "Master Outlet",
  master_vendor: "Master Vendor",
  pusat_data_barang: "Pusat Data Barang",
  inventaris_mebelair: "Meubelair",
  mebelair_meja: "Data Meja",
  mebelair_kursi: "Data Kursi",
  mebelair_lemari: "Data Lemari",
  mebelair_sofa: "Data Sofa",
  mebelair_ac: "Data AC",
  form: "Surat Serah Terima",
  preview: "Preview Surat",
  perangkat_printer: "Data Printer",
  perangkat_komputer: "Data PC",
  perangkat_laptop: "Data Laptop",
  kelola_user: "Manajemen Akses",
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
  sopp_renovasi: "SOPP - Renovasi",
};

/** Mapping viewId → Kategori & Breadcrumb header */
export const VIEW_BREADCRUMBS = {
  dashboard: { category: "HOME", breadcrumb: "Dashboard Inventaris" },
  dashboard_inventaris: { category: "HOME", breadcrumb: "Dashboard Inventaris" },
  dashboard_bangunan: { category: "HOME", breadcrumb: "Dashboard Bangunan" },
  dashboard_pengamanan: { category: "HOME", breadcrumb: "Dashboard Pengamanan & Korporasi" },
  notifikasi: { category: "NOTIFIKASI", breadcrumb: "Peringatan" },
  riwayat: { category: "SURAT", breadcrumb: "Riwayat Surat" },
  master_barang: { category: "DATA MASTER", breadcrumb: "Master Barang" },
  master_barang_meubelair: { category: "DATA MASTER", breadcrumb: "Master Barang > Meubelair" },
  master_barang_non_meubelair: { category: "DATA MASTER", breadcrumb: "Master Barang > Non Meubelair" },
  master_outlet: { category: "DATA MASTER", breadcrumb: "Master Outlet" },
  master_vendor: { category: "DATA MASTER", breadcrumb: "Master Vendor" },
  pusat_data_barang: { category: "INVENTARIS", breadcrumb: "Pusat Data Barang" },
  inventaris_mebelair: { category: "INVENTARIS", breadcrumb: "Meubelair" },
  mebelair_meja: { category: "INVENTARIS", breadcrumb: "Meubelair > Data Meja" },
  mebelair_kursi: { category: "INVENTARIS", breadcrumb: "Meubelair > Data Kursi" },
  mebelair_lemari: { category: "INVENTARIS", breadcrumb: "Meubelair > Data Lemari" },
  mebelair_sofa: { category: "INVENTARIS", breadcrumb: "Meubelair > Data Sofa" },
  mebelair_ac: { category: "INVENTARIS", breadcrumb: "Meubelair > Data AC" },
  form: { category: "SURAT", breadcrumb: "Buat Surat > Surat Serah Terima" },
  preview: { category: "SURAT", breadcrumb: "Preview Surat" },
  perangkat_printer: { category: "INVENTARIS", breadcrumb: "Non Meubelair > Data Printer" },
  perangkat_komputer: { category: "INVENTARIS", breadcrumb: "Non Meubelair > Data Komputer" },
  perangkat_laptop: { category: "INVENTARIS", breadcrumb: "Non Meubelair > Data Laptop" },
  kelola_user: { category: "MANAJEMEN USER", breadcrumb: "Manajemen Akses" },
  log_aktivitas: { category: "PENGATURAN", breadcrumb: "Log Aktivitas" },
  bangunan_tanah: { category: "BANGUNAN", breadcrumb: "Daftar Tanah" },
  bangunan_sewa: { category: "BANGUNAN", breadcrumb: "Daftar Bangunan > Sewa Bangunan" },
  bangunan_renovasi: { category: "BANGUNAN", breadcrumb: "Daftar Bangunan > Renovasi" },
  bangunan_sarana: { category: "BANGUNAN", breadcrumb: "Pengamanan dan Korporasi" },
  spk_renovasi: { category: "SURAT", breadcrumb: "SPK > Renovasi" },
  spk_elektronik: { category: "SURAT", breadcrumb: "SPK > Elektronik" },
  spk_kendaraan: { category: "SURAT", breadcrumb: "SPK > Kendaraan" },
  sopp_pengadaan: { category: "SURAT", breadcrumb: "SOPP > Pengadaan" },
  sopp_sewa: { category: "SURAT", breadcrumb: "SOPP > Sewa" },
  sopp_renovasi: { category: "SURAT", breadcrumb: "SOPP > Renovasi" },
};

/** Tab awal saat aplikasi pertama kali dibuka */
export const INITIAL_TABS = [{ id: "dashboard", title: VIEW_TITLES.dashboard }];

/** Tab yang tidak bisa ditutup */
export const PERMANENT_TABS = ["dashboard"];

/** Mapping viewId → URL slug */
export const TAB_URL_MAP = {
  dashboard: "/",
  dashboard_inventaris: "/dashboard-inventaris",
  dashboard_bangunan: "/dashboard-bangunan",
  dashboard_pengamanan: "/dashboard-pengamanan",
  notifikasi: "/notifikasi",
  riwayat: "/riwayat-surat",
  master_barang: "/master-barang",
  master_barang_meubelair: "/master-barang-meubelair",
  master_barang_non_meubelair: "/master-barang-non-meubelair",
  master_outlet: "/master-outlet",
  master_vendor: "/master-vendor",
  pusat_data_barang: "/pusat-data-barang",
  inventaris_mebelair: "/meubelair",
  mebelair_meja: "/mebelair-meja",
  mebelair_kursi: "/mebelair-kursi",
  mebelair_lemari: "/mebelair-lemari",
  mebelair_sofa: "/mebelair-sofa",
  mebelair_ac: "/mebelair-ac",
  form: "/surat-jalan",
  preview: "/preview-surat",
  perangkat_printer: "/data-printer",
  perangkat_komputer: "/data-pc",
  perangkat_laptop: "/data-laptop",
  kelola_user: "/manajemen-akses",
  log_aktivitas: "/log-aktivitas",
  bangunan_tanah: "/daftar-tanah",
  bangunan_sewa: "/sewa-bangunan",
  bangunan_renovasi: "/renovasi-gedung",
  bangunan_sarana: "/sarana-keamanan",
  spk_renovasi: "/spk-renovasi",
  spk_elektronik: "/spk-elektronik",
  spk_kendaraan: "/spk-kendaraan",
  sopp_pengadaan: "/sopp-pengadaan",
  sopp_sewa: "/sopp-sewa",
  sopp_renovasi: "/sopp-renovasi",
};

/** Reverse lookup: URL pathname → viewId */
export const URL_TAB_MAP = Object.entries(TAB_URL_MAP).reduce((acc, [key, val]) => {
  acc[val] = key;
  return acc;
}, { "/riwayat": "riwayat", "/inventaris-mebelair": "inventaris_mebelair" });