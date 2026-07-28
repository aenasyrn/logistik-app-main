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
        Schema::dropIfExists('letter_histories');

        Schema::create('spk_histories', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_spk')->index();
            $table->date('tanggal')->nullable();
            $table->string('perusahaan')->nullable();
            $table->text('uraian')->nullable();
            $table->string('jumlah')->nullable();
            $table->json('content');
            $table->timestamps();
        });

        Schema::create('sopp_histories', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_sopp')->index();
            $table->date('tanggal')->nullable();
            $table->string('tipe_sopp'); // 'sewa' or 'pengadaan'
            $table->string('dibayarkan_kepada')->nullable();
            $table->string('jumlah')->nullable();
            $table->json('content');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spk_histories');
        Schema::dropIfExists('sopp_histories');
    }
};
