<p align="center">
	<img src="public/logo-smartlog.png" alt="Logo Smartlog" height="76">
	&nbsp;&nbsp;&nbsp;
	<img src="public/logo-pegadaian.png" alt="Logo Pegadaian" height="76">
</p>

<h1 align="center">Smartlog</h1>

<p align="center">
	<strong>Sistem Informasi Logistik</strong><br>
	Aplikasi internal untuk inventaris, aset unit kerja, transaksi barang, dan dokumen operasional.
</p>

<p align="center">
	<a href="#product-requirements-document-prd">PRD</a> |
	<a href="#menjalankan-aplikasi">Menjalankan aplikasi</a> |
	<a href="#ringkasan-skema-database">Skema database</a>
</p>

<p align="center">
	<img src="https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel&logoColor=white" alt="Laravel 12">
	<img src="https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white" alt="React 18">
	<img src="https://img.shields.io/badge/Inertia.js-2-9553E9" alt="Inertia.js 2">
	<img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite 7">
</p>

Backend menggunakan Laravel 12; antarmuka menggunakan React melalui Inertia.js dan Vite. Dokumentasi PRD dan skema database berikut merangkum fungsionalitas serta struktur yang tercermin pada routes, model, dan migration.

## Product Requirements Document (PRD)

### Latar Belakang dan Tujuan

Data aset dan dokumen logistik perlu dikelola terpusat agar petugas dapat mencatat inventaris per unit kerja, memantau transaksi dan masa sewa, serta menyiapkan dokumen operasional. Aplikasi ini menyediakan satu tempat untuk pencatatan, pembaruan, impor, dan penelusuran data tersebut.

### Pengguna dan Hak Akses

Semua halaman dan data operasional mensyaratkan autentikasi.

| Peran | Hak akses utama |
| --- | --- |
| Admin (`admin`) | Mengelola data, melakukan perubahan dan penghapusan yang dibatasi untuk admin, serta mengelola pengaturan nomor surat dan akses pengguna. |
| Petugas Logistik (`logistic_officer`) | Melihat data dan melakukan pencatatan atau impor pada modul operasional yang diizinkan. Tidak memiliki akses ke operasi khusus admin. |

### Ruang Lingkup Fungsional

1. **Dashboard dan data master:** dashboard, outlet/unit kerja, vendor, kategori barang, dan data pendukung outlet.
2. **Inventaris dan perangkat:** inventaris umum, komputer, printer, laptop, serta meubelair; termasuk pencatatan kondisi, lokasi, status, dan informasi masa sewa yang tersedia pada modul terkait.
3. **Transaksi barang:** pencatatan barang masuk/keluar beserta item, kuantitas, penerima/pengirim, outlet, dan nomor surat.
4. **Aset bangunan dan fasilitas:** data aset tanah, sewa bangunan, renovasi, dan fasilitas pengamanan yang dikaitkan dengan outlet jika tersedia.
5. **Dokumen dan riwayat:** penyimpanan riwayat SPK dan SOPP, riwayat kontrak pada entitas yang mendukungnya, serta pengaturan penomoran surat.
6. **Pengawasan dan administrasi:** pencatatan aktivitas aplikasi dan pengelolaan akses pengguna untuk admin.
7. **Impor data:** beberapa modul menyediakan operasi impor sesuai implementasi controller masing-masing.

### Aturan Bisnis Utama

- Data operasional hanya dapat diakses oleh pengguna yang telah masuk.
- Pembuatan dan impor data dibatasi untuk admin dan petugas logistik pada modul yang diberi middleware peran.
- Perubahan dan penghapusan tertentu, pengaturan nomor surat, serta administrasi pengguna dibatasi untuk admin.
- Satu transaksi dapat memiliki beberapa item transaksi; item dapat merujuk ke outlet.
- Perangkat dapat ditautkan ke data inventaris, outlet, dan transaksi bila relasi tersedia.
- Riwayat kontrak menggunakan relasi polimorfik; kolom `contractable_type` dan `contractable_id` tidak memiliki foreign key database langsung.

### Teknologi

- PHP 8.2+ dan Laravel 12
- React 18, Inertia.js 2, dan Vite 7
- Database yang didukung oleh konfigurasi Laravel pada file `.env`

## Menjalankan Aplikasi

Pasang dependensi, siapkan `.env` (salin dari `.env.example`), atur koneksi database, lalu jalankan migration:

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

Di PowerShell, salin file environment dengan:

