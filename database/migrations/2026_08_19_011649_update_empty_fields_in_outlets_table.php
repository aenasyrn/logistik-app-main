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
        // Load all menu_sewa grouped by outlet_id
        $sewas = DB::table('menu_sewa')
            ->whereNotNull('outlet_id')
            ->get()
            ->groupBy('outlet_id');

        // Load all renovasi grouped by outlet_id
        $renovasis = DB::table('renovasi')
            ->whereNotNull('outlet_id')
            ->get()
            ->groupBy('outlet_id');

        // Load all aset_tanah grouped by outlet_id
        $lands = DB::table('aset_tanah')
            ->whereNotNull('outlet_id')
            ->get()
            ->groupBy('outlet_id');

        // Load all pengamanan_korporasi grouped by outlet_id
        $securities = DB::table('pengamanan_korporasi')
            ->whereNotNull('outlet_id')
            ->get()
            ->groupBy('outlet_id');

        $fields = ['type_outlet', 'type_bangunan', 'status_gedung', 'alamat', 'kelurahan', 'kecamatan', 'kab_kota', 'provinsi'];

        DB::table('outlets')->orderBy('id')->chunk(100, function ($outlets) use ($sewas, $renovasis, $lands, $securities, $fields) {
            foreach ($outlets as $outlet) {
                $hasEmpty = false;
                foreach ($fields as $field) {
                    if (empty($outlet->$field) || $outlet->$field === '-') {
                        $hasEmpty = true;
                        break;
                    }
                }

                if (!$hasEmpty) {
                    continue;
                }

                $updateData = [];

                // Try to get data from menu_sewa first (most fields)
                if (isset($sewas[$outlet->id])) {
                    foreach ($sewas[$outlet->id] as $sewa) {
                        foreach ($fields as $field) {
                            $currentVal = isset($updateData[$field]) ? $updateData[$field] : $outlet->$field;
                            if ((empty($currentVal) || $currentVal === '-') && !empty($sewa->$field) && $sewa->$field !== '-') {
                                $updateData[$field] = $sewa->$field;
                            }
                        }
                    }
                }

                // Try to get data from renovasi
                if (isset($renovasis[$outlet->id])) {
                    foreach ($renovasis[$outlet->id] as $renovasi) {
                        // status_gedung
                        $currentStatus = isset($updateData['status_gedung']) ? $updateData['status_gedung'] : $outlet->status_gedung;
                        if ((empty($currentStatus) || $currentStatus === '-') && !empty($renovasi->status_gedung) && $renovasi->status_gedung !== '-') {
                            $updateData['status_gedung'] = $renovasi->status_gedung;
                        }
                        // alamat (from cabang)
                        $currentAlamat = isset($updateData['alamat']) ? $updateData['alamat'] : $outlet->alamat;
                        if ((empty($currentAlamat) || $currentAlamat === '-') && !empty($renovasi->cabang) && $renovasi->cabang !== '-') {
                            $updateData['alamat'] = $renovasi->cabang;
                        }
                    }
                }

                // Try to get data from aset_tanah
                if (isset($lands[$outlet->id])) {
                    foreach ($lands[$outlet->id] as $land) {
                        // alamat
                        $currentAlamat = isset($updateData['alamat']) ? $updateData['alamat'] : $outlet->alamat;
                        if ((empty($currentAlamat) || $currentAlamat === '-') && !empty($land->alamat) && $land->alamat !== '-') {
                            $updateData['alamat'] = $land->alamat;
                        }
                    }
                }

                // Try to get data from pengamanan_korporasi
                if (isset($securities[$outlet->id])) {
                    foreach ($securities[$outlet->id] as $security) {
                        // alamat (from kantor_cabang)
                        $currentAlamat = isset($updateData['alamat']) ? $updateData['alamat'] : $outlet->alamat;
                        if ((empty($currentAlamat) || $currentAlamat === '-') && !empty($security->kantor_cabang) && $security->kantor_cabang !== '-') {
                            $updateData['alamat'] = $security->kantor_cabang;
                        }
                    }
                }

                if (!empty($updateData)) {
                    DB::table('outlets')->where('id', $outlet->id)->update($updateData);
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reverse operation needed for updating data
    }
};

