<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('aset_tanah')) {
            $count = DB::table('aset_tanah')->count();
            if ($count === 0) {
                // Find matching outlet IDs or fallback to any valid outlet ID
                $petamburan = DB::table('outlets')->where('nama', 'like', '%Petamburan%')->first();
                $bekasi = DB::table('outlets')->where('nama', 'like', '%Bekasi Utama%')->first();
                $bogor = DB::table('outlets')->where('nama', 'like', '%Bogor%')->first();
                $senen = DB::table('outlets')->where('nama', 'like', '%Pasar Senen%')->first();
                $salemba = DB::table('outlets')->where('nama', 'like', '%Salemba%')->first();

                $defaultOutlet = DB::table('outlets')->first();
                $defaultId = $defaultOutlet ? $defaultOutlet->id : 1;

                $now = now();

                DB::table('aset_tanah')->insert([
                    [
                        'outlet_id' => $petamburan ? $petamburan->id : $defaultId,
                        'no' => 1,
                        'unit_kerja' => 'CP Petamburan',
                        'alamat' => 'Jl. KS Tubun No. 28, Petamburan, Jakarta Barat',
                        'peruntukan' => 'Gedung Operasional CP Petamburan',
                        'aset_sap' => 'SAP-10101',
                        'no_shgb' => 'SHGB-99123/JKT',
                        'no_sertifikat' => 'SERT-77654',
                        'no_sertifikat_gabung' => 'GAB-445566',
                        'no_imb' => 'IMB-112244',
                        'nama_pemilik_imb' => 'PT Pegadaian',
                        'tgl_shgb_mulai' => '2012-03-15',
                        'tgl_shgb_berakhir' => '2032-03-15',
                        'tahun_perolehan' => 2012,
                        'luas_tanah_m2' => 1200.00,
                        'luas_pagar_m2' => 90.00,
                        'luas_bangunan_m2' => 700.00,
                        'status' => 'Aktif',
                        'keterangan' => 'Lahan utama operasional CP Petamburan',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ],
                    [
                        'outlet_id' => $bekasi ? $bekasi->id : $defaultId,
                        'no' => 2,
                        'unit_kerja' => 'CP Bekasi Utama',
                        'alamat' => 'Jl. Ahmad Yani No. 88, Bekasi, Jawa Barat',
                        'peruntukan' => 'Gedung Operasional & Logistik',
                        'aset_sap' => 'SAP-10102',
                        'no_shgb' => 'SHGB-88776/BKS',
                        'no_sertifikat' => 'SERT-33445',
                        'no_sertifikat_gabung' => 'GAB-778899',
                        'no_imb' => 'IMB-334455',
                        'nama_pemilik_imb' => 'PT Pegadaian',
                        'tgl_shgb_mulai' => '2016-11-01',
                        'tgl_shgb_berakhir' => '2036-11-01',
                        'tahun_perolehan' => 2016,
                        'luas_tanah_m2' => 3000.00,
                        'luas_pagar_m2' => 250.00,
                        'luas_bangunan_m2' => 1800.00,
                        'status' => 'Aktif',
                        'keterangan' => 'Aset tanah dan bangunan CP Bekasi Utama',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ],
                    [
                        'outlet_id' => $bogor ? $bogor->id : $defaultId,
                        'no' => 3,
                        'unit_kerja' => 'CP Bogor',
                        'alamat' => 'Jl. Pajajaran No. 15, Bogor, Jawa Barat',
                        'peruntukan' => 'Gedung Kantor & Pelayanan',
                        'aset_sap' => 'SAP-10103',
                        'no_shgb' => 'SHGB-55667/BGR',
                        'no_sertifikat' => 'SERT-11223',
                        'no_sertifikat_gabung' => 'GAB-112233',
                        'no_imb' => 'IMB-667788',
                        'nama_pemilik_imb' => 'PT Pegadaian',
                        'tgl_shgb_mulai' => '2014-06-20',
                        'tgl_shgb_berakhir' => '2034-06-20',
                        'tahun_perolehan' => 2014,
                        'luas_tanah_m2' => 1800.00,
                        'luas_pagar_m2' => 150.00,
                        'luas_bangunan_m2' => 1100.00,
                        'status' => 'Aktif',
                        'keterangan' => 'Aset tanah kantor operasional CP Bogor',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ],
                    [
                        'outlet_id' => $senen ? $senen->id : $defaultId,
                        'no' => 4,
                        'unit_kerja' => 'CP Pasar Senen',
                        'alamat' => 'Jl. Stasiun Senen No. 5, Jakarta Pusat',
                        'peruntukan' => 'Gedung Operasional Pasar Senen',
                        'aset_sap' => 'SAP-10104',
                        'no_shgb' => 'SHGB-44332/SNN',
                        'no_sertifikat' => 'SERT-55667',
                        'no_sertifikat_gabung' => 'GAB-889900',
                        'no_imb' => 'IMB-778899',
                        'nama_pemilik_imb' => 'PT Pegadaian',
                        'tgl_shgb_mulai' => '2013-09-10',
                        'tgl_shgb_berakhir' => '2033-09-10',
                        'tahun_perolehan' => 2013,
                        'luas_tanah_m2' => 1100.00,
                        'luas_pagar_m2' => 80.00,
                        'luas_bangunan_m2' => 650.00,
                        'status' => 'Aktif',
                        'keterangan' => 'Aset tanah operasional Pasar Senen',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ],
                    [
                        'outlet_id' => $salemba ? $salemba->id : $defaultId,
                        'no' => 5,
                        'unit_kerja' => 'CP Salemba',
                        'alamat' => 'Jl. Salemba Raya No. 42, Jakarta Pusat',
                        'peruntukan' => 'Gedung Operasional & Layanan',
                        'aset_sap' => 'SAP-10105',
                        'no_shgb' => 'SHGB-33221/SLM',
                        'no_sertifikat' => 'SERT-22334',
                        'no_sertifikat_gabung' => 'GAB-556677',
                        'no_imb' => 'IMB-889900',
                        'nama_pemilik_imb' => 'PT Pegadaian',
                        'tgl_shgb_mulai' => '2017-02-18',
                        'tgl_shgb_berakhir' => '2037-02-18',
                        'tahun_perolehan' => 2017,
                        'luas_tanah_m2' => 1350.00,
                        'luas_pagar_m2' => 110.00,
                        'luas_bangunan_m2' => 800.00,
                        'status' => 'Aktif',
                        'keterangan' => 'Lahan aset operasional CP Salemba',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ],
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No destructing action needed
    }
};
