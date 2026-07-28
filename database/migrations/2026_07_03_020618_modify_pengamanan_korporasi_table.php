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
        // 1. Delete the header row if it exists
        if (Schema::hasTable('pengamanan_korporasi') && Schema::hasColumn('pengamanan_korporasi', 'COL 2')) {
            DB::table('pengamanan_korporasi')
                ->where('COL 2', 'Kantor Wilayah')
                ->delete();
        }

        // 2. Add id primary key and rename columns
        Schema::table('pengamanan_korporasi', function (Blueprint $table) {
            // Check if 'id' already exists before adding
            if (!Schema::hasColumn('pengamanan_korporasi', 'id')) {
                $table->id()->first();
            }

            if (Schema::hasColumn('pengamanan_korporasi', 'COL 1')) {
                $table->renameColumn('COL 1', 'no_urut');
            }
            if (Schema::hasColumn('pengamanan_korporasi', 'COL 2')) {
                $table->renameColumn('COL 2', 'kantor_wilayah');
            }
            if (Schema::hasColumn('pengamanan_korporasi', 'COL 3')) {
                $table->renameColumn('COL 3', 'kantor_area');
            }
            if (Schema::hasColumn('pengamanan_korporasi', 'COL 4')) {
                $table->renameColumn('COL 4', 'kantor_cabang');
            }
            if (Schema::hasColumn('pengamanan_korporasi', 'COL 5')) {
                $table->renameColumn('COL 5', 'kode_unit_kerja');
            }
            if (Schema::hasColumn('pengamanan_korporasi', 'COL 6')) {
                $table->renameColumn('COL 6', 'nama_unit_kerja');
            }
            if (Schema::hasColumn('pengamanan_korporasi', 'COL 7')) {
                $table->renameColumn('COL 7', 'status');
            }
            if (Schema::hasColumn('pengamanan_korporasi', 'COL 8')) {
                $table->renameColumn('COL 8', 'vendor');
            }
            if (Schema::hasColumn('pengamanan_korporasi', 'COL 9')) {
                $table->renameColumn('COL 9', 'jumlah_kamera');
            }
            if (Schema::hasColumn('pengamanan_korporasi', 'COL 10')) {
                $table->renameColumn('COL 10', 'aplikasi');
            }
            if (Schema::hasColumn('pengamanan_korporasi', 'COL 11')) {
                $table->renameColumn('COL 11', 'nama_aplikasi');
            }
            if (Schema::hasColumn('pengamanan_korporasi', 'COL 12')) {
                $table->renameColumn('COL 12', 'keterangan');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengamanan_korporasi', function (Blueprint $table) {
            if (Schema::hasColumn('pengamanan_korporasi', 'id')) {
                $table->dropColumn('id');
            }

            if (Schema::hasColumn('pengamanan_korporasi', 'no_urut')) {
                $table->renameColumn('no_urut', 'COL 1');
            }
            if (Schema::hasColumn('pengamanan_korporasi', 'kantor_wilayah')) {
                $table->renameColumn('kantor_wilayah', 'COL 2');
            }
            if (Schema::hasColumn('pengamanan_korporasi', 'kantor_area')) {
                $table->renameColumn('kantor_area', 'COL 3');
            }
            if (Schema::hasColumn('pengamanan_korporasi', 'kantor_cabang')) {
                $table->renameColumn('kantor_cabang', 'COL 4');
            }
            if (Schema::hasColumn('pengamanan_korporasi', 'kode_unit_kerja')) {
                $table->renameColumn('kode_unit_kerja', 'COL 5');
            }
            if (Schema::hasColumn('pengamanan_korporasi', 'nama_unit_kerja')) {
                $table->renameColumn('nama_unit_kerja', 'COL 6');
            }
            if (Schema::hasColumn('pengamanan_korporasi', 'status')) {
                $table->renameColumn('status', 'COL 7');
            }
            if (Schema::hasColumn('pengamanan_korporasi', 'vendor')) {
                $table->renameColumn('vendor', 'COL 8');
            }
            if (Schema::hasColumn('pengamanan_korporasi', 'jumlah_kamera')) {
                $table->renameColumn('jumlah_kamera', 'COL 9');
            }
            if (Schema::hasColumn('pengamanan_korporasi', 'aplikasi')) {
                $table->renameColumn('aplikasi', 'COL 10');
            }
            if (Schema::hasColumn('pengamanan_korporasi', 'nama_aplikasi')) {
                $table->renameColumn('nama_aplikasi', 'COL 11');
            }
            if (Schema::hasColumn('pengamanan_korporasi', 'keterangan')) {
                $table->renameColumn('keterangan', 'COL 12');
            }
        });
    }
};
