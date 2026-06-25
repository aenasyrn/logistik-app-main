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
        Schema::create('building_gedungs', function (Blueprint $table) {
            $table->id();
            $table->string('nama_gedung');
            $table->string('lokasi')->nullable();
            $table->double('luas_bangunan')->nullable(); // in m2
            $table->integer('jumlah_lantai')->nullable();
            $table->string('kondisi')->default('BAIK'); // BAIK, RUSAK RINGAN, RUSAK BERAT
            $table->text('deskripsi')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('building_gedungs');
    }
};
