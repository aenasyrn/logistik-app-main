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
        Schema::create('building_lands', function (Blueprint $table) {
            $table->id();
            $table->string('unit_kerja');
            $table->text('alamat')->nullable();
            $table->string('peruntukan')->nullable();
            $table->string('aset_sap')->nullable();
            $table->string('no_shgb')->nullable();
            $table->string('no_sertifikat')->nullable();
            $table->string('no_sertifikat_gabungan')->nullable();
            $table->string('no_imb')->nullable();
            $table->string('nama_pemilik_imb')->nullable();
            $table->date('tgl_mulai_shgb')->nullable();
            $table->date('tgl_berakhir_shgb')->nullable();
            $table->integer('tahun_perolehan')->nullable();
            $table->double('luas_tanah')->nullable();
            $table->double('luas_pagar')->nullable();
            $table->double('luas_bangunan')->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('building_lands');
    }
};
