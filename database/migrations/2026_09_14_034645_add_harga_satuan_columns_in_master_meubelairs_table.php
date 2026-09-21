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
        Schema::table('master_meubelairs', function (Blueprint $table) {
            if (!Schema::hasColumn('master_meubelairs', 'harga_satuan')) {
                $table->unsignedBigInteger('harga_satuan')->default(0)->after('tanggal_registrasi');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('master_meubelairs', function (Blueprint $table) {
            if (Schema::hasColumn('master_meubelairs', 'harga_satuan')) {
                $table->dropColumn('harga_satuan');
            }
        });
    }
};
