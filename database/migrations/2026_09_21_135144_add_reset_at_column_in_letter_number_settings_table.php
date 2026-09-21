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
        Schema::table('letter_number_settings', function (Blueprint $table) {
            $table->timestamp('reset_at')->nullable()->after('last_reset_year');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('letter_number_settings', function (Blueprint $table) {
            $table->dropColumn('reset_at');
        });
    }
};
