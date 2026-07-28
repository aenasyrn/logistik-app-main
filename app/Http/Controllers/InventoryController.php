<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function store(Request $request)
    {
        $input = $request->all();
        foreach ($input as $key => $value) {
            if ($value === '') {
                $input[$key] = null;
            }
        }
        $request->merge($input);

        $request->validate([
            'nama' => 'required|string|max:255',
            'kuantitas' => 'required|integer|min:0',
            'satuan' => 'required|string|max:50',
            'vendor_nama' => 'nullable|string|max:255',
            'no_spk' => 'nullable|string|max:255',
            'no_pks' => 'nullable|string|max:255',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
            'masa_sewa_bulan' => 'nullable|integer|min:0',
            'status' => 'nullable|string|max:100',
            'deskripsi' => 'nullable|string',
        ]);

        $item = Inventory::create($request->only([
            'nama', 'kuantitas', 'satuan', 'vendor_nama', 'no_spk', 'no_pks',
            'tanggal_mulai', 'tanggal_selesai', 'masa_sewa_bulan', 'status', 'deskripsi'
        ]));

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Tambah',
            'module' => 'Master Barang',
            'details' => "Menambahkan barang: {$item->nama} sebanyak {$item->kuantitas} {$item->satuan}",
        ]);

        return redirect()->back()->with('message', 'Barang berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $input = $request->all();
        foreach ($input as $key => $value) {
            if ($value === '') {
                $input[$key] = null;
            }
        }
        $request->merge($input);

        $request->validate([
            'nama' => 'required|string|max:255',
            'kuantitas' => 'required|integer|min:0',
            'satuan' => 'required|string|max:50',
            'vendor_nama' => 'nullable|string|max:255',
            'no_spk' => 'nullable|string|max:255',
            'no_pks' => 'nullable|string|max:255',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
            'masa_sewa_bulan' => 'nullable|integer|min:0',
            'status' => 'nullable|string|max:100',
            'deskripsi' => 'nullable|string',
        ]);

        $item = Inventory::findOrFail($id);
        $oldNama = $item->nama;
        $item->update($request->only([
            'nama', 'kuantitas', 'satuan', 'vendor_nama', 'no_spk', 'no_pks',
            'tanggal_mulai', 'tanggal_selesai', 'masa_sewa_bulan', 'status', 'deskripsi'
        ]));

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Edit',
            'module' => 'Master Barang',
            'details' => "Mengubah barang: {$oldNama} menjadi {$item->nama}",
        ]);

        return redirect()->back()->with('message', 'Barang berhasil diperbarui');
    }

    public function destroy($id)
    {
        $item = Inventory::findOrFail($id);
        $nama = $item->nama;
        $item->delete();

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Hapus',
            'module' => 'Master Barang',
            'details' => "Menghapus barang: {$nama}",
        ]);

        return redirect()->back()->with('message', 'Barang berhasil dihapus');
    }

    public function import(Request $request)
    {
        $request->validate([
            'rows' => 'required|array',
        ]);

        $rows = $request->input('rows');
        $importedCount = 0;

        $existingInventories = \App\Models\Inventory::all()->keyBy('nama');

        \Illuminate\Support\Facades\DB::transaction(function () use ($rows, &$importedCount, &$existingInventories) {
            foreach ($rows as $row) {
                if (empty($row['nama'])) {
                    continue;
                }

                $nama = trim($row['nama']);
                $item = isset($existingInventories[$nama]) ? $existingInventories[$nama] : null;

                $data = [
                    'kuantitas' => !empty($row['kuantitas']) ? intval($row['kuantitas']) : 0,
                    'satuan' => $row['satuan'] ?? 'Pcs',
                    'vendor_nama' => $row['vendor_nama'] ?? null,
                    'no_spk' => $row['no_spk'] ?? null,
                    'no_pks' => $row['no_pks'] ?? null,
                    'tanggal_mulai' => !empty($row['tanggal_mulai']) ? $row['tanggal_mulai'] : null,
                    'tanggal_selesai' => !empty($row['tanggal_selesai']) ? $row['tanggal_selesai'] : null,
                    'masa_sewa_bulan' => !empty($row['masa_sewa_bulan']) ? intval($row['masa_sewa_bulan']) : 0,
                    'status' => $row['status'] ?? 'Inventaris',
                    'deskripsi' => $row['deskripsi'] ?? null,
                ];

                if ($item) {
                    $changed = false;
                    foreach ($data as $key => $val) {
                        if ($item->{$key} !== $val) {
                            $item->{$key} = $val;
                            $changed = true;
                        }
                    }
                    if ($changed) {
                        $item->save();
                    }
                } else {
                    $item = \App\Models\Inventory::create(array_merge(['nama' => $nama], $data));
                    $existingInventories[$nama] = $item;
                }
                $importedCount++;
            }
        });

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Import CSV',
            'module' => 'Master Barang',
            'details' => "Mengimpor massal {$importedCount} data barang",
        ]);

        return response()->json([
            'success' => true,
            'message' => "{$importedCount} data barang berhasil diimpor",
        ]);
    }
}
