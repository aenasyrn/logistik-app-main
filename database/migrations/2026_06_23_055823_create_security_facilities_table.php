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
        Schema::create('security_facilities', function (Blueprint $table) {
            $table->id();
            $table->string('nama_fasilitas');
            $table->string('lokasi')->nullable();
            $table->string('jenis')->nullable(); // CCTV, Pagar, Pos Satpam, Alrm
            $table->integer('jumlah')->default(1);
            $table->string('kondisi')->default('BAIK'); // BAIK, RUSAK
            $table->text('deskripsi')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('security_facilities');
    }
};
