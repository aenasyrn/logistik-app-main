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
        $senenCps = [
            'CP PETAMBURAN',
            'CP SALEMBA',
            'CP PASAR SENEN',
            'CP PASAR BARU',
            'CP KEMAYORAN',
            'CP CEMPAKA PUTIH',
            'CP SUDIRMAN',
            'CP ITC CEMPAKA MAS',
            'CPS KRAMAT RAYA',
        ];

        \Illuminate\Support\Facades\DB::table('outlets')
            ->whereIn('nama', $senenCps)
            ->orWhereIn('cabang', $senenCps)
            ->update(['area' => 'AREA SENEN']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reverse operation needed for updating data
    }
};
