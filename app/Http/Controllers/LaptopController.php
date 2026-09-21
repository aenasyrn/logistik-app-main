<?php

namespace App\Http\Controllers;

use App\Models\Laptop;
use App\Models\Inventory;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LaptopController extends Controller
{
    private function mergeRequestFields(Request $request)
    {
        $nikPegawai = $request->input('nikPegawai') ?? $request->input('nik_pegawai');
        $namaPengguna = $request->input('namaPengguna') ?? $request->input('nama_pengguna');
        $jabatan = $request->input('jabatan') ?? $request->input('namaJabatan');
        $departemen = $request->input('departemen');
        $produk = $request->input('produk') ?? $request->input('modelLaptop');
        $hostname = $request->input('hostname') ?? $request->input('deviceName');
        $sn = $request->input('sn') ?? $request->input('serialNumber');
        $os = $request->input('os');
        $kondisi = $request->input('kondisi') ?? 'BAIK';
        $penyedia = $request->input('penyedia') ?? $request->input('vendor');
        $tanggalMulai = $request->input('tanggalMulai') ?? $request->input('tanggal_mulai');
        $tanggalSelesai = $request->input('tanggalSelesai') ?? $request->input('tanggal_selesai');
        $masaSewaBulan = $request->input('masaSewaBulan') ?? $request->input('masa_sewa_bulan');
        $status = $request->input('status');
        $inventoryId = $request->input('inventory_id');

        $resolvedInventoryId = (is_numeric($inventoryId) && intval($inventoryId) > 0) ? intval($inventoryId) : null;
        if (!$resolvedInventoryId && !empty($produk)) {
            $matchedInv = Inventory::whereRaw('LOWER(TRIM(nama)) = ?', [strtolower(trim($produk))])->first();
            if ($matchedInv) {
                $resolvedInventoryId = $matchedInv->id;
            }
        }

        $request->merge([
            'nik_pegawai' => $nikPegawai,
            'nama_pengguna' => $namaPengguna,
            'jabatan' => $jabatan,
            'departemen' => $departemen,
            'produk' => $produk,
            'hostname' => $hostname,
            'sn' => $sn,
            'os' => $os ?: null,
            'kondisi' => $kondisi ?: 'BAIK',
            'penyedia' => $penyedia,
            'tanggal_mulai' => (!empty($tanggalMulai) && $tanggalMulai !== 'null') ? $tanggalMulai : null,
            'tanggal_selesai' => (!empty($tanggalSelesai) && $tanggalSelesai !== 'null') ? $tanggalSelesai : null,
            'masaSewaBulan' => (is_numeric($masaSewaBulan) && intval($masaSewaBulan) >= 0) ? intval($masaSewaBulan) : null,
            'masa_sewa_bulan' => (is_numeric($masaSewaBulan) && intval($masaSewaBulan) >= 0) ? intval($masaSewaBulan) : null,
            'status' => $status ?: 'Inventaris',
            'inventory_id' => $resolvedInventoryId,
        ]);
    }

    public function store(Request $request)
    {
        $this->mergeRequestFields($request);

        $data = $request->validate([
            'inventory_id' => 'nullable|integer',
            'nik_pegawai' => 'nullable|string',
            'nama_pengguna' => 'nullable|string',
            'jabatan' => 'nullable|string',
            'departemen' => 'nullable|string',
            'produk' => 'nullable|string',
            'hostname' => 'nullable|string',
            'sn' => 'nullable|string',
            'os' => 'nullable|string',
            'kondisi' => 'nullable|string',
            'penyedia' => 'nullable|string',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
            'masa_sewa_bulan' => 'nullable|integer',
            'status' => 'nullable|string',
            'keterangan' => 'nullable|string',
        ]);

        $laptop = Laptop::create($data);
        $laptop->load(['histories', 'inventory.histories']);

        ActivityLog::create([
            'user_email' => auth()->user()?->email ?? 'system',
            'action' => 'Tambah',
            'module' => 'Data Laptop',
            'details' => "Menambahkan laptop SN: {$laptop->sn} pengguna: {$laptop->nama_pengguna}",
        ]);

        return response()->json($laptop);
    }

    public function update(Request $request, $id)
    {
        $this->mergeRequestFields($request);

        $data = $request->validate([
            'inventory_id' => 'nullable|integer',
            'nik_pegawai' => 'nullable|string',
            'nama_pengguna' => 'nullable|string',
            'jabatan' => 'nullable|string',
            'departemen' => 'nullable|string',
            'produk' => 'nullable|string',
            'hostname' => 'nullable|string',
            'sn' => 'nullable|string',
            'os' => 'nullable|string',
            'kondisi' => 'nullable|string',
            'penyedia' => 'nullable|string',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
            'masa_sewa_bulan' => 'nullable|integer',
            'status' => 'nullable|string',
            'keterangan' => 'nullable|string',
        ]);

        $laptop = Laptop::findOrFail($id);
        $laptop->update($data);
        $laptop->load(['histories', 'inventory.histories']);

        ActivityLog::create([
            'user_email' => auth()->user()?->email ?? 'system',
            'action' => 'Edit',
            'module' => 'Data Laptop',
            'details' => "Mengubah data laptop SN: {$laptop->sn} pengguna: {$laptop->nama_pengguna}",
        ]);

        return response()->json($laptop);
    }

    public function destroy($id)
    {
        $laptop = Laptop::findOrFail($id);
        $sn = $laptop->sn;
        $user = $laptop->nama_pengguna;
        $laptop->delete();

        ActivityLog::create([
            'user_email' => auth()->user()?->email ?? 'system',
            'action' => 'Hapus',
            'module' => 'Data Laptop',
            'details' => "Menghapus laptop SN: {$sn} (Pengguna: {$user})",
        ]);

        return response()->json(['message' => 'Laptop berhasil dihapus']);
    }

    public function import(Request $request)
    {
        $request->validate([
            'rows' => 'required|array',
        ]);

        $rows = $request->input('rows');
        $importedCount = 0;
        $existingLaptops = Laptop::all()->keyBy('sn');

        DB::transaction(function () use ($rows, &$importedCount, $existingLaptops) {
            $newLaptops = [];
            $laptopsToUpdate = [];

            foreach ($rows as $r) {
                $sn = trim($r['sn'] ?? $r['serial_number'] ?? '');
                if (empty($sn)) continue;

                $data = [
                    'nik_pegawai' => $r['nik_pegawai'] ?? $r['nik'] ?? null,
                    'nama_pengguna' => $r['nama_pengguna'] ?? $r['pengguna'] ?? null,
                    'jabatan' => $r['jabatan'] ?? null,
                    'departemen' => $r['departemen'] ?? null,
                    'produk' => $r['produk'] ?? $r['model'] ?? null,
                    'hostname' => $r['hostname'] ?? null,
                    'sn' => $sn,
                    'os' => $r['os'] ?? 'Windows',
                    'kondisi' => $r['kondisi'] ?? 'BAIK',
                    'penyedia' => $r['penyedia'] ?? $r['vendor'] ?? null,
                    'tanggal_mulai' => $r['tanggal_mulai'] ?? null,
                    'tanggal_selesai' => $r['tanggal_selesai'] ?? null,
                    'masa_sewa_bulan' => $r['masa_sewa_bulan'] ?? null,
                    'status' => $r['status'] ?? 'Inventaris',
                    'keterangan' => $r['keterangan'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                if (isset($existingLaptops[$sn])) {
                    $existing = $existingLaptops[$sn];
                    $laptopsToUpdate[] = array_merge(['id' => $existing->id], $data);
                } else {
                    $newLaptops[] = $data;
                }
                $importedCount++;
            }

            if (!empty($newLaptops)) {
                foreach (array_chunk($newLaptops, 500) as $chunk) {
                    DB::table('laptops')->insert($chunk);
                }
            }

            if (!empty($laptopsToUpdate)) {
                foreach ($laptopsToUpdate as $up) {
                    $id = $up['id'];
                    unset($up['id']);
                    DB::table('laptops')->where('id', $id)->update($up);
                }
            }
        });

        ActivityLog::create([
            'user_email' => auth()->user()?->email ?? 'system',
            'action' => 'Import',
            'module' => 'Data Laptop',
            'details' => "Mengimpor {$importedCount} data laptop",
        ]);

        return response()->json([
            'message' => "Berhasil mengimpor {$importedCount} data laptop.",
            'count' => $importedCount,
        ]);
    }
}
