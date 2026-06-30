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
        // 1. Create aset_tanah if it doesn't exist (e.g. on new installations)
        if (!Schema::hasTable('aset_tanah')) {
            Schema::create('aset_tanah', function (Blueprint $table) {
                $table->id();
                $table->integer('no')->nullable();
                $table->string('unit_kerja', 100)->nullable();
                $table->text('alamat')->nullable();
                $table->string('peruntukan', 100)->nullable();
                $table->string('aset_sap', 50)->nullable();
                $table->string('no_shgb', 50)->nullable();
                $table->string('no_sertifikat', 100)->nullable();
                $table->string('no_sertifikat_gabung', 100)->nullable();
                $table->string('no_imb', 100)->nullable();
                $table->string('nama_pemilik_imb', 150)->nullable();
                $table->date('tgl_shgb_mulai')->nullable();
                $table->date('tgl_shgb_berakhir')->nullable();
                $table->year('tahun_perolehan')->nullable();
                $table->decimal('luas_tanah_m2', 10, 2)->nullable();
                $table->decimal('luas_pagar_m2', 10, 2)->nullable();
                $table->decimal('luas_bangunan_m2', 10, 2)->nullable();
                $table->text('keterangan')->nullable();
                $table->timestamps();
            });
        }

        // 2. Drop building_lands safely
        Schema::dropIfExists('building_lands');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Down migration can restore building_lands if needed, but since it was dummy data we leave it simple
        if (!Schema::hasTable('building_lands')) {
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
    }
};
