<?php

namespace App\Http\Controllers;

use App\Models\Computer;
use App\Models\Outlet;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ComputerController extends Controller
{
    private function mergeRequestFields(Request $request)
    {
        $request->merge([
            'outlet_id' => $request->input('idOutlet') ?? $request->input('outlet_id'),
            'ip_address' => $request->input('ipAddress') ?? $request->input('ip_address'),
            'mac_address' => $request->input('macAddress') ?? $request->input('mac_address'),
            'tanggal_mulai' => $request->input('tanggalMulai') ?? $request->input('tanggal_mulai'),
            'tanggal_selesai' => $request->input('tanggalSelesai') ?? $request->input('tanggal_selesai'),
        ]);
    }

    public function store(Request $request)
    {
        $this->mergeRequestFields($request);

        $data = $request->validate([
            'outlet_id' => 'nullable|integer',
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
            'deskripsi' => 'nullable|string',
        ]);

        $computer = Computer::create($data);

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
            'deskripsi' => 'nullable|string',
        ]);

        $computer = Computer::findOrFail($id);
        $computer->update($data);

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Edit',
            'module' => 'Data PC',
            'details' => "Mengubah komputer SN: {$computer->sn}",
        ]);

        return response()->json($computer);
    }

    public function destroy($id)
    {
        $computer = Computer::findOrFail($id);
        $sn = $computer->sn;
        $computer->delete();

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Hapus',
            'module' => 'Data PC',
            'details' => "Menghapus komputer SN: {$sn}",
        ]);

        return response()->json(['success' => true]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'rows' => 'required|array',
        ]);

        $rows = $request->input('rows');
        $importedCount = 0;

        DB::transaction(function () use ($rows, &$importedCount) {
            foreach ($rows as $row) {
                if (empty($row['sn'])) {
                    continue;
                }

                $outletId = !empty($row['outlet_id']) ? intval($row['outlet_id']) : null;
                if ($outletId && !Outlet::where('id', $outletId)->exists()) {
                    Outlet::create([
                        'id' => $outletId,
                        'code' => (string) $outletId,
                        'nama' => $row['outlet'] ?? 'Outlet Baru',
                    ]);
                }

                Computer::updateOrCreate(
                    ['sn' => $row['sn']],
                    [
                        'outlet_id' => $outletId,
                        'outlet' => $row['outlet'] ?? null,
                        'ip_address' => $row['ip_address'] ?? null,
                        'mac_address' => $row['mac_address'] ?? null,
                        'ram' => $row['ram'] ?? null,
                        'storage' => $row['storage'] ?? null,
                        'cpu' => $row['cpu'] ?? null,
                        'os' => $row['os'] ?? null,
                        'produk' => $row['produk'] ?? null,
                        'tanggal_mulai' => !empty($row['tanggal_mulai']) ? $row['tanggal_mulai'] : null,
                        'tanggal_selesai' => !empty($row['tanggal_selesai']) ? $row['tanggal_selesai'] : null,
                        'penyedia' => $row['penyedia'] ?? null,
                        'status' => $row['status'] ?? 'Inventaris',
                        'kondisi' => $row['kondisi'] ?? 'BAIK',
                        'deskripsi' => $row['deskripsi'] ?? null,
                    ]
                );
                $importedCount++;
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
