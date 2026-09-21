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
        // 1. Exact match on nama or code
        \Illuminate\Support\Facades\DB::statement("
            UPDATE computers c
            JOIN outlets o ON (UPPER(TRIM(c.outlet)) = UPPER(TRIM(o.nama)) OR UPPER(TRIM(c.outlet)) = UPPER(TRIM(o.code)))
            SET c.outlet_id = o.id
            WHERE c.outlet_id IS NULL
        ");

        // 2. Specific aliases for known naming variants
        $aliases = [
            'UPC CIRACAS' => 12546,
            'UPS PSJAYA CEMPAKA PUTIH' => 60140,
            'UPC PULOGEBANG' => 12354,
            'UPC KOMPLEKS TIMAH' => 12589,
            'UPC BOJONG RAWALUMBU' => 12632,
            'UPC SUDIRMAN BOGOR' => 12565,
        ];

        foreach ($aliases as $aliasName => $outletId) {
            \Illuminate\Support\Facades\DB::table('computers')
                ->where('outlet', $aliasName)
                ->whereNull('outlet_id')
                ->update(['outlet_id' => $outletId]);
        }

        // 3. Prefix matching for any remaining
        \Illuminate\Support\Facades\DB::statement("
            UPDATE computers c
            JOIN outlets o ON (
                UPPER(TRIM(o.nama)) LIKE CONCAT(UPPER(TRIM(c.outlet)), '%')
                OR UPPER(TRIM(c.outlet)) LIKE CONCAT(UPPER(TRIM(o.nama)), '%')
            )
            SET c.outlet_id = o.id
            WHERE c.outlet_id IS NULL AND c.outlet IS NOT NULL AND c.outlet != '#N/A'
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No destructive reversal needed
    }
};
