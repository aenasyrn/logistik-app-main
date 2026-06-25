<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Outlet;
use App\Models\Inventory;
use App\Models\Computer;
use App\Models\Printer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Users
        User::create([
            'name' => 'User Biasa',
            'email' => 'user@logistik.co.id',
            'password' => Hash::make('user12345'),
            'role' => 'user',
        ]);

        User::create([
            'name' => 'Administrator',
            'email' => 'admin@logistik.co.id',
            'password' => Hash::make('admin12345'),
            'role' => 'admin',
        ]);

        // 2. Seed Outlets
        $outlet1 = Outlet::create([
            'id' => 12350,
            'code' => '12350',
            'nama' => 'UPC BOJONG RAWALUMBU',
            'alamat' => 'Bekasi, Jawa Barat',
        ]);

        $outlet2 = Outlet::create([
            'id' => 12458,
            'code' => '12458',
            'nama' => 'CP CIBINONG',
            'alamat' => 'Cibinong, Bogor, Jawa Barat',
        ]);

        $outlet3 = Outlet::create([
            'id' => 60830,
            'code' => '60830',
            'nama' => 'UPS GALUH MAS',
            'alamat' => 'Karawang, Jawa Barat',
        ]);

        // 3. Seed Inventories
        Inventory::create([
            'nama' => 'OptiPlex SFF 7010',
            'kuantitas' => 10,
            'satuan' => 'Pcs',
            'deskripsi' => 'PC Desktop Brand Dell',
        ]);

        Inventory::create([
            'nama' => 'EPSON L4260 ECO TANK',
            'kuantitas' => 5,
            'satuan' => 'Pcs',
            'deskripsi' => 'Printer Inkjet Warna',
        ]);

        Inventory::create([
            'nama' => 'LQ-310 DOT MATRIX',
            'kuantitas' => 3,
            'satuan' => 'Pcs',
            'deskripsi' => 'Printer Dot Matrix Kasir',
        ]);

        // 4. Seed Computers
        Computer::create([
            'outlet_id' => $outlet1->id,
            'outlet' => $outlet1->nama,
            'ip_address' => '10.81.58.23',
            'mac_address' => 'cc:96:e5:3f:af:e8',
            'ram' => '7 GB',
            'storage' => '503GB',
            'cpu' => '13th Gen Intel(R) Core(TM) i5-13600',
            'os' => 'Ubuntu Pegadaian',
            'produk' => 'OptiPlex SFF 7010',
            'sn' => '8B9BVZ3',
            'tanggal_mulai' => '2024-04-01',
            'tanggal_selesai' => '2026-04-01',
            'penyedia' => 'POJ',
            'status' => 'Sewa Berjalan',
            'kondisi' => 'BAIK',
            'deskripsi' => 'PC Admin Utama',
        ]);

        Computer::create([
            'outlet_id' => $outlet2->id,
            'outlet' => $outlet2->nama,
            'ip_address' => '10.81.167.60',
            'mac_address' => '4c:d7:17:9e:23:22',
            'ram' => '7 GB',
            'storage' => '503GB',
            'cpu' => '13th Gen Intel(R) Core(TM) i5-13600',
            'os' => 'Ubuntu Pegadaian V.22 Build 2024.11.01',
            'produk' => 'OptiPlex SFF 7010',
            'sn' => 'GMYMS44',
            'tanggal_mulai' => '2025-01-01',
            'tanggal_selesai' => '2028-01-01',
            'penyedia' => 'EPS',
            'status' => 'Sewa Berjalan',
            'kondisi' => 'BAIK',
            'deskripsi' => 'PC Transaksi Kasir',
        ]);

        // 5. Seed Printers
        Printer::create([
            'outlet_id' => $outlet2->id,
            'outlet' => $outlet2->nama,
            'produk' => 'EPSON L4260 ECO TANK',
            'sn' => 'X8SS028432',
            'tanggal_mulai' => '2024-04-01',
            'tanggal_selesai' => '2026-04-01',
            'penyedia' => 'POJ',
            'status' => 'Sewa Berjalan',
            'kondisi' => 'KURANG BAIK',
            'deskripsi' => 'Mikro',
        ]);

        Printer::create([
            'outlet_id' => $outlet3->id,
            'outlet' => $outlet3->nama,
            'produk' => 'LQ-310 DOT MATRIX',
            'sn' => 'R9JYJ33221',
            'tanggal_mulai' => '2024-04-01',
            'tanggal_selesai' => '2026-04-01',
            'penyedia' => 'POJ',
            'status' => 'Sewa Berjalan',
            'kondisi' => 'BAIK',
            'deskripsi' => 'Printer validasi kasir',
        ]);

        // 6. Seed Additional Outlets for Buildings
        $outletPalembang = Outlet::create([
            'id' => 10101,
            'code' => '10101',
            'nama' => 'KC Palembang',
            'alamat' => 'Palembang, Sumatera Selatan',
        ]);

        $outletPekanbaru = Outlet::create([
            'id' => 10102,
            'code' => '10102',
            'nama' => 'KC Pekanbaru',
            'alamat' => 'Pekanbaru, Riau',
        ]);

        $outletPontianak = Outlet::create([
            'id' => 10103,
            'code' => '10103',
            'nama' => 'KC Pontianak',
            'alamat' => 'Pontianak, Kalimantan Barat',
        ]);

        $outletBanjarmasin = Outlet::create([
            'id' => 10104,
            'code' => '10104',
            'nama' => 'KC Banjarmasin',
            'alamat' => 'Banjarmasin, Kalimantan Selatan',
        ]);

        $outletBalikpapan = Outlet::create([
            'id' => 10105,
            'code' => '10105',
            'nama' => 'KC Balikpapan',
            'alamat' => 'Balikpapan, Kalimantan Timur',
        ]);

        // 7. Seed Building Lands (Skipped - using database table aset_tanah directly)



        // 9. Seed Building Rentals (Sewa) - matching screenshot with 2026 base date
        \App\Models\BuildingSewa::create([
            'outlet_id' => $outletPalembang->id,
            'kode_outlet' => $outletPalembang->code,
            'nama_outlet' => $outletPalembang->nama,
            'type_outlet' => 'Induk Cluster',
            'type_bangunan' => 'Ruko Single',
            'jenis_sto' => 'STO A',
            'status_gedung' => 'Sewa',
            'periode_sewa' => '3 Tahun',
            'tgl_kontrak_mulai' => '2023-07-09',
            'tgl_kontrak_berakhir' => '2026-07-08', // 15 days remaining from 2026-06-23
            'harga_sewa' => 12000000,
            'keterangan' => 'Sewa bangunan operasional',
            'alamat' => 'Jl. Jend. Sudirman No. 12',
            'kelurahan' => '20 Ilir D III',
            'kecamatan' => 'Ilir Timur I',
            'kab_kota' => 'Palembang',
            'provinsi' => 'Sumatera Selatan',
        ]);

        \App\Models\BuildingSewa::create([
            'outlet_id' => $outletPekanbaru->id,
            'kode_outlet' => $outletPekanbaru->code,
            'nama_outlet' => $outletPekanbaru->nama,
            'type_outlet' => 'Anggota Cluster',
            'type_bangunan' => 'Stand Alone',
            'jenis_sto' => 'STO B',
            'status_gedung' => 'Sewa',
            'periode_sewa' => '3 Tahun',
            'tgl_kontrak_mulai' => '2023-07-22',
            'tgl_kontrak_berakhir' => '2026-07-21', // 28 days remaining
            'harga_sewa' => 10500000,
            'keterangan' => 'Sewa bangunan kantor pembantu',
            'alamat' => 'Jl. Sudirman No. 45',
            'kelurahan' => 'Simpang Empat',
            'kecamatan' => 'Pekanbaru Kota',
            'kab_kota' => 'Pekanbaru',
            'provinsi' => 'Riau',
        ]);

        \App\Models\BuildingSewa::create([
            'outlet_id' => $outletPontianak->id,
            'kode_outlet' => $outletPontianak->code,
            'nama_outlet' => $outletPontianak->nama,
            'type_outlet' => 'Non Cluster',
            'type_bangunan' => 'Ruko Double',
            'jenis_sto' => 'STO C',
            'status_gedung' => 'Sewa',
            'periode_sewa' => '3 Tahun',
            'tgl_kontrak_mulai' => '2023-08-08',
            'tgl_kontrak_berakhir' => '2026-08-07', // 45 days remaining
            'harga_sewa' => 9800000,
            'keterangan' => 'Sewa ruko operasional',
            'alamat' => 'Jl. Gajah Mada No. 88',
            'kelurahan' => 'Benua Melayu Darat',
            'kecamatan' => 'Pontianak Selatan',
            'kab_kota' => 'Pontianak',
            'provinsi' => 'Kalimantan Barat',
        ]);

        \App\Models\BuildingSewa::create([
            'outlet_id' => $outletBanjarmasin->id,
            'kode_outlet' => $outletBanjarmasin->code,
            'nama_outlet' => $outletBanjarmasin->nama,
            'type_outlet' => 'Mandiri',
            'type_bangunan' => 'Ruko Single',
            'jenis_sto' => 'STO A',
            'status_gedung' => 'Sewa',
            'periode_sewa' => '5 Tahun',
            'tgl_kontrak_mulai' => '2022-08-31',
            'tgl_kontrak_berakhir' => '2027-08-31', // 14 months remaining
            'harga_sewa' => 8200000,
            'keterangan' => 'Sewa ruko kasir',
            'alamat' => 'Jl. Ahmad Yani KM 4.5',
            'kelurahan' => 'Pemurus Luar',
            'kecamatan' => 'Banjarmasin Timur',
            'kab_kota' => 'Banjarmasin',
            'provinsi' => 'Kalimantan Selatan',
        ]);

        \App\Models\BuildingSewa::create([
            'outlet_id' => $outletBalikpapan->id,
            'kode_outlet' => $outletBalikpapan->code,
            'nama_outlet' => $outletBalikpapan->nama,
            'type_outlet' => 'Rencana Relokasi/Tutup',
            'type_bangunan' => 'Mall / Kios',
            'jenis_sto' => 'STO B',
            'status_gedung' => 'Sewa',
            'periode_sewa' => '3 Tahun',
            'tgl_kontrak_mulai' => '2022-10-31',
            'tgl_kontrak_berakhir' => '2025-10-31', // Expired relative to 2026-06-23
            'harga_sewa' => 14500000,
            'keterangan' => 'Sewa kantor wilayah',
            'alamat' => 'Jl. Jend. Sudirman No. 109',
            'kelurahan' => 'Klandasan Ilir',
            'kecamatan' => 'Balikpapan Kota',
            'kab_kota' => 'Balikpapan',
            'provinsi' => 'Kalimantan Timur',
        ]);

        // 10. Seed Building Renovations
        \App\Models\BuildingRenovation::create([
            'no_memo' => 'MEMO/2026/01',
            'tgl_memo' => '2026-01-05',
            'nama_pekerjaan' => 'Renovasi Atap & Plafon',
            'nilai_pembayaran' => 25000000,
            'nama_outlet' => 'KC Palembang',
            'cabang' => 'Palembang',
            'norek' => '1234567890',
            'bank' => 'BRI',
            'pelaksana_pekerjaan' => 'CV Pembangunan Jaya',
            'tgl_tagihan' => '2026-02-10',
            'nilai_spk_pelaksanaan' => 30000000,
            'nilai_addendum_spk' => 0,
            'tgl_spk' => '2026-01-08',
            'no_spk' => 'SPK/RENOV/001',
            'pajak_pph' => 600000,
            'tgl_bap_bast' => '2026-02-15',
            'tagihan_nilai' => 25000000,
            'tagihan_dpp' => 22727273,
            'tagihan_ppn' => 2272727,
            'tagihan_pph' => 454545,
            'tagihan_retensi' => 1250000,
            'tagihan_transfer' => 23272727,
            'retensi_nilai' => 1250000,
            'retensi_dpp' => 1136364,
            'retensi_ppn' => 113636,
            'retensi_pph' => 22727,
            'retensi_transfer' => 1227273,
            'status' => 'Selesai',
            'deskripsi' => 'Perbaikan kebocoran atap gedung pelayanan',
        ]);

        \App\Models\BuildingRenovation::create([
            'no_memo' => 'MEMO/2026/02',
            'tgl_memo' => '2026-05-25',
            'nama_pekerjaan' => 'Pengecatan Fasad Depan',
            'nilai_pembayaran' => 12500000,
            'nama_outlet' => 'CP Cibinong',
            'cabang' => 'Cibinong',
            'norek' => '0987654321',
            'bank' => 'Mandiri',
            'pelaksana_pekerjaan' => 'Indah Decor',
            'tgl_tagihan' => '2026-06-25',
            'nilai_spk_pelaksanaan' => 15000000,
            'nilai_addendum_spk' => 0,
            'tgl_spk' => '2026-05-28',
            'no_spk' => 'SPK/RENOV/002',
            'pajak_pph' => 300000,
            'tgl_bap_bast' => '2026-07-01',
            'tagihan_nilai' => 12500000,
            'tagihan_dpp' => 11363636,
            'tagihan_ppn' => 1136364,
            'tagihan_pph' => 227273,
            'tagihan_retensi' => 750000,
            'tagihan_transfer' => 11522727,
            'retensi_nilai' => 750000,
            'retensi_dpp' => 681818,
            'retensi_ppn' => 68182,
            'retensi_pph' => 13636,
            'retensi_transfer' => 736364,
            'status' => 'Dalam Proses',
            'deskripsi' => 'Pemeliharaan cat gedung agar tetap bersih',
        ]);

        // 11. Seed Security Facilities
        \App\Models\SecurityFacility::create([
            'nama_fasilitas' => 'CCTV Outdoor Dome',
            'lokasi' => 'KC Palembang',
            'jenis' => 'CCTV',
            'jumlah' => 6,
            'kondisi' => 'BAIK',
            'deskripsi' => 'Pengawasan luar gedung utama',
        ]);

        \App\Models\SecurityFacility::create([
            'nama_fasilitas' => 'Pagar Terali Besi',
            'lokasi' => 'CP Cibinong',
            'jenis' => 'Pagar',
            'jumlah' => 1,
            'kondisi' => 'BAIK',
            'deskripsi' => 'Pagar pembatas halaman depan',
        ]);


    }
}