```powershell
Copy-Item .env.example .env
```

Jalankan server aplikasi dan aset frontend sekaligus:

```bash
composer run dev
```

Buka aplikasi Laravel di [http://127.0.0.1:8000](http://127.0.0.1:8000). Vite berjalan terpisah pada port `5173` untuk menyediakan aset dan hot reload; halaman root di port tersebut bukan halaman aplikasi. Pastikan database sudah dikonfigurasi dan pengguna aplikasi tersedia untuk login.

## Ringkasan Skema Database

Ringkasan berikut menggantikan diagram ERD dengan daftar tabel dan relasi per domain. `PK` adalah primary key, `FK` adalah foreign key, dan kolom yang tidak ditandai `FK` bukan constraint foreign key database. Tabel infrastruktur Laravel seperti cache, sessions, dan queue tidak ditampilkan.

### Unit, Inventaris, dan Transaksi

| Tabel | Kunci dan kolom inti |
| --- | --- |
| `outlets` | `id` (PK), `code`, `nama`, `area`, `cabang` |
| `inventories` | `id` (PK), `nama`, `kuantitas`, `satuan`, `status` |
| `computers` | `id` (PK), `outlet_id` (FK, nullable), `inventory_id` (nullable, indexed), `transaction_id` (FK, nullable), `sn`, `status` |
| `printers` | `id` (PK), `outlet_id` (FK, nullable), `inventory_id` (nullable, indexed), `transaction_id` (FK, nullable), `sn`, `status` |
| `laptops` | `id` (PK), `inventory_id` (FK, nullable), `sn`, `status` |
| `transactions` | `id` (PK), `nomor_surat`, `tanggal`, `jenis_transaksi` |
| `transaction_items` | `id` (PK), `transaction_id` (FK), `outlet_id` (FK, nullable), `nama`, `kuantitas` |
| `meubelairs` | `id` (PK), `outlet_id` (FK, nullable), `kategori`, `jenis`, `quantity` |

### Aset dan Kontrak

| Tabel | Kunci dan kolom inti |
| --- | --- |
| `aset_tanah` | `id` (PK), `outlet_id` (FK wajib) |
| `menu_sewa` | `id` (PK), `outlet_id` (FK, nullable), `nama_outlet` |
| `renovasi` | `id` (PK), `outlet_id` (FK, nullable), `nama_outlet` |
| `pengamanan_korporasi` | `id` (PK), `outlet_id` (FK, nullable), `nama_unit_kerja` |
| `contract_histories` | `id` (PK), `contractable_type`, `contractable_id`, `tgl_mulai`, `tgl_selesai` |

### Dokumen dan Data Pendukung

| Tabel | Kunci dan fungsi |
| --- | --- |
| `users` | `id` (PK); akun pengguna dan peran akses. |
| `vendors` | `id` (PK); data master vendor. |
| `master_meubelairs` | `id` (PK); master barang meubelair. |
| `jenis_meubelairs` | `id` (PK); daftar jenis meubelair. |
| `spk_histories` | `id` (PK); arsip dokumen SPK. |
| `sopp_histories` | `id` (PK); arsip dokumen SOPP. |
| `activity_logs` | `id` (PK); catatan aktivitas aplikasi. |
| `letter_number_settings` | `id` (PK); pengaturan penomoran surat. |

### Relasi Utama

- Satu `outlets` dapat terkait dengan banyak komputer, printer, meubelair, item transaksi, aset tanah, data sewa, renovasi, dan fasilitas pengamanan. `aset_tanah.outlet_id` wajib; relasi outlet lainnya nullable.
- Satu `transactions` memiliki banyak `transaction_items`. Penghapusan transaksi menghapus item-itemnya.
- `computers` dan `printers` dapat memiliki `transaction_id` opsional. Keduanya juga menyimpan `inventory_id` yang terindeks dan digunakan oleh relasi model, tetapi tidak dibatasi foreign key database. `laptops.inventory_id` memiliki foreign key.
- `contract_histories` menggunakan relasi polimorfik melalui `contractable_type` dan `contractable_id`, bukan foreign key biasa. Model yang memakai riwayat ini adalah aset tanah, sewa bangunan, inventaris, komputer, printer, dan laptop.
- Tabel `vendors`, master meubelair, riwayat SPK/SOPP, log aktivitas, dan pengaturan nomor surat tidak memiliki foreign key bisnis langsung pada migration. Sejumlah nilai vendor, area, cabang, dan pengguna disimpan sebagai teks.