<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\Computer;
use App\Models\Printer;
use App\Models\Laptop;
use App\Models\ContractHistory;
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
            'jenis_barang' => 'nullable|string|max:100',
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
            'biaya_sewa' => 'nullable|integer|min:0',
            'harga_satuan' => 'nullable|integer|min:0',
        ]);

        $namaInput = trim($request->nama ?? '');
        $vendorInput = trim($request->vendor_nama ?? '');

        $duplicateQuery = Inventory::whereRaw('LOWER(TRIM(nama)) = ?', [strtolower($namaInput)]);
        if ($vendorInput !== '') {
            $duplicateQuery->whereRaw('LOWER(TRIM(vendor_nama)) = ?', [strtolower($vendorInput)]);
        } else {
            $duplicateQuery->where(function ($q) {
                $q->whereNull('vendor_nama')->orWhereRaw('TRIM(vendor_nama) = ""');
            });
        }

        if ($duplicateQuery->exists()) {
            return redirect()->back()->withErrors([
                'nama' => 'Barang dengan nama dan vendor yang sama sudah terdaftar.'
            ]);
        }

        $item = Inventory::create($request->only([
            'nama', 'jenis_barang', 'kuantitas', 'satuan', 'vendor_nama', 'no_spk', 'no_pks',
            'tanggal_mulai', 'tanggal_selesai', 'masa_sewa_bulan', 'status', 'deskripsi', 'biaya_sewa', 'harga_satuan'
        ]));

        ActivityLog::create([
            'user_email' => auth()->user()?->email ?? 'system',
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
            'jenis_barang' => 'nullable|string|max:100',
            'kuantitas' => 'required|numeric',
            'satuan' => 'required|string|max:50',
            'vendor_nama' => 'nullable|string|max:255',
            'no_spk' => 'nullable|string|max:255',
            'no_pks' => 'nullable|string|max:255',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
            'masa_sewa_bulan' => 'nullable|integer|min:0',
            'status' => 'nullable|string|max:100',
            'deskripsi' => 'nullable|string',
            'biaya_sewa' => 'nullable|integer|min:0',
            'harga_satuan' => 'nullable|integer|min:0',
        ]);

        $namaInput = trim($request->nama ?? '');
        $vendorInput = trim($request->vendor_nama ?? '');

        $duplicateQuery = Inventory::where('id', '!=', $id)
            ->whereRaw('LOWER(TRIM(nama)) = ?', [strtolower($namaInput)]);
        if ($vendorInput !== '') {
            $duplicateQuery->whereRaw('LOWER(TRIM(vendor_nama)) = ?', [strtolower($vendorInput)]);
        } else {
            $duplicateQuery->where(function ($q) {
                $q->whereNull('vendor_nama')->orWhereRaw('TRIM(vendor_nama) = ""');
            });
        }

        if ($duplicateQuery->exists()) {
            return redirect()->back()->withErrors([
                'nama' => 'Barang dengan nama dan vendor yang sama sudah terdaftar.'
            ]);
        }

        $item = Inventory::findOrFail($id);
        $oldNama = $item->nama;

        $modeEdit = $request->input('mode_edit', 'koreksi');

        if ($modeEdit === 'perpanjang') {
            ContractHistory::create([
                'contractable_type' => Inventory::class,
                'contractable_id' => $item->id,
                'tgl_mulai' => $item->tanggal_mulai,
                'tgl_selesai' => $item->tanggal_selesai,
                'biaya' => $item->biaya_sewa,
                'harga_satuan' => $item->harga_satuan,
                'kuantitas' => $item->kuantitas ?? $item->stok,
                'satuan' => $item->satuan,
                'no_dokumen' => $item->no_spk ?? $item->no_pks,
                'no_spk' => $item->no_spk,
                'no_pks' => $item->no_pks,
                'vendor' => $item->vendor_nama,
                'status' => $item->status,
                'keterangan' => $item->deskripsi,
                'user_email' => auth()->user()?->email ?? 'system',
            ]);
        }

        $inputData = $request->only([
            'nama', 'jenis_barang', 'kuantitas', 'satuan', 'vendor_nama', 'no_spk', 'no_pks',
            'tanggal_mulai', 'tanggal_selesai', 'masa_sewa_bulan', 'status', 'deskripsi', 'biaya_sewa', 'harga_satuan'
        ]);
        if (empty($inputData['vendor_nama'])) {
            $inputData['vendor_nama'] = $request->input('penyedia') ?? $request->input('vendor') ?? $item->vendor_nama;
        }

        $item->update($inputData);
        $item->refresh();

        // Hitung status real-time berdasarkan tanggal_selesai
        $autoStatus = 'Inventaris';
        if (!empty($item->tanggal_selesai)) {
            $today = now()->startOfDay();
            $end = \Carbon\Carbon::parse($item->tanggal_selesai)->startOfDay();
            $autoStatus = $end->greaterThanOrEqualTo($today) ? 'Sewa Berjalan' : 'Sewa Habis';
        }

        // Sinkronisasi otomatis ke Data Komputer dan Data Printer
        $syncData = [
            'inventory_id' => $item->id,
            'tanggal_mulai' => $item->tanggal_mulai,
            'tanggal_selesai' => $item->tanggal_selesai,
            'status' => $autoStatus,
        ];

        $cleanOldNama = strtolower(trim(preg_replace('/\s*\(\d+\s*unit\)/i', '', $oldNama)));
        $cleanNewNama = strtolower(trim(preg_replace('/\s*\(\d+\s*unit\)/i', '', $item->nama)));

        // Sync Computers
        $compUpdate = $syncData;
        if (!empty($item->vendor_nama)) {
            $compUpdate['penyedia'] = $item->vendor_nama;
        }
        Computer::where('inventory_id', $item->id)
            ->orWhereRaw('LOWER(TRIM(produk)) = ?', [strtolower(trim($oldNama))])
            ->orWhereRaw('LOWER(TRIM(produk)) = ?', [strtolower(trim($item->nama))])
            ->orWhereRaw('LOWER(TRIM(produk)) LIKE ?', ['%' . $cleanNewNama . '%'])
            ->update($compUpdate);

        // Sync Printers
        $printerUpdate = $syncData;
        if (!empty($item->vendor_nama)) {
            $printerUpdate['vendor'] = $item->vendor_nama;
        }
        Printer::where('inventory_id', $item->id)
            ->orWhereRaw('LOWER(TRIM(produk)) = ?', [strtolower(trim($oldNama))])
            ->orWhereRaw('LOWER(TRIM(produk)) = ?', [strtolower(trim($item->nama))])
            ->orWhereRaw('LOWER(TRIM(produk)) LIKE ?', ['%' . $cleanNewNama . '%'])
            ->update($printerUpdate);

        // Sync Laptops
        $laptopUpdate = $syncData;
        if (!empty($item->vendor_nama)) {
            $laptopUpdate['penyedia'] = $item->vendor_nama;
        }
        Laptop::where('inventory_id', $item->id)
            ->orWhereRaw('LOWER(TRIM(produk)) = ?', [strtolower(trim($oldNama))])
            ->orWhereRaw('LOWER(TRIM(produk)) = ?', [strtolower(trim($item->nama))])
            ->orWhereRaw('LOWER(TRIM(produk)) LIKE ?', ['%' . $cleanNewNama . '%'])
            ->update($laptopUpdate);

        ActivityLog::create([
            'user_email' => auth()->user()?->email ?? 'system',
            'action' => $modeEdit === 'perpanjang' ? 'Perpanjang Sewa' : 'Edit',
            'module' => 'Master Barang',
            'details' => $modeEdit === 'perpanjang'
                ? "Memperpanjang masa sewa barang: {$item->nama} hingga {$item->tanggal_selesai}"
                : "Mengubah barang: {$oldNama} menjadi {$item->nama}",
        ]);

        return redirect()->back()->with('message', $modeEdit === 'perpanjang' ? 'Perpanjangan sewa berhasil disimpan dan disinkronkan ke perangkat terkait' : 'Barang berhasil diperbarui');
    }

    public function destroy($id)
    {
        $item = Inventory::findOrFail($id);
        $nama = $item->nama;
        $item->delete();

        ActivityLog::create([
            'user_email' => auth()->user()?->email ?? 'system',
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
                    'jenis_barang' => $row['jenis_barang'] ?? $row['jenis'] ?? null,
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
                    'biaya_sewa' => !empty($row['biaya_sewa']) ? intval($row['biaya_sewa']) : 0,
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
            'user_email' => auth()->user()?->email ?? 'system',
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
