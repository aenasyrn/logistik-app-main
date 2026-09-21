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
            'area' => 'required|string|max:100',
            'cabang' => 'required|string|max:100',
            'type_outlet' => 'nullable|string|max:100',
            'type_bangunan' => 'nullable|string|max:100',
            'status_gedung' => 'nullable|string|max:100',
            'alamat' => 'nullable|string',
            'kelurahan' => 'nullable|string|max:100',
            'kecamatan' => 'nullable|string|max:100',
            'kab_kota' => 'nullable|string|max:100',
            'provinsi' => 'nullable|string|max:100',
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
        $outlet->area = $request->area;
        $outlet->cabang = $request->cabang;
        $outlet->type_outlet = $request->type_outlet;
        $outlet->type_bangunan = $request->type_bangunan;
        $outlet->status_gedung = $request->status_gedung;
        $outlet->alamat = $request->alamat;
        $outlet->kelurahan = $request->kelurahan;
        $outlet->kecamatan = $request->kecamatan;
        $outlet->kab_kota = $request->kab_kota;
        $outlet->provinsi = $request->provinsi;
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
            'area' => 'required|string|max:100',
            'cabang' => 'required|string|max:100',
            'type_outlet' => 'nullable|string|max:100',
            'type_bangunan' => 'nullable|string|max:100',
            'status_gedung' => 'nullable|string|max:100',
            'alamat' => 'nullable|string',
            'kelurahan' => 'nullable|string|max:100',
            'kecamatan' => 'nullable|string|max:100',
            'kab_kota' => 'nullable|string|max:100',
            'provinsi' => 'nullable|string|max:100',
        ], [
            'kode.unique' => 'Kode outlet sudah digunakan oleh instansi lain.',
        ]);

        $outlet = Outlet::findOrFail($id);
        $oldNama = $outlet->nama;
        
        $outlet->nama = $request->nama;
        if ($request->has('kode')) {
            $outlet->code = $request->kode;
        }
        $outlet->area = $request->area;
        $outlet->cabang = $request->cabang;
        $outlet->type_outlet = $request->type_outlet;
        $outlet->type_bangunan = $request->type_bangunan;
        $outlet->status_gedung = $request->status_gedung;
        $outlet->alamat = $request->alamat;
        $outlet->kelurahan = $request->kelurahan;
        $outlet->kecamatan = $request->kecamatan;
        $outlet->kab_kota = $request->kab_kota;
        $outlet->provinsi = $request->provinsi;
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

                $typeOutlet = !empty($row['type_outlet']) ? trim((string)$row['type_outlet']) : null;
                $typeBangunan = !empty($row['type_bangunan']) ? trim((string)$row['type_bangunan']) : null;
                $statusGedung = !empty($row['status_gedung']) ? trim((string)$row['status_gedung']) : null;
                $alamat = !empty($row['alamat']) ? trim((string)$row['alamat']) : null;
                $kelurahan = !empty($row['kelurahan']) ? trim((string)$row['kelurahan']) : null;
                $kecamatan = !empty($row['kecamatan']) ? trim((string)$row['kecamatan']) : null;
                $kabKota = !empty($row['kab_kota']) ? trim((string)$row['kab_kota']) : null;
                $provinsi = !empty($row['provinsi']) ? trim((string)$row['provinsi']) : null;
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
                    if ($outlet->type_outlet !== $typeOutlet) {
                        $outlet->type_outlet = $typeOutlet;
                        $changed = true;
                    }
                    if ($outlet->type_bangunan !== $typeBangunan) {
                        $outlet->type_bangunan = $typeBangunan;
                        $changed = true;
                    }
                    if ($outlet->status_gedung !== $statusGedung) {
                        $outlet->status_gedung = $statusGedung;
                        $changed = true;
                    }
                    if ($outlet->alamat !== $alamat) {
                        $outlet->alamat = $alamat;
                        $changed = true;
                    }
                    if ($outlet->kelurahan !== $kelurahan) {
                        $outlet->kelurahan = $kelurahan;
                        $changed = true;
                    }

                    if ($outlet->kecamatan !== $kecamatan) {
                        $outlet->kecamatan = $kecamatan;
                        $changed = true;
                    }

                    if ($outlet->kab_kota !== $kabKota) {
                        $outlet->kab_kota = $kabKota;
                        $changed = true;
                    }

                    if ($outlet->provinsi !== $provinsi) {
                        $outlet->provinsi = $provinsi;
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
                    $outlet->type_outlet = $typeOutlet;
                    $outlet->type_bangunan = $typeBangunan;
                    $outlet->status_gedung = $statusGedung;
                    $outlet->alamat = $alamat;
                    $outlet->kelurahan = $kelurahan;
                    $outlet->kecamatan = $kecamatan;
                    $outlet->kab_kota = $kabKota;
                    $outlet->provinsi = $provinsi;
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
