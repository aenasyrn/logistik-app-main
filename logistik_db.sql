-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jun 24, 2026 at 03:59 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `logistik_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` bigint UNSIGNED NOT NULL,
  `user_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_email`, `action`, `module`, `details`, `timestamp`, `created_at`, `updated_at`) VALUES
(1, 'admin@logistik.co.id', 'Edit', 'Daftar Tanah', 'Mengubah tanah: KC Palembang', '2026-06-24 02:31:56', '2026-06-23 19:31:56', '2026-06-23 19:31:56');

-- --------------------------------------------------------

--
-- Table structure for table `building_gedungs`
--

CREATE TABLE `building_gedungs` (
  `id` bigint UNSIGNED NOT NULL,
  `nama_gedung` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lokasi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `luas_bangunan` double DEFAULT NULL,
  `jumlah_lantai` int DEFAULT NULL,
  `kondisi` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BAIK',
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `building_gedungs`
--

INSERT INTO `building_gedungs` (`id`, `nama_gedung`, `lokasi`, `luas_bangunan`, `jumlah_lantai`, `kondisi`, `deskripsi`, `created_at`, `updated_at`) VALUES
(1, 'Gedung KC Palembang', 'Jl. Ahmad Yani No. 12, Palembang', 850, 3, 'BAIK', 'Gedung utama pelayanan nasabah', '2026-06-23 19:30:02', '2026-06-23 19:30:02'),
(2, 'Gedung Kasir CP Cibinong', 'Cibinong, Bogor', 200, 1, 'BAIK', 'Gedung loket transaksi', '2026-06-23 19:30:02', '2026-06-23 19:30:02');

-- --------------------------------------------------------

--
-- Table structure for table `building_lands`
--

CREATE TABLE `building_lands` (
  `id` bigint UNSIGNED NOT NULL,
  `unit_kerja` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alamat` text COLLATE utf8mb4_unicode_ci,
  `peruntukan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `aset_sap` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `no_shgb` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `no_sertifikat` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `no_sertifikat_gabungan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `no_imb` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nama_pemilik_imb` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tgl_mulai_shgb` date DEFAULT NULL,
  `tgl_berakhir_shgb` date DEFAULT NULL,
  `tahun_perolehan` int DEFAULT NULL,
  `luas_tanah` double DEFAULT NULL,
  `luas_pagar` double DEFAULT NULL,
  `luas_bangunan` double DEFAULT NULL,
  `keterangan` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `building_lands`
--

INSERT INTO `building_lands` (`id`, `unit_kerja`, `alamat`, `peruntukan`, `aset_sap`, `no_shgb`, `no_sertifikat`, `no_sertifikat_gabungan`, `no_imb`, `nama_pemilik_imb`, `tgl_mulai_shgb`, `tgl_berakhir_shgb`, `tahun_perolehan`, `luas_tanah`, `luas_pagar`, `luas_bangunan`, `keterangan`, `created_at`, `updated_at`) VALUES
(1, 'KC Palembang', 'Jl. Ahmad Yani No. 12, Palembang', 'Kantor Cabang', 'SAP-10101', 'SHGB-12345', 'SERT-98765', 'GAB-112233', 'IMB-554433', 'PT Pegadaian KC Palembang', '2015-05-10', '2035-05-10', 2015, 1500, 120, 850, 'Lahan utama operasional Palembang', '2026-06-23 19:30:02', '2026-06-23 19:31:56'),
(2, 'KC Pekanbaru', 'Jl. Sudirman No. 45, Pekanbaru', 'Lahan Kosong', 'SAP-10102', 'SHGB-67890', 'SERT-45612', NULL, NULL, NULL, '2018-08-20', '2038-08-20', 2018, 2400, 200, 0, 'Direncanakan untuk gudang logistik baru', '2026-06-23 19:30:02', '2026-06-23 19:30:02');

-- --------------------------------------------------------

--
-- Table structure for table `building_renovations`
--

CREATE TABLE `building_renovations` (
  `id` bigint UNSIGNED NOT NULL,
  `no_memo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tgl_memo` date DEFAULT NULL,
  `nama_pekerjaan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nilai_pembayaran` bigint UNSIGNED DEFAULT NULL,
  `nama_outlet` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cabang` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `norek` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pelaksana_pekerjaan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tgl_tagihan` date DEFAULT NULL,
  `nilai_spk_pelaksanaan` bigint UNSIGNED DEFAULT NULL,
  `nilai_addendum_spk` bigint UNSIGNED DEFAULT NULL,
  `tgl_spk` date DEFAULT NULL,
  `no_spk` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pajak_pph` bigint UNSIGNED DEFAULT NULL,
  `tgl_bap_bast` date DEFAULT NULL,
  `tagihan_nilai` bigint UNSIGNED DEFAULT NULL,
  `tagihan_dpp` bigint UNSIGNED DEFAULT NULL,
  `tagihan_ppn` bigint UNSIGNED DEFAULT NULL,
  `tagihan_pph` bigint UNSIGNED DEFAULT NULL,
  `tagihan_retensi` bigint UNSIGNED DEFAULT NULL,
  `tagihan_transfer` bigint UNSIGNED DEFAULT NULL,
  `retensi_nilai` bigint UNSIGNED DEFAULT NULL,
  `retensi_dpp` bigint UNSIGNED DEFAULT NULL,
  `retensi_ppn` bigint UNSIGNED DEFAULT NULL,
  `retensi_pph` bigint UNSIGNED DEFAULT NULL,
  `retensi_transfer` bigint UNSIGNED DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'Dalam Proses',
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `building_renovations`
--

INSERT INTO `building_renovations` (`id`, `no_memo`, `tgl_memo`, `nama_pekerjaan`, `nilai_pembayaran`, `nama_outlet`, `cabang`, `norek`, `bank`, `pelaksana_pekerjaan`, `tgl_tagihan`, `nilai_spk_pelaksanaan`, `nilai_addendum_spk`, `tgl_spk`, `no_spk`, `pajak_pph`, `tgl_bap_bast`, `tagihan_nilai`, `tagihan_dpp`, `tagihan_ppn`, `tagihan_pph`, `tagihan_retensi`, `tagihan_transfer`, `retensi_nilai`, `retensi_dpp`, `retensi_ppn`, `retensi_pph`, `retensi_transfer`, `status`, `deskripsi`, `created_at`, `updated_at`) VALUES
(1, 'MEMO/2026/01', '2026-01-05', 'Renovasi Atap & Plafon', 25000000, 'KC Palembang', 'Palembang', '1234567890', 'BRI', 'CV Pembangunan Jaya', '2026-02-10', 30000000, 0, '2026-01-08', 'SPK/RENOV/001', 600000, '2026-02-15', 25000000, 22727273, 2272727, 454545, 1250000, 23272727, 1250000, 1136364, 113636, 22727, 1227273, 'Selesai', 'Perbaikan kebocoran atap gedung pelayanan', '2026-06-23 19:30:02', '2026-06-23 19:30:02'),
(2, 'MEMO/2026/02', '2026-05-25', 'Pengecatan Fasad Depan', 12500000, 'CP Cibinong', 'Cibinong', '0987654321', 'Mandiri', 'Indah Decor', '2026-06-25', 15000000, 0, '2026-05-28', 'SPK/RENOV/002', 300000, '2026-07-01', 12500000, 11363636, 1136364, 227273, 750000, 11522727, 750000, 681818, 68182, 13636, 736364, 'Dalam Proses', 'Pemeliharaan cat gedung agar tetap bersih', '2026-06-23 19:30:02', '2026-06-23 19:30:02');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `computers`
--

CREATE TABLE `computers` (
  `id` bigint UNSIGNED NOT NULL,
  `outlet_id` bigint UNSIGNED DEFAULT NULL,
  `outlet` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mac_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ram` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `storage` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cpu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `os` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `produk` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sn` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tanggal_mulai` date DEFAULT NULL,
  `tanggal_selesai` date DEFAULT NULL,
  `penyedia` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Inventaris',
  `kondisi` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BAIK',
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `computers`
--

INSERT INTO `computers` (`id`, `outlet_id`, `outlet`, `ip_address`, `mac_address`, `ram`, `storage`, `cpu`, `os`, `produk`, `sn`, `tanggal_mulai`, `tanggal_selesai`, `penyedia`, `status`, `kondisi`, `deskripsi`, `created_at`, `updated_at`) VALUES
(1, 12350, 'UPC BOJONG RAWALUMBU', '10.81.58.23', 'cc:96:e5:3f:af:e8', '7 GB', '503GB', '13th Gen Intel(R) Core(TM) i5-13600', 'Ubuntu Pegadaian', 'OptiPlex SFF 7010', '8B9BVZ3', '2024-04-01', '2026-04-01', 'POJ', 'Sewa Berjalan', 'BAIK', 'PC Admin Utama', '2026-06-23 19:30:02', '2026-06-23 19:30:02'),
(2, 12458, 'CP CIBINONG', '10.81.167.60', '4c:d7:17:9e:23:22', '7 GB', '503GB', '13th Gen Intel(R) Core(TM) i5-13600', 'Ubuntu Pegadaian V.22 Build 2024.11.01', 'OptiPlex SFF 7010', 'GMYMS44', '2025-01-01', '2028-01-01', 'EPS', 'Sewa Berjalan', 'BAIK', 'PC Transaksi Kasir', '2026-06-23 19:30:02', '2026-06-23 19:30:02');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `integrated_warehouses`
--

CREATE TABLE `integrated_warehouses` (
  `id` bigint UNSIGNED NOT NULL,
  `nama_gudang` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lokasi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kapasitas` double DEFAULT NULL,
  `kondisi` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BAIK',
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `integrated_warehouses`
--

INSERT INTO `integrated_warehouses` (`id`, `nama_gudang`, `lokasi`, `kapasitas`, `kondisi`, `deskripsi`, `created_at`, `updated_at`) VALUES
(1, 'Gudang Jaminan Utama', 'Pekanbaru', 1500, 'BAIK', 'Gudang penyimpanan barang jaminan emas dan barang berharga', '2026-06-23 19:30:02', '2026-06-23 19:30:02');

-- --------------------------------------------------------

--
-- Table structure for table `inventories`
--

CREATE TABLE `inventories` (
  `id` bigint UNSIGNED NOT NULL,
  `nama` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kuantitas` int NOT NULL DEFAULT '0',
  `satuan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pcs',
  `vendor_nama` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `no_spk` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `no_pks` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tanggal_mulai` date DEFAULT NULL,
  `tanggal_selesai` date DEFAULT NULL,
  `masa_sewa_bulan` int DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Inventaris',
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventories`
--

INSERT INTO `inventories` (`id`, `nama`, `kuantitas`, `satuan`, `vendor_nama`, `no_spk`, `no_pks`, `tanggal_mulai`, `tanggal_selesai`, `masa_sewa_bulan`, `status`, `deskripsi`, `created_at`, `updated_at`) VALUES
(1, 'OptiPlex SFF 7010', 10, 'Pcs', NULL, NULL, NULL, NULL, NULL, NULL, 'Inventaris', 'PC Desktop Brand Dell', '2026-06-23 19:30:02', '2026-06-23 19:30:02'),
(2, 'EPSON L4260 ECO TANK', 5, 'Pcs', NULL, NULL, NULL, NULL, NULL, NULL, 'Inventaris', 'Printer Inkjet Warna', '2026-06-23 19:30:02', '2026-06-23 19:30:02'),
(3, 'LQ-310 DOT MATRIX', 3, 'Pcs', NULL, NULL, NULL, NULL, NULL, NULL, 'Inventaris', 'Printer Dot Matrix Kasir', '2026-06-23 19:30:02', '2026-06-23 19:30:02');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `menu_sewa`
--

CREATE TABLE `menu_sewa` (
  `id` bigint UNSIGNED NOT NULL,
  `outlet_id` bigint UNSIGNED DEFAULT NULL,
  `kode_outlet` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nama_outlet` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type_outlet` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type_bangunan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jenis_sto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status_gedung` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `periode_sewa` int DEFAULT NULL,
  `tgl_kontrak_mulai` date DEFAULT NULL,
  `tgl_kontrak_berakhir` date DEFAULT NULL,
  `harga_sewa` bigint UNSIGNED DEFAULT NULL,
  `keterangan` text COLLATE utf8mb4_unicode_ci,
  `alamat` text COLLATE utf8mb4_unicode_ci,
  `kelurahan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kecamatan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kab_kota` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provinsi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `menu_sewa`
--

INSERT INTO `menu_sewa` (`id`, `outlet_id`, `kode_outlet`, `nama_outlet`, `type_outlet`, `type_bangunan`, `jenis_sto`, `status_gedung`, `periode_sewa`, `tgl_kontrak_mulai`, `tgl_kontrak_berakhir`, `harga_sewa`, `keterangan`, `alamat`, `kelurahan`, `kecamatan`, `kab_kota`, `provinsi`, `created_at`) VALUES
(1, NULL, NULL, 'Gudang Terpadu Area Bekasi (Tambun) - Area Bekasi', NULL, NULL, NULL, 'SEWA', 3, '2023-09-01', '2026-08-31', 567266667, 'Sebuah gudang terdiri 1 lantai dengan luas 861 M2', 'JALAN KH ABU BAKAR RT 002 RW 002', 'Setiadarma', 'Tambun Selatan', 'Bekasi', 'Jawa Barat', NULL),
(2, NULL, NULL, 'Gudang Terpadu Rawa Panjang - Area Bekasi', 'Rencana relokasi/tutup', NULL, NULL, 'SEWA', 3, '2023-08-08', '2026-08-08', 867266667, 'Sebuah lahan tanah dan bangunan gudang dan bangunan lainnya yang terdiri dari 1 lantai dengan luas +1.060 M2 (dengan total 6 sertifikat)', 'JALAN RAYA CUT MUTIA NO. 777', 'Sepanjang Jaya', 'Rawalumbu', 'Bekasi', 'Jawa Barat', NULL),
(3, NULL, NULL, 'Gudang Terpadu Jatimakmur - Area Jatiwaringin', 'Include UPC', NULL, NULL, 'SEWA', 3, '2023-08-01', '2026-07-31', 650600000, 'Sebuah lahan tanah dan bangunan gudang dan bangunan lainnya yang terdiri dari 1 lantai dengan luas +1.728 M2', 'JALAN RAYA JATIWARINGIN RUKO ASEM BARU NO. 5-6', 'Jatiwaringin', 'Pondok Gede', 'Bekasi', 'Jawa Barat', NULL),
(4, NULL, NULL, 'Gudang Terpadu Karadenan - Area Bogor', NULL, NULL, NULL, 'SEWA', 3, '2023-08-15', '2026-08-14', 1000600000, 'Sebuah lahan tanah dan bangunan gudang dan bangunan lainnya yang terdiri dari 1 lantai dengan luas +1.604 M2 (dengan total 5 sertifikat)', 'JALAN POMAD NO. 9', 'Karadenan', 'Cibinong', 'Kab. Bogor', 'Jawa Barat', NULL),
(5, NULL, NULL, 'Gudang Terpadu Pasar Kranggan - Area Kramat Jati', 'Rencana relokasi/tutup', NULL, NULL, 'SEWA', 2, '2024-12-03', '2026-12-03', 306155556, 'Sebuah lahan tanah dan bangunan gudang dan bangunan lainnya yang terdiri dari 1 lantai dengan luas +242 M2', 'JALAN JATIRANGGA NO. 93 RT 002 RW 009', 'Jatirangga', 'Jatisampurna', 'Bekasi', 'Jawa Barat', NULL),
(6, NULL, NULL, 'Gudang Terpadu Pasar Pucung - Area Bogor', 'Include UPC', NULL, NULL, 'SEWA', 3, '2023-08-14', '2026-08-15', 1250600000, 'Sebuah lahan tanah dan bangunan gudang dan bangunan lainnya yang terdiri dari 1 lantai dengan luas +1.889 M2 (dengan total 3 sertifikat)', 'KP SAWAH SUKMAJAYA JALAN KALIMULYA', 'Kalimulya', 'Sukmajaya', 'Depok', 'Jawa Barat', NULL),
(7, NULL, '12293', 'CP PETAMBURAN', 'INDUK CLUSTER', 'STAND ALONE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALANKS TUBUN RAYA NO.19', 'Petamburan', 'Tanah Abang', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(8, NULL, '12294', 'UPC GANG LONTAR', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2022', 'SEWA', 2, '2024-09-01', '2026-09-01', 211711111, NULL, 'JALANLONTAR BAWAH NO.179', 'Kebon Melati', 'Tanah Abang', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(9, NULL, '12297', 'UPC BLOK B TANAH ABANG', 'ANGGOTA CLUSTER', 'MALL / KIOS', 'STO KANWIL 2021', 'SEWA', 1, '2026-03-01', '2027-06-28', 217066667, '2 kios jadi satu', 'BLOK B TANAH ABANG LT.5 ZONA 2', 'Kebon Melati', 'Tanah Abang', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(10, NULL, '12835', 'UPC BIAK', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2025', 'SEWA', 3, '2025-05-12', '2028-05-12', 217266667, NULL, 'PERTOKOAN METRO BIAKJL.BIAK NO.5J', 'Cideng', 'Gambir', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(11, NULL, '12300', 'CP SALEMBA', 'INDUK CLUSTER', 'STAND ALONE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN SALEMBA RAYA NO 2', 'Kenari', 'Senen', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(12, NULL, '12301', 'UPC PASAR JANGKRIK II', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2025', 'SEWA', NULL, '2023-08-01', '2026-07-31', 300600000, NULL, 'JALAN KELAPA SAWIT RAYA 30', 'Kayu Manis', 'Matraman', 'Jakarta Timur', 'DKI Jakarta', NULL),
(13, NULL, '12302', 'UPC PASAR JOHAR', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 5, '2025-07-04', '2030-07-04', 256155556, NULL, 'JALAN PERCETAKAN NEGARA II / 14', 'Johar Baru', 'Johar Baru', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(14, NULL, '12305', 'UPC TAMBAK', 'ANGGOTA CLUSTER', 'STAND ALONE', NULL, 'SEWA', 2, '2024-12-01', '2026-11-30', 115555440, NULL, 'JALAN TAMBAK NO.2 INKOPOL', 'Pegangsaan', 'Menteng', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(15, NULL, '12306', 'UPC PASAR GENJING', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2023-07-31', '2026-07-31', 300600000, NULL, 'JALAN RAWAMANGUN NO 41', 'Rawasari', 'Cempaka Putih', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(16, NULL, '12309', 'UPC MATRAMAN', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2025', 'SEWA', 3, '2025-10-31', '2028-10-31', 483933333, NULL, 'JALAN MATRAMAN RAYA NO 64', 'Kebon Manggis', 'Matraman', 'Jakarta Timur', 'DKI Jakarta', NULL),
(17, NULL, '12310', 'UPC SABANG', 'INDUK CLUSTER', 'RUKO DOUBLE', 'RENCANA STO 2026', 'SEWA', 3, '2025-09-25', '2028-09-24', 467266667, NULL, 'JALAN H.AGUS SALIM NO 42', 'Kebon Sirih', 'Menteng', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(18, NULL, '12323', 'UPC CIKINI', 'NON CLUSTER', 'RUKO DOUBLE', 'PROSES STO 2026', 'SEWA', 3, '2024-08-23', '2027-08-23', 300600000, NULL, 'GEDUNG CIKINI GOLD CENTER LT GF/A/AKS036', 'Pegangsaan', 'Menteng', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(19, NULL, '12321', 'CP PASAR SENEN', 'INDUK CLUSTER', 'STAND ALONE', 'STO PUSAT 2021', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN SENEN RAYA NO.36', 'Senen', 'Senen', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(20, NULL, '12308', 'UPC POS CIKINI', 'ANGGOTA CLUSTER', 'STAND ALONE', 'RELOKASI 2024\r\nPROSES RELOKASI 2026', 'SEWA', 5, '2026-05-15', '2031-01-31', 481506899, NULL, 'JALAN CIKINI RAYA NO. 2-4 (MENTENG HUIS)', 'Meteng', 'Menteng', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(21, NULL, '12322', 'UPC KWITANG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 2, '2025-09-01', '2027-08-31', 66155556, NULL, 'JALAN KRAMAT KWITANG I', 'Kwitang', 'Senen', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(22, NULL, '12324', 'UPC BUNGUR', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 5, '2024-01-01', '2029-01-01', 750600000, NULL, 'JALAN BUNGUR BESAR RAYA NO.02 C', 'Bungur', 'Senen', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(23, NULL, '12325', 'UPC KRAMAT SENTIONG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2022', 'SEWA', 3, '2026-06-01', '2029-05-31', 860600000, NULL, 'JL. KRAMAT SENTIONG NO.43', 'Kramat', 'Senen', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(24, NULL, '12330', 'UPC ATRIUM SENEN', 'ANGGOTA CLUSTER', 'MALL / KIOS', 'STO KANWIL', 'SEWA', 3, '2026-03-18', '2029-03-17', 562770000, NULL, 'PASAR SENEN JAYA JL. PASAR SENEN NO. 3 RW. 3', 'Senen', 'Senen', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(25, NULL, '12331', 'UPC GONDANGDIA', 'ANGGOTA CLUSTER', 'STAND ALONE', 'RELOKASI 2025', 'SEWA', 3, '2025-05-09', '2028-05-09', 167266667, NULL, 'JALAN WAHID HASYIM NO.14', 'Kebon Sirih', 'Menteng', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(26, NULL, '12332', 'CP PASAR BARU', 'INDUK CLUSTER', 'STAND ALONE', 'STO PUSAT 2022', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN KH SAMANHUDI NO 133', 'Pasar Baru', 'Sawah Besar', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(27, NULL, '12335', 'UPC KARANGANYAR', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RENCANA RELOKASI 2026', 'SEWA', 1, '2025-06-17', '2026-06-16', 161711111, '2026 rencana relokasi', 'JALAN D NO 73 KEL KARANG ANYAR', 'Karang Anyar', 'Sawah Besar', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(28, NULL, '12901', 'UPC APRON', 'ANGGOTA CLUSTER', 'STAND ALONE', 'STO KANWIL', 'SEWA', 2, '2025-02-28', '2027-02-28', 125044444, NULL, 'JL. CASA NO. 10 RT 15/RW 6', 'Kb. Kosong', 'Kemayoran', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(29, NULL, '12997', 'UPC A RAYA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 5, '2025-01-11', '2030-01-11', 445044444, NULL, 'JL. A RAYA NO.28', 'Kartini', 'Sawah Besar', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(30, NULL, '12407', 'CP KEMAYORAN', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN SERDANG RAYA NO 8 SERDANG', 'Serdang', 'Kemayoran', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(31, NULL, '12333', 'UPC KEBON KOSONG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2024', 'SEWA', 2, '2024-09-01', '2026-09-01', 245044444, NULL, 'JALAN KEBUN KOSONG RAYA NO.44C', 'Kebon Kosong', 'Kemayoran', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(32, NULL, '12408', 'UPC CEMPAKA SARI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2025', 'SEWA', 2, '2025-08-01', '2027-08-01', 122822222, NULL, 'JALAN RAYA CEMPAKA SARI V NO 1 HARAPAN MULYA', 'Harapan Mulya', 'Kemayoran', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(33, NULL, '12409', 'UPC CEMPAKA BARU', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RENCANA RELOKASI 2027', 'SEWA', 1, '2026-05-24', '2027-05-23', 45044444, '2027 rencana relokasi', 'JALAN REMAJA III/10 SERDANG', 'Utan Panjang', 'Kemayoran', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(34, NULL, '12410', 'UPC BENDUNGAN JAGO', 'ANGGOTA CLUSTER', 'STAND ALONE', 'RENCANA RELOKASI 2027', 'SEWA', 1, '2026-06-01', '2027-05-31', 95044444, 'Batal relokasi 2026. Rencana relokasi 2027', 'JL UTAN PANJANG RAYA', 'Utan Panjang', 'Kemayoran', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(35, NULL, '12417', 'CP KAMPUNG AMBON', 'INDUK CLUSTER', 'STAND ALONE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALANH TENNO.86 RAWASARI', 'Rawamangun', 'Pulo Gadung', 'Jakarta Timur', 'DKI Jakarta', NULL),
(36, NULL, '12418', 'UPC PASAR KAMPUNG AMBON', 'ANGGOTA CLUSTER', 'STAND ALONE', 'STO KANWIL 2024', 'SEWA', 3, '2026-01-08', '2029-01-07', 220600000, NULL, 'JALANPONDASI RAYA NO.40', 'Kayu Putih', 'Pulo Gadung', 'Jakarta Timur', 'DKI Jakarta', NULL),
(37, NULL, '12420', 'UPC PRAMUKA', 'ANGGOTA CLUSTER', 'STAND ALONE', 'RELOKASI 2025', 'SEWA', 1, '2026-11-10', '2027-11-10', 272618000, NULL, 'JALAN UTAN KAYU RAYA NO.17A', 'Utan Kayu Utara', 'Matraman', 'Jakarta Timur', 'DKI Jakarta', NULL),
(38, NULL, '12505', 'UPC TARUNA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2025', 'SEWA', 1, '2026-07-14', '2027-07-15', 42822222, NULL, 'JALAN TARUNA RAYA NO.118', 'Pulo Gadung', 'Pulo Gadung', 'Jakarta Timur', 'DKI Jakarta', NULL),
(39, NULL, '12303', 'UPC UTAN KAYU', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2024', 'SEWA', 2, '2024-12-01', '2026-12-01', 245044444, NULL, 'JALAN UTAN KAYU RAYA NO 76', 'Utan Kayu Selatan', 'Matraman', 'Jakarta Timur', 'DKI Jakarta', NULL),
(40, NULL, '12484', 'CP CEMPAKA PUTIH', 'INDUK CLUSTER', 'RUKO SINGLE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN CEMPAKA PUTIH TENGAH II BLOK B.5', 'Cempaka Putih Timur', 'Cempaka Putih', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(41, NULL, '12307', 'UPC KAMPUNG RAWA', 'ANGGOTA CLUSTER', 'STAND ALONE', 'STO PUSAT 2021', 'SEWA', 3, '2024-04-01', '2027-03-31', 200600000, NULL, 'JALAN KP.RAWA SAWAH NO.12', 'Kampung Rawa', 'Johar Baru', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(42, NULL, '12485', 'UPC RAWASARI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2025', 'SEWA', 3, '2025-11-01', '2028-11-01', 417266667, NULL, 'JALAN RAWASARI SELATAN NO 18C', 'Rawasari', 'Cempaka Putih', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(43, NULL, '12487', 'UPC MARDANI', 'ANGGOTA CLUSTER', 'STAND ALONE', 'STO KANWIL 2026', 'SEWA', 3, '2026-03-13', '2029-03-12', 360600000, NULL, 'JALAN MARDANI RAYA NO 38', 'Cempaka Putih Barat', 'Cempaka Putih', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(44, NULL, '12488', 'UPC RUMAH SAKIT ISLAM', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 3, '2024-01-18', '2027-01-17', 283933333, NULL, 'JALAN CEMPAKA PUTIH TENGAH I/36B', 'Cempaka Putih Timur', 'Cempaka Putih', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(45, NULL, '12533', 'CP SUDIRMAN', 'INDUK CLUSTER', 'STAND ALONE', 'STO PUSAT 2023', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN BENDUNGAN HILIR RAYA NO. 86', 'Bendungan Hilir', 'Tanah Abang', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(46, NULL, '12304', 'UPC SARINAH/THAMRIN', 'NON CLUSTER', 'MALL / KIOS', 'STO KANWIL', 'SEWA', 2, '2026-05-01', '2028-04-30', 395943216, NULL, 'JL. H AGUS SALIM NO 60A RUKO MALL SARINAH', 'Gondangdia', 'Menteng', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(47, NULL, '12535', 'UPC THAMRIN CITY', 'NON CLUSTER', 'MALL / KIOS', 'STO PUSAT 2024', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'THAMRIN CITY JALAN KEBON KACANG RAYA LANTAI DASAR BLOK A18 NO.06 DAN 08', 'Kebon Melati', 'Tanah Abang', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(48, NULL, '12536', 'UPC DANAU TOBA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'PROSES STO 2026', 'SEWA', 2, '2025-08-31', '2027-09-01', 278377778, NULL, 'JL. BENDUNGAN HILIR RAYA NO. 148', 'Bendungan Hilir', 'Tanah Abang', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(49, NULL, '12654', 'CP ITC CEMPAKA MAS', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2024', 'SEWA', 3, '2023-11-01', '2026-10-31', 450600000, 'Info Mbak Kelly (10/02/2026): 2026 rencana relokasi', 'GRAHA CEMPAKA MAS BLOK E24', 'Sumur Batu', 'Kemayoran', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(50, NULL, '12652', 'UPC CEMPAKA MAS', 'NON CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2024-10-30', '2027-10-30', 250600000, NULL, 'RUKO CEMPAKA MAS BLOK P NO. 20 SUMUR BATU', 'Sumur Batu', 'Kemayoran', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(51, NULL, '12653', 'UPC PASAR SERDANG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2024-04-01', '2027-03-31', 307266667, NULL, 'JALANPASAR SERDANG BARU 2 NO.383A', 'Serdang', 'Kemayoran', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(52, NULL, '12996', 'UPC SERDANG BARU', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2026', 'SEWA', 2, '2026-01-31', '2028-01-31', 93933333, NULL, 'JL. HOWITZER LANJUTAN NO.19', 'Sumur Batu', 'Kemayoran', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(53, NULL, '13031', 'UPC HOWITZER', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 3, '2026-02-01', '2029-01-31', 306155556, NULL, 'JL. HOWITZER NO 3A SUMUR BATU RT 00 RW 00 KEMAYORAN', 'Harapan Mulya', 'Kemayoran', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(54, NULL, '60139', 'CPS KRAMAT RAYA', 'INDUK CLUSTER', 'STAND ALONE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN KRAMAT RAYA NO. 162', 'Kenari', 'Senen', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(55, NULL, '60140', 'UPS PASAR JAYA CEMPAKA PUTIH', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL\r\nRENCANA RELOKASI 2026', 'SEWA', 1, '2025-11-01', '2026-10-31', 52822222, '2026 rencana relokasi', 'JALAN CEMPAKA PUTIH BARAT III NO. 16 A', 'Cempaka Putih Barat', 'Cempaka Putih', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(56, NULL, '60141', 'UPS PASAR DJOHAR BARU', 'ANGGOTA CLUSTER', 'STAND ALONE', 'STO KANWIL 2025', 'SEWA', 3, '2024-06-02', '2027-06-01', 290600000, NULL, 'JALAN PERCETAKAN NEGARA II NO. 6A', 'Johar Baru', 'Johar Baru', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(57, NULL, '60142', 'UPS MEDITERANIA', 'NON CLUSTER', 'MALL / KIOS', 'STO KANWIL 2025', 'SEWA', 2, '2025-01-01', '2026-12-31', 140992800, NULL, 'APARTEMEN MEDITERANIA SELATAN GIANT KIOS C2 JALAN', 'Kebon Kosong', 'Kemayoran', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(58, NULL, NULL, 'PERLUASAN RUKO UPS MEDITERANIA', NULL, 'MALL / KIOS', 'STO KANWIL 2025', 'SEWA', 2, '2025-05-01', '2026-12-31', 72306000, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(59, NULL, '60143', 'UPS KALIBARU', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 2, '2025-01-03', '2027-01-03', 83933333, NULL, 'JALAN KALIBARU TIMUR III NO. 1', 'Bungur', 'Senen', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(60, NULL, '60144', 'UPS PERCETAKAN NEGARA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 3, '2023-12-01', '2026-11-30', 333933333, NULL, 'JL. PERCETAKAN NEGARA NO. C230', 'Rawasari', 'Cempaka Putih', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(61, NULL, '60145', 'UPS KAYU JATI RAWA BENING', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2025', 'SEWA', 2, '2025-03-01', '2027-03-01', 222822222, NULL, 'JL. MAS MANSYUR 25B', 'Kebon Kacang', 'Tanah Abang', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(62, NULL, '60822', 'UPS TAMAN SOLO GAJAH MADA', 'ANGGOTA CLUSTER', 'STAND ALONE', NULL, 'SEWA', 3, '2024-06-01', '2027-05-31', 217266667, NULL, 'JALAN CEMPAKA PUTIH TENGAH 27 NO. 55', 'Cempaka Putih Timur', 'Cempaka Putih', 'Jakarta Pusat', 'DKI Jakarta', NULL),
(63, NULL, '60825', 'UPS KAYU MANIS', 'ANGGOTA CLUSTER', 'STAND ALONE', 'RENCANA RELOKASI 2027', 'SEWA', 1, '2026-02-04', '2027-02-03', 133933333, '2027 rencana relokasi', 'JALAN KAYU MANIS TIMUR NO. 4', 'Utan Kayu Selatan', 'Matraman', 'Jakarta Timur', 'DKI Jakarta', NULL),
(64, NULL, '60826', 'UPS PISANGAN LAMA', 'NON CLUSTER', 'STAND ALONE', 'RELOKASI 2025', 'SEWA', 3, '2025-02-01', '2028-01-31', 400600000, NULL, 'JALAN PISANGAN LAMA III NO. 9B', 'Pisangan Timur', 'Pulo Gadung', 'Jakarta Timur', 'DKI Jakarta', NULL),
(65, NULL, '12311', 'CP JATINEGARA', 'INDUK CLUSTER', 'STAND ALONE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN JATINEGARA BARAT NO.3A', 'Bali Mester', 'Jatinegara', 'Jakarta Timur', 'DKI Jakarta', NULL),
(66, NULL, '12315', 'UPC PAL MERIAM', 'ANGGOTA CLUSTER', 'PASAR', 'STO KANWIL', 'SEWA', 3, '2026-03-01', '2029-03-01', 128977778, '10 kios jadi satu', 'GG. BANTEN VIII/5 RT 007 RW 005', 'Bali Mester', 'Jatinegara', 'Jakarta Timur', 'DKI Jakarta', NULL),
(67, NULL, '12320', 'UPC OTISTA RAYA', 'ANGGOTA CLUSTER', 'STAND ALONE', 'PROSES STO 2026', 'SEWA', 3, '2026-03-14', '2029-03-14', 165600000, NULL, 'JALAN OTISTA RAYA NO.59', 'Bidaracina', 'Jatinegara', 'Jakarta Timur', 'DKI Jakarta', NULL),
(68, NULL, '12370', 'UPC JENGKI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2024', 'SEWA', 3, '2024-02-28', '2027-02-27', 283933333, NULL, 'JALAN JENGKI NO. 25A KEBON PALA', 'Kebon Pala', 'Makasar', 'Jakarta Timur', 'DKI Jakarta', NULL),
(69, NULL, '12373', 'UPC SARTIKA', 'ANGGOTA CLUSTER', 'STAND ALONE', NULL, 'SEWA', 3, '2024-06-01', '2027-05-31', 300600000, NULL, 'JALAN DEWI SARTIKA NO.165B SAMPING PANASONIC', 'Cawang', 'Kramat Jati', 'Jakarta Timur', 'DKI Jakarta', NULL),
(70, NULL, '12423', 'UPC KRAMAT ASEM', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2025-11-18', '2028-11-17', 201850000, NULL, 'JALANKRAMAT ASEM UTAN KAYU NO.2', 'Utan Kayu Selatan', 'Matraman', 'Jakarta Timur', 'DKI Jakarta', NULL),
(71, NULL, '12352', 'CP PENGGILINGAN', 'INDUK CLUSTER', 'STAND ALONE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN RAYA PENGGILINGAN NO.1', 'Penggilingan', 'Cakung', 'Jakarta Timur', 'DKI Jakarta', NULL),
(72, NULL, '12353', 'UPC PERUMNAS KLENDER', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 3, '2025-06-21', '2028-06-21', 250600000, NULL, 'JALAN RAYA TERATAI PUTIH NO. 9 I', 'Malaka Jaya', 'Duren Sawit', 'Jakarta Timur', 'DKI Jakarta', NULL),
(73, NULL, '12354', 'UPC PULO GEBANG', 'NON CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2024', 'SEWA', 3, '2024-03-27', '2027-03-26', 467266667, NULL, 'JALAN RAYA PULO GEBANG PERMAI NO.42', 'Pulo Gebang', 'Cakung', 'Jakarta Timur', 'DKI Jakarta', NULL),
(74, NULL, '12355', 'UPC KOMPLEK PIK', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2025', 'SEWA', 2, '2026-06-01', '2028-06-01', 183933333, 'Atap rusak, mau diperbaiki Pemilik', 'JALAN RAYA PENGGILINGAN NO. 5B', 'Penggilingan', 'Cakung', 'Jakarta Timur', 'DKI Jakarta', NULL),
(75, NULL, '12359', 'UPC RAWA KUNING', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2025', 'SEWA', 4, '2025-06-01', '2029-05-31', 378377778, NULL, 'JALAN RAYA RAWA KUNING NO.18', 'Pulo Gebang', 'Cakung', 'Jakarta Timur', 'DKI Jakarta', NULL),
(76, NULL, '13097', 'UPC CAKUNG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2024', 'SEWA', 3, '2024-11-01', '2027-11-01', 211711111, NULL, 'JALAN RAYA TIPAR CAKUNG N0.1 A RT 05 RW 08 CAKUNG', 'Cakung Timur', 'Cakung', 'Jakarta Timur', 'DKI Jakarta', NULL),
(77, NULL, '13101', 'UPC KAMPUNG BULAK / KAYUTINGGI DALAM', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2025', 'SEWA', 2, '2026-05-21', '2028-05-21', 93933333, NULL, 'KP. BULAK KAYU TINGGI RT 04 RW 09 CAKUNG', 'Cakung Timur', 'Cakung', 'Jakarta Timur', 'DKI Jakarta', NULL),
(78, NULL, '12363', 'CP KRAMAT JATI', 'INDUK CLUSTER', 'STAND ALONE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JL. KELAPA GADING V NO.3 JAKARTA TIMUR', 'Kramat Jati', 'Kramat Jati', 'Jakarta Timur', 'DKI Jakarta', NULL),
(79, NULL, '12364', 'UPC RAYA TENGAH', 'ANGGOTA CLUSTER', 'STAND ALONE', 'STO KANWIL 2024', 'SEWA', 3, '2023-08-12', '2026-08-11', 111711111, NULL, 'JALAN RY TENGAH NO.2-GEDONG-', 'Gedong', 'Pasar Rebo', 'Jakarta Timur', 'DKI Jakarta', NULL),
(80, NULL, '12366', 'UPC KAMPUNG TENGAH', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2023', 'SEWA', 3, '2023-12-01', '2026-11-30', 121711111, NULL, 'JL. RAYA INPRES NO.24A RT 004 / RW 010', 'Kampung Tengah', 'Kramat Jati', 'Jakarta Timur', 'DKI Jakarta', NULL),
(81, NULL, '12367', 'UPC PASAR KRAMAT JATI', 'ANGGOTA CLUSTER', 'PASAR', 'STO KANWIL 2023', 'SEWA', 2, '2025-05-14', '2027-05-13', 100600000, NULL, 'PSR KRAMAT JATI BLOK B LOS AKS NO.186', 'Kramat Jati', 'Kramat Jati', 'Jakarta Timur', 'DKI Jakarta', NULL),
(82, NULL, '12368', 'UPC MALL CIJANTUNG', 'NON CLUSTER', 'MALL / KIOS', NULL, 'SEWA', 2, '2024-11-21', '2026-11-20', 464347987, NULL, 'MALL CIJANTUNG LT DASAR', 'Cijantung', 'Pasar Rebo', 'Jakarta Timur', 'DKI Jakarta', NULL),
(83, NULL, '12371', 'UPC KAMPUNG DUKUH', 'ANGGOTA CLUSTER', 'STAND ALONE', 'STO PUSAT 2023', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, 'Aset Kantor Pusat', 'JALAN DUKUH V JAKARTA TIMUR', 'Dukuh', 'Kramat Jati', 'Jakarta Timur', 'DKI Jakarta', NULL),
(84, NULL, '12583', 'UPC PGC CILILITAN', 'NON CLUSTER', 'MALL / KIOS', NULL, 'SEWA', 3, '2025-05-23', '2028-05-22', 313849186, NULL, 'JL. MAYJEN SUTOYO NO. 76 PGC 2 LT 2 NO.12 - ZONA HIJAU', 'Cililitan', 'Kramat Jati', 'Jakarta Timur', 'DKI Jakarta', NULL),
(85, NULL, '12702', 'UPC CONDET', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2023', 'SEWA', 3, '2024-04-23', '2027-04-24', 417266667, NULL, 'JALAN CONDET RAYA NO.3 DPN SD 03 PAGI', 'Gedong', 'Pasar Rebo', 'Jakarta Timur', 'DKI Jakarta', NULL),
(86, NULL, '12707', 'UPC BALE KAMBANG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL\r\nRENCANA RELOKASI 2027', 'SEWA', 1, '2026-02-26', '2027-02-26', 178377778, '2027 rencana relokasi', 'JALAN CONDET RAYA NO.99 RT.5 RW.2 BALEKAMBANG', 'Balekambang', 'Kramat Jati', 'Jakarta Timur', 'DKI Jakarta', NULL),
(87, NULL, '12498', 'CP RAWAMANGUN', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN SUNAN GIRI NO. 1A', 'Rawamangun', 'Pulo Gadung', 'Jakarta Timur', 'DKI Jakarta', NULL),
(88, NULL, '12314', 'UPC CIPINANG BARU', 'ANGGOTA CLUSTER', 'STAND ALONE', NULL, 'SEWA', 2, '2024-12-10', '2026-12-10', 111711111, NULL, 'JALAN CIPINANG BARU RAYA NO.33', 'Cipinang', 'Pulo Gadung', 'Jakarta Timur', 'DKI Jakarta', NULL),
(89, NULL, '12419', 'UPC JATINEGARA', 'ANGGOTA CLUSTER', 'STAND ALONE', 'RELOKASI 2024', 'SEWA', 3, '2024-08-01', '2027-08-01', 160600000, NULL, 'JL.RAYA BEKASI KM 18 NO. 7A', 'Jatinegara Kaum', 'Pulo Gadung', 'Jakarta Timur', 'DKI Jakarta', NULL),
(90, NULL, '12501', 'UPC PASAR RAWAMANGUN', 'ANGGOTA CLUSTER', 'STAND ALONE', 'STO KANWIL \r\nRENCANA RELOKASI 2026', 'SEWA', 1, '2025-07-25', '2026-07-25', 133933333, '2026 rencana relokasi', 'JALAN PEGAMBIRAN NO.25', 'Rawamangun', 'Pulo Gadung', 'Jakarta Timur', 'DKI Jakarta', NULL),
(91, NULL, '12502', 'UPC LAYUR', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 2, '2025-06-30', '2027-06-30', 133933333, NULL, 'JALAN LAYUR SELATAN RAYA NO.5', 'Jati', 'Pulo Gadung', 'Jakarta Timur', 'DKI Jakarta', NULL),
(92, NULL, '12506', 'UPC BALAI PUSTAKA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 2, '2024-12-15', '2026-12-15', 267266667, NULL, 'JL. CIPINANG BARU TIMUR NO. 1-E', 'Cipinang', 'Pulo Gadung', 'Jakarta Timur', 'DKI Jakarta', NULL),
(93, NULL, '12574', 'UPC PAHLAWAN REVOLUSI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2026', 'SEWA', 3, '2024-04-30', '2027-04-30', 250600000, NULL, 'JALAN PAHLAWAN REVOLUSI NO.9C', 'Klender', 'Duren Sawit', 'Jakarta Timur', 'DKI Jakarta', NULL),
(94, NULL, '12545', 'CP CIBUBUR', 'INDUK CLUSTER', 'RUKO SINGLE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JL. LAPANGAN TEMBAK RUKO ARUDINA BLOK F7 CIBUBUR', 'Cibubur', 'Ciracas', 'Jakarta Timur', 'DKI Jakarta', NULL),
(95, NULL, '12546', 'UPC PASAR REBO', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 2, '2024-10-01', '2026-10-01', 89488889, NULL, 'JL. RAYA BOGOR KM 23 NO. 4 CIRACAS', 'Susukan', 'Ciracas', 'Jakarta Timur', 'DKI Jakarta', NULL),
(96, NULL, '12547', 'UPC CIRACAS', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RENCANA STO 2026', 'SEWA', 3, '2024-07-07', '2027-07-07', 273933333, NULL, 'JL. RAYA CIRACAS NO. 47B CIRACAS', 'Ciracas', 'Ciracas', 'Jakarta Timur', 'DKI Jakarta', NULL),
(97, NULL, '12547', 'UPC PASAR CIBUBUR', 'ANGGOTA CLUSTER', 'PASAR', 'STO KANWIL 2025', 'SEWA', 5, '2024-01-01', '2028-12-31', 389488889, NULL, 'JL. LAPANGAN TEMBAK NO. 3', 'Cibubur', 'Ciracas', 'Jakarta Timur', 'DKI Jakarta', NULL),
(98, NULL, '12550', 'UPC CEGER', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2023', 'SEWA', 3, '2025-09-30', '2028-09-30', 300600000, NULL, 'JALAN GEMPOL RAYA NO 10', 'Ceger', 'Cipayung', 'Jakarta Timur', 'DKI Jakarta', NULL),
(99, NULL, '12551', 'UPC KELAPA DUA CIBUBUR', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT', 'SEWA', 3, '2026-03-01', '2029-03-01', 183933333, '2029 agar tidak ada kenaikan harga, karena di 2026 terdapat kesalahan nego harga', 'JALAN RAYA KELAPA DUA WETAN NO. 9D CIRACAS', 'Kelapa Dua Wetan', 'Ciracas', 'Jakarta Timur', 'DKI Jakarta', NULL),
(100, NULL, '12699', 'UPC CIBUBUR JUNCTION', 'NON CLUSTER', 'MALL / KIOS', 'RELOKASI 2025', 'SEWA', 3, '2025-02-15', '2028-02-14', 525888210, NULL, 'MALL CIBUBUR JUNCTION LT UG CIRACAS', 'Cibubur', 'Ciracas', 'Jakarta Timur', 'DKI Jakarta', NULL),
(101, NULL, '12705', 'UPC KALISARI DALAM', 'INDUK CLUSTER', 'STAND ALONE', 'RENCANA STO 2025', 'SEWA', 3, '2025-02-04', '2028-02-04', 207266667, NULL, 'JL. KALISARI RAYA NO.56', 'Kalisari', 'Pasar Rebo', 'Jakarta Timur', 'DKI Jakarta', NULL),
(102, NULL, '12706', 'UPC GONGSENG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2025', 'SEWA', 4, '2023-12-31', '2027-12-31', 289488889, NULL, 'JALAN GONGSENG RAYA NO 28 CIJANTUNG', 'Kalisari', 'Pasar Rebo', 'Jakarta Timur', 'DKI Jakarta', NULL),
(103, NULL, '12570', 'CP BUARAN', 'INDUK CLUSTER', 'RUKO SINGLE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN RAYA BUARAN NO.5', 'Duren Sawit', 'Duren Sawit', 'Jakarta Timur', 'DKI Jakarta', NULL),
(104, NULL, '12571', 'UPC PULOJAHE', 'ANGGOTA CLUSTER', 'STAND ALONE', 'RENCANA STO 2026', 'SEWA', 1, '2025-07-31', '2026-07-31', 83933333, 'Batal relokasi 2026', 'JALAN KRT RADJIMAN NO. 82', 'Jatinegara', 'Cakung', 'Jakarta Timur', 'DKI Jakarta', NULL),
(105, NULL, '12572', 'UPC MALAKA', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2022', 'SEWA', 3, '2024-09-18', '2027-09-18', 183933333, NULL, 'JALANMALAKA RAYA NO.32', 'Malaka Sari', 'Duren Sawit', 'Jakarta Timur', 'DKI Jakarta', NULL),
(106, NULL, '12573', 'UPC DUREN SAWIT', 'NON CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2025', 'SEWA', 3, '2024-10-28', '2027-10-28', 300600000, NULL, 'JL. LAUT BANDA BLOK BB 1/5', 'Duren Sawit', 'Duren Sawit', 'Jakarta Timur', 'DKI Jakarta', NULL),
(107, NULL, '12576', 'UPC DERMAGA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2025', 'SEWA', 3, '2025-01-10', '2028-01-10', 283933333, NULL, 'JL. RAYA DUREN SAWIT BLOK B5 KAV.NO.2C', 'Duren Sawit', 'Duren Sawit', 'Jakarta Timur', 'DKI Jakarta', NULL),
(108, NULL, '12577', 'UPC BUNGA RAMPAI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 1, '2026-04-06', '2027-04-06', 67266667, NULL, 'JL. BUNGA RAMPAI NO.24', 'Malaka Jaya', 'Duren Sawit', 'Jakarta Timur', 'DKI Jakarta', NULL),
(109, NULL, '12578', 'CP KEBON NANAS', 'INDUK CLUSTER', 'STAND ALONE', 'STO PUSAT 2023', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN DI PANJAITAN KAV 31 CIPINANG CEMPEDAK', 'Cipinang Cempedak', 'Jatinegara', 'Jakarta Timur', 'DKI Jakarta', NULL),
(110, NULL, '12318', 'UPC HALIM', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2025', 'SEWA', 2, '2025-12-01', '2027-11-30', 71711111, NULL, 'JALAN KOMODOR HALIM PERDANA KUSUMAH NO.01', 'Halim Perdana Kusumah', 'Makasar', 'Jakarta Timur', 'DKI Jakarta', NULL),
(111, NULL, '12581', 'UPC MALL BASURA', 'ANGGOTA CLUSTER', 'MALL / KIOS', 'STO KANWIL\r\nRELOKASI 2026', 'SEWA', 3, '2026-04-11', '2029-04-10', 591347618, NULL, 'MALL BASURA CITY LT.LG UNIT RE/06', 'Cipinang Besar Selatan', 'Jatinegara', 'Jakarta Timur', 'DKI Jakarta', NULL),
(112, NULL, '12582', 'UPC CIPINANG MUARA 2', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 3, '2026-01-16', '2029-01-15', 278377778, NULL, 'JL. ANEKA ELOK RT 012 RW 003', 'Cipinang Muara', 'Jatinegara', 'Jakarta Timur', 'DKI Jakarta', NULL),
(113, NULL, '12584', 'UPC OTISTA III', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 3, '2024-08-02', '2027-08-01', 143333333, '2026 rencana relokasi', 'JALAN OTISTA III C/16 RT 02/04', 'Cipinang Cempedak', 'Jatinegara', 'Jakarta Timur', 'DKI Jakarta', NULL),
(114, NULL, '12585', 'UPC GRIYA WARTAWAN', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2025\r\nRENCANA RELOKASI 2026', 'SEWA', 1, '2025-10-23', '2026-10-23', 35555556, NULL, 'JALAN GRIYA WARTAWAN NO.9 RT 12/01', 'Cipinang Cempedak', 'Jatinegara', 'Jakarta Timur', 'DKI Jakarta', NULL),
(115, NULL, '12600', 'CP KRANGGAN', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2020', 'MILIK SENDIRI', 0, NULL, NULL, NULL, 'Ruko sebelah', 'RUKO KRANGGAN PERMAI BLOK RT 15 NO. 16-17 JATISAMPURNA', 'Jatisampurna', 'Jati Sampurna', 'Bekasi', 'Jawa Barat', NULL),
(116, NULL, '12464', 'UPC CIKEAS', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2026', 'SEWA', 5, '2023-03-03', '2028-03-03', 167266667, 'Atap rusak, sering bocor', 'KAMPUNG CIKEAS NAGRAK NO. 22 GUNUNG PUTRI', 'Nagrag', 'Gunung Putri', 'Bogor', 'Jawa Barat', NULL),
(117, NULL, '12553', 'UPC CITRA GRAND', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2024', 'SEWA', 3, '2024-06-01', '2027-06-01', 257266667, NULL, 'RUKO CITRA GRAND BLOK R3 NO. 8 PERUM CITRA GRAND JATI SAMPURNA', 'Jatikarya', 'Jati Sampurna', 'Bekasi', 'Jawa Barat', NULL),
(118, NULL, '12554', 'UPC SETU CIPAYUNG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL\r\nRELOKASI 2026', 'SEWA', 3, '2026-02-01', '2029-02-01', 203993333, NULL, 'JALAN RAYA SETU CIPAYUNG NO. 29 RT 06 RW 04 CIPAYUNG', 'Cipayung', 'Cipayung', 'Jakarta Timur', 'DKI Jakarta', NULL),
(119, NULL, '12604', 'UPC PASAR KRANGGAN', 'ANGGOTA CLUSTER', 'PASAR', 'STO KANWIL 2024', 'SEWA', 5, '2023-09-21', '2028-09-20', 389488889, NULL, 'RUKO PASAR KRANGGAN LT 1 BLOK E4 NO.8', 'Jatisampurna', 'Jati Sampurna', 'Bekasi', 'Jawa Barat', NULL),
(120, NULL, '12605', 'UPC UJUNG ASPAL', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL\r\nUPDATE STO KANWIL 2026', 'SEWA', 3, '2025-03-01', '2028-03-01', 283993333, NULL, 'JALAN RAYA HANKAM', 'Jatiranggon', 'Jati Sampurna', 'Bekasi', 'Jawa Barat', NULL),
(121, NULL, '12606', 'UPC PLAZA CIBUBUR', 'ANGGOTA CLUSTER', 'MALL / KIOS', 'STO KANWIL 2026', 'SEWA', 5, '2022-11-09', '2027-11-09', 392171031, NULL, 'ALTERNATIF CIBUBUR KM 2-3 PLASA CIBUBUR LT.2', 'Jatisampurna', 'Jati Sampurna', 'Bekasi', 'Jawa Barat', NULL),
(122, NULL, '12608', 'UPC LEUWINANGGUNG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2025', 'SEWA', 3, '2025-10-01', '2028-10-01', 180660000, NULL, 'JALAN RAYA LEUWINANGGUNG', 'Leuwinanggung', 'Cimanggis', 'Depok', 'Jawa Barat', NULL),
(123, NULL, '12603', 'CP KOTA WISATA', 'INDUK CLUSTER', 'STAND ALONE', 'STO PUSAT 2022', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'RUKO TRAFALGAR CONCORDIA SRB 16-17', 'Ciangsana', 'Gunung Putri', 'Bogor', 'Jawa Barat', NULL),
(124, NULL, '12552', 'UPC LEGENDA WISATA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2025', 'SEWA', 5, '2023-12-06', '2028-12-05', 261711111, NULL, 'RUKO LITTLE CHINA JD 5 PERUM LEGENDA WISATAGUNUNG PUTRI', 'Wanaherang', 'Gunung Putri', 'Bogor', 'Jawa Barat', NULL),
(125, NULL, '12601', 'UPC CILEUNGSI', 'NON CLUSTER', 'RUKO DOUBLE', 'STO PUSAT', 'SEWA', 5, '2023-08-23', '2028-08-22', 209666667, NULL, 'RUKO MALL CILEUNGSI BLOK F.16', 'Cileungsi', 'Ciawi', 'Bogor', 'Jawa Barat', NULL),
(126, NULL, '12602', 'UPC CITRA INDAH', 'NON CLUSTER', 'RUKO DOUBLE', 'STO PUSAT', 'SEWA', 5, '2023-09-05', '2028-09-05', 245044444, NULL, 'RUKO CITRA INDAH SQUARE BLOK CS1 NO 10', 'Sukamaju', 'Jonggol', 'Bogor', 'Jawa Barat', NULL),
(127, NULL, '12607', 'UPC METLAND CILEUNGSI / PONDOK DAMAI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2024', 'SEWA', 5, '2023-02-08', '2028-02-07', 250600000, NULL, 'METLAND TRANSYOGI RUKO PTM 3 NO 16', 'Cileungsi', 'Cileungsi', 'Bogor', 'Jawa Barat', NULL),
(128, NULL, '12634', 'UPC CILEUNGSI HIJAU', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 3, '2025-04-14', '2028-04-13', 40660000, NULL, 'JALAN RAYA NAROGONG KM 21 NO.A10 CILENGSI HIJAU', 'Setu Sari', 'Cileungsi', 'Bogor', 'Jawa Barat', NULL),
(129, NULL, '12637', 'UPC CANADIAN KOTA WISATA', 'NON CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 5, '2025-06-12', '2030-06-13', 333993333, NULL, 'RUKO CANADIAN CBC-24 - KOTA WISATA', 'Setu Sari', 'Cileungsi', 'Bogor', 'Jawa Barat', NULL),
(130, NULL, '12682', 'UPC BOJONG KULUR', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2025', 'SEWA', 3, '2025-07-25', '2028-07-24', 117326667, NULL, 'JALAN LETDA NATSIR RT 01/09 BOJONG KULUR', 'Bojong Kulur', 'Gunung Putri', 'Bogor', 'Jawa Barat', NULL),
(131, NULL, '12644', 'CP PONDOK KELAPA', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN SALURAN INSPEKSI KALIMALANG NO.42', 'Duren Sawit', 'Duren Sawit', 'Jakarta Timur', 'DKI Jakarta', NULL),
(132, NULL, '12575', 'UPC RADIN INTEN', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 3, '2024-05-11', '2027-05-10', 100600000, NULL, 'JALAN RAYA PONDOK KELAPA NO. 8', 'Pondok Kelapa', 'Duren Sawit', 'Jakarta Timur', 'DKI Jakarta', NULL),
(133, NULL, '12645', 'UPC CURUG PONDOK KELAPA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2024', 'SEWA', 3, '2024-04-22', '2027-04-21', 133933333, NULL, 'JALAN CURUG RAYA NO.2', 'Pondok Kelapa', 'Duren Sawit', 'Jakarta Timur', 'DKI Jakarta', NULL),
(134, NULL, '12646', 'UPC PONDOK KOPI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 3, '2024-11-08', '2027-11-08', 216666667, NULL, 'KOMP MALAKA COUNTRY BLOK D NO.49', 'Pondok Kopi', 'Duren Sawit', 'Jakarta Timur', 'DKI Jakarta', NULL),
(135, NULL, '12647', 'UPC HAJI NAMAN', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2025', 'SEWA', 5, '2025-03-14', '2030-03-14', 395044444, NULL, 'JALAN H. NAMAN NO.13', 'Pondok Kelapa', 'Duren Sawit', 'Jakarta Timur', 'DKI Jakarta', NULL),
(136, NULL, '12651', 'UPC PONDOK KELAPA UTARA', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2024', 'SEWA', 3, '2026-05-17', '2029-05-16', 229350000, NULL, 'JALAN PONDOK KELAPA UTARA 7 NO.19', 'Pondok Kelapa', 'Duren Sawit', 'Jakarta Timur', 'DKI Jakarta', NULL),
(137, NULL, '60120', 'CPS DEWI SARTIKA', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2020', 'SEWA', 2, '2024-10-06', '2026-10-05', 700600000, NULL, 'JL OTISTA RAYA NO 40 B', 'Bidaracina', 'Jatinegara', 'Jakarta Timur', 'DKI Jakarta', NULL),
(138, NULL, '60122', 'UPS CILILITAN BESAR', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2025-01-31', '2028-02-01', 120600000, NULL, 'JALAN CILILITAN BESAR NO.104', 'Cililitan', 'Kramat Jati', 'Jakarta Timur', 'DKI Jakarta', NULL),
(139, NULL, '60123', 'UPS PASAR INDUK', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT', 'SEWA', 3, '2024-03-20', '2027-03-21', 193933333, NULL, 'JALAN RAYA BOGOR KM. 21 NO. 04', 'Rambutan', 'Ciracas', 'Jakarta Timur', 'DKI Jakarta', NULL),
(140, NULL, '60124', 'UPS BATU AMPAR', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2024-02-17', '2027-02-16', 217266667, NULL, 'JALAN BATU AMPAR I NO. 03', 'Batuampar', 'Kramat Jati', 'Jakarta Timur', 'DKI Jakarta', NULL),
(141, NULL, '60125', 'UPS CIPAYUNG', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2024', 'SEWA', 3, '2023-11-11', '2026-11-11', 383933333, NULL, 'JALAN RAYA CIPAYUNG BLOK T NO.08', 'Cipayung', 'Cipayung', 'Jakarta Timur', 'DKI Jakarta', NULL),
(142, NULL, '60126', 'UPS EMPAT DELAPAN', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2024', 'SEWA', 2, '2024-10-01', '2026-10-01', 83933333, NULL, 'JALAN PINANG RANTI II NO. 03', 'Pinang Ranti', 'Makasar', 'Jakarta Timur', 'DKI Jakarta', NULL),
(143, NULL, '60127', 'UPS TANAH MERDEKA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2024', 'SEWA', 3, '2024-09-01', '2027-09-01', 200600000, NULL, 'JALAN TANAH MERDEKA', 'Susukan', 'Ciracas', 'Jakarta Timur', 'DKI Jakarta', NULL),
(144, NULL, '60128', 'UPS EMBRIO', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 3, '2024-09-01', '2027-08-31', 193933333, NULL, 'JL. KERJA BAKTI NO. 15', 'Makasar', 'Makasar', 'Jakarta Timur', 'DKI Jakarta', NULL),
(145, NULL, '60823', 'UPS CIPINANG ELOK', 'INDUK CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 5, '2024-05-08', '2029-05-08', 259111110, NULL, 'WISMA ELOK BLOK JJALAN CIPINANG MUARA NO.136', 'Cipinang Muara', 'Jatinegara', 'Jakarta Timur', 'DKI Jakarta', NULL),
(146, NULL, '12425', 'CP PONDOK MELATI', 'INDUK CLUSTER', 'STAND ALONE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN RAYA HANKAM NO. 32 A-B', 'Jati Rahayu', 'Pondok Melati', 'Bekasi', 'Jawa Barat', NULL),
(147, NULL, '12428', 'UPC PASAR KECAPI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 5, '2022-10-17', '2027-10-17', 239488889, NULL, 'JL. RAYA PASAR KECAPI NO.2', 'Jati Rahayu', 'Pondok Melati', 'Bekasi', 'Jawa Barat', NULL),
(148, NULL, '12429', 'UPC RAYA BOJONG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2026', 'SEWA', 3, '2026-04-12', '2029-04-12', 120600000, NULL, 'JALAN  JATIMAKMUR NO 44 RT 009 RW 009', 'Jatimakmur', 'Pondok Gede', 'Bekasi', 'Jawa Barat', NULL),
(149, NULL, '12434', 'UPC JATIWARNA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 1, '2026-06-15', '2027-06-15', 139488889, NULL, 'JL. RAYA HANKAM NO.96', 'Jatimelati', 'Pondok Melati', 'Bekasi', 'Jawa Barat', NULL),
(150, NULL, '12529', 'UPC JATIMAKMUR 2', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT', 'SEWA', 4, '2025-04-16', '2029-04-15', 389488889, NULL, 'JALAN RAYA JATIMAKMUR NO.2B JATIMAKMUR', 'Jatimakmur', 'Pondok Gede', 'Bekasi', 'Jawa Barat', NULL),
(151, NULL, '12431', 'CP PLAZA PONDOK GEDE', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2024', 'SEWA', 5, '2021-08-09', '2026-08-09', 1722822222, NULL, 'JALAN RAYA PONDOK GEDE RT 13 RW 1', 'Halim Perdanakusuma', 'Cipayung', 'Jakarta Timur', 'DKI Jakarta', NULL),
(152, NULL, '12365', 'UPC TAMINI SQUARE', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2025', 'SEWA', 2, '2024-08-01', '2026-08-01', 144444444, NULL, 'JL. RAYA GARUDA NO.07SEBRANG MALL TS', 'Pinang Ranti', 'Makasar', 'Jakarta Timur', 'DKI Jakarta', NULL),
(153, NULL, '12427', 'UPC PINANG RANTI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 4, '2022-08-01', '2026-07-31', 232000000, NULL, 'JALAN RAYA PINANG RANTI NO.14 PINANG RANTI', 'Pinang Ranti', 'Makasar', 'Jakarta Timur', NULL, NULL),
(154, NULL, '12530', 'UPC LUBANG BUAYA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2025', 'SEWA', 3, '2025-04-02', '2028-04-02', 267266667, NULL, 'JALAN MONUMEN PANCASILA NO.64 LUBANG BUAYA', 'Lubang Buaya', 'Cipayung', 'Jakarta Timur', 'DKI Jakarta', NULL),
(155, NULL, '12507', 'CP PONDOK UNGU', 'INDUK CLUSTER', 'RUKO SINGLE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN SULTAN AGUNG KM 27 NO.56', 'Medan Satria', 'Medan Satria', 'Bekasi', 'Jawa Barat', NULL),
(156, NULL, NULL, 'PERLUASAN RUKO CP PONDOK UNGU', NULL, 'RUKO DOUBLE', NULL, 'SEWA', 3, '2025-06-28', '2028-06-27', 300600000, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(157, NULL, '12344', 'UPC MARRAKASH', 'NON CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 5, '2022-12-22', '2027-12-21', 222822222, NULL, 'JALAN RAYA PONDOK UNGU PERMAI BLOK AL.14 NO.08', 'Kebalen', 'Babelan', 'Bekasi', 'Jawa Barat', NULL),
(158, NULL, '12483', 'UPC SEROJA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021\r\nRENCANA RELOKASI 2026', 'SEWA', 1, '2025-09-15', '2026-09-15', 29488889, '2026 rencana relokasi', 'JALAN KAVLING BARATA', 'Harapan Jaya', 'Bekasi Utara', 'Bekasi', 'Jawa Barat', NULL),
(159, NULL, '12509', 'UPC HARAPAN BARU', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2024-02-15', '2027-02-15', 105600000, NULL, 'JALAN JERUK RAYA NO.1', 'Kota Baru', 'Bekasi Barat', 'Bekasi', 'Jawa Barat', NULL),
(160, NULL, '12511', 'UPC KALIABANG PAKU', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2025-06-03', '2028-06-02', 233933333, NULL, 'JALAN RAYA KALIABANG TENGAH NO.24', 'Kali Abang Tengah', 'Bekasi Utara', 'Bekasi', 'Jawa Barat', NULL),
(161, NULL, '12512', 'UPC HARAPAN JAYA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT', 'SEWA', 5, '2025-01-02', '2030-01-02', 320044444, NULL, 'JALAN CEMARA PERMAI BLOK A NO.55', 'Harapan Jaya', 'Bekasi Utara', 'Bekasi', 'Jawa Barat', NULL),
(162, NULL, '13104', 'UPC UNGU PERMAI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2022', 'SEWA', 5, '2024-02-10', '2029-02-10', 111711111, NULL, 'JL TARUMAJAYA KP PAMAHANHARAPAN MULYA REGENCY', 'Setia Mulya', 'Tarumajaya', 'Bekasi', 'Jawa Barat', NULL),
(163, NULL, '12508', 'CP HARAPAN INDAH', 'INDUK CLUSTER', 'RUKO SINGLE', 'STO PUSAT', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'RUKO HARAPAN INDAH BLOK BF NO.28', 'Pejuang', 'Medan Satria', 'Bekasi', 'Jawa Barat', NULL),
(164, NULL, '12348', 'UPC PEJUANG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2024', 'SEWA', 3, '2025-12-01', '2028-11-30', 250600000, NULL, 'RUKO SENTRA ANEKA NIAGA BLOK A.7', 'Pejuang', 'Medan Satria', 'Bekasi', 'Jawa Barat', NULL),
(165, NULL, '12357', 'UPC UJUNG MENTENG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RENCANA STO 2026', 'SEWA', 3, '2023-11-01', '2026-10-31', 183933333, NULL, 'JALAN MENTENG METROPOLITAN NO.27A', 'Ujung Menteng', 'Cakung', 'Jakarta Timur', 'DKI Jakarta', NULL),
(166, NULL, '12514', 'UPC PURI HARAPAN', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 3, '2025-09-18', '2028-09-17', 72822222, NULL, 'KAMPUNG KEPU', 'Kali Abang Tengah', 'Bekasi Utara', 'Bekasi', 'Jawa Barat', NULL),
(167, NULL, '12515', 'UPC RAWA SILEM', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 2, '2025-11-11', '2027-11-11', 72822222, NULL, 'JALAN RAWA UJUNG HARAPAN NO. 48', 'Kali Abang Tengah', 'Bekasi Utara', 'Bekasi', 'Jawa Barat', NULL),
(168, NULL, '12516', 'UPC BOULEVARD HIJAU', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 3, '2025-11-01', '2028-10-31', 350600000, NULL, 'KOMPLEK CENTRA NIAGA B1/56', 'Pejuang', 'Medan Satria', 'Bekasi', 'Jawa Barat', NULL),
(169, NULL, '13105', 'UPC TAMAN HARAPAN', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2024', 'SEWA', 3, '2024-04-22', '2027-04-22', 183933333, NULL, 'JALAN TAMAN HARAPAN BARU BLOK PP.2 NO.10', 'Harapan Baru', 'Bekasi Utara', 'Bekasi', 'Jawa Barat', NULL),
(170, NULL, '12527', 'CP JATIWARINGIN', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN RAYA JATIWARINGIN RUKO ASEM BARU NO. 5-6', 'Jatiwaringin', 'Pondok Gede', 'Bekasi', 'Jawa Barat', NULL),
(171, NULL, '12430', 'UPC CENDRAWASIH', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RENCANA STO 2026', 'SEWA', 2, '2026-01-31', '2028-02-01', 208933333, NULL, 'JL. KEMANG RAYA RUKO BLOK I NO.1', 'Jaticempaka', 'Pondok Gede', 'Bekasi', 'Jawa Barat', NULL),
(172, NULL, '12528', 'UPC JATIMAKMUR', 'ANGGOTA CLUSTER', 'STAND ALONE', 'STO KANWIL 2021', 'SEWA', 3, '2023-08-01', '2026-07-31', 650600000, 'Gabung dengan Gudang Terpadu Jatiwaringin', 'JALAN RAYA JATIMAKMUR NO.56 PONDOK GEDE', 'Jatimakmur', 'Pondok Gede', 'Bekasi', 'Jawa Barat', NULL),
(173, NULL, '12531', 'UPC GAMPRIT', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2024-08-26', '2027-08-26', 133933333, NULL, 'JL GAMPRIT RAYA NO.46', 'Jatiwaringin', 'Pondok Gede', 'Bekasi', 'Jawa Barat', NULL),
(174, NULL, '12532', 'UPC JATIWARINGIN', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 3, '2025-07-26', '2028-07-26', 200600000, NULL, 'JL RAYA JATIWARINGIN NO.57', 'Jatiwaringin', 'Pondok Gede', 'Bekasi', 'Jawa Barat', NULL),
(175, NULL, '12557', 'UPC JATI CEMPAKA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RENCANA STO 2026', 'SEWA', 5, '2023-06-01', '2028-05-31', 239488889, NULL, 'JALAN KEMANG RAYA PASAR BERSIH', 'Jaticempaka', 'Pondok Gede', 'Bekasi', 'Jawa Barat', NULL),
(176, NULL, '12555', 'CP PONDOK BAMBU', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2023', 'SEWA', 3, '2023-09-29', '2026-09-28', 483933333, NULL, 'JALAN PAHLAWAN REVOLUSI NO.35 PONDOK BAMBU', 'Pondok Bambu', 'Duren Sawit', 'Jakarta Timur', 'DKI Jakarta', NULL),
(177, NULL, '12556', 'UPC PASAR INPRES PONDOK BAMBU', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 3, '2024-03-19', '2027-03-19', 333933333, NULL, 'JALAN BETUNG RAYA PASAR INPRES PONDOK BAMBU', 'Pondok Bambu', 'Duren Sawit', 'Jakarta Timur', 'DKI Jakarta', NULL),
(178, NULL, '12558', 'UPC MALL PD BAMBU SPOT', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2025', 'SEWA', 4, '2025-07-01', '2029-07-01', 293044444, NULL, 'JL. PAHLAWAN REVOLUSI NO.7', 'Pondok Bambu', 'Duren Sawit', 'Jakarta Timur', 'DKI Jakarta', NULL),
(179, NULL, '12561', 'UPC PANGKALAN JATI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 5, '2021-09-01', '2026-09-01', 667266667, NULL, 'JALAN JATIWARINGIN RAYA JAKARTA TIMUR', 'Jaticempaka', 'Pondok Gede', 'Bekasi', 'Jawa Barat', NULL),
(180, NULL, '12594', 'CP PEKAYON', 'INDUK CLUSTER', 'RUKO SINGLE', 'STO PUSAT 2023', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN RAYA PASAR JATIASIH NO.99G JATIRASA JATIASIH BEKASI', 'Jatirasa', 'Jatiasih', 'Bekasi', 'Jawa Barat', NULL),
(181, NULL, '12595', 'UPC VILA NUSA INDAH', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2025\r\nRENCANA RELOKASI 2027', 'SEWA', 1, '2026-01-30', '2027-01-30', 61711111, '2027 rencana relokasi', 'JALAN VILLA NUSA INDAH II BLOK T5 NO.2 BOJONG KULUR GUNUNG PUTRI BOGOR', 'Bojong Kulur', 'Gunung Putri', 'Bogor', 'Jawa Barat', NULL),
(182, NULL, '12597', 'UPC JATILUHUR', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021 (PART 1) /\r\nSTO KANWIL 2025 (PART 2)', 'SEWA', 5, '2026-03-23', '2031-03-22', 458933333, NULL, 'JALAN WIBAWA MUKTI II NO.59 JATILUHUR JATIASIH BEKASI', 'Jatiluhur', 'Jatiasih', 'Bekasi', 'Jawa Barat', NULL),
(183, NULL, '12598', 'UPC PASAR VILA NUSA INDAH', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2025', 'SEWA', 3, '2026-05-02', '2029-05-02', 142266667, NULL, 'JALAN RAYA VILLA NUSA INDAH 2 BLOK AA1 NO.15 BOJONG KULUR GUNUNG PUTRI BOGOR', 'Bojong Kulur', 'Gunung Putri', 'Bogor', 'Jawa Barat', NULL),
(184, NULL, '12599', 'UPC KODAU', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2025', 'SEWA', 5, '2026-05-13', '2031-05-13', 222822222, NULL, 'JALAN RAYA KODAU NO.03 JATI RAHAYU PONDOK MELATI BEKASI', 'Jatimelati', 'Pondok Melati', 'Bekasi', 'Jawa Barat', NULL),
(185, NULL, '12678', 'UPC WIBAWA MUKTI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 3, '2024-01-01', '2027-01-01', 267266667, NULL, 'JALAN WIBAWA MUKTI 2 JATI ASIH', 'Jatiasih', 'Jatiasih', 'Bekasi', 'Jawa Barat', NULL),
(186, NULL, '12609', 'CP KRANJI', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2023', 'SEWA', 3, '2024-10-14', '2027-10-14', 383933333, 'Include ruko perluasan', 'JALAN BINTARA RAYA NO. 12 RUKO SENTRA KRANJI BARU', 'Kranji', 'Bekasi Barat', 'Bekasi', 'Jawa Barat', NULL),
(187, NULL, NULL, 'PERLUASAN CP KRANJI', NULL, 'RUKO DOUBLE', 'STO PUSAT 2023', NULL, NULL, NULL, NULL, NULL, 'Sudah bareng ruko 1', NULL, NULL, NULL, NULL, NULL, NULL),
(188, NULL, '12440', 'UPC PATRIOT KP DUA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2024-07-15', '2027-07-15', 167266667, NULL, 'JALAN PATRIOT RAYA NO.72', 'Jaka Sampurna', 'Bekasi Barat', 'Bekasi', 'Jawa Barat', NULL),
(189, NULL, '12611', 'UPC BINTARA RAYA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2026-03-01', '2029-02-28', 200600000, '2026 kenaikan sewa 25%', 'JALAN BINTARA RAYA III NO.13B', 'Kranji', 'Bekasi Barat', 'Bekasi', 'Jawa Barat', NULL),
(190, NULL, '12612', 'UPC JAYAKARTA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2024-07-08', '2027-07-08', 183333333, NULL, 'JALAN NANGKA RAYA NO.19A PERUM 1 KRANJI', 'Kranji', 'Bekasi Barat', 'Bekasi', 'Jawa Barat', NULL),
(191, NULL, '12614', 'UPC SUMMARECON / GRAND MALL', 'NON CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 3, '2024-03-01', '2027-02-28', 510600000, NULL, 'JALAN BOULEVARD SELATAN BLOK SA16', 'Marga Mulya', 'Bekasi Utara', 'Bekasi', 'Jawa Barat', NULL),
(192, NULL, '12631', 'CP KEMANG PRATAMA', 'INDUK CLUSTER', 'RUKO SINGLE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN KEMANG PRATAMA RAYA RUKO KEMANG PRATAMA BLOK MM NO.1B', 'Bojong Rawalumbu', 'Rawalumbu', 'Bekasi', 'Jawa Barat', NULL),
(193, NULL, '12350', 'UPC BOJONG RAWA LUMBU', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RENCANA STO 2026', 'SEWA', 3, '2025-09-13', '2028-09-12', 177266667, NULL, 'JALAN LUMBU UTARA RAYA NO.9A BLOK IV', 'Bojong Rawalumbu', 'Rawalumbu', 'Bekasi', 'Jawa Barat', NULL),
(194, NULL, '12632', 'UPC RAWALUMBU', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 3, '2023-08-11', '2026-08-10', 211711111, NULL, 'JALAN PENGASINAN RAYA NO.6C RAWA LUMBU', 'Bojong Rawalumbu', 'Rawalumbu', 'Bekasi', 'Jawa Barat', NULL),
(195, NULL, '12633', 'UPC BANTAR GEBANG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 3, '2024-01-15', '2027-01-15', 211711111, NULL, 'JALAN RAYA BANTAR GEBANG SETU KM 2', 'Pedurenan (Padurenan)', 'Mustika Jaya', 'Bekasi', 'Jawa Barat', NULL),
(196, NULL, '12636', 'UPC SEPANJANG JAYA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2026-06-02', '2029-06-01', 211711111, NULL, 'JALAN PRAMUKA NO. 14 KEL SEPANJANG JAYA', 'Sepanjang Jaya', 'Rawalumbu', 'Bekasi', 'Jawa Barat', NULL),
(197, NULL, '12676', 'CP GALAXI', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN TAMAN GALAXI BLOK G NO. 23 JAKA SETIA', 'Jaka Setia', 'Bekasi Selatan', 'Bekasi', 'Jawa Barat', NULL),
(198, NULL, '12677', 'UPC RAJAWALI PERUMNAS I', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'PROSES RELOKASI 2026', 'SEWA', 3, '2026-05-01', '2029-05-01', 183933333, NULL, 'JALAN RAJAWALI RAYA KAVLING 1 NO. 33 RT 08 RW 02', 'Kayuringin Jaya', 'Bekasi Selatan', 'Bekasi', 'Jawa Barat', NULL);
INSERT INTO `menu_sewa` (`id`, `outlet_id`, `kode_outlet`, `nama_outlet`, `type_outlet`, `type_bangunan`, `jenis_sto`, `status_gedung`, `periode_sewa`, `tgl_kontrak_mulai`, `tgl_kontrak_berakhir`, `harga_sewa`, `keterangan`, `alamat`, `kelurahan`, `kecamatan`, `kab_kota`, `provinsi`, `created_at`) VALUES
(199, NULL, '12679', 'UPC VILA PEKAYON', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2024-05-15', '2027-05-14', 167266667, NULL, 'JALAN KETAPANG RAYA BLOK DD 21/8B RT.6/15 PEKAYON JAYA', 'Pekayon Jaya', 'Bekasi Selatan', 'Bekasi', 'Jawa Barat', NULL),
(200, NULL, '12681', 'UPC GRAHA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 5, '2026-07-14', '2031-07-14', 306155556, NULL, 'JALAN RAYA JATIMEKAR RT 001/04 KEL JATIMEKAR', 'Jati Mekar', 'Jatiasih', 'Bekasi', 'Jawa Barat', NULL),
(201, NULL, '12683', 'UPC PEMDA JATIASIH', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2025', 'SEWA', 2, '2025-07-05', '2027-07-05', 145044444, NULL, 'JALAN PULO RIBUNG RT 02 RW 17 NO 12 KEL JAKA', 'Jaka Setia', 'Bekasi Selatan', 'Bekasi', 'Jawa Barat', NULL),
(202, NULL, '12684', 'UPC GALAXY NUSA INDAH', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2023', 'SEWA', 5, '2024-04-30', '2029-04-30', 345044444, NULL, 'JALAN NUSA INDAH RAYA BLOK U NO.47 GALAKSI', 'Jaka Setia', 'Bekasi Selatan', 'Bekasi', 'Jawa Barat', NULL),
(203, NULL, '60165', 'CPS PLAZA THB', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 3, '2024-04-01', '2027-03-31', 391661280, NULL, 'JOYO MARTONO BLOK A1 NO.18', 'Margahayu', 'Bekasi Timur', 'Bekasi', 'Jawa Barat', NULL),
(204, NULL, '60162', 'UPS BTC', 'NON CLUSTER', 'MALL / KIOS', 'RENCANA STO 2026', 'SEWA', 3, '2026-04-01', '2029-03-31', 238650000, NULL, 'TAMAN HARAPAN BARU NO.1 BLOK A NO.3', 'Pejuang', 'Medan Satria', 'Bekasi', 'Jawa Barat', NULL),
(205, NULL, '60166', 'UPS PERJUANGAN BARU', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 4, '2023-03-30', '2027-03-30', 336600000, NULL, 'RUKO INDOWARE HOUSE NO.D-1 JL KALIABANG RAYA', 'Harapan Jaya', 'Bekasi Utara', 'Bekasi', 'Jawa Barat', NULL),
(206, NULL, '12341', 'CP BEKASI UTAMA', 'INDUK CLUSTER', 'STAND ALONE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN IR. H. JUANDA NO. 28', 'Margajaya', 'Bekasi Selatan', 'Bekasi', 'Jawa Barat', NULL),
(207, NULL, '12342', 'UPC WISMA ASRI', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2025', 'SEWA', 3, '2024-01-03', '2027-01-03', 157933333, NULL, 'TAMAN WISMA ASRI L.1 NO.1', 'Teluk Pucung', 'Bekasi Utara', 'Bekasi', 'Jawa Barat', NULL),
(208, NULL, '12343', 'UPC VILLA ASRI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2025', 'SEWA', 3, '2023-12-03', '2026-12-03', 175600000, NULL, 'RUKO VILLA ASRI NO.16A', 'Mustika Jaya', 'Mustika Jaya', 'Bekasi', 'Jawa Barat', NULL),
(209, NULL, '12345', 'UPC MEKAR SARI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'PROSES STO 2026', 'SEWA', 5, '2024-08-28', '2029-08-28', 222822222, NULL, 'JLMEKAR SARI RAYA', 'Bekasi Jaya', 'Bekasi Timur', 'Bekasi', 'Jawa Barat', NULL),
(210, NULL, '12346', 'UPC DUKUH ZAMRUD', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT', 'SEWA', 3, '2023-11-25', '2026-11-24', 250600000, NULL, 'JALAN DUKUH ZAMRUD UTARA BLOK S NO.53', 'Pedurenan (Padurenan)', 'Mustika Jaya', 'Bekasi', 'Jawa Barat', NULL),
(211, NULL, '12347', 'UPC MEGA BEKASI', 'NON CLUSTER', 'MALL / KIOS', 'RENCANA STO 2026', 'SEWA', 3, '2025-08-27', '2028-08-28', 236013750, NULL, 'MEGA BEKASI HYPERMALL LT.1 NO.179A JALAN AHMAD YANI NO. 1', 'Kayuringin Jaya', 'Bekasi Selatan', 'Bekasi', 'Jawa Barat', NULL),
(212, NULL, '12349', 'UPC VILA INDAH PERMAI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT', 'SEWA', 5, '2025-01-02', '2030-01-02', 378377778, NULL, 'JALAN RAYA INDAH PERMAI BLOK D1 NO.94', 'Teluk Pucung', 'Bekasi Utara', 'Bekasi', 'Jawa Barat', NULL),
(213, NULL, '12351', 'UPC KEBALEN', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 5, '2021-11-01', '2026-11-01', 195044444, NULL, 'KP. PENGGGILINGAN TENGAH', 'Kebalen', 'Babelan', 'Bekasi', 'Jawa Barat', NULL),
(214, NULL, '12439', 'UPC GABUS RAYA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 3, '2025-06-14', '2028-06-15', 206155556, NULL, 'JALAN LETNAN ARSYAD RAYA NO 14 B', 'Kayuringin Jaya', 'Bekasi Selatan', 'Bekasi', 'Jawa Barat', NULL),
(215, NULL, '12513', 'UPC TELUK PUCUNG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 5, '2023-06-01', '2028-05-31', 222822222, NULL, 'KAMPUNG IRIAN', 'Teluk Pucung', 'Bekasi Utara', 'Bekasi', 'Jawa Barat', NULL),
(216, NULL, '12616', 'UPC PONCOL KARTINI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 2, '2025-01-15', '2027-01-15', 100600000, NULL, 'JL M HASIBUAN NO 33', 'Margahayu', 'Bekasi Timur', 'Bekasi', 'Jawa Barat', NULL),
(217, NULL, '12384', 'CP KARAWANG', 'INDUK CLUSTER', 'STAND ALONE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JL. ALUN-ALUN UTARA NO.1', 'Karawang Kulon', 'Karawang Barat', 'Karawang', 'Jawa Barat', NULL),
(218, NULL, '12385', 'UPC KOSAMBI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2026', 'SEWA', 5, '2022-11-01', '2027-10-31', 278377778, NULL, 'JL.RAYA KOSAMBI NO.33', 'Duren', 'Klari', 'Karawang', 'Jawa Barat', NULL),
(219, NULL, '12386', 'UPC NAGASARI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 5, '2023-06-01', '2028-05-31', 184766667, NULL, 'JL.BANTEN NO.1 D', 'Nagasari', 'Karawang Barat', 'Karawang', 'Jawa Barat', NULL),
(220, NULL, '12387', 'UPC NIAGA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2024', 'SEWA', 3, '2025-05-31', '2028-06-01', 177266667, NULL, 'JL.AR.HAKIM NO.1', 'Nagasari', 'Karawang Barat', 'Karawang', 'Jawa Barat', NULL),
(221, NULL, '12388', 'UPC GINTUNG KERTA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 3, '2025-05-31', '2028-06-01', 145044444, NULL, 'JL.RAYA KLARI NO.10 DUSUN KRAJAN', 'Gintungkerta', 'Klari', 'Karawang', 'Jawa Barat', NULL),
(222, NULL, '12389', 'UPC TELUK JAMBE', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 3, '2025-06-01', '2028-05-31', 183933333, NULL, 'JL.RAYA TELUK JAMBE NO.31 DUSUN SUKAMANAH', 'Telukjambe', 'Telukjambe Timur', 'Karawang', 'Jawa Barat', NULL),
(223, NULL, '12391', 'UPC KONDANG JAYA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RENCANA STO 2026', 'SEWA', 3, '2023-07-31', '2026-07-31', 117266667, NULL, 'JL.RAYA CITRA KEBUN MAS NO.10', 'Kondangjaya', 'Karawang Timur', 'Karawang', 'Jawa Barat', NULL),
(224, NULL, '12392', 'UPC PASAR BARU', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 5, '2022-06-18', '2027-06-18', 222822222, NULL, 'JL. KI HAJAR DEWANTARA NO.87', 'Nagasari', 'Karawang Barat', 'Karawang', 'Jawa Barat', NULL),
(225, NULL, '12393', 'UPC PASAR JOHAR', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2026', 'SEWA', 5, '2022-07-01', '2027-06-30', 390600000, NULL, 'JL. TUPAREV NO.547 JOHAR BARAT', 'Karawang Wetan', 'Karawang Timur', 'Karawang', 'Jawa Barat', NULL),
(226, NULL, '12394', 'UPC PERUMNAS TELUK JAMBE', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2026', 'SEWA', 3, '2026-05-01', '2029-04-30', 183933333, NULL, 'RUKO PERUMAHAN BUMI TELUK JAMBE - JALAN BHARATA BLOK K NO 12A', 'Sukaluyu', 'Telukjambe Timur', 'Karawang', 'Jawa Barat', NULL),
(227, NULL, '12413', 'CP RENGAS DENGKLOK', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JL. RAYA PASAR RENGASDENGKLOK BLOK KRATON NO.6', 'Rengasdengklok Selatan', 'Rengasdengklok', 'Karawang', 'Jawa Barat', NULL),
(228, NULL, '12390', 'UPC LAMARAN', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 5, '2026-07-01', '2031-06-30', 361711111, NULL, 'JALAN SYEH QURO NO.27 LAMARAN', 'Palumbonsari', 'Karawang Timur', 'Karawang', 'Jawa Barat', NULL),
(229, NULL, '12414', 'UPC TELAGASARI', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021\r\nRELOKASI 2025', 'SEWA', 5, '2025-08-31', '2030-08-31', 461711111, NULL, 'JALAN SYECH QURO DUSUN KRAJAN I TELAGASARI', 'Talagasari', 'Talagasari', 'Karawang', 'Jawa Barat', NULL),
(230, NULL, '12415', 'UPC CIBUAYA', 'MANDIRI', 'RUKO DOUBLE', 'STO PUSAT 2022', 'SEWA', 4, '2025-01-01', '2029-01-01', 222822222, NULL, 'JALAN PASAR CIBUAYA - CIBUAYA', 'Pejaten', 'Cibuaya', 'Karawang', 'Jawa Barat', NULL),
(231, NULL, '12416', 'UPC KEDUNG WARINGIN / TANJUNG PURA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 5, '2026-01-24', '2031-01-24', 306155556, NULL, 'JALAN RAYA PEBAYURAN', 'Kedungwaringin', 'Kedung Waringin', 'Bekasi', 'Jawa Barat', NULL),
(232, NULL, '12435', 'CP KALIMALANG', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'PERTOKOAN SUMBER ARTA B.III NO.1-2', 'Bintara Jaya', 'Bekasi Barat', 'Bekasi', 'Jawa Barat', NULL),
(233, NULL, '12437', 'UPC CAMAN RAYA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2023-07-08', '2026-07-08', 183933333, '61311111', 'JALAN CAMAN RAYA NO. 7A', 'Jatibening', 'Pondok Gede', 'Bekasi', 'Jawa Barat', NULL),
(234, NULL, '12442', 'UPC JAKA PERMAI', 'ANGGOTA CLUSTER', 'STAND ALONE', NULL, 'SEWA', 2, '2025-04-04', '2027-04-04', 93933333, NULL, 'JALAN CENDANA 19 A NO 1', 'Jaka Sampurna', 'Bekasi Barat', 'Bekasi', 'Jawa Barat', NULL),
(235, NULL, '12443', 'UPC KINCAN RAYA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2026-05-24', '2029-05-23', 258933333, NULL, 'JALAN KINCAN RAYA NO.17B', 'Jatibening', 'Pondok Gede', 'Bekasi', 'Jawa Barat', NULL),
(236, NULL, '12444', 'UPC JATIBENING', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2026', 'SEWA', 3, '2024-10-16', '2027-10-16', 246666667, NULL, 'JALAN RAYA JATIBENING 2 NO.89D', 'Jatibening Baru', 'Pondok Gede', 'Bekasi', 'Jawa Barat', NULL),
(237, NULL, '12613', 'UPC BINTARA JAYA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 3, '2025-04-09', '2028-04-08', 158266667, NULL, 'JALAN BINTARA JAYA NO.8', 'Kranji', 'Bekasi Barat', 'Bekasi', 'Jawa Barat', NULL),
(238, NULL, '12680', 'UPC RATNA', 'ANGGOTA CLUSTER', 'STAND ALONE', 'STO PUSAT 2024', 'SEWA', 3, '2025-05-16', '2028-05-15', 267266667, NULL, 'RUKO GRAND MANSION JL DR RATNA NO 5', 'Jatibening', 'Pondok Gede', 'Bekasi', 'Jawa Barat', NULL),
(239, NULL, '12445', 'CP TAMBUN', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN SULTAN HASANUDDIN NO.181', 'Mekarsari', 'Tambun Selatan', 'Bekasi', 'Jawa Barat', NULL),
(240, NULL, '12446', 'UPC PASAR MANGUN JAYA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2025-03-15', '2028-03-15', 200600000, NULL, 'JALAN PASAR MINI MANGUNJAYA', 'Mangunjaya', 'Tambun Selatan', 'Bekasi', 'Jawa Barat', NULL),
(241, NULL, '12449', 'UPC PASAR INDUK CIBITUNG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 2, '2026-04-01', '2028-04-01', 100600000, NULL, 'JALAN TEUKU UMAR NO.13', 'Cibuntu', 'Cibitung', 'Bekasi', 'Jawa Barat', NULL),
(242, NULL, '12450', 'UPC GRAMAPURI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2024', 'SEWA', 3, '2024-12-01', '2027-12-01', 200600000, NULL, 'JALAN H.BOSIH NO.101', 'Wanasari', 'Cibitung', 'Bekasi', 'Jawa Barat', NULL),
(243, NULL, '12453', 'UPC PASAR KOMPAS', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 5, '2021-11-21', '2026-11-21', 131155556, NULL, 'JALAN KOMPAS SKU BLOK A10 NO.11', 'Mekarsari', 'Tambun Selatan', 'Bekasi', 'Jawa Barat', NULL),
(244, NULL, '12454', 'UPC PASAR PAMOR', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2025', 'SEWA', 5, '2022-04-01', '2027-04-01', 161711111, NULL, 'JALAN RAYA BEKASI REGENCY I BLOK L NO.25', 'Wanasari', 'Cibitung', 'Bekasi', 'Jawa Barat', NULL),
(245, NULL, '12455', 'UPC JEJALEN', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 2, '2026-04-01', '2028-04-01', 78377778, NULL, 'RUKO PERUM TAMBUN BLOK K12 NO.20', 'Jalenjaya (Jejalenjaya)', 'Tambun Utara', 'Bekasi', 'Jawa Barat', NULL),
(246, NULL, '12456', 'UPC PASAR SETU', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2021', 'SEWA', 3, '2024-04-12', '2027-04-12', 200600000, NULL, 'JALAN RAYA SETU', 'Telajung', 'Cikarang Barat', 'Bekasi', 'Jawa Barat', NULL),
(247, NULL, '12662', 'UPC PAPAN MAS', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 2, '2026-04-22', '2028-04-22', 133933333, NULL, 'JALAN MEKAR SARI TENGAH NO.20', 'Mekarsari', 'Tambun Selatan', 'Bekasi', 'Jawa Barat', NULL),
(248, NULL, '12664', 'UPC TRIDAYA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 3, '2024-08-10', '2027-08-10', 133333333, NULL, 'JALAN RAYA SUMBER JAYA', 'Sumber Jaya', 'Tambun Selatan', 'Bekasi', 'Jawa Barat', NULL),
(249, NULL, '12465', 'CP CIKARANG', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'RUKO GRAND AMARTHA JALAN RE.MARTADINATA NO.3ACIKARANG UTARA', 'Karang Baru', 'Cikarang Utara', 'Bekasi', 'Jawa Barat', NULL),
(250, NULL, NULL, 'PERLUASAN RUKO CP CIKARANG', NULL, 'RUKO DOUBLE', NULL, 'SEWA', 3, '2025-05-01', '2028-05-01', 438099999, 'Sewa ke Dapen (CP Cikarang)', NULL, NULL, NULL, NULL, NULL, NULL),
(251, NULL, '12466', 'UPC JABABEKA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2022', 'SEWA', 3, '2024-10-01', '2027-10-01', 117266667, NULL, 'JALAN INDUSTRI JBBK NO. 88 RUKO JABABEKA CIKARANG UTARA', 'Pasir Gombong', 'Cikarang Utara', 'Bekasi', 'Jawa Barat', NULL),
(252, NULL, '12467', 'UPC KALIJAYA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 5, '2021-08-16', '2026-08-16', 306155556, NULL, 'JALAN IMAM BONJOL NO. 19 BC DESA SUKADANAU CIKARANG BARAT', 'Sukadanau', 'Cikarang Barat', 'Bekasi', 'Jawa Barat', NULL),
(253, NULL, '12468', 'UPC SERANG CIKARANG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 4, '2026-01-05', '2030-01-04', 528377778, NULL, 'JALAN RAYA SERANG', 'Sukadami', 'Cikarang Selatan', 'Bekasi', 'Jawa Barat', NULL),
(254, NULL, '12469', 'UPC SGC', 'NON CLUSTER', 'MALL / KIOS', 'STO PARSIAL', 'SEWA', 3, '2023-08-25', '2026-10-10', 402741655, NULL, 'JALAN RE. MARTADINATA BLOK GF NO. B.15-ZONA KUNING SENTRA GROSIR CIKARANG', 'Cibatu', 'Cikarang Selatan', 'Bekasi', 'Jawa Barat', NULL),
(255, NULL, '12470', 'UPC SUKAMANTRI', 'ANGGOTA CLUSTER', 'STAND ALONE', 'STO KANWIL 2025', 'SEWA', 5, '2023-12-31', '2028-12-31', 250600000, NULL, 'JALAN KH. DEWANTARA NO. 147 SUKAMANTRI KARANGBAHAGIA', 'Sukaraya', 'Karangbahagia', 'Bekasi', 'Jawa Barat', NULL),
(256, NULL, '12471', 'UPC GRAHA CIKARANG', 'MANDIRI', 'STAND ALONE', NULL, 'SEWA', 5, '2023-06-30', '2028-06-30', 250600000, NULL, 'JALAN RAYA LEMAH ABANG KP. CIBEBER RT 03 RW 04 DESA SIMPANGAN CIKARANG UTARA', 'Waluya', 'Cikarang Utara', 'Bekasi', 'Jawa Barat', NULL),
(257, NULL, '12472', 'UPC SUKARESMI', 'INDUK CLUSTER', 'STAND ALONE', 'STO PUSAT 2021', 'SEWA', 3, '2023-12-01', '2026-12-01', 550600000, NULL, 'JL RAYA CIKARANG CIBARUSAH KP LEUWEUNG MALANG', 'Sukaresmi', 'Cikarang Selatan', 'Bekasi', 'Jawa Barat', NULL),
(258, NULL, '12473', 'CP BEKASI TIMUR', 'INDUK CLUSTER', 'RUKO SINGLE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN IR. JUANDA NO 81 RUKO PLAZA BEKASI', 'Duren Jaya', 'Bekasi Timur', 'Bekasi', 'Jawa Barat', NULL),
(259, NULL, '12447', 'UPC TAMAN RAFLESIA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'PROSES STO 2026', 'SEWA', 3, '2026-05-04', '2029-05-03', 202266667, NULL, 'JALAN JATIMULYA BLOK G NO.23', 'Srijaya', 'Tambun Utara', 'Bekasi', 'Jawa Barat', NULL),
(260, NULL, '12474', 'UPC RAWA PANJANG', 'ANGGOTA CLUSTER', 'STAND ALONE', NULL, 'SEWA', 3, '2023-08-08', '2026-08-08', 833933333, 'Gabung dengan Gudang Terpadu Rawa Panjang', 'JALAN CUT MUTIA', 'Sepanjang Jaya', 'Rawalumbu', 'Bekasi', 'Jawa Barat', NULL),
(261, NULL, '12475', 'UPC JATI MULYA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 5, '2022-06-01', '2027-05-31', 172822222, NULL, 'JALAN JATI MULYA RAYA BLOK G NO 1 A', 'Jatimulya', 'Tambun Selatan', 'Bekasi', 'Jawa Barat', NULL),
(262, NULL, '12477', 'UPC KALIABANG NANGKA', 'INDUK CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 5, '2022-12-31', '2027-12-31', 250600000, NULL, 'JALAN HM TABRANI NO 8', 'Perwira', 'Bekasi Utara', 'Bekasi', 'Jawa Barat', NULL),
(263, NULL, '12478', 'UPC KARANG SATRIA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2024-01-04', '2027-01-04', 145044444, NULL, 'KP KOMPA DESA KARANG SATRIA', 'Karangsatria', 'Tambun Utara', 'Bekasi', 'Jawa Barat', NULL),
(264, NULL, '12479', 'UPC PONDOK HIJAU', 'ANGGOTA CLUSTER', 'STAND ALONE', NULL, 'SEWA', 3, '2025-12-01', '2028-11-30', 250600000, NULL, 'JALAN RAYA PONDOK HIJAU PERMAI BLOK I-6 NO 70', 'Pengasinan', 'Rawalumbu', 'Bekasi', 'Jawa Barat', NULL),
(265, NULL, '12480', 'UPC BUMYAGARA', 'ANGGOTA CLUSTER', 'STAND ALONE', 'STO KANWIL 2023', 'SEWA', 3, '2026-08-07', '2029-08-06', 108933333, NULL, 'JL. MUTIARA GADING G.20/18', 'Mustika Jaya', 'Mustika Jaya', 'Bekasi', 'Jawa Barat', NULL),
(266, NULL, '12481', 'UPC MUSTIKA JAYA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RENCANA STO 2026', 'SEWA', 3, '2023-11-26', '2026-11-26', 100600000, NULL, 'RUKO GRAHA HARAPAN BLOK B2', 'Mustika Jaya', 'Mustika Jaya', 'Bekasi', 'Jawa Barat', NULL),
(267, NULL, '12482', 'UPC PONDOK TIMUR', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2024-05-05', '2027-05-05', 75600000, NULL, 'JALAN PUYUH RAYA BLOK F NO 10', 'Mustika Jaya', 'Mustika Jaya', 'Bekasi', 'Jawa Barat', NULL),
(268, NULL, '12635', 'UPC MUTIARA GADING TIMUR', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2024', 'SEWA', 3, '2024-07-15', '2027-07-15', 277777778, NULL, 'KOMP MUTIARA GADING TIMUR BLOK R.11', 'Mustika Jaya', 'Mustika Jaya', 'Bekasi', 'Jawa Barat', NULL),
(269, NULL, '12659', 'CP SETIA MEKAR', 'INDUK CLUSTER', 'STAND ALONE', 'STO PUSAT 2023', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN NUSANTARA RAYA NO.40', 'Duren Jaya', 'Bekasi Timur', 'Bekasi', 'Jawa Barat', NULL),
(270, NULL, '12660', 'UPC VILA MUTIARA GADING', 'NON CLUSTER', 'RUKO DOUBLE', 'PROSES STO 2026', 'SEWA', 3, '2026-03-28', '2029-03-27', 233933333, NULL, 'JL.KARANG SATRIA RUKO MUTIARA GRANDE BLOK D.2 NO.38', 'Srijaya', 'Tambun Utara', 'Bekasi', 'Jawa Barat', NULL),
(271, NULL, '12661', 'UPC DUREN JAYA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 4, '2026-03-22', '2030-03-21', 356155556, NULL, 'PERUM BUNGA RAYA BLOK A JLN PAHLAWAN NO.5', 'Duren Jaya', 'Bekasi Timur', 'Bekasi', 'Jawa Barat', NULL),
(272, NULL, '12663', 'UPC BUMI SANI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 5, '2025-10-20', '2030-10-20', 222822222, NULL, 'JALAN SETIA MEKAR NO.18', 'Setiamekar', 'Tambun Selatan', 'Bekasi', 'Jawa Barat', NULL),
(273, NULL, '12665', 'UPC TABRANI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 5, '2022-02-28', '2027-02-28', 328377777, NULL, 'JALAN KYAI HAJI MOECHTAR TABRANI BLOK C NO.12E', 'Marga Mulya', 'Bekasi Utara', 'Bekasi', 'Jawa Barat', NULL),
(274, NULL, '12666', 'UPC AGUS SALIM', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2024-12-04', '2027-12-04', 189488889, NULL, 'JALAN AGUS SALIM NO.45', 'Bekasi Jaya', 'Bekasi Timur', 'Bekasi', 'Jawa Barat', NULL),
(275, NULL, '60160', 'CPS ISLAMIC CENTRE', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 3, '2025-05-15', '2028-05-15', 400266667, NULL, 'JL RAYA PEKAYON NO 17', 'Pekayon Jaya', 'Bekasi Selatan', 'Bekasi', 'Jawa Barat', NULL),
(276, NULL, '60161', 'UPS KARTINI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2023', 'SEWA', 2, '2025-07-20', '2027-07-19', 128933333, NULL, 'JL. RAYA PERJUANGAN C-7', 'Harapan Baru', 'Bekasi Utara', 'Bekasi', 'Jawa Barat', NULL),
(277, NULL, '60163', 'UPS BANTAR GEBANG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2026', 'SEWA', 3, '2023-07-24', '2026-07-23', 167266667, NULL, 'RAYA NAROGONG KM.10 KOMP. RUKO PERSADA BLOK B NO.1', 'Bantar Gebang', 'Bantar Gebang', 'Bekasi', 'Jawa Barat', NULL),
(278, NULL, '60164', 'UPS GRAND GALAXY / MALL PEKAYON', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2024', 'SEWA', 3, '2024-09-25', '2027-09-25', 233933333, NULL, 'RUKO GRAND GALAXY BLOK R-GA NO.75', 'Jaka Setia', 'Bekasi Selatan', 'Bekasi', 'Jawa Barat', NULL),
(279, NULL, '60167', 'UPS ALAMANDA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2024-03-25', '2027-03-25', 83933333, NULL, 'KARANG SATRIA NO.23', 'Srijaya', 'Tambun Utara', 'Bekasi', 'Jawa Barat', NULL),
(280, NULL, '60169', 'CPS METRO BOULEVARD CIKARANG', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'RUKO CAPITOL BUSINESS PARK BLOK 2K-L JL. NIAGA RAYA', 'Mekarmukti', 'Cikarang Utara', 'Bekasi', 'Jawa Barat', NULL),
(281, NULL, '60170', 'UPS GRAHA MAS', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2023', 'SEWA', 5, '2023-10-16', '2028-10-15', 289488888, NULL, 'JALAN CITANDUI RAYA M10/3A', 'Simpangan', 'Cikarang Utara', 'Bekasi', 'Jawa Barat', NULL),
(282, NULL, '60171', 'UPS SENTOSA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 2, '2026-05-31', '2028-05-31', 76155556, NULL, 'JALAN CIKARANG-CIBAROSA NO.88', 'Sukaresmi', 'Cikarang Selatan', 'Bekasi', 'Jawa Barat', NULL),
(283, NULL, '60828', 'UPS TUPAREV KARAWANG', 'INDUK CLUSTER', 'STAND ALONE', 'STO PUSAT 2023', 'SEWA', 5, '2024-05-07', '2029-05-06', 333933333, NULL, 'JALAN TUPAREV NO.373 CINANGO', 'Adiarsa Timur', 'Karawang Timur', 'Karawang', 'Jawa Barat', NULL),
(284, NULL, '60829', 'UPS SYARIAH JOHAR', 'ANGGOTA CLUSTER', 'STAND ALONE', 'RENCANA STO 2026', 'SEWA', 3, '2026-01-24', '2029-01-23', 133933333, NULL, 'JALAN SUROTOKUNTO NO.5D', 'Karawang Wetan', 'Karawang Timur', 'Karawang', 'Jawa Barat', NULL),
(285, NULL, '60830', 'UPS GALUH MAS', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2024', 'SEWA', 3, '2025-07-10', '2028-07-10', 150600000, NULL, 'PERUM GALUH MAS RUKO ARCADIA BLOK B1 NO.1', 'Telukjambe', 'Telukjambe Timur', 'Karawang', 'Jawa Barat', NULL),
(286, NULL, '12374', 'CP BOGOR', 'INDUK CLUSTER', 'STAND ALONE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN IR JUANDA NO.02 RT - RW - BOGOR TENGAH - KOTA', 'Gudang', 'Bogor Tengah - Kota', 'Bogor', 'Jawa Barat', NULL),
(287, NULL, '12376', 'UPC PAMOYANAN / CIPAKU', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2025-03-18', '2028-03-18', 175660000, NULL, 'JALAN RAYA PAMOYANAN NO.05 A RT 01 RW 01 BOGOR SELATAN - KOTA', 'Pamoyanan', 'Bogor Selatan - Kota', 'Bogor', 'Jawa Barat', NULL),
(288, NULL, '12377', 'UPC BOGOR TRADE MALL', 'ANGGOTA CLUSTER', 'MALL / KIOS', 'STO KANWIL', 'SEWA', 3, '2025-10-18', '2028-10-18', 351320000, '3 kios jadi satu', 'JALAN IR JUANDA NO.68 LT GROUND BLOK A.5 NO.1 RT 01 RW 07 BOGOR TENGAH - KOTA', 'Paledang', 'Bogor Tengah - Kota', 'Bogor', 'Jawa Barat', NULL),
(289, NULL, '12538', 'UPC TAJUR', 'MANDIRI', 'RUKO DOUBLE', 'STO KANWIL 2026', 'SEWA', 3, '2025-11-14', '2028-11-13', 400600000, NULL, 'JALAN RAYA TAJUR NO 265 RT 02 RW 03 BOGOR TIMUR - KOTA', 'Tajur', 'Bogor Timur - Kota', 'Bogor', 'Jawa Barat', NULL),
(290, NULL, '12539', 'UPC CIAWI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2025-09-04', '2028-09-04', 200660000, NULL, 'JALAN RAYA PUNCAK PASAR CIAWI RT 00 RW 00 CIAWI', 'Ciawi', 'Ciawi', 'Bogor', 'Jawa Barat', NULL),
(291, NULL, '12540', 'UPC CARINGIN', 'NON CLUSTER', 'RUKO DOUBLE', 'PROSES RELOKASI 2026', 'SEWA', 3, '2026-06-02', '2029-06-02', 267326667, NULL, 'JALAN HE SUKMA KM 17 RT 00 RW 00 CARINGIN', 'Caringin', 'Caringin', 'Bogor', 'Jawa Barat', NULL),
(292, NULL, '12542', 'UPC CISARUA', 'NON CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021\r\nRELOKASI 2025', 'SEWA', 3, '2025-04-11', '2028-04-11', 233993333, NULL, 'JALAN RAYA PUNCAK RT 00 RW 00 CISARUA', 'Cisarua', 'Cisarua', 'Bogor', 'Jawa Barat', NULL),
(293, NULL, '12543', 'UPC PASAR SUKASARI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2025-12-01', '2028-11-30', 350600000, NULL, 'JALAN SILIWANGIN ATAS NO 1129 RT 00 RW 00 BOGOR TIMUR - KOTA', 'Sukasari', 'Bogor Timur - Kota', 'Bogor', 'Jawa Barat', NULL),
(294, NULL, '12395', 'CP DEPOK', 'INDUK CLUSTER', 'STAND ALONE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN SILIWANGI NO.20 PANCORAN MAS', 'Depok', 'Pancoran Mas', 'Depok', 'Jawa Barat', NULL),
(295, NULL, '12396', 'UPC CITAYAM', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 5, '2026-03-13', '2031-03-12', 472882222, NULL, 'KP.PABUARAN BOJONGGEDE', 'Pabuaran', 'Bojonggede', 'Bogor', 'Jawa Barat', NULL),
(296, NULL, '12397', 'UPC SUKAMAJU', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 3, '2024-02-05', '2027-02-05', 300600000, NULL, 'JALAN RAYA BOGOR SUKMAJAYA', 'SUKMAJAYA', 'Sukmajaya', 'Depok', 'Jawa Barat', NULL),
(297, NULL, '12399', 'UPC PASAR PUCUNG', 'ANGGOTA CLUSTER', 'STAND ALONE', 'STO PUSAT 2021', 'SEWA', 3, '2023-08-14', '2026-08-15', 1250600000, 'Gabung dengan Gudang Terpadu Pasar Pucung', 'KP SAWAH SUKMAJAYA JALAN KALIMULYA', 'Kalimulya', 'Sukmajaya', 'Depok', 'Jawa Barat', NULL),
(298, NULL, '12400', 'UPC PASAR AGUNG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2025-09-17', '2028-09-17', 267326667, NULL, 'PASAR AGUNG BLOK G1 NO.3-7 SUKMAJAYA', 'Abadijaya', 'Sukmajaya', 'Depok', 'Jawa Barat', NULL),
(299, NULL, '12401', 'UPC ITC DEPOK', 'MANDIRI', 'RUKO DOUBLE', 'STO KANWIL 2026', 'SEWA', 3, '2024-03-19', '2027-03-19', 482100000, NULL, 'JALAN MARGONDA RAYA RUKO ITC DEPOK BLOK C NO.A03 LT.UBEJI', 'Pondok Cina', 'Beji', 'Depok', 'Jawa Barat', NULL),
(300, NULL, '12402', 'UPC GRIYA DEPOK ASRI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 5, '2026-02-16', '2031-02-16', 500660000, NULL, 'RUKO GRIYA DEPOK ASRI JALAN TOLE ISKANDAR BLOK BSUKMAJAYA', 'Mekarjaya', 'Sukmajaya', 'Depok', 'Jawa Barat', NULL),
(301, NULL, '12524', 'UPC PASAR CITAYAM', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 2, '2025-05-29', '2027-05-29', 128437778, NULL, 'KOMPLEKS RUKO CITAYAM PERMAI 30', 'Bojong Pondok Terong', 'Pancoran Mas', 'Depok', 'Jawa Barat', NULL),
(302, NULL, '12526', 'UPC RATU JAYA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2026-01-21', '2029-01-21', 267326667, NULL, 'JALAN RAYA RATU JAYA', 'Ratujaya', 'Pancoran Mas', 'Depok', 'Jawa Barat', NULL),
(303, NULL, '12619', 'UPC KOTA KEMBANG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 2, '2026-02-09', '2028-02-09', 167326667, 'Batal relokasi 2026', 'JALAN RAYA KARTINI NO. 38', 'Depok', 'Pancoran Mas', 'Depok', 'Jawa Barat', NULL),
(304, NULL, '12696', 'UPC KEMAKMURAN', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2024-02-12', '2027-02-12', 210600000, NULL, 'JALAN RAYA KEMAKMURAN NO.58 SUKMAJAYA', 'Abadijaya', 'Sukmajaya', 'Depok', 'Jawa Barat', NULL),
(305, NULL, '12458', 'CP CIBINONG', 'INDUK CLUSTER', 'STAND ALONE', 'STO PUSAT 2021', 'SEWA', 5, '2024-01-01', '2029-01-01', 2083933333, NULL, 'JALAN RAYA BOGOR JKT KM 43 NO 600CIBINONG', 'Pabuaran', 'Cibinong', 'Bogor', 'Jawa Barat', NULL),
(306, NULL, '12459', 'UPC TLAJUNG UDIK', 'MANDIRI', 'RUKO DOUBLE', 'RENCANA STO 2026', 'SEWA', 3, '2024-08-13', '2027-08-12', 167326667, NULL, 'GRIYA BUKIT JAYA BLOK H A3 NO 14 GUNUNG PUTRI', 'Tlajung Udik', 'Gunung Putri', 'Bogor', 'Jawa Barat', NULL),
(307, NULL, '12460', 'UPC SUKAHATI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RENCANA RELOKASI 2027', 'SEWA', 1, '2025-12-18', '2026-12-18', 36215556, '2027 rencana relokasi', 'JALAN DADI KUSMAYADI PERUM BCE BLOK A3/01 CIBINONG', 'Karadenan', 'Cibinong', 'Bogor', 'Jawa Barat', NULL),
(308, NULL, '12461', 'UPC CIKARET', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2025-09-01', '2028-08-31', 267326667, NULL, 'JALAN RAYA CIKARET NO 21 CIBINONG', 'Pabuaran', 'Cibinong', 'Bogor', 'Jawa Barat', NULL),
(309, NULL, '12462', 'UPC CILANGKAP', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2024', 'SEWA', 3, '2024-03-04', '2027-03-04', 233933333, NULL, 'JALAN RAYA BOGOR KM 40.7 PADURENAN CIBINONG', 'Pabuaran', 'Cibinong', 'Bogor', 'Jawa Barat', NULL),
(310, NULL, '12463', 'UPC CIRIUNG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2025-05-08', '2028-05-08', 197326667, NULL, 'JALAN MAYOR OKING NO. 128Q CIBINONG', 'Ciriung', 'Cibinong', 'Bogor', 'Jawa Barat', NULL),
(311, NULL, '12626', 'UPC CITEREUP', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2024', 'SEWA', 5, '2025-07-31', '2030-07-31', 695104444, NULL, 'JALAN MAYOR OKING NO.78 CITEUREUP CITEUREUP', 'Karang Asem Barat', 'Citeureup', 'Bogor', 'Jawa Barat', NULL),
(312, NULL, '12691', 'UPC KEDUNG WARINGIN', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2024-03-09', '2027-03-09', 283933333, NULL, 'JALAN RAYA KEDUNG WARINGIN NO.47 BOJONGGEDE', 'Kedung Waringin', 'Bojonggede', 'Bogor', 'Jawa Barat', NULL),
(313, NULL, '12701', 'UPC TAPOS', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2026', 'SEWA', 3, '2025-03-31', '2028-03-31', 183993333, NULL, 'PERUMAHAN PALEM RESIDENCE II NO R5', 'Tapos', 'Cimanggis', 'Depok', 'Jawa Barat', NULL),
(314, NULL, '12490', 'CP PASAR MAWAR', 'INDUK CLUSTER', 'STAND ALONE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN MERDEKA NO. 156 BOGOR TENGAH - KOTA', 'Ciwaringin', 'Bogor Tengah - Kota', 'Bogor', 'Jawa Barat', NULL),
(315, NULL, '12491', 'UPC SAWOJAJAR', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RENCANA STO 2025', 'SEWA', 5, '2023-06-16', '2028-06-16', NULL, NULL, 'JALAN SAWOJAJAR NO. 22A BOGOR TENGAH - KOTA', 'Pabaton', 'Bogor Tengah - Kota', 'Bogor', 'Jawa Barat', NULL),
(316, NULL, '12493', 'UPC CEMPALA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 2, '2026-04-22', '2028-04-22', 78437778, NULL, 'JALAN BRIGJEN SAPTADJI HADIPRAWIRA NO.170BOGOR BARAT - KOTA', 'Cilendek Barat', 'Bogor Barat - Kota', 'Bogor', 'Jawa Barat', NULL),
(317, NULL, '12672', 'UPC YASMIN', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 3, '2024-03-20', '2027-03-20', 250600000, NULL, 'JALAN RING ROAD RAYA NO 114 TAMAN YASMIN SEKTOR 6', 'Curug', 'Bogor Barat - Kota', 'Bogor', 'Jawa Barat', NULL),
(318, NULL, '12517', 'CP PANCORAN MAS', 'INDUK CLUSTER', 'RUKO SINGLE', 'STO PUSAT 2023', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN NUSANTARA RAYA 114A DEPOK', 'Pancoran Mas', 'Pancoran Mas', 'Depok', 'Jawa Barat', NULL),
(319, NULL, NULL, 'CP PANCORAN MAS LT 2 BENGKEL', NULL, 'RUKO DOUBLE', NULL, 'SEWA', 5, '2022-11-01', '2027-10-31', 333933333, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(320, NULL, '12518', 'UPC GANDUL', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2023-10-01', '2026-09-30', 133933333, NULL, 'JALAN RAYA GANDUL NO 47A', 'Gandul', 'Limo', 'Depok', 'Jawa Barat', NULL),
(321, NULL, '12519', 'UPC BEJI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2025-08-16', '2028-08-15', 175660000, NULL, 'JALAN KH USMAN NO 193B RT 00 RW 00 BEJI', 'Beji', 'Beji', 'Depok', 'Jawa Barat', NULL),
(322, NULL, '12520', 'UPC CINERE', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 2, '2026-05-31', '2028-05-31', 80660000, NULL, 'JALAN CINERE RAYA NO 9C', 'Cinere', 'Limo', 'Depok', 'Jawa Barat', NULL),
(323, NULL, '12523', 'UPC MARGO CITY', 'MANDIRI', 'RUKO DOUBLE', 'RENCANA STO 2026', 'SEWA', 5, '2025-09-01', '2030-08-31', 1028437778, NULL, 'JL MARGONDA RAYA NO.16', 'Pondok Cina', 'Beji', 'Depok', 'Jawa Barat', NULL),
(324, NULL, '12617', 'UPC SAWANGAN', 'INDUK CLUSTER', 'STAND ALONE', 'STO KANWIL 2026', 'SEWA', 3, '2024-09-01', '2027-08-31', 145044444, NULL, 'JALAN RAYA SAWANGAN KAVLING 286 C', 'Mampang', 'Pancoran Mas', 'Depok', 'Jawa Barat', NULL),
(325, NULL, '12622', 'UPC RAYA PITARA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 2, '2025-04-22', '2027-04-22', 67326667, 'Pernah rencana relokasi 2025', 'JALAN RAYA PITARA NO. 05', 'Pancoran Mas', 'Pancoran Mas', 'Depok', 'Jawa Barat', NULL),
(326, NULL, '12624', 'UPC GROGOL SAWANGAN', 'INDUK CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2024-10-11', '2027-10-12', 185548889, NULL, 'JALAN RAYA PRAMUKA NO. 47', 'Grogol', 'Limo', 'Depok', 'Jawa Barat', NULL),
(327, NULL, '12828', 'UPC PANGKALAN JATI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2025-05-01', '2028-05-01', 173993333, NULL, 'JALAN GANDUL RAYA RUKO NO.9', 'Gandul', 'Limo', 'Depok', 'Jawa Barat', NULL),
(328, NULL, '12562', 'CP WARUNG JAMBU', 'INDUK CLUSTER', 'RUKO SINGLE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN KS.TUBUN NO.14', 'Cibuluh', 'Bogor Utara - Kota', 'Bogor', 'Jawa Barat', NULL),
(329, NULL, '12382', 'UPC TEGAL LEGA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2024-09-01', '2027-08-31', 218100000, NULL, 'JALAN BOGOR BARU BLOK AX NO/01 BOGOR TENGAH - KOTA', 'Tegal Panjang', 'Bogor Tengah - Kota', 'Bogor', 'Jawa Barat', NULL),
(330, NULL, '12563', 'UPC INDRAPRASTA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2023', 'SEWA', 5, '2024-07-01', '2029-06-30', 639488889, NULL, 'JALAN PANDU RAYA NO.100', 'Bantarjati', 'Bogor Utara - Kota', 'Bogor', 'Jawa Barat', NULL),
(331, NULL, '12565', 'UPC SUDIRMAN BOGOR / PLAZA JAMBU DUA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2023-12-21', '2026-12-21', 417266667, NULL, 'JALAN JENDRAL SUDIRMAN', 'Pabaton', 'Bogor Tengah - Kota', 'Bogor', 'Jawa Barat', NULL),
(332, NULL, '12569', 'UPC BANGBARU 1 WARU', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2025-06-30', '2028-06-30', 233994444, NULL, 'JALAN BANGBARUNG NO.62', 'Bantarjati', 'Bogor Utara - Kota', 'Bogor', 'Jawa Barat', NULL),
(333, NULL, '12586', 'CP KELAPA DUA', 'INDUK CLUSTER', 'RUKO SINGLE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN AKSES UI NO. 45F KELAPA DUA', 'Tugu', 'Cimanggis', 'Depok', 'Jawa Barat', NULL),
(334, NULL, '12588', 'UPC PASAR PAL', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 3, '2024-02-10', '2027-02-09', 350600000, NULL, 'JALAN RAYA BOGOR KM 29 NO. 1', 'Mekarsari', 'Cimanggis', 'Depok', 'Jawa Barat', NULL),
(335, NULL, '12589', 'UPC KOMPLEK TIMAH', 'ANGGOTA CLUSTER', 'STAND ALONE', 'STO KANWIL', 'SEWA', 3, '2026-03-30', '2029-03-29', 140660000, NULL, 'JALAN KOMP TIMAH BLOK GG1', 'Tugu', 'Cimanggis', 'Depok', 'Jawa Barat', NULL),
(336, NULL, '12590', 'UPC HANKAM', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 3, '2024-03-14', '2027-03-14', 160600000, NULL, 'JL. RAYANUSANTARA NO. 16', 'Pasir Gunung Selatan', 'Cimanggis', 'Depok', 'Jawa Barat', NULL),
(337, NULL, '12591', 'UPC MEKARSARI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2024-02-26', '2027-02-26', 200600000, NULL, 'JL. TIGA BERLIAN RAYA NO. 153', 'Mekarsari', 'Cimanggis', 'Depok', 'Jawa Barat', NULL),
(338, NULL, '12592', 'UPC LAPAN', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 5, '2023-07-31', '2028-07-31', 389488889, NULL, 'JALAN LAPAN NO.1A KEL.PEKAYON RT 014 RW 001', 'Pekayon', 'Pasar Rebo', 'Jakarta Timur', 'DKI Jakarta', NULL),
(339, NULL, '12639', 'CP KEDUNGHALANG', 'INDUK CLUSTER', 'RUKO SINGLE', 'STO PUSAT 2021', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN RAYA BOGOR NO.323I RT 0 RW 0 BOGOR UTARA - KOTA', 'Ciparigi', 'Bogor Utara - Kota', 'Bogor', 'Jawa Barat', NULL),
(340, NULL, '12380', 'UPC PASAR BERSIH SENTUL / BELLANOVA MALL', 'NON CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2023', 'SEWA', 3, '2025-06-01', '2028-06-01', 300660000, NULL, 'PASAR BERSIH SENTUL CITY RUKO H-2 JALAN SURYA KENCANA', 'Sentul', 'Babakan Madang', 'Bogor', 'Jawa Barat', NULL),
(341, NULL, '12640', 'UPC VILLA BOGOR INDAH / KARADENAN', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 5, '2022-07-18', '2027-07-18', 222822222, NULL, 'VILLA BOGOR INDAH BLOK AA.1 RUKO NO.17', 'Kedunghalang', 'Bogor Utara - Kota', 'Bogor', 'Jawa Barat', NULL),
(342, NULL, '12687', 'UPC PESONA CILEBUT', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'PROSES STO 2026', 'SEWA', 2, '2025-12-01', '2027-11-30', 145104444, NULL, 'RUKO PESONA CILEBUT BARAT BLOK C1 NO.11A RT 00 RW 00 SUKARAJA', 'Cilebut Barat', 'Sukaraja', 'Bogor', 'Jawa Barat', NULL),
(343, NULL, '12690', 'UPC SALABENDA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2023', 'SEWA', 3, '2025-07-27', '2028-07-27', 167326667, NULL, 'JL. SHOLEH ISKANDAR BLOK M RT. 003/004', 'Parakan Jaya', 'Kemang', 'Bogor', 'Jawa Barat', NULL),
(344, NULL, '12668', 'CP GUNUNG BATU', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN MAYJEN ISHAK DJUARSA NO 96 RT 00 RW 00 BOGOR BARAT - KOTA', 'Gunungbatu', 'Bogor Barat - Kota', 'Bogor', 'Jawa Barat', NULL),
(345, NULL, '12379', 'UPC CIAPUS', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2025', 'SEWA', 3, '2025-03-03', '2028-03-03', 117326667, NULL, 'JALAN KABANDUNGAN I NO.6 CIAPUS', 'Ciapus', 'Ciomas', 'Bogor', 'Jawa Barat', NULL),
(346, NULL, '12669', 'UPC CIAMPEA', 'INDUK CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2024-01-01', '2027-01-01', 267266666, NULL, 'JALAN RAYA WARUNG BORONG NO 19 RT 04 RW 20', 'Bojong Rangkas', 'Ciampea', 'Bogor', 'Jawa Barat', NULL),
(347, NULL, '12670', 'UPC LEUWILIANG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2024-01-01', '2027-01-01', 177266667, NULL, 'JALAN RAYA LEUWILIANG NO 31 RT 00 RW 00 LEUWILIANG', 'Wangun Jaya', 'Leuwisadeng', 'Bogor', 'Jawa Barat', NULL),
(348, NULL, '12671', 'UPC CIBATOK', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2024-02-03', '2027-02-03', 150600000, NULL, 'JALAN RAYA CIBUNGBULANG KM 18 RT 00 RW 00 CIBUNGBULANG', 'Cimanggu 1', 'Cibungbulang', 'Bogor', 'Jawa Barat', NULL),
(349, NULL, '12495', 'UPC PAGELARAN', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2025-07-01', '2028-07-01', 133993333, NULL, 'JALAN TAMAN PAGELARAN C1 NO.8 CIOMAS', 'Sukamantri', 'Tamansari', 'Bogor', 'Jawa Barat', NULL),
(350, NULL, '12673', 'UPC CIOMAS BARU', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 3, '2024-03-04', '2027-03-04', 267266666, NULL, 'JALAN RAYA CIOMAS BOJONG MENTENG', 'Pasir Kuda', 'Bogor Barat - Kota', 'Bogor', 'Jawa Barat', NULL),
(351, NULL, '12674', 'UPC DRAMAGA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2025', 'SEWA', 3, '2025-07-01', '2028-07-01', 300660000, NULL, 'JL. BUGAH SARICIPUTIH', 'Margajaya', 'Bogor Barat - Kota', 'Bogor', 'Jawa Barat', NULL),
(352, NULL, '12675', 'UPC CIBANTENG 1', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2024', 'SEWA', 2, '2024-10-01', '2026-10-01', 83437778, NULL, 'RUKO CIBANTENG NO.3 JLN.RAYA CIBANTENGCIAMPEABOGOR', 'Cihideung Ilir', 'Ciampea', 'Bogor', 'Jawa Barat', NULL),
(353, NULL, '12685', 'CP BOJONGSARI', 'INDUK CLUSTER', 'RUKO SINGLE', 'STO', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN RAYA PARUNG BOGOR KM 38', 'Curug', 'Sawangan', 'Depok', 'Jawa Barat', NULL),
(354, NULL, '12618', 'UPC LIMO', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2022', 'SEWA', 5, '2023-08-20', '2028-08-19', 375600000, NULL, 'JALAN RAYA LIMO CINERE RAYA NO.15', 'Limo', 'Limo', 'Depok', 'Jawa Barat', NULL),
(355, NULL, '12620', 'UPC MERUYUNG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 3, '2025-06-09', '2028-06-08', 116666667, NULL, 'RUKO DIAN PLAZA II JALAN RAYA MERUYUNG', 'Meruyung', 'Limo', 'Depok', 'Jawa Barat', NULL),
(356, NULL, '12621', 'UPC RAYA MUCHTAR', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2022', 'SEWA', 2, '2025-07-14', '2027-07-14', 111771111, NULL, 'JALAN RAYA MUCHTAR', 'Sawangan Lama', 'Sawangan', 'Depok', 'Jawa Barat', NULL),
(357, NULL, '12686', 'UPC BOJONGSARI BARU / PS RAYA PARUNG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2022', 'SEWA', 3, '2024-12-12', '2027-12-12', 118377777, NULL, 'JL. RAYA PARUNG BOGOR KM 38 SAWANGAN', 'Bojong Sari Lama', 'Sawangan', 'Depok', 'Jawa Barat', NULL),
(358, NULL, '12688', 'UPC BEDAHAN', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2022\r\nRELOKASI 2026', 'SEWA', 3, '2026-05-26', '2029-05-26', 217326667, NULL, 'JALAN RAYA MUCHTAR RT 003 RW 006 Sawangan Bar', 'Bedahan', 'Sawangan', 'Depok', 'Jawa Barat', NULL),
(359, NULL, '12689', 'UPC PONDOK PETIR', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 2, '2026-06-09', '2028-06-08', 83993333, NULL, 'JALAN RAYA PONDOK PETIRSAWANGAN', 'Curug', 'Sawangan', 'Depok', 'Jawa Barat', NULL),
(360, NULL, '12693', 'UPC ARCO', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RENCANA RELOKASI 2026', 'SEWA', 1, '2025-11-20', '2026-11-20', 45104444, '2026 rencana relokasi', 'JALAN RAYA PARUNG BOGOR KP.LEBAK WANGI NO. 4PARUNG', 'Pamagersari', 'Parung', 'Bogor', 'Jawa Barat', NULL),
(361, NULL, '12694', 'CP CISALAK', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 3, '2025-06-21', '2028-06-21', 367326667, NULL, 'JALAN RAYA BOGOR KM 31 NO.4 CIMANGGIS', 'Baktijaya', 'Sukmajaya', 'Depok', 'Jawa Barat', NULL),
(362, NULL, '12398', 'UPC PASAR MUSI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2023-11-01', '2026-10-31', 117266667, NULL, 'JALAN INDRAGIRI RAYA NO.390', 'Sukatani', 'Cimanggis', 'Depok', 'Jawa Barat', NULL),
(363, NULL, '12403', 'UPC GAS ALAM', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'PROSES STO 2026', 'SEWA', 3, '2025-04-10', '2028-04-10', 133993333, NULL, 'JALAN PUTRI TUNGGAL CIMANGGIS', 'Cisalak Pasar', 'Cimanggis', 'Depok', 'Jawa Barat', NULL),
(364, NULL, '12695', 'UPC RADAR AURI', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2023-12-01', '2026-12-01', 100600000, NULL, 'JALAN RAYA RADAR AURI NO 29 CIMANGGIS', 'Cisalak Pasar', 'Cimanggis', 'Depok', 'Jawa Barat', NULL),
(365, NULL, '12697', 'UPC CIMANGGIS', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 2, '2026-04-01', '2028-04-01', 156215556, NULL, 'JALAN RAYA BOGOR KM.30 NO 75CIMANGGIS', 'Cisalak Pasar', 'Cimanggis', 'Depok', 'Jawa Barat', NULL),
(366, NULL, '12698', 'UPC PEKAPURAN', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 3, '2024-05-01', '2027-05-01', 150600000, NULL, 'JALAN RAYA PEKAPURAN NO 122CIMANGGIS', 'Sukatani', 'Cimanggis', 'Depok', 'Jawa Barat', NULL),
(367, NULL, '60129', 'CPS MARGONDA', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'JALAN MARGONDA RAYA NO. 22', 'Pondok Cina', 'Beji', 'Depok', 'Jawa Barat', NULL),
(368, NULL, '60131', 'UPS DEPOK TIMUR', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL', 'SEWA', 3, '2026-03-21', '2029-03-20', 240660000, NULL, 'JL. KEJAYAAN BLOK 06 NO. 4 RT 001, RW 008', 'Abadijaya', 'Sukmajaya', 'Depok', 'Jawa Barat', NULL),
(369, NULL, '60132', 'UPS PURI ANGGREK MAS', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2025', 'SEWA', 4, '2025-03-03', '2029-03-03', 111771111, NULL, 'JALAN RAYA SAWANGAN NO. 27', 'Rangkapanjaya Baru', 'Pancoran Mas', 'Depok', 'Jawa Barat', NULL),
(370, NULL, '60133', 'UPS PONDOK DUTA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 5, '2025-03-17', '2030-03-17', 472882222, NULL, 'GRAHA AL FATIH JL PONDOK DUTA RAYA', 'Tugu', 'Cimanggis', 'Depok', 'Jawa Barat', NULL),
(371, NULL, '60134', 'UPS GRAND DEPOK CITY', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2025', 'SEWA', 3, '2024-06-01', '2027-06-01', 150600000, NULL, 'JALAN RAYA KSU PARUNG SERAP NO. 77 C', 'Tirtajaya', 'Sukmajaya', 'Depok', 'Jawa Barat', NULL),
(372, NULL, '60135', 'UPS NUSANTARA', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2022', 'SEWA', 3, '2024-12-31', '2027-12-31', 183933333, NULL, 'JALAN NUSANTARA RAYA NO. 100', 'Beji Timur', 'Beji', 'Depok', 'Jawa Barat', NULL),
(373, NULL, '60136', 'UPS SENTOSA', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2024', 'SEWA', 4, '2024-03-15', '2028-03-15', 578377778, NULL, 'JALAN SENTOSA RAYA NO. 101B', 'Mekarjaya', 'Sukmajaya', 'Depok', 'Jawa Barat', NULL),
(374, NULL, '60138', 'UPS DETOS', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 2, '2024-12-01', '2026-12-01', 200660000, NULL, 'JLN MARGONDA RAYA NO 417 J', 'Pondok Cina', 'Beji', 'Depok', 'Jawa Barat', NULL),
(375, NULL, '60623', 'UPS CINERE RAYA', 'NON CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2023', 'SEWA', 4, '2025-10-01', '2029-09-30', 400660000, NULL, 'JALAN CINERE RAYA NO.14', 'Cinere', 'Limo', 'epokj', 'Jawa Barat', NULL),
(376, NULL, '60834', 'UPS HARJAMUKTI', 'NON CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2023', 'SEWA', 3, '2024-05-14', '2027-05-14', 333933333, NULL, 'RUKO CITRAMAS BLOK E JL. ALTERNATIF CIBUBUR', 'Harjamukti', 'Cimanggis', 'Depok', 'Jawa Barat', NULL),
(377, NULL, '60931', 'UPS LAPANGAN TEMBAK', 'NON CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2021', 'SEWA', 3, '2023-12-15', '2026-12-15', 483933333, NULL, 'JL. LAPANGAN TEMBAK NO.1', 'Cibubur', 'Ciracas', 'Jakarta Timur', 'Jawa Barat', NULL),
(378, NULL, '60146', 'CPS BOGOR BARU', 'INDUK CLUSTER', 'RUKO SINGLE', 'STO PUSAT 2020', 'MILIK SENDIRI', NULL, NULL, NULL, NULL, NULL, 'RUKO PLAZA INDAHBBLOK C NO.3A', 'Kedung Badak', 'Tanah Sereal', 'Bogor', 'Jawa Barat', NULL),
(379, NULL, '60147', 'UPS SEMPLAK', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2022\r\nPROSES RELOKASI 2026', 'SEWA', 5, '2026-07-17', '2031-07-16', 417326667, NULL, 'RAYA SEMPLAK NO 295', 'Semplak', 'Bogor Barat - Kota', 'Bogor', 'Jawa Barat', NULL),
(380, NULL, '60148', 'UPS BOJONG GEDE', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2022', 'SEWA', 3, '2026-02-01', '2029-02-01', 350660000, NULL, 'JL. PASAR BARU BOJONG GEDE RT 001 RW 003', 'Bojong Gede', 'Bojonggede', 'Bogor', 'Jawa Barat', NULL),
(381, NULL, '60149', 'UPS BANTAR KEMANG', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2024-03-31', '2027-03-31', 267266667, NULL, 'DURIAN RAYA NO8', 'Baranangsiang', 'Bogor Timur - Kota', 'Bogor', 'Jawa Barat', NULL),
(382, NULL, '60150', 'UPS BUBULAK', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 3, '2023-02-18', '2026-02-18', 333933333, NULL, 'DURIAN RAYA NO8', 'Sindangbarang', 'Bogor Barat - Kota', 'Bogor', 'Jawa Barat', NULL),
(383, NULL, '60151', 'UPS PAHLAWAN', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RENCANA STO 2026', 'SEWA', 2, '2026-03-11', '2028-03-11', 188660000, NULL, 'PAHLAWAN NO 50', 'Empang', 'Bogor Selatan - Kota', 'Bogor', 'Jawa Barat', NULL),
(384, NULL, '60152', 'UPS SUKAHATI INDAH', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'RELOKASI 2025', 'SEWA', 4, '2025-07-14', '2029-07-14', 239548889, NULL, 'RAYA SUKAHATI NO 112', 'Karadenan', 'Cibinong', 'Bogor', 'Jawa Barat', NULL),
(385, NULL, '60153', 'UPS BUKIT CIMANGGU', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', 'STO KANWIL 2022', 'SEWA', 3, '2025-02-01', '2028-01-31', 237660000, NULL, 'BKT CIMANGGU CITY BOULEVARD BLOK A-2/3', 'Cibadak', 'Tanah Sereal', 'Bogor', 'Jawa Barat', NULL),
(386, NULL, '60831', 'UPS CIBINONG MANSION', 'INDUK CLUSTER', 'RUKO DOUBLE', 'STO PUSAT 2022', 'SEWA', 3, '2026-06-01', '2029-05-31', 233993333, NULL, 'JL.KSR DADI KUSMAYADI RUKO CITRA NUSA 8A', 'Tengah', 'Cibinong', 'Bogor', 'Jawa Barat', NULL),
(387, NULL, '60832', 'UPS GRAHA POS', 'ANGGOTA CLUSTER', 'RUKO DOUBLE', NULL, 'SEWA', 2, '2026-03-15', '2028-03-15', 230660000, NULL, 'JL. RAYA BOGOR KM 45 NO.1A CIBINONG', 'Cibinong', 'Cibinong', 'Bogor', 'Jawa Barat', NULL),
(388, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 90836637502, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_06_23_032343_create_outlets_table', 1),
(5, '2026_06_23_032344_create_inventories_table', 1),
(6, '2026_06_23_032345_create_computers_table', 1),
(7, '2026_06_23_032346_create_printers_table', 1),
(8, '2026_06_23_032346_create_transactions_table', 1),
(9, '2026_06_23_032347_create_transaction_items_table', 1),
(10, '2026_06_23_032348_create_activity_logs_table', 1),
(11, '2026_06_23_055818_create_building_lands_table', 1),
(12, '2026_06_23_055819_create_building_gedungs_table', 1),
(13, '2026_06_23_055821_create_building_rentals_table', 1),
(14, '2026_06_23_055822_create_building_renovations_table', 1),
(15, '2026_06_23_055823_create_security_facilities_table', 1),
(16, '2026_06_23_055824_create_integrated_warehouses_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `outlets`
--

CREATE TABLE `outlets` (
  `id` bigint UNSIGNED NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nama` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alamat` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `outlets`
--

INSERT INTO `outlets` (`id`, `code`, `nama`, `alamat`, `created_at`, `updated_at`) VALUES
(10101, '10101', 'KC Palembang', 'Palembang, Sumatera Selatan', '2026-06-23 19:30:02', '2026-06-23 19:30:02'),
(10102, '10102', 'KC Pekanbaru', 'Pekanbaru, Riau', '2026-06-23 19:30:02', '2026-06-23 19:30:02'),
(10103, '10103', 'KC Pontianak', 'Pontianak, Kalimantan Barat', '2026-06-23 19:30:02', '2026-06-23 19:30:02'),
(10104, '10104', 'KC Banjarmasin', 'Banjarmasin, Kalimantan Selatan', '2026-06-23 19:30:02', '2026-06-23 19:30:02'),
(10105, '10105', 'KC Balikpapan', 'Balikpapan, Kalimantan Timur', '2026-06-23 19:30:02', '2026-06-23 19:30:02'),
(12350, '12350', 'UPC BOJONG RAWALUMBU', 'Bekasi, Jawa Barat', '2026-06-23 19:30:02', '2026-06-23 19:30:02'),
(12458, '12458', 'CP CIBINONG', 'Cibinong, Bogor, Jawa Barat', '2026-06-23 19:30:02', '2026-06-23 19:30:02'),
(60830, '60830', 'UPS GALUH MAS', 'Karawang, Jawa Barat', '2026-06-23 19:30:02', '2026-06-23 19:30:02');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `printers`
--

CREATE TABLE `printers` (
  `id` bigint UNSIGNED NOT NULL,
  `outlet_id` bigint UNSIGNED DEFAULT NULL,
  `outlet` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `produk` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sn` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tanggal_mulai` date DEFAULT NULL,
  `tanggal_selesai` date DEFAULT NULL,
  `penyedia` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Inventaris',
  `kondisi` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BAIK',
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `printers`
--

INSERT INTO `printers` (`id`, `outlet_id`, `outlet`, `produk`, `sn`, `tanggal_mulai`, `tanggal_selesai`, `penyedia`, `status`, `kondisi`, `deskripsi`, `created_at`, `updated_at`) VALUES
(1, 12458, 'CP CIBINONG', 'EPSON L4260 ECO TANK', 'X8SS028432', '2024-04-01', '2026-04-01', 'POJ', 'Sewa Berjalan', 'KURANG BAIK', 'Mikro', '2026-06-23 19:30:02', '2026-06-23 19:30:02'),
(2, 60830, 'UPS GALUH MAS', 'LQ-310 DOT MATRIX', 'R9JYJ33221', '2024-04-01', '2026-04-01', 'POJ', 'Sewa Berjalan', 'BAIK', 'Printer validasi kasir', '2026-06-23 19:30:02', '2026-06-23 19:30:02');

-- --------------------------------------------------------

--
-- Table structure for table `security_facilities`
--

CREATE TABLE `security_facilities` (
  `id` bigint UNSIGNED NOT NULL,
  `nama_fasilitas` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lokasi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jenis` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jumlah` int NOT NULL DEFAULT '1',
  `kondisi` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BAIK',
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `security_facilities`
--

INSERT INTO `security_facilities` (`id`, `nama_fasilitas`, `lokasi`, `jenis`, `jumlah`, `kondisi`, `deskripsi`, `created_at`, `updated_at`) VALUES
(1, 'CCTV Outdoor Dome', 'KC Palembang', 'CCTV', 6, 'BAIK', 'Pengawasan luar gedung utama', '2026-06-23 19:30:02', '2026-06-23 19:30:02'),
(2, 'Pagar Terali Besi', 'CP Cibinong', 'Pagar', 1, 'BAIK', 'Pagar pembatas halaman depan', '2026-06-23 19:30:02', '2026-06-23 19:30:02');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('AMw1UCDAoJ3pZ3fghq2uIrtfK4xcEq7sPEvzr5gX', 2, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoienBlWWRBOGtDeXFWc0dEWWZCMkhqaTdGSmNPbGJJWEhCRlFuU3FDNSI7czozOiJ1cmwiO2E6MDp7fXM6OToiX3ByZXZpb3VzIjthOjI6e3M6MzoidXJsIjtzOjIxOiJodHRwOi8vMTI3LjAuMC4xOjgwMDAiO3M6NToicm91dGUiO3M6OToiZGFzaGJvYXJkIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6Mjt9', 1782271544),
('LwixbAMb2RIERSz9YgyCKqBT0BVIhI0a9d7AQiXW', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.125.1 Chrome/148.0.7778.97 Electron/42.2.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiNDhmZ3FIOTJMdFhNRDc2bEhidURrbE80WW1heHBBUDNZcjRncWlzYSI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czoyMToiaHR0cDovLzEyNy4wLjAuMTo4MDAwIjt9czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1782270696);

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` bigint UNSIGNED NOT NULL,
  `nomor_surat` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tanggal` date NOT NULL,
  `jenis_transaksi` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `penerima_nama` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `penerima_jabatan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `penerima_instansi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pengirim_nama` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pengirim_jabatan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pengirim_instansi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mengetahui_nama` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mengetahui_jabatan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lokasi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transaction_items`
--

CREATE TABLE `transaction_items` (
  `id` bigint UNSIGNED NOT NULL,
  `transaction_id` bigint UNSIGNED NOT NULL,
  `nama` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kuantitas` int NOT NULL,
  `satuan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pcs',
  `sn` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `keterangan` text COLLATE utf8mb4_unicode_ci,
  `outlet_id` bigint UNSIGNED DEFAULT NULL,
  `outlet` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'User Biasa', 'user@logistik.co.id', NULL, '$2y$12$qKo/vCpUnZwYiuH/f5Mq1.GXeq8lo3RK81pqEXOQ3HYazX24sVSYO', 'user', NULL, '2026-06-23 19:30:02', '2026-06-23 19:30:02'),
(2, 'Administrator', 'admin@logistik.co.id', NULL, '$2y$12$2MfiKyabeeps0rYP4GvtLeWnbi5QXRg6JEs0IMChSBd.x/N.zTU7.', 'admin', 'sVUUA0r2CrZUJkHN5VHTavnNnepB3qWumCl3BgSgku4CvnxSugFHe1RpM7aN', '2026-06-23 19:30:02', '2026-06-23 19:30:02');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `building_gedungs`
--
ALTER TABLE `building_gedungs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `building_lands`
--
ALTER TABLE `building_lands`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `building_renovations`
--
ALTER TABLE `building_renovations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `computers`
--
ALTER TABLE `computers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `computers_outlet_id_foreign` (`outlet_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `integrated_warehouses`
--
ALTER TABLE `integrated_warehouses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `inventories`
--
ALTER TABLE `inventories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `menu_sewa`
--
ALTER TABLE `menu_sewa`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `outlets`
--
ALTER TABLE `outlets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `printers`
--
ALTER TABLE `printers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `printers_outlet_id_foreign` (`outlet_id`);

--
-- Indexes for table `security_facilities`
--
ALTER TABLE `security_facilities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_items_transaction_id_foreign` (`transaction_id`),
  ADD KEY `transaction_items_outlet_id_foreign` (`outlet_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `building_gedungs`
--
ALTER TABLE `building_gedungs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `building_lands`
--
ALTER TABLE `building_lands`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `building_renovations`
--
ALTER TABLE `building_renovations`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `computers`
--
ALTER TABLE `computers`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `integrated_warehouses`
--
ALTER TABLE `integrated_warehouses`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `inventories`
--
ALTER TABLE `inventories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `menu_sewa`
--
ALTER TABLE `menu_sewa`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=389;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `outlets`
--
ALTER TABLE `outlets`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60831;

--
-- AUTO_INCREMENT for table `printers`
--
ALTER TABLE `printers`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `security_facilities`
--
ALTER TABLE `security_facilities`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transaction_items`
--
ALTER TABLE `transaction_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `computers`
--
ALTER TABLE `computers`
  ADD CONSTRAINT `computers_outlet_id_foreign` FOREIGN KEY (`outlet_id`) REFERENCES `outlets` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `printers`
--
ALTER TABLE `printers`
  ADD CONSTRAINT `printers_outlet_id_foreign` FOREIGN KEY (`outlet_id`) REFERENCES `outlets` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD CONSTRAINT `transaction_items_outlet_id_foreign` FOREIGN KEY (`outlet_id`) REFERENCES `outlets` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `transaction_items_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
