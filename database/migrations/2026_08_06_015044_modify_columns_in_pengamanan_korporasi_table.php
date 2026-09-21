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
        Schema::table('pengamanan_korporasi', function (Blueprint $table) {
            $table->string('kantor_wilayah', 50)->nullable()->change();
            $table->string('kantor_area', 50)->nullable()->change();
            $table->string('kantor_cabang', 50)->nullable()->change();
            $table->string('kode_unit_kerja', 50)->nullable()->change();
            $table->string('nama_unit_kerja', 50)->change();
            $table->string('status', 50)->nullable()->change();
            $table->string('vendor', 50)->nullable()->change();
            $table->string('jumlah_kamera', 50)->nullable()->change();
            $table->string('aplikasi', 50)->nullable()->change();
            $table->string('nama_aplikasi', 50)->nullable()->change();
            $table->text('keterangan')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengamanan_korporasi', function (Blueprint $table) {
            $table->string('kantor_wilayah', 16)->nullable()->change();
            $table->string('kantor_area', 17)->nullable()->change();
            $table->string('kantor_cabang', 28)->nullable()->change();
            $table->string('kode_unit_kerja', 15)->nullable()->change();
            $table->string('nama_unit_kerja', 40)->change();
            $table->string('status', 7)->nullable()->change();
            $table->string('vendor', 23)->nullable()->change();
            $table->string('jumlah_kamera', 13)->nullable()->change();
            $table->string('aplikasi', 10)->nullable()->change();
            $table->string('nama_aplikasi', 13)->nullable()->change();
            $table->string('keterangan', 102)->nullable()->change();
        });
    }
};
