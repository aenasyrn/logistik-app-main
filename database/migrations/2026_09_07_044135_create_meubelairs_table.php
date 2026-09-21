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
        Schema::create('meubelairs', function (Blueprint $table) {
            $table->id();
            $table->string('kategori')->index(); // 'meja', 'kursi', 'lemari'
            $table->string('jenis'); // Jenis Meja / Kursi / Lemari
            $table->integer('quantity')->default(1);
            $table->foreignId('outlet_id')->nullable()->constrained('outlets')->nullOnDelete();
            $table->string('lokasi')->nullable();
            $table->string('kondisi')->default('BAIK'); // BAIK, RUSAK RINGAN, RUSAK BERAT, dll
            $table->string('status')->default('Inventaris'); // Inventaris, Sewa, dll
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meubelairs');
    }
};
