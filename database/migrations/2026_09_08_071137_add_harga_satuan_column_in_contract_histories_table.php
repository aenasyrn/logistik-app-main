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
        Schema::table('contract_histories', function (Blueprint $table) {
            $table->bigInteger('harga_satuan')->nullable()->after('biaya');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contract_histories', function (Blueprint $table) {
            $table->dropColumn('harga_satuan');
        });
    }
};
