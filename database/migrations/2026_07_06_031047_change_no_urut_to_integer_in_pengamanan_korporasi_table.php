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
        // Ensure no_urut has only integer values before changing type
        \Illuminate\Support\Facades\DB::statement("UPDATE pengamanan_korporasi SET no_urut = '0' WHERE no_urut IS NULL OR no_urut = '' OR no_urut NOT REGEXP '^[0-9]+$'");

        Schema::table('pengamanan_korporasi', function (Blueprint $table) {
            $table->unsignedInteger('no_urut')->nullable()->change();
            $table->index('no_urut');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengamanan_korporasi', function (Blueprint $table) {
            $table->dropIndex(['no_urut']);
            $table->string('no_urut')->nullable()->change();
        });
    }
};
