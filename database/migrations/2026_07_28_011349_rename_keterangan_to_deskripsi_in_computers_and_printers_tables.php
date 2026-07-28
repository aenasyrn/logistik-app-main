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
        if (Schema::hasColumn('computers', 'keterangan')) {
            Schema::table('computers', function (Blueprint $table) {
                $table->renameColumn('keterangan', 'deskripsi');
            });
        } elseif (!Schema::hasColumn('computers', 'deskripsi')) {
            Schema::table('computers', function (Blueprint $table) {
                $table->text('deskripsi')->nullable();
            });
        }

        if (Schema::hasColumn('printers', 'keterangan')) {
            Schema::table('printers', function (Blueprint $table) {
                $table->renameColumn('keterangan', 'deskripsi');
            });
        } elseif (!Schema::hasColumn('printers', 'deskripsi')) {
            Schema::table('printers', function (Blueprint $table) {
                $table->text('deskripsi')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('computers', 'deskripsi')) {
            Schema::table('computers', function (Blueprint $table) {
                $table->renameColumn('deskripsi', 'keterangan');
            });
        }

        if (Schema::hasColumn('printers', 'deskripsi')) {
            Schema::table('printers', function (Blueprint $table) {
                $table->renameColumn('deskripsi', 'keterangan');
            });
        }
    }
};
