<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Table outlet_areas
        Schema::create('outlet_areas', function (Blueprint $table) {
            $table->id();
            $table->string('nama')->unique();
            $table->timestamps();
        });

        // 2. Table outlet_cabangs
        Schema::create('outlet_cabangs', function (Blueprint $table) {
            $table->id();
            $table->string('area_nama');
            $table->string('nama');
            $table->timestamps();

            $table->index('area_nama');
        });

        // 3. Seed initial predefined areas and cabangs
        $now = now();
        $predefined = [
            "AREA SENEN" => [
                "CP PETAMBURAN",
                "CP SALEMBA",
                "CP PASAR SENEN",
                "CP PASAR BARU",
                "CP KEMAYORAN",
                "CP KAMPUNG AMBON",
                "CP CEMPAKA PUTIH",
                "CP SUDIRMAN",
                "CP ITC CEMPAKA MAS",
                "CPS KRAMAT RAYA",
            ],
            "AREA KRAMAT JATI" => [
                "CP JATINEGARA",
                "CP PENGGILINGAN",
                "CP KRAMAT JATI",
                "CP RAWAMANGUN",
                "CP CIBUBUR",
                "CP BUARAN",
                "CP KEBON NANAS",
                "CP KRANGGAN",
                "CP KOTA WISATA",
                "CP PONDOK KELAPA",
                "CPS DEWI SARTIKA",
            ],
            "AREA JATIWARINGIN" => [
                "CP PONDOK MELATI",
                "CP PLAZA PONDOK GEDE",
                "CP PONDOK UNGU",
                "CP HARAPAN INDAH",
                "CP JATIWARINGIN",
                "CP PONDOK BAMBU",
                "CP PEKAYON",
                "CP KRANJI",
                "CP KEMANG PRATAMA",
                "CP GALAXI",
                "CPS PLAZA THB",
            ],
            "AREA BEKASI" => [
                "CP BEKASI UTAMA",
                "CP KARAWANG",
                "CP RENGAS DENGKLOK",
                "CP KALIMALANG",
                "CP TAMBUN",
                "CP CIKARANG",
                "CP BEKASI TIMUR",
                "CP SETIA MEKAR",
                "CPS ISLAMIC CENTRE",
                "CPS METRO BOULEVARD CIKARANG",
            ],
            "AREA BOGOR" => [
                "CP BOGOR",
                "CP DEPOK",
                "CP CIBINONG",
                "CP PASAR MAWAR",
                "CP PANCORAN MAS",
                "CP WARUNG JAMBU",
                "CP KELAPA DUA",
                "CP KEDUNGHALANG",
                "CP GUNUNG BATU",
                "CP BOJONGSARI",
                "CP CISALAK",
                "CPS MARGONDA",
                "CPS BOGOR BARU",
                "CP BOGOR 1",
                "CP BOGOR 2",
                "CP DEPOK 1",
                "CP DEPOK 2",
                "CPS METRO BOU CKR",
            ],
        ];

        // Also check if any other area exists in outlets table
        $existingAreas = DB::table('outlets')
            ->whereNotNull('area')
            ->where('area', '!=', '')
            ->distinct()
            ->pluck('area')
            ->toArray();

        foreach ($existingAreas as $eArea) {
            $upper = strtoupper(trim($eArea));
            if (!isset($predefined[$upper])) {
                $predefined[$upper] = [];
            }
        }

        foreach ($predefined as $areaNama => $cabangs) {
            DB::table('outlet_areas')->insertOrIgnore([
                'nama' => $areaNama,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            foreach ($cabangs as $cabangNama) {
                DB::table('outlet_cabangs')->insertOrIgnore([
                    'area_nama' => $areaNama,
                    'nama' => $cabangNama,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        // Also seed any existing cabangs from outlets table if not already added
        $existingRows = DB::table('outlets')
            ->whereNotNull('area')
            ->whereNotNull('cabang')
            ->where('cabang', '!=', '')
            ->select('area', 'cabang')
            ->distinct()
            ->get();

        foreach ($existingRows as $row) {
            $aName = strtoupper(trim($row->area));
            $cName = strtoupper(trim($row->cabang));
            if ($aName && $cName) {
                $already = DB::table('outlet_cabangs')
                    ->where('area_nama', $aName)
                    ->where('nama', $cName)
                    ->exists();
                if (!$already) {
                    DB::table('outlet_cabangs')->insert([
                        'area_nama' => $aName,
                        'nama' => $cName,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('outlet_cabangs');
        Schema::dropIfExists('outlet_areas');
    }
};
