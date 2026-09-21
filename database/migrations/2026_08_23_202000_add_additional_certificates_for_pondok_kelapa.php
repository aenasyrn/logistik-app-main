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
            $existing = DB::table('aset_tanah')
                ->where('unit_kerja', 'like', '%Pondok Kelapa%')
                ->first();

            if ($existing) {
                $count = DB::table('aset_tanah')
                    ->where('unit_kerja', 'like', '%Pondok Kelapa%')
                    ->count();

                if ($count < 3) {
                    $now = now();
                    DB::table('aset_tanah')->insert([
                        [
                            'outlet_id' => $existing->outlet_id,
                            'no' => $existing->no,
                            'unit_kerja' => $existing->unit_kerja,
                            'alamat' => $existing->alamat,
                            'peruntukan' => 'Gedung Operasional & Layanan Tambahan',
                            'aset_sap' => $existing->aset_sap,
                            'no_shgb' => 'HGB NO.9113 AF977721',
                            'no_sertifikat' => '09.05.01.08.3.09113',
                            'no_sertifikat_gabung' => $existing->no_sertifikat_gabung,
                            'no_imb' => '11884/8.1/31.75.00.000/-1.785.51/2015',
                            'nama_pemilik_imb' => $existing->nama_pemilik_imb,
                            'tgl_shgb_mulai' => '2017-08-15',
                            'tgl_shgb_berakhir' => '2037-08-15',
                            'tahun_perolehan' => 2017,
                            'luas_tanah_m2' => 850.00,
                            'luas_pagar_m2' => 80.00,
                            'luas_bangunan_m2' => 500.00,
                            'status' => 'Aktif',
                            'keterangan' => 'Sertifikat Lahan Tambahan 1 CP Pondok Kelapa',
                            'created_at' => $now,
                            'updated_at' => $now,
                        ],
                        [
                            'outlet_id' => $existing->outlet_id,
                            'no' => $existing->no,
                            'unit_kerja' => $existing->unit_kerja,
                            'alamat' => $existing->alamat,
                            'peruntukan' => 'Lahan Parkir & Fasilitas',
                            'aset_sap' => $existing->aset_sap,
                            'no_shgb' => 'HGB NO.9114 AF977722',
                            'no_sertifikat' => '09.05.01.08.3.09114',
                            'no_sertifikat_gabung' => $existing->no_sertifikat_gabung,
                            'no_imb' => '11885/8.1/31.75.00.000/-1.785.51/2015',
                            'nama_pemilik_imb' => $existing->nama_pemilik_imb,
                            'tgl_shgb_mulai' => '2019-01-10',
                            'tgl_shgb_berakhir' => '2039-01-10',
                            'tahun_perolehan' => 2019,
                            'luas_tanah_m2' => 600.00,
                            'luas_pagar_m2' => 60.00,
                            'luas_bangunan_m2' => 0.00,
                            'status' => 'Aktif',
                            'keterangan' => 'Sertifikat Lahan Tambahan 2 CP Pondok Kelapa',
                            'created_at' => $now,
                            'updated_at' => $now,
                        ],
                    ]);
                }
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
