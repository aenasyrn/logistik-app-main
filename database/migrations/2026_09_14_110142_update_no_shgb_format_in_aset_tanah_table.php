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
        Schema::table('aset_tanah', function (Blueprint $table) {
            $table->string('no_shgb', 255)->nullable()->change();
        });

        $records = \Illuminate\Support\Facades\DB::table('aset_tanah')->get();
        foreach ($records as $record) {
            $cert = trim($record->no_sertifikat ?? '');
            $shgb = trim($record->no_shgb ?? '');

            if (empty($shgb)) {
                continue;
            }

            $newShgb = null;

            if (stripos($shgb, 'HGB') !== false) {
                // Check if it's formatted like "HGB NO.17776 ABP808368" (space separated)
                if (preg_match('/^(HGB\s*NO\.?\s*\d+)\s+([A-Z0-9]+)$/i', $shgb, $m)) {
                    $newShgb = "{$m[1]}\n{$m[2]}";
                }
            } else {
                // Extract HGB number from cert (e.g. "09.01.05.06.3.00781" -> "781")
                if (preg_match('/\.(\d+)$/', $cert, $m)) {
                    $hgbNum = ltrim($m[1], '0');
                    if ($hgbNum !== '') {
                        $newShgb = "HGB NO.{$hgbNum}\n{$shgb}";
                    }
                }
            }

            if ($newShgb && $newShgb !== $shgb) {
                \Illuminate\Support\Facades\DB::table('aset_tanah')
                    ->where('id', $record->id)
                    ->update(['no_shgb' => $newShgb]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No down action required
    }
};
