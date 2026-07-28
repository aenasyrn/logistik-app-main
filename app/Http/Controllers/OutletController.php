<?php

namespace App\Http\Controllers;

use App\Models\Outlet;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class OutletController extends Controller
{
    public function store(Request $request)
    {
        if ($request->has('kode')) {
            $normalizedKode = trim((string)$request->kode);
            if ($normalizedKode === '' || $normalizedKode === '-') {
                $request->merge(['kode' => null]);
            }
        }

        $request->validate([
            'kode' => 'nullable|string|max:50|unique:outlets,code',
            'nama' => 'required|string|max:255',
        ], [
            'kode.unique' => 'Kode outlet sudah digunakan oleh instansi lain.',
        ]);

        $code = $request->kode;
        $outlet = new Outlet();
        
        if ($code) {
            if (is_numeric($code)) {
                $numericCode = intval($code);
                if (!\App\Models\Outlet::where('id', $numericCode)->exists()) {
                    $outlet->id = $numericCode;
                }
            }
            $outlet->code = $code;
        }
        
        $outlet->nama = $request->nama;
        $outlet->save();

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Tambah',
            'module' => 'Master Instansi',
            'details' => "Menambahkan instansi: {$outlet->nama} (ID: {$outlet->id})",
        ]);

        return redirect()->back()->with('message', 'Outlet berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        if ($request->has('kode')) {
            $normalizedKode = trim((string)$request->kode);
            if ($normalizedKode === '' || $normalizedKode === '-') {
                $request->merge(['kode' => null]);
            }
        }

        $request->validate([
            'kode' => 'nullable|string|max:50|unique:outlets,code,' . $id,
            'nama' => 'required|string|max:255',
        ], [
            'kode.unique' => 'Kode outlet sudah digunakan oleh instansi lain.',
        ]);

        $outlet = Outlet::findOrFail($id);
        $oldNama = $outlet->nama;
        
        $outlet->nama = $request->nama;
        if ($request->has('kode')) {
            $outlet->code = $request->kode;
        }
        $outlet->save();

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Edit',
            'module' => 'Master Instansi',
            'details' => "Mengubah instansi: {$oldNama} menjadi {$outlet->nama}",
        ]);

        return redirect()->back()->with('message', 'Outlet berhasil diperbarui');
    }

    public function destroy($id)
    {
        $outlet = Outlet::findOrFail($id);
        $nama = $outlet->nama;
        $outlet->delete();

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Hapus',
            'module' => 'Master Instansi',
            'details' => "Menghapus instansi: {$nama} (ID: {$id})",
        ]);

        return redirect()->back()->with('message', 'Outlet berhasil dihapus');
    }

    public function import(Request $request)
    {
        $request->validate([
            'rows' => 'required|array',
        ]);

        $rows = $request->input('rows');
        $importedCount = 0;

        $existingOutlets = \App\Models\Outlet::all();
        $byCode = [];
        $byName = [];
        $byId = [];
        foreach ($existingOutlets as $outlet) {
            $byId[$outlet->id] = $outlet;
            if ($outlet->code !== null && $outlet->code !== '') {
                $byCode[$outlet->code] = $outlet;
            }
            if ($outlet->nama !== null && $outlet->nama !== '') {
                $byName[$outlet->nama] = $outlet;
            }
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($rows, &$importedCount, &$byCode, &$byName, &$byId) {
            foreach ($rows as $row) {
                if (empty($row['nama'])) {
                    continue;
                }

                $rawCode = !empty($row['kode']) ? trim((string)$row['kode']) : null;
                $code = ($rawCode === '-' || $rawCode === '') ? null : $rawCode;

                // Find existing outlet: if code is present, match ONLY by code. If empty, match by name.
                $outlet = null;
                if ($code) {
                    if (isset($byCode[$code])) {
                        $outlet = $byCode[$code];
                    }
                } else {
                    if (isset($byName[$row['nama']])) {
                        $outlet = $byName[$row['nama']];
                    }
                }

                if ($outlet) {
                    $changed = false;
                    if ($outlet->nama !== $row['nama']) {
                        $outlet->nama = $row['nama'];
                        $changed = true;
                    }
                    if ($code && $outlet->code !== $code) {
                        $outlet->code = $code;
                        $changed = true;
                    }
                    if ($changed) {
                        $outlet->save();
                    }
                } else {
                    $outlet = new \App\Models\Outlet();
                    if ($code) {
                        if (is_numeric($code)) {
                            $numericCode = intval($code);
                            if (!isset($byId[$numericCode])) {
                                $outlet->id = $numericCode;
                                $byId[$numericCode] = $outlet; // Update cache
                            }
                        }
                        $outlet->code = $code;
                    }
                    $outlet->nama = $row['nama'];
                    $outlet->save();

                    // Keep memory indexes updated for subsequent rows
                    if ($outlet->code) {
                        $byCode[$outlet->code] = $outlet;
                    }
                    $byName[$outlet->nama] = $outlet;
                }
                $importedCount++;
            }
        });

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Import CSV',
            'module' => 'Master Instansi',
            'details' => "Mengimpor massal {$importedCount} data instansi",
        ]);

        return response()->json([
            'success' => true,
            'message' => "{$importedCount} data instansi berhasil diimpor",
        ]);
    }
}
