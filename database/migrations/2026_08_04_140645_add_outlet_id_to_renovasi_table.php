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
        // Disable strict mode for this session to clean up 0000-00-00 dates
        DB::statement("SET session sql_mode = ''");

        // Set short timeout to avoid hanging if the table is locked
        DB::statement('SET session lock_wait_timeout = 5');

        // Clean up zero dates to avoid SQLSTATE[22007] Incorrect date value: '0000-00-00'
        DB::statement("UPDATE renovasi SET tanggal_memo = NULL WHERE tanggal_memo = '0000-00-00'");
        DB::statement("UPDATE renovasi SET tanggal_tagihan = NULL WHERE tanggal_tagihan = '0000-00-00'");
        DB::statement("UPDATE renovasi SET tanggal_spk = NULL WHERE tanggal_spk = '0000-00-00'");
        DB::statement("UPDATE renovasi SET tanggal_bap_bast = NULL WHERE tanggal_bap_bast = '0000-00-00'");


        // 1. Add column as nullable
        Schema::table('renovasi', function (Blueprint $table) {
            if (!Schema::hasColumn('renovasi', 'outlet_id')) {
                $table->unsignedBigInteger('outlet_id')->nullable()->after('id');
            }
        });



        // 2. Fetch unique outlet names
        $uniqueOutletNames = DB::table('renovasi')
            ->whereNotNull('nama_outlet')
            ->where('nama_outlet', '<>', '')
            ->distinct()
            ->pluck('nama_outlet')
            ->map(fn($name) => trim($name))
            ->unique();

        // 3. Fetch existing outlets by name
        $existingOutlets = DB::table('outlets')
            ->whereIn('nama', $uniqueOutletNames)
            ->get()
            ->pluck('id', 'nama')
            ->toArray();

        // 4. Create missing outlets
        foreach ($uniqueOutletNames as $namaOutlet) {
            if (!isset($existingOutlets[$namaOutlet])) {
                $cleanName = preg_replace('/[^a-zA-Z0-9]/', '', $namaOutlet);
                $code = 'OT_' . strtoupper(substr($cleanName, 0, 8));
                
                // Ensure code is unique in outlets table
                $originalCode = $code;
                $counter = 1;
                while (DB::table('outlets')->where('code', $code)->exists()) {
                    $code = substr($originalCode, 0, 8) . $counter;
                    $counter++;
                }

                // Fetch address (cabang) from one of the renovations
                $sampleRenovation = DB::table('renovasi')
                    ->where('nama_outlet', $namaOutlet)
                    ->first();

                $outletId = DB::table('outlets')->insertGetId([
                    'code' => $code,
                    'nama' => $namaOutlet,
                    'alamat' => $sampleRenovation->cabang ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $existingOutlets[$namaOutlet] = $outletId;
            }
        }

        // 5. Bulk update renovations using JOIN
        DB::statement("
            UPDATE renovasi r
            JOIN outlets o ON TRIM(r.nama_outlet) = o.nama
            SET r.outlet_id = o.id
            WHERE r.outlet_id IS NULL OR r.outlet_id = 0
        ");


        // 6. Add foreign key
        Schema::table('renovasi', function (Blueprint $table) {
            $table->foreign('outlet_id')->references('id')->on('outlets')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('renovasi', function (Blueprint $table) {
            if (Schema::hasColumn('renovasi', 'outlet_id')) {
                $table->dropForeign(['outlet_id']);
                $table->dropColumn('outlet_id');
            }
        });
    }
};


