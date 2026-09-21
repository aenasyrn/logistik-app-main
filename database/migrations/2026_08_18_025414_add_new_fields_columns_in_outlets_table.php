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
        Schema::table('outlets', function (Blueprint $table) {
            if (!Schema::hasColumn('outlets', 'type_outlet')) {
                $table->string('type_outlet')->nullable()->after('nama');
            }
            if (!Schema::hasColumn('outlets', 'type_bangunan')) {
                $table->string('type_bangunan')->nullable()->after('type_outlet');
            }
            if (!Schema::hasColumn('outlets', 'status_gedung')) {
                $table->string('status_gedung')->nullable()->after('type_bangunan');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('outlets', function (Blueprint $table) {
            if (Schema::hasColumn('outlets', 'type_outlet')) {
                $table->dropColumn('type_outlet');
            }
            if (Schema::hasColumn('outlets', 'type_bangunan')) {
                $table->dropColumn('type_bangunan');
            }
            if (Schema::hasColumn('outlets', 'status_gedung')) {
                $table->dropColumn('status_gedung');
            }
        });
    }
};
