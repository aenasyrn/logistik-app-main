<?php

namespace App\Http\Controllers;

use App\Models\BuildingLand;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class BuildingLandController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'unit_kerja' => 'required|string|max:255',
            'alamat' => 'nullable|string',
            'peruntukan' => 'nullable|string',
            'aset_sap' => 'nullable|string',
            'no_shgb' => 'nullable|string',
            'no_sertifikat' => 'nullable|string',
            'no_sertifikat_gabungan' => 'nullable|string',
            'no_imb' => 'nullable|string',
            'nama_pemilik_imb' => 'nullable|string',
            'tgl_mulai_shgb' => 'nullable|date',
            'tgl_berakhir_shgb' => 'nullable|date',
            'tahun_perolehan' => 'nullable|integer',
            'luas_tanah' => 'nullable|numeric',
            'luas_pagar' => 'nullable|numeric',
            'luas_bangunan' => 'nullable|numeric',
            'keterangan' => 'nullable|string',
        ]);

        $land = BuildingLand::create($data);

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Tambah',
            'module' => 'Daftar Tanah',
            'details' => "Menambahkan tanah: {$land->unit_kerja}",
        ]);

        return redirect()->back()->with('message', 'Data tanah berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'unit_kerja' => 'required|string|max:255',
            'alamat' => 'nullable|string',
            'peruntukan' => 'nullable|string',
            'aset_sap' => 'nullable|string',
            'no_shgb' => 'nullable|string',
            'no_sertifikat' => 'nullable|string',
            'no_sertifikat_gabungan' => 'nullable|string',
            'no_imb' => 'nullable|string',
            'nama_pemilik_imb' => 'nullable|string',
            'tgl_mulai_shgb' => 'nullable|date',
            'tgl_berakhir_shgb' => 'nullable|date',
            'tahun_perolehan' => 'nullable|integer',
            'luas_tanah' => 'nullable|numeric',
            'luas_pagar' => 'nullable|numeric',
            'luas_bangunan' => 'nullable|numeric',
            'keterangan' => 'nullable|string',
        ]);

        $land = BuildingLand::findOrFail($id);
        $land->update($data);

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Edit',
            'module' => 'Daftar Tanah',
            'details' => "Mengubah tanah: {$land->unit_kerja}",
        ]);

        return redirect()->back()->with('message', 'Data tanah berhasil diperbarui');
    }

    public function destroy($id)
    {
        $land = BuildingLand::findOrFail($id);
        $nama = $land->unit_kerja;
        $land->delete();

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Hapus',
            'module' => 'Daftar Tanah',
            'details' => "Menghapus tanah: {$nama}",
        ]);

        return redirect()->back()->with('message', 'Data tanah berhasil dihapus');
    }

    public function import(Request $request)
    {
        $request->validate([
            'rows' => 'required|array',
        ]);

        $rows = $request->input('rows');
        $importedCount = 0;

        \Illuminate\Support\Facades\DB::transaction(function () use ($rows, &$importedCount) {
            foreach ($rows as $row) {
                if (empty($row['unit_kerja'])) {
                    continue;
                }

                $existing = null;
                if (!empty($row['no_sertifikat'])) {
                    $existing = BuildingLand::where('no_sertifikat', $row['no_sertifikat'])->first();
                }
                if (!$existing && !empty($row['no_shgb'])) {
                    $existing = BuildingLand::where('no_shgb', $row['no_shgb'])->first();
                }
                if (!$existing && !empty($row['unit_kerja'])) {
                    $query = BuildingLand::where('unit_kerja', $row['unit_kerja']);
                    if (!empty($row['alamat'])) {
                        $query->where('alamat', $row['alamat']);
                    }
                    $existing = $query->first();
                }

                $dataToSave = [
                    'unit_kerja' => $row['unit_kerja'] ?? null,
                    'alamat' => $row['alamat'] ?? null,
                    'peruntukan' => $row['peruntukan'] ?? null,
                    'aset_sap' => $row['aset_sap'] ?? null,
                    'no_shgb' => $row['no_shgb'] ?? null,
                    'no_sertifikat' => $row['no_sertifikat'] ?? null,
                    'no_sertifikat_gabungan' => $row['no_sertifikat_gabungan'] ?? null,
                    'no_imb' => $row['no_imb'] ?? null,
                    'nama_pemilik_imb' => $row['nama_pemilik_imb'] ?? null,
                    'tgl_mulai_shgb' => !empty($row['tgl_mulai_shgb']) ? $row['tgl_mulai_shgb'] : null,
                    'tgl_berakhir_shgb' => !empty($row['tgl_berakhir_shgb']) ? $row['tgl_berakhir_shgb'] : null,
                    'tahun_perolehan' => !empty($row['tahun_perolehan']) ? intval($row['tahun_perolehan']) : null,
                    'luas_tanah' => !empty($row['luas_tanah']) ? floatval($row['luas_tanah']) : null,
                    'luas_pagar' => !empty($row['luas_pagar']) ? floatval($row['luas_pagar']) : null,
                    'luas_bangunan' => !empty($row['luas_bangunan']) ? floatval($row['luas_bangunan']) : null,
                    'keterangan' => $row['keterangan'] ?? null,
                ];

                if ($existing) {
                    $existing->update($dataToSave);
                } else {
                    BuildingLand::create($dataToSave);
                }

                $importedCount++;
            }
        });

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Import CSV',
            'module' => 'Daftar Tanah',
            'details' => "Mengimpor massal {$importedCount} data tanah",
        ]);

        return response()->json([
            'success' => true,
            'message' => "{$importedCount} data tanah berhasil diimpor",
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string',
        ]);

        $land = BuildingLand::findOrFail($id);
        $land->update([
            'status' => $request->input('status')
        ]);

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Edit',
            'module' => 'Daftar Tanah',
            'details' => "Mengubah status tanah: {$land->unit_kerja} menjadi {$land->status}",
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status tanah berhasil diperbarui',
            'land' => $land,
        ]);
    }
}
