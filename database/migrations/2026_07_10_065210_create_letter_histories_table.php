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
        Schema::create('letter_histories', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_surat')->index();
            $table->date('tanggal')->nullable();
            $table->string('tipe_surat');
            $table->string('penerima')->nullable();
            $table->text('uraian')->nullable();
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
        Schema::dropIfExists('letter_histories');
    }
};
