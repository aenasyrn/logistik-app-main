<?php

namespace App\Http\Controllers;

use App\Models\Printer;
use App\Models\Outlet;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PrinterController extends Controller
{
    private function mergeRequestFields(Request $request)
    {
        $request->merge([
            'outlet_id' => $request->input('idOutlet') ?? $request->input('outlet_id'),
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
            'produk' => 'nullable|string',
            'sn' => 'nullable|string',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
            'penyedia' => 'nullable|string',
            'status' => 'nullable|string',
            'kondisi' => 'nullable|string',
            'deskripsi' => 'nullable|string',
        ]);

        $printer = Printer::create($data);

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
            'outlet' => 'nullable|string',
            'produk' => 'nullable|string',
            'sn' => 'nullable|string',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
            'penyedia' => 'nullable|string',
            'status' => 'nullable|string',
            'kondisi' => 'nullable|string',
            'deskripsi' => 'nullable|string',
        ]);

        $printer = Printer::findOrFail($id);
        $printer->update($data);

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
        $printer = Printer::findOrFail($id);
        $sn = $printer->sn;
        $printer->delete();

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Hapus',
            'module' => 'Data Printer',
            'details' => "Menghapus printer SN: {$sn}",
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

                Printer::updateOrCreate(
                    ['sn' => $row['sn']],
                    [
                        'outlet_id' => $outletId,
                        'outlet' => $row['outlet'] ?? null,
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
            'module' => 'Data Printer',
            'details' => "Mengimpor massal {$importedCount} data printer",
        ]);

        return response()->json([
            'success' => true,
            'message' => "{$importedCount} data printer berhasil diimpor",
        ]);
    }
}
