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
        Schema::create('menu_sewa', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('outlet_id')->nullable();
            $table->string('kode_outlet')->nullable();
            $table->string('nama_outlet')->nullable();
            $table->string('type_outlet')->nullable();
            $table->string('type_bangunan')->nullable();
            $table->string('jenis_sto')->nullable();
            $table->string('status_gedung')->nullable();
            $table->string('periode_sewa')->nullable();
            $table->date('tgl_kontrak_mulai')->nullable();
            $table->date('tgl_kontrak_berakhir')->nullable();
            $table->unsignedBigInteger('harga_sewa')->nullable();
            $table->text('keterangan')->nullable();
            $table->text('alamat')->nullable();
            $table->string('kelurahan')->nullable();
            $table->string('kecamatan')->nullable();
            $table->string('kab_kota')->nullable();
            $table->string('provinsi')->nullable();
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_sewa');
    }
};
