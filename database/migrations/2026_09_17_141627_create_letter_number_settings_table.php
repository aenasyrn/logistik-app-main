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
        Schema::create('letter_number_settings', function (Blueprint $table) {
            $table->id();
            $table->string('letter_type')->unique(); // serah_terima_keluar, serah_terima_masuk, spk, sopp
            $table->string('mode')->default('otomatis'); // otomatis, reset_manual, manual
            $table->integer('current_number')->default(0);
            $table->integer('manual_start_number')->nullable();
            $table->integer('last_reset_year')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('letter_number_settings');
    }
};
