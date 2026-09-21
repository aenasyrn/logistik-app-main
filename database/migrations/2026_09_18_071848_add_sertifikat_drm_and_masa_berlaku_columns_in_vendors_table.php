<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            if (!Schema::hasColumn('vendors', 'sertifikat_drm')) {
                $table->string('sertifikat_drm')->nullable()->after('bidang');
            }
            if (!Schema::hasColumn('vendors', 'tgl_awal_drm')) {
                $table->date('tgl_awal_drm')->nullable()->after('sertifikat_drm');
            }
            if (!Schema::hasColumn('vendors', 'tgl_akhir_drm')) {
                $table->date('tgl_akhir_drm')->nullable()->after('tgl_awal_drm');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            if (Schema::hasColumn('vendors', 'tgl_akhir_drm')) {
                $table->dropColumn('tgl_akhir_drm');
            }
            if (Schema::hasColumn('vendors', 'tgl_awal_drm')) {
                $table->dropColumn('tgl_awal_drm');
            }
            if (Schema::hasColumn('vendors', 'sertifikat_drm')) {
                $table->dropColumn('sertifikat_drm');
            }
        });
    }
};
