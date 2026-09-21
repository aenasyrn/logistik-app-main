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
        Schema::table('vendors', function (Blueprint $table) {
            if (!Schema::hasColumn('vendors', 'pimpinan')) {
                $table->string('pimpinan')->nullable()->after('nama');
            }
            if (!Schema::hasColumn('vendors', 'bidang')) {
                $table->string('bidang')->nullable()->after('pimpinan');
            }
            if (!Schema::hasColumn('vendors', 'kota')) {
                $table->string('kota')->nullable()->after('bidang');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            if (Schema::hasColumn('vendors', 'pimpinan')) {
                $table->dropColumn('pimpinan');
            }
            if (Schema::hasColumn('vendors', 'bidang')) {
                $table->dropColumn('bidang');
            }
            if (Schema::hasColumn('vendors', 'kota')) {
                $table->dropColumn('kota');
            }
        });
    }
};
