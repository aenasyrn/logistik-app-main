<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('renovasi', function (Blueprint $table) {
            $table->enum('status_gedung', ['Milik Sendiri', 'Sewa'])->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('renovasi', function (Blueprint $table) {
            $table->enum('status_gedung', ['Milik Sendiri', 'Sewa'])->nullable(false)->change();
        });
    }
};
