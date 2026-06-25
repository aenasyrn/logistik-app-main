<?php

namespace App\Http\Controllers;

use App\Models\BuildingSewa;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class BuildingSewaController extends Controller
{
    private function mergeRequestFields(Request $request)
    {
        $request->merge([
            'outlet_id' => $request->input('idOutlet') ?? $request->input('outlet_id'),
            'kode_outlet' => $request->input('kode_outlet') ?? $request->input('kodeOutlet'),
            'nama_outlet' => $request->input('nama_outlet') ?? $request->input('namaOutlet') ?? $request->input('outlet'),
            'type_outlet' => $request->input('type_outlet') ?? $request->input('typeOutlet'),
            'type_bangunan' => $request->input('type_bangunan') ?? $request->input('typeBangunan'),
            'jenis_sto' => $request->input('jenis_sto') ?? $request->input('jenisSto'),
            'status_gedung' => $request->input('status_gedung') ?? $request->input('statusGedung'),
            'periode_sewa' => $request->input('periode_sewa') ?? $request->input('periodeSewa'),
            'tgl_kontrak_mulai' => $request->input('tgl_kontrak_mulai') ?? $request->input('tanggal_kontrak_mulai') ?? $request->input('tanggalKontrakMulai') ?? $request->input('tanggal_mulai'),
            'tgl_kontrak_berakhir' => $request->input('tgl_kontrak_berakhir') ?? $request->input('tanggal_kontrak_berakhir') ?? $request->input('tanggalKontrakBerakhir') ?? $request->input('tanggal_selesai'),
            'harga_sewa' => $request->input('harga_sewa') ?? $request->input('hargaSewa'),
            'keterangan' => $request->input('keterangan') ?? $request->input('deskripsi'),
            'alamat' => $request->input('alamat'),
            'kelurahan' => $request->input('kelurahan'),
            'kecamatan' => $request->input('kecamatan'),
            'kab_kota' => $request->input('kab_kota') ?? $request->input('kabKota'),
            'provinsi' => $request->input('provinsi'),
        ]);
    }

    public function store(Request $request)
    {
        $this->mergeRequestFields($request);

        $data = $request->validate([
            'outlet_id' => 'nullable|integer',
            'kode_outlet' => 'nullable|string',
            'nama_outlet' => 'nullable|string',
            'type_outlet' => 'nullable|string',
            'type_bangunan' => 'nullable|string',
            'jenis_sto' => 'nullable|string',
            'status_gedung' => 'nullable|string',
            'periode_sewa' => 'nullable',
            'tgl_kontrak_mulai' => 'nullable|date',
            'tgl_kontrak_berakhir' => 'nullable|date',
            'harga_sewa' => 'nullable|numeric',
            'keterangan' => 'nullable|string',
            'alamat' => 'nullable|string',
            'kelurahan' => 'nullable|string',
            'kecamatan' => 'nullable|string',
            'kab_kota' => 'nullable|string',
            'provinsi' => 'nullable|string',
        ]);

        $sewa = BuildingSewa::create($data);

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Tambah',
            'module' => 'Sewa Bangunan',
            'details' => "Menambahkan sewa outlet: {$sewa->nama_outlet}",
        ]);

        return redirect()->back()->with('message', 'Data sewa berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $this->mergeRequestFields($request);

        try {
            $data = $request->validate([
                'outlet_id' => 'nullable|integer',
                'kode_outlet' => 'nullable|string',
                'nama_outlet' => 'nullable|string',
                'type_outlet' => 'nullable|string',
                'type_bangunan' => 'nullable|string',
                'jenis_sto' => 'nullable|string',
                'status_gedung' => 'nullable|string',
                'periode_sewa' => 'nullable',
                'tgl_kontrak_mulai' => 'nullable|date',
                'tgl_kontrak_berakhir' => 'nullable|date',
                'harga_sewa' => 'nullable|numeric',
                'keterangan' => 'nullable|string',
                'alamat' => 'nullable|string',
                'kelurahan' => 'nullable|string',
                'kecamatan' => 'nullable|string',
                'kab_kota' => 'nullable|string',
                'provinsi' => 'nullable|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Illuminate\Support\Facades\Log::error('Validation failed during sewa update: ' . json_encode($e->errors()));
            throw $e;
        }

        $sewa = BuildingSewa::findOrFail($id);
        $sewa->update($data);

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Edit',
            'module' => 'Sewa Bangunan',
            'details' => "Mengubah sewa outlet: {$sewa->nama_outlet}",
        ]);

        return redirect()->back()->with('message', 'Data sewa berhasil diperbarui');
    }

    public function destroy($id)
    {
        $sewa = BuildingSewa::findOrFail($id);
        $outletName = $sewa->nama_outlet;
        $sewa->delete();

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Hapus',
            'module' => 'Sewa Bangunan',
            'details' => "Menghapus sewa outlet: {$outletName}",
        ]);

        return redirect()->back()->with('message', 'Data sewa berhasil dihapus');
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
                if (empty($row['nama_outlet']) && empty($row['kode_outlet'])) {
                    continue;
                }

                $outletId = !empty($row['outlet_id']) ? intval($row['outlet_id']) : null;
                if ($outletId && !\App\Models\Outlet::where('id', $outletId)->exists()) {
                    \App\Models\Outlet::create([
                        'id' => $outletId,
                        'code' => $row['kode_outlet'] ?? (string) $outletId,
                        'nama' => $row['nama_outlet'] ?? 'Outlet Baru',
                        'alamat' => $row['alamat'] ?? null,
                    ]);
                }

                $existing = null;
                if (!empty($row['kode_outlet'])) {
                    $existing = BuildingSewa::where('kode_outlet', $row['kode_outlet'])->first();
                }
                if (!$existing && !empty($row['nama_outlet'])) {
                    $existing = BuildingSewa::where('nama_outlet', $row['nama_outlet'])->first();
                }

                $dataToSave = [
                    'outlet_id' => $outletId,
                    'kode_outlet' => $row['kode_outlet'] ?? null,
                    'nama_outlet' => $row['nama_outlet'] ?? null,
                    'type_outlet' => $row['type_outlet'] ?? null,
                    'type_bangunan' => $row['type_bangunan'] ?? null,
                    'jenis_sto' => $row['jenis_sto'] ?? null,
                    'status_gedung' => $row['status_gedung'] ?? null,
                    'periode_sewa' => $row['periode_sewa'] ?? null,
                    'tgl_kontrak_mulai' => !empty($row['tgl_kontrak_mulai']) ? $row['tgl_kontrak_mulai'] : null,
                    'tgl_kontrak_berakhir' => !empty($row['tgl_kontrak_berakhir']) ? $row['tgl_kontrak_berakhir'] : null,
                    'harga_sewa' => !empty($row['harga_sewa']) ? floatval($row['harga_sewa']) : 0,
                    'keterangan' => $row['keterangan'] ?? null,
                    'alamat' => $row['alamat'] ?? null,
                    'kelurahan' => $row['kelurahan'] ?? null,
                    'kecamatan' => $row['kecamatan'] ?? null,
                    'kab_kota' => $row['kab_kota'] ?? null,
                    'provinsi' => $row['provinsi'] ?? null,
                ];

                if ($existing) {
                    $existing->update($dataToSave);
                } else {
                    BuildingSewa::create($dataToSave);
                }

                $importedCount++;
            }
        });

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Import CSV',
            'module' => 'Sewa Bangunan',
            'details' => "Mengimpor massal {$importedCount} data sewa bangunan",
        ]);

        return response()->json([
            'success' => true,
            'message' => "{$importedCount} data sewa bangunan berhasil diimpor",
        ]);
    }
}
