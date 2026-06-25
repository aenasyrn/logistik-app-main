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
        Schema::create('printers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('outlet_id')->nullable()->constrained('outlets')->nullOnDelete();
            $table->string('outlet')->nullable(); // backup text
            $table->string('produk')->nullable();
            $table->string('sn')->nullable(); // serial number
            $table->date('tanggal_mulai')->nullable();
            $table->date('tanggal_selesai')->nullable();
            $table->string('penyedia')->nullable();
            $table->string('status')->default('Inventaris'); // Sewa Berjalan, Inventaris, Sewa Habis
            $table->string('kondisi')->default('BAIK'); // BAIK, KURANG BAIK, dll
            $table->text('deskripsi')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('printers');
    }
};
