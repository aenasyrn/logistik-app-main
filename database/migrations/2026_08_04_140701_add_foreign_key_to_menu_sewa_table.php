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
        DB::statement("UPDATE menu_sewa SET tgl_kontrak_mulai = NULL WHERE tgl_kontrak_mulai = '0000-00-00'");
        DB::statement("UPDATE menu_sewa SET tgl_kontrak_berakhir = NULL WHERE tgl_kontrak_berakhir = '0000-00-00'");

        // 1. Ensure all existing non-null outlet_ids in menu_sewa point to valid outlets


        $sewas = DB::table('menu_sewa')->whereNotNull('outlet_id')->get();
        foreach ($sewas as $sewa) {
            $outletExists = DB::table('outlets')->where('id', $sewa->outlet_id)->exists();
            if (!$outletExists) {
                // Try resolving by code or name
                $outlet = null;
                if (!empty($sewa->kode_outlet)) {
                    $outlet = DB::table('outlets')->where('code', $sewa->kode_outlet)->first();
                }
                if (!$outlet && !empty($sewa->nama_outlet)) {
                    $outlet = DB::table('outlets')->where('nama', $sewa->nama_outlet)->first();
                }

                if ($outlet) {
                    DB::table('menu_sewa')->where('id', $sewa->id)->update([
                        'outlet_id' => $outlet->id,
                    ]);
                } else if (!empty($sewa->nama_outlet)) {
                    // Create the outlet
                    $code = $sewa->kode_outlet;
                    if (empty($code)) {
                        $cleanName = preg_replace('/[^a-zA-Z0-9]/', '', $sewa->nama_outlet);
                        $code = 'OT_' . strtoupper(substr($cleanName, 0, 8));
                    }
                    // Ensure code is unique in outlets table
                    $originalCode = $code;
                    $counter = 1;
                    while (DB::table('outlets')->where('code', $code)->exists()) {
                        $code = substr($originalCode, 0, 8) . $counter;
                        $counter++;
                    }

                    $outletId = DB::table('outlets')->insertGetId([
                        'code' => $code,
                        'nama' => $sewa->nama_outlet,
                        'alamat' => $sewa->alamat ?? null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    DB::table('menu_sewa')->where('id', $sewa->id)->update([
                        'outlet_id' => $outletId,
                    ]);
                } else {
                    // Cannot resolve, set to null
                    DB::table('menu_sewa')->where('id', $sewa->id)->update([
                        'outlet_id' => null,
                    ]);
                }
            }
        }

        // 2. Add foreign key
        Schema::table('menu_sewa', function (Blueprint $table) {
            $table->foreign('outlet_id')->references('id')->on('outlets')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menu_sewa', function (Blueprint $table) {
            if (Schema::hasColumn('menu_sewa', 'outlet_id')) {
                $table->dropForeign(['outlet_id']);
            }
        });
    }
};

