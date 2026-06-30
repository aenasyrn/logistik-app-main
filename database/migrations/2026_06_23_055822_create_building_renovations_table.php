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
        Schema::create('renovasi', function (Blueprint $table) {
            $table->id();
            $table->string('no_memo')->nullable();
            $table->date('tgl_memo')->nullable();
            $table->string('nama_pekerjaan');
            $table->decimal('nilai_pembayaran', 5, 4)->nullable();
            $table->string('nama_outlet')->nullable();
            $table->string('cabang')->nullable();
            $table->string('norek')->nullable();
            $table->string('bank')->nullable();
            $table->string('pelaksana_pekerjaan')->nullable();
            $table->date('tgl_tagihan')->nullable();
            $table->unsignedBigInteger('nilai_spk_pelaksanaan')->nullable();
            $table->unsignedBigInteger('nilai_addendum_spk')->nullable();
            $table->date('tgl_spk')->nullable();
            $table->string('no_spk')->nullable();
            $table->unsignedBigInteger('pajak_pph')->nullable();
            $table->date('tgl_bap_bast')->nullable();

            // Subbab Nilai Tagihan
            $table->unsignedBigInteger('tagihan_nilai')->nullable();
            $table->unsignedBigInteger('tagihan_dpp')->nullable();
            $table->unsignedBigInteger('tagihan_ppn')->nullable();
            $table->unsignedBigInteger('tagihan_pph')->nullable();
            $table->unsignedBigInteger('tagihan_retensi')->nullable();
            $table->unsignedBigInteger('tagihan_transfer')->nullable();

            // Subbab Retensi 5%
            $table->unsignedBigInteger('retensi_nilai')->nullable();
            $table->unsignedBigInteger('retensi_dpp')->nullable();
            $table->unsignedBigInteger('retensi_ppn')->nullable();
            $table->unsignedBigInteger('retensi_pph')->nullable();
            $table->unsignedBigInteger('retensi_transfer')->nullable();

            $table->string('status')->default('Dalam Proses')->nullable();
            $table->text('deskripsi')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('renovasi');
    }
};
