<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        \Illuminate\Support\Facades\DB::statement("SET sql_mode = ''");
        Schema::table('renovasi', function (Blueprint $table) {
            $table->decimal('pajak_pph', 18, 2)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::statement("SET sql_mode = ''");
        Schema::table('renovasi', function (Blueprint $table) {
            $table->decimal('pajak_pph', 6, 3)->nullable()->change();
        });
    }
};
