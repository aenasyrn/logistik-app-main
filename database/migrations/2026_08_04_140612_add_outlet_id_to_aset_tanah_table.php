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
        // 1. Add column as nullable
        Schema::table('aset_tanah', function (Blueprint $table) {
            if (!Schema::hasColumn('aset_tanah', 'outlet_id')) {
                $table->unsignedBigInteger('outlet_id')->nullable()->after('id');
            }
        });

        // 2. Migrate existing records: match/create outlet
        $lands = DB::table('aset_tanah')->get();
        foreach ($lands as $land) {
            $unitKerja = trim($land->unit_kerja ?? '');
            if (empty($unitKerja)) {
                $unitKerja = 'Outlet Tanpa Nama';
            }
            
            // Check if outlet already exists by name
            $outlet = DB::table('outlets')->where('nama', $unitKerja)->first();
            
            if (!$outlet) {
                // Generate a unique code
                $cleanName = preg_replace('/[^a-zA-Z0-9]/', '', $unitKerja);
                $code = 'OT_' . strtoupper(substr($cleanName, 0, 8));
                // Ensure code is unique in outlets table
                $originalCode = $code;
                $counter = 1;
                while (DB::table('outlets')->where('code', $code)->exists()) {
                    $code = substr($originalCode, 0, 8) . $counter;
                    $counter++;
                }

                $outletId = DB::table('outlets')->insertGetId([
                    'code' => $code,
                    'nama' => $unitKerja,
                    'alamat' => $land->alamat ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $outletId = $outlet->id;
            }

            DB::table('aset_tanah')->where('id', $land->id)->update([
                'outlet_id' => $outletId,
            ]);
        }

        // 3. Make column NOT NULL and add foreign key
        Schema::table('aset_tanah', function (Blueprint $table) {
            $table->unsignedBigInteger('outlet_id')->nullable(false)->change();
            $table->foreign('outlet_id')->references('id')->on('outlets')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('aset_tanah', function (Blueprint $table) {
            if (Schema::hasColumn('aset_tanah', 'outlet_id')) {
                $table->dropForeign(['outlet_id']);
                $table->dropColumn('outlet_id');
            }
        });
    }
};

