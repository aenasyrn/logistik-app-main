<?php

namespace App\Http\Controllers;

use App\Models\SecurityFacility;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class SecurityFacilityController extends Controller
{
    public function store(Request $request)
    {
        // Shift all existing no_urut values to make room for the new record at the top (no_urut = 1)
        \App\Models\SecurityFacility::query()->update([
            'no_urut' => \Illuminate\Support\Facades\DB::raw('CAST(no_urut AS UNSIGNED) + 1')
        ]);

        $outletId = $request->input('outlet_id') ?? $request->input('idOutlet');
        if (!empty($outletId) && (!is_numeric($outletId) || !\App\Models\Outlet::where('id', $outletId)->exists())) {
            $outletId = null;
        }

        $request->merge([
            'outlet_id' => $outletId ? intval($outletId) : null,
            'kantor_wilayah' => $request->input('kantor_wilayah') ?: 'KANWIL JAKARTA 1',
        ]);

        $data = $request->validate([
            'outlet_id' => 'nullable|integer',
            'kantor_wilayah' => 'nullable|string|max:50',
            'kantor_area' => 'nullable|string|max:50',
            'kantor_cabang' => 'nullable|string|max:50',
            'kode_unit_kerja' => 'nullable|string|max:50',
            'nama_unit_kerja' => 'required|string|max:50',
            'status' => 'nullable|string|max:50',
            'vendor' => 'nullable|string|max:50',
            'jumlah_kamera' => 'nullable|string|max:50',
            'aplikasi' => 'nullable|string|max:50',
            'nama_aplikasi' => 'nullable|string|max:50',
            'keterangan' => 'nullable|string',
        ]);
 
        $data['no_urut'] = '1';
 
        $facility = SecurityFacility::create($data);
 
        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Tambah',
            'module' => 'Pengamanan dan Korporasi',
            'details' => "Menambahkan pengamanan & korporasi: {$facility->nama_unit_kerja}",
        ]);
 
        return redirect()->back()->with('message', 'Data pengamanan dan korporasi berhasil ditambahkan');
    }
 
    public function update(Request $request, $id)
    {
        $outletId = $request->input('outlet_id') ?? $request->input('idOutlet');
        if (!empty($outletId) && (!is_numeric($outletId) || !\App\Models\Outlet::where('id', $outletId)->exists())) {
            $outletId = null;
        }

        $request->merge([
            'outlet_id' => $outletId ? intval($outletId) : null,
            'kantor_wilayah' => $request->input('kantor_wilayah') ?: 'KANWIL JAKARTA 1',
        ]);

        $data = $request->validate([
            'outlet_id' => 'nullable|integer',
            'no_urut' => 'nullable|integer',
            'kantor_wilayah' => 'nullable|string|max:50',
            'kantor_area' => 'nullable|string|max:50',
            'kantor_cabang' => 'nullable|string|max:50',
            'kode_unit_kerja' => 'nullable|string|max:50',
            'nama_unit_kerja' => 'required|string|max:50',
            'status' => 'nullable|string|max:50',
            'vendor' => 'nullable|string|max:50',
            'jumlah_kamera' => 'nullable|string|max:50',
            'aplikasi' => 'nullable|string|max:50',
            'nama_aplikasi' => 'nullable|string|max:50',
            'keterangan' => 'nullable|string',
        ]);


        $facility = SecurityFacility::findOrFail($id);
        $facility->update($data);

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Edit',
            'module' => 'Pengamanan dan Korporasi',
            'details' => "Mengubah pengamanan & korporasi: {$facility->nama_unit_kerja}",
        ]);

        return redirect()->back()->with('message', 'Data pengamanan dan korporasi berhasil diperbarui');
    }

    public function destroy($id)
    {
        $facility = SecurityFacility::findOrFail($id);
        $nama = $facility->nama_unit_kerja;
        $facility->delete();

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Hapus',
            'module' => 'Pengamanan dan Korporasi',
            'details' => "Menghapus pengamanan & korporasi: {$nama}",
        ]);

        return redirect()->back()->with('message', 'Data pengamanan dan korporasi berhasil dihapus');
    }

    public function import(Request $request)
    {
        $request->validate([
            'rows' => 'required|array',
        ]);

        $rows = $request->input('rows');
        $importedCount = 0;

        \Illuminate\Support\Facades\DB::transaction(function () use ($rows, &$importedCount) {
            $validRows = [];
            foreach ($rows as $row) {
                if (!empty($row['nama_unit_kerja'])) {
                    $validRows[] = $row;
                }
            }

            $importCount = count($validRows);
            if ($importCount === 0) {
                return;
            }

            // Shift existing rows to make space at the top
            SecurityFacility::query()->update([
                'no_urut' => \Illuminate\Support\Facades\DB::raw("COALESCE(CAST(no_urut AS UNSIGNED), 0) + {$importCount}")
            ]);

            $currentIndex = 1;
            foreach ($validRows as $row) {
                $existing = null;
                if (!empty($row['kode_unit_kerja'])) {
                    $existing = SecurityFacility::where('kode_unit_kerja', $row['kode_unit_kerja'])->first();
                }
                if (!$existing && !empty($row['nama_unit_kerja'])) {
                    $existing = SecurityFacility::where('nama_unit_kerja', $row['nama_unit_kerja'])->first();
                }

                $dataToSave = [
                    'no_urut' => $currentIndex,
                    'kantor_wilayah' => $row['kantor_wilayah'] ?? null,
                    'kantor_area' => $row['kantor_area'] ?? null,
                    'kantor_cabang' => $row['kantor_cabang'] ?? null,
                    'kode_unit_kerja' => $row['kode_unit_kerja'] ?? null,
                    'nama_unit_kerja' => $row['nama_unit_kerja'],
                    'status' => $row['status'] ?? 'Online',
                    'vendor' => $row['vendor'] ?? null,
                    'jumlah_kamera' => !empty($row['jumlah_kamera']) ? intval($row['jumlah_kamera']) : null,
                    'aplikasi' => $row['aplikasi'] ?? null,
                    'nama_aplikasi' => $row['nama_aplikasi'] ?? null,
                    'keterangan' => $row['keterangan'] ?? null,
                ];

                if ($existing) {
                    $existing->update($dataToSave);
                } else {
                    SecurityFacility::create($dataToSave);
                }

                $currentIndex++;
                $importedCount++;
            }
        });

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Import CSV',
            'module' => 'Pengamanan dan Korporasi',
            'details' => "Mengimpor massal {$importedCount} data pengamanan dan korporasi",
        ]);

        return response()->json([
            'success' => true,
            'message' => "{$importedCount} data pengamanan dan korporasi berhasil diimpor",
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $data = $request->validate([
            'status' => 'required|string|max:50',
        ]);

        $facility = SecurityFacility::findOrFail($id);
        $facility->update($data);

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'UBAH',
            'module' => 'PENGAMANAN DAN KORPORASI',
            'details' => "Mengubah status cctv/sarana: {$facility->nama_unit_kerja} menjadi {$facility->status}",
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status berhasil diperbarui',
            'facility' => $facility,
        ]);
    }
}
