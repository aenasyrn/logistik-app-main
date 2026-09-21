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
        Schema::table('meubelairs', function (Blueprint $table) {
            if (Schema::hasColumn('meubelairs', 'status')) {
                $table->dropColumn('status');
            }
            if (!Schema::hasColumn('meubelairs', 'tanggal_register')) {
                $table->date('tanggal_register')->nullable()->after('kondisi');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('meubelairs', function (Blueprint $table) {
            if (Schema::hasColumn('meubelairs', 'tanggal_register')) {
                $table->dropColumn('tanggal_register');
            }
            if (!Schema::hasColumn('meubelairs', 'status')) {
                $table->string('status')->default('Inventaris')->after('kondisi');
            }
        });
    }
};
