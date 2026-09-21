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
        Schema::table('printers', function (Blueprint $table) {
            if (!Schema::hasColumn('printers', 'inventory_id')) {
                $table->unsignedBigInteger('inventory_id')->nullable()->after('outlet_id');
                $table->index('inventory_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('printers', function (Blueprint $table) {
            if (Schema::hasColumn('printers', 'inventory_id')) {
                $table->dropIndex(['inventory_id']);
                $table->dropColumn('inventory_id');
            }
        });
    }
};
