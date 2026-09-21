<?php

namespace App\Http\Controllers;

use App\Models\Printer;
use App\Models\Outlet;
use App\Models\Inventory;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PrinterController extends Controller
{
    private function mergeRequestFields(Request $request)
    {
        $outletId = $request->input('idOutlet') ?? $request->input('outlet_id');
        $tanggalMulai = $request->input('tanggalMulai') ?? $request->input('tanggal_mulai');
        $tanggalSelesai = $request->input('tanggalSelesai') ?? $request->input('tanggal_selesai');
        $vendor = $request->input('vendor') ?? $request->input('penyedia');
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
            'tanggal_mulai' => (!empty($tanggalMulai) && $tanggalMulai !== 'null') ? $tanggalMulai : null,
            'tanggal_selesai' => (!empty($tanggalSelesai) && $tanggalSelesai !== 'null') ? $tanggalSelesai : null,
            'vendor' => $vendor,
        ]);
    }

    public function store(Request $request)
    {
        $this->mergeRequestFields($request);

        $data = $request->validate([
            'outlet_id' => 'nullable|integer',
            'inventory_id' => 'nullable|integer',
            'outlet' => 'nullable|string',
            'produk' => 'nullable|string',
            'sn' => 'nullable|string',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
            'vendor' => 'nullable|string',
            'status' => 'nullable|string',
            'kondisi' => 'nullable|string',
            'keterangan' => 'nullable|string',
        ]);

        $printer = Printer::create($data);
        $printer->load(['histories', 'outlet_rel', 'inventory.histories']);

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Tambah',
            'module' => 'Data Printer',
            'details' => "Menambahkan printer SN: {$printer->sn} untuk outlet {$printer->outlet}",
        ]);

        return response()->json($printer);
    }

    public function update(Request $request, $id)
    {
        $this->mergeRequestFields($request);

        $data = $request->validate([
            'outlet_id' => 'nullable|integer',
            'inventory_id' => 'nullable|integer',
            'outlet' => 'nullable|string',
            'produk' => 'nullable|string',
            'sn' => 'nullable|string',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
            'vendor' => 'nullable|string',
            'status' => 'nullable|string',
            'kondisi' => 'nullable|string',
            'keterangan' => 'nullable|string',
        ]);

        $printer = Printer::findOrFail($id);
        $printer->update($data);
        $printer->load(['histories', 'outlet_rel', 'inventory.histories']);

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Edit',
            'module' => 'Data Printer',
            'details' => "Mengubah printer SN: {$printer->sn}",
        ]);

        return response()->json($printer);
    }

    public function destroy($id)
    {
        try {
            $printer = Printer::find($id);
            if (!$printer) {
                return response()->json([
                    'success' => true,
                    'message' => 'Data printer sudah tidak ada atau telah dihapus sebelumnya.'
                ]);
            }

            $sn = $printer->sn ?? '-';

            // Bersihkan riwayat kontrak jika ada
            $printer->histories()->delete();

            $printer->delete();

            try {
                ActivityLog::create([
                    'user_email' => auth()->user()->email ?? 'system',
                    'action' => 'Hapus',
                    'module' => 'Data Printer',
                    'details' => "Menghapus printer SN: {$sn}",
                ]);
            } catch (\Throwable $e) {
                \Log::warning("Gagal mencatat log aktivitas hapus Printer: " . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Data printer berhasil dihapus.'
            ]);
        } catch (\Throwable $e) {
            \Log::error("Gagal menghapus printer ID {$id}: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function import(Request $request)
    {
        set_time_limit(300);

        $request->validate([
            'rows' => 'required|array',
        ]);

        $rows = $request->input('rows');
        $importedCount = 0;

        $existingOutlets = \App\Models\Outlet::pluck('id')->toArray();
        $existingOutletsMap = array_combine($existingOutlets, $existingOutlets);

        $existingPrinters = Printer::all()->keyBy('sn');

        DB::transaction(function () use ($rows, &$importedCount, &$existingOutletsMap, &$existingPrinters) {
            $newOutletsToInsert = [];
            $newPrintersToInsert = [];
            $printersToUpdate = [];
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

                $printer = null;
                if ($sn !== null) {
                    $printer = isset($existingPrinters[$sn]) ? $existingPrinters[$sn] : null;
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

                $vendor = (isset($row['vendor']) && trim($row['vendor']) !== '') ? trim($row['vendor']) : null;
                $status = (isset($row['status']) && trim($row['status']) !== '') ? trim($row['status']) : 'Inventaris';
                $kondisi = (isset($row['kondisi']) && trim($row['kondisi']) !== '') ? trim($row['kondisi']) : 'BAIK';
                $keterangan = (isset($row['keterangan']) && trim($row['keterangan']) !== '') ? trim($row['keterangan']) : null;

                $data = [
                    'outlet_id' => $outletId,
                    'outlet' => $outlet,
                    'produk' => $produk,
                    'tanggal_mulai' => $tanggalMulai,
                    'tanggal_selesai' => $tanggalSelesai,
                    'vendor' => $vendor,
                    'status' => $status,
                    'kondisi' => $kondisi,
                    'keterangan' => $keterangan,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                if ($printer) {
                    $isChanged = false;
                    foreach ($data as $key => $val) {
                        if ($key === 'created_at' || $key === 'updated_at') continue;
                        $oldVal = $printer->$key;
                        if ($oldVal != $val) {
                            $isChanged = true;
                            break;
                        }
                    }

                    if ($isChanged) {
                        $updateData = $data;
                        $updateData['updated_at'] = $now;
                        unset($updateData['created_at']);

                        $printersToUpdate[] = array_merge(['id' => $printer->id], $updateData);
                    }
                } else {
                    $newPrintersToInsert[] = array_merge(['sn' => $sn], $data);
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

            // 2. Bulk Insert Printers
            if (!empty($newPrintersToInsert)) {
                foreach (array_chunk($newPrintersToInsert, 500) as $chunk) {
                    DB::table('printers')->insert($chunk);
                }
            }

            // 3. Raw Batch Update Printers
            if (!empty($printersToUpdate)) {
                foreach (array_chunk($printersToUpdate, 200) as $chunk) {
                    $firstRow = reset($chunk);
                    $columns = array_keys(array_diff_key($firstRow, ['id' => '']));

                    $query = "UPDATE `printers` SET ";
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
            'module' => 'Data Printer',
            'details' => "Mengimpor massal {$importedCount} data printer",
        ]);

        return response()->json([
            'success' => true,
            'message' => "{$importedCount} data printer berhasil diimpor",
        ]);
    }
}
