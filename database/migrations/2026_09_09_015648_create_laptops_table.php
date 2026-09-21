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
        Schema::create('laptops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_id')->nullable()->constrained('inventories')->nullOnDelete();
            $table->string('nik_pegawai')->nullable();
            $table->string('nama_pengguna')->nullable();
            $table->string('jabatan')->nullable();
            $table->string('departemen')->nullable();
            $table->string('produk')->nullable();
            $table->string('hostname')->nullable();
            $table->string('sn')->nullable();
            $table->string('os')->default('Windows');
            $table->string('kondisi')->default('BAIK');
            $table->string('penyedia')->nullable();
            $table->date('tanggal_mulai')->nullable();
            $table->date('tanggal_selesai')->nullable();
            $table->integer('masa_sewa_bulan')->nullable();
            $table->string('status')->default('Inventaris');
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laptops');
    }
};
