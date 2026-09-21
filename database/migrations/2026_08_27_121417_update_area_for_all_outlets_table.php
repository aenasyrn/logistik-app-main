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
        $areaMap = [
            'AREA SENEN' => [
                'CP PETAMBURAN', 'CP SALEMBA', 'CP PASAR SENEN', 'CP PASAR BARU',
                'CP KEMAYORAN', 'CP KAMPUNG AMBON', 'CP CEMPAKA PUTIH', 'CP SUDIRMAN',
                'CP ITC CEMPAKA MAS', 'CPS KRAMAT RAYA'
            ],
            'AREA KRAMAT JATI' => [
                'CP JATINEGARA', 'CP PENGGILINGAN', 'CP KRAMAT JATI', 'CP RAWAMANGUN',
                'CP CIBUBUR', 'CP BUARAN', 'CP KEBON NANAS', 'CP KRANGGAN',
                'CP KOTA WISATA', 'CP PONDOK KELAPA', 'CPS DEWI SARTIKA'
            ],
            'AREA JATIWARINGIN' => [
                'CP PONDOK MELATI', 'CP PLAZA PONDOK GEDE', 'CP PONDOK UNGU', 'CP HARAPAN INDAH',
                'CP JATIWARINGIN', 'CP PONDOK BAMBU', 'CP PEKAYON', 'CP KRANJI',
                'CP KEMANG PRATAMA', 'CP GALAXI', 'CPS PLAZA THB'
            ],
            'AREA BEKASI' => [
                'CP BEKASI UTAMA', 'CP KARAWANG', 'CP RENGAS DENGKLOK', 'CP KALIMALANG',
                'CP TAMBUN', 'CP CIKARANG', 'CP BEKASI TIMUR', 'CP SETIA MEKAR',
                'CPS ISLAMIC CENTRE', 'CPS METRO BOULEVARD CIKARANG'
            ],
            'AREA BOGOR' => [
                'CP BOGOR', 'CP DEPOK', 'CP CIBINONG', 'CP PASAR MAWAR',
                'CP PANCORAN MAS', 'CP WARUNG JAMBU', 'CP KELAPA DUA', 'CP KEDUNGHALANG',
                'CP GUNUNG BATU', 'CP BOJONGSARI', 'CP CISALAK', 'CPS MARGONDA',
                'CPS BOGOR BARU', 'CP BOGOR 1', 'CP BOGOR 2', 'CP DEPOK 1',
                'CP DEPOK 2', 'CPS METRO BOU CKR'
            ]
        ];

        foreach ($areaMap as $areaName => $cps) {
            \Illuminate\Support\Facades\DB::table('outlets')
                ->whereIn('nama', $cps)
                ->orWhereIn('cabang', $cps)
                ->update(['area' => $areaName]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reverse operation needed for updating data
    }
};
