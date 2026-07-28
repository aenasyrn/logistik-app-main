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
        Schema::table('menu_sewa', function (Blueprint $table) {
            $table->string('periode_sewa')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menu_sewa', function (Blueprint $table) {
            $table->integer('periode_sewa')->nullable()->change();
        });
    }
};
