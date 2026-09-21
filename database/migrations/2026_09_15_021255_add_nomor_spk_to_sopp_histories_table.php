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
        Schema::table('sopp_histories', function (Blueprint $table) {
            $table->string('nomor_spk')->nullable()->after('nomor_sopp')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sopp_histories', function (Blueprint $table) {
            $table->dropColumn('nomor_spk');
        });
    }
};
