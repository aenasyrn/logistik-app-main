<?php

namespace App\Http\Controllers;

use App\Models\Computer;
use App\Models\Outlet;
use App\Models\Inventory;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ComputerController extends Controller
{
    private function mergeRequestFields(Request $request)
    {
        $outletId = $request->input('idOutlet') ?? $request->input('outlet_id');
        $ipAddress = $request->input('ipAddress') ?? $request->input('ip_address');
        $macAddress = $request->input('macAddress') ?? $request->input('mac_address');
        $tanggalMulai = $request->input('tanggalMulai') ?? $request->input('tanggal_mulai');
        $tanggalSelesai = $request->input('tanggalSelesai') ?? $request->input('tanggal_selesai');
        $penyedia = $request->input('penyedia') ?? $request->input('vendor');
        $inventoryId = $request->input('inventory_id');

        $resolvedOutletId = (is_numeric($outletId) && intval($outletId) > 0) ? intval($outletId) : null;
        if ($resolvedOutletId && !Outlet::where('id', $resolvedOutletId)->exists()) {
            $resolvedOutletId = null;
        }

        if (!$resolvedOutletId && $request->filled('outlet')) {
            $lokasiName = trim($request->input('outlet'));
            $matched = Outlet::where('nama', $lokasiName)->orWhere('code', $lokasiName)->first();
            if ($matched) {
                $resolvedOutletId = $matched->id;
            }
        }

        $resolvedInventoryId = (is_numeric($inventoryId) && intval($inventoryId) > 0) ? intval($inventoryId) : null;
        if (!$resolvedInventoryId && $request->filled('produk')) {
            $matchedInv = Inventory::whereRaw('LOWER(TRIM(nama)) = ?', [strtolower(trim($request->input('produk')))])->first();
            if ($matchedInv) {
                $resolvedInventoryId = $matchedInv->id;
            }
        }

        $request->merge([
            'outlet_id' => $resolvedOutletId,
            'inventory_id' => $resolvedInventoryId,
            'ip_address' => $ipAddress,
            'mac_address' => $macAddress,
            'tanggal_mulai' => (!empty($tanggalMulai) && $tanggalMulai !== 'null') ? $tanggalMulai : null,
            'tanggal_selesai' => (!empty($tanggalSelesai) && $tanggalSelesai !== 'null') ? $tanggalSelesai : null,
            'penyedia' => $penyedia,
        ]);
    }

    public function store(Request $request)
    {
        $this->mergeRequestFields($request);

        $data = $request->validate([
            'outlet_id' => 'nullable|integer',
            'inventory_id' => 'nullable|integer',
            'outlet' => 'nullable|string',
            'ip_address' => 'nullable|string',
            'mac_address' => 'nullable|string',
            'ram' => 'nullable|string',
            'storage' => 'nullable|string',
            'cpu' => 'nullable|string',
            'os' => 'nullable|string',
            'produk' => 'nullable|string',
            'sn' => 'nullable|string',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
            'penyedia' => 'nullable|string',
            'status' => 'nullable|string',
            'kondisi' => 'nullable|string',
            'keterangan' => 'nullable|string',
        ]);

        $computer = Computer::create($data);
        $computer->load(['histories', 'outlet_rel', 'inventory.histories']);

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Tambah',
            'module' => 'Data PC',
            'details' => "Menambahkan komputer SN: {$computer->sn} untuk outlet {$computer->outlet}",
        ]);

        return response()->json($computer);
    }

    public function update(Request $request, $id)
    {
        $this->mergeRequestFields($request);

        $data = $request->validate([
            'outlet_id' => 'nullable|integer',
            'inventory_id' => 'nullable|integer',
            'outlet' => 'nullable|string',
            'ip_address' => 'nullable|string',
            'mac_address' => 'nullable|string',
            'ram' => 'nullable|string',
            'storage' => 'nullable|string',
            'cpu' => 'nullable|string',
            'os' => 'nullable|string',
            'produk' => 'nullable|string',
            'sn' => 'nullable|string',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
            'penyedia' => 'nullable|string',
            'status' => 'nullable|string',
            'kondisi' => 'nullable|string',
            'keterangan' => 'nullable|string',
        ]);

        $computer = Computer::findOrFail($id);
        $computer->update($data);

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Edit',
            'module' => 'Data PC',
            'details' => "Mengubah komputer SN: {$computer->sn}",
        ]);

        $computer->load(['histories', 'outlet_rel', 'inventory.histories']);

        return response()->json($computer);
    }

    public function destroy($id)
    {
        try {
            $computer = Computer::find($id);
            if (!$computer) {
                return response()->json([
                    'success' => true,
                    'message' => 'Data komputer sudah tidak ada atau telah dihapus sebelumnya.'
                ]);
            }

            $sn = $computer->sn ?? '-';

            // Bersihkan riwayat kontrak jika ada
            $computer->histories()->delete();

            $computer->delete();

            try {
                ActivityLog::create([
                    'user_email' => auth()->user()->email ?? 'system',
                    'action' => 'Hapus',
                    'module' => 'Data PC',
                    'details' => "Menghapus komputer SN: {$sn}",
                ]);
            } catch (\Throwable $e) {
                \Log::warning("Gagal mencatat log aktivitas hapus PC: " . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Data komputer berhasil dihapus.'
            ]);
        } catch (\Throwable $e) {
            \Log::error("Gagal menghapus komputer ID {$id}: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function import(Request $request)
    {
        set_time_limit(600); // 10 minutes limit

        $request->validate([
            'rows' => 'required|array',
        ]);

        $rows = $request->input('rows');
        $importedCount = 0;

        $existingOutlets = \App\Models\Outlet::pluck('id')->toArray();
        $existingOutletsMap = array_combine($existingOutlets, $existingOutlets);

        $existingComputers = \App\Models\Computer::all()->keyBy('sn');

        DB::transaction(function () use ($rows, &$importedCount, &$existingOutletsMap, &$existingComputers) {
            $newOutletsToInsert = [];
            $newComputersToInsert = [];
            $computersToUpdate = [];
            $now = now();

            foreach ($rows as $row) {
                $sn = (isset($row['sn']) && trim($row['sn']) !== '') ? trim($row['sn']) : null;
                $outlet = (isset($row['outlet']) && trim($row['outlet']) !== '') ? trim($row['outlet']) : null;
                $produk = (isset($row['produk']) && trim($row['produk']) !== '') ? trim($row['produk']) : null;

                // Lewati baris jika data sn, outlet, dan produk semuanya kosong (baris kosong)
                if ($sn === null && $outlet === null && $produk === null) {
                    continue;
                }

                $outletId = null;
                if (!empty($row['outlet_id'])) {
                    $trimmedOutletId = trim($row['outlet_id']);
                    if (is_numeric($trimmedOutletId) && intval($trimmedOutletId) > 0) {
                        $outletId = intval($trimmedOutletId);
                    }
                }

                if ($outletId && !isset($existingOutletsMap[$outletId])) {
                    $outletName = $outlet !== null ? $outlet : 'Outlet Baru';
                    $newOutletsToInsert[] = [
                        'id' => $outletId,
                        'code' => (string) $outletId,
                        'nama' => $outletName,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                    $existingOutletsMap[$outletId] = $outletId;
                }

                $comp = null;
                if ($sn !== null) {
                    $comp = isset($existingComputers[$sn]) ? $existingComputers[$sn] : null;
                }

                // Validate dates to format YYYY-MM-DD
                $tanggalMulai = null;
                if (!empty($row['tanggal_mulai'])) {
                    $trimmedDate = trim($row['tanggal_mulai']);
                    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $trimmedDate)) {
                        $tanggalMulai = $trimmedDate;
                    }
                }

                $tanggalSelesai = null;
                if (!empty($row['tanggal_selesai'])) {
                    $trimmedDate = trim($row['tanggal_selesai']);
                    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $trimmedDate)) {
                        $tanggalSelesai = $trimmedDate;
                    }
                }

                $ipAddress = (isset($row['ip_address']) && trim($row['ip_address']) !== '') ? trim($row['ip_address']) : null;
                $macAddress = (isset($row['mac_address']) && trim($row['mac_address']) !== '') ? trim($row['mac_address']) : null;
                $ram = (isset($row['ram']) && trim($row['ram']) !== '') ? trim($row['ram']) : null;
                $storage = (isset($row['storage']) && trim($row['storage']) !== '') ? trim($row['storage']) : null;
                $cpu = (isset($row['cpu']) && trim($row['cpu']) !== '') ? trim($row['cpu']) : null;
                $os = (isset($row['os']) && trim($row['os']) !== '') ? trim($row['os']) : null;
                $penyedia = (isset($row['penyedia']) && trim($row['penyedia']) !== '') ? trim($row['penyedia']) : null;
                $status = (isset($row['status']) && trim($row['status']) !== '') ? trim($row['status']) : 'Inventaris';
                $kondisi = (isset($row['kondisi']) && trim($row['kondisi']) !== '') ? trim($row['kondisi']) : 'BAIK';
                $keterangan = (isset($row['keterangan']) && trim($row['keterangan']) !== '') ? trim($row['keterangan']) : null;

                $data = [
                    'outlet_id' => $outletId,
                    'outlet' => $outlet,
                    'ip_address' => $ipAddress,
                    'mac_address' => $macAddress,
                    'ram' => $ram,
                    'storage' => $storage,
                    'cpu' => $cpu,
                    'os' => $os,
                    'produk' => $produk,
                    'tanggal_mulai' => $tanggalMulai,
                    'tanggal_selesai' => $tanggalSelesai,
                    'penyedia' => $penyedia,
                    'status' => $status,
                    'kondisi' => $kondisi,
                    'keterangan' => $keterangan,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                if ($comp) {
                    $isChanged = false;
                    foreach ($data as $key => $val) {
                        if ($key === 'created_at' || $key === 'updated_at') continue;
                        $oldVal = $comp->$key;
                        if ($oldVal != $val) {
                            $isChanged = true;
                            break;
                        }
                    }

                    if ($isChanged) {
                        $updateData = $data;
                        $updateData['updated_at'] = $now;
                        unset($updateData['created_at']);

                        $computersToUpdate[] = array_merge(['id' => $comp->id], $updateData);
                    }
                } else {
                    $newComputersToInsert[] = array_merge(['sn' => $sn], $data);
                }
                $importedCount++;
            }

            // 1. Bulk Insert Outlets
            if (!empty($newOutletsToInsert)) {
                $uniqueOutlets = [];
                foreach ($newOutletsToInsert as $o) {
                    $uniqueOutlets[$o['id']] = $o;
                }
                foreach (array_chunk(array_values($uniqueOutlets), 200) as $chunk) {
                    DB::table('outlets')->insert($chunk);
                }
            }

            // 2. Bulk Insert Computers
            if (!empty($newComputersToInsert)) {
                foreach (array_chunk($newComputersToInsert, 500) as $chunk) {
                    DB::table('computers')->insert($chunk);
                }
            }

            // 3. Raw Batch Update Computers
            if (!empty($computersToUpdate)) {
                foreach (array_chunk($computersToUpdate, 200) as $chunk) {
                    $firstRow = reset($chunk);
                    $columns = array_keys(array_diff_key($firstRow, ['id' => '']));

                    $query = "UPDATE `computers` SET ";
                    $bindings = [];
                    
                    foreach ($columns as $column) {
                        $query .= "`{$column}` = CASE ";
                        foreach ($chunk as $up) {
                            $query .= "WHEN `id` = ? THEN ? ";
                            $bindings[] = $up['id'];
                            $bindings[] = $up[$column];
                        }
                        $query .= "ELSE `{$column}` END, ";
                    }
                    
                    $query = rtrim($query, ", ");
                    
                    $ids = array_column($chunk, 'id');
                    $query .= " WHERE `id` IN (" . implode(',', array_fill(0, count($ids), '?')) . ")";
                    $bindings = array_merge($bindings, $ids);
                    
                    DB::update($query, $bindings);
                }
            }
        });

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Import CSV',
            'module' => 'Data PC',
            'details' => "Mengimpor massal {$importedCount} data komputer",
        ]);

        return response()->json([
            'success' => true,
            'message' => "{$importedCount} data komputer berhasil diimpor",
        ]);
    }
}
