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
        // Set short timeout to avoid hanging if the table is locked
        DB::statement('SET session lock_wait_timeout = 5');

        // 1. Add column as nullable
        Schema::table('pengamanan_korporasi', function (Blueprint $table) {
            if (!Schema::hasColumn('pengamanan_korporasi', 'outlet_id')) {
                $table->unsignedBigInteger('outlet_id')->nullable()->after('id');
            }
        });


        // 2. Fetch unique outlet names/codes from pengamanan_korporasi
        $uniqueFacilities = DB::table('pengamanan_korporasi')
            ->whereNotNull('nama_unit_kerja')
            ->where('nama_unit_kerja', '<>', '')
            ->select('nama_unit_kerja', 'kode_unit_kerja', 'kantor_cabang')
            ->get()
            ->unique('nama_unit_kerja');

        // 3. Fetch existing outlets by name
        $existingOutlets = DB::table('outlets')
            ->get()
            ->pluck('id', 'nama')
            ->toArray();

        // 4. Create missing outlets and update IDs
        foreach ($uniqueFacilities as $facility) {
            $namaUnit = trim($facility->nama_unit_kerja);
            
            // Check if exists by name
            if (!isset($existingOutlets[$namaUnit])) {
                // Check if exists by code if code is set
                $outletByCode = null;
                if (!empty($facility->kode_unit_kerja)) {
                    $outletByCode = DB::table('outlets')->where('code', $facility->kode_unit_kerja)->first();
                }

                if ($outletByCode) {
                    $outletId = $outletByCode->id;
                } else {
                    $code = $facility->kode_unit_kerja;
                    if (empty($code)) {
                        $cleanName = preg_replace('/[^a-zA-Z0-9]/', '', $namaUnit);
                        $code = 'OT_' . strtoupper(substr($cleanName, 0, 8));
                    }
                    $originalCode = $code;
                    $counter = 1;
                    while (DB::table('outlets')->where('code', $code)->exists()) {
                        $code = substr($originalCode, 0, 8) . $counter;
                        $counter++;
                    }

                    $outletId = DB::table('outlets')->insertGetId([
                        'code' => $code,
                        'nama' => $namaUnit,
                        'alamat' => $facility->kantor_cabang ?? null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
                $existingOutlets[$namaUnit] = $outletId;
            }

        }
 
        // 5. Bulk update facilities using JOIN with COLLATE to avoid collation mismatch error
        DB::statement("
            UPDATE pengamanan_korporasi p
            JOIN outlets o ON TRIM(p.nama_unit_kerja) COLLATE utf8mb4_unicode_ci = o.nama COLLATE utf8mb4_unicode_ci
            SET p.outlet_id = o.id
            WHERE p.outlet_id IS NULL OR p.outlet_id = 0
        ");



        // 5. Add foreign key
        Schema::table('pengamanan_korporasi', function (Blueprint $table) {
            $table->foreign('outlet_id')->references('id')->on('outlets')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengamanan_korporasi', function (Blueprint $table) {
            if (Schema::hasColumn('pengamanan_korporasi', 'outlet_id')) {
                $table->dropForeign(['outlet_id']);
                $table->dropColumn('outlet_id');
            }
        });
    }
};


