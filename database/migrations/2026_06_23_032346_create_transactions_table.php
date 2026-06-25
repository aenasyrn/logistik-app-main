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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_surat')->nullable();
            $table->date('tanggal');
            $table->string('jenis_transaksi'); // Barang Masuk, Barang Keluar
            $table->string('penerima_nama')->nullable();
            $table->string('penerima_jabatan')->nullable();
            $table->string('penerima_instansi')->nullable();
            $table->string('pengirim_nama')->nullable();
            $table->string('pengirim_jabatan')->nullable();
            $table->string('pengirim_instansi')->nullable();
            $table->string('mengetahui_nama')->nullable();
            $table->string('mengetahui_jabatan')->nullable();
            $table->string('lokasi')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
