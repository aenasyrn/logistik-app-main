<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Inventory;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'id' => 'nullable|integer',
            'nomorSurat' => 'required|string|max:255',
            'tanggal' => 'required|date',
            'jenisTransaksi' => 'required|string|in:Barang Masuk,Barang Keluar',
            'penerimaNama' => 'nullable|string|max:255',
            'penerimaJabatan' => 'nullable|string|max:255',
            'penerimaInstansi' => 'nullable|string|max:255',
            'pengirimNama' => 'nullable|string|max:255',
            'pengirimJabatan' => 'nullable|string|max:255',
            'pengirimInstansi' => 'nullable|string|max:255',
            'mengetahuiNama' => 'nullable|string|max:255',
            'mengetahuiJabatan' => 'nullable|string|max:255',
            'lokasi' => 'nullable|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.nama' => 'required|string|max:255',
            'items.*.kuantitas' => 'required|integer|min:1',
            'items.*.satuan' => 'required|string|max:50',
            'items.*.sn' => 'nullable|string|max:255',
            'items.*.keterangan' => 'nullable|string',
            'items.*.outlet_id' => 'nullable|integer',
            'items.*.outlet' => 'nullable|string',
        ]);

        $newTrx = null;

        DB::transaction(function () use ($data, &$newTrx) {
            $itemNames = collect($data['items'])->pluck('nama')->toArray();
            
            if (isset($data['id']) && $data['id']) {
                $newTrx = Transaction::findOrFail($data['id']);
                $oldItemNames = $newTrx->items->pluck('nama')->toArray();
                $itemNames = array_unique(array_merge($itemNames, $oldItemNames));
            }

            // Batch fetch all required inventories to minimize DB roundtrips over remote connection
            $inventories = Inventory::whereIn('nama', $itemNames)->get()->keyBy('nama');

            if (isset($data['id']) && $data['id']) {
                // Revert previous inventory changes
                foreach ($newTrx->items as $oldItem) {
                    $oldDiff = ($newTrx->jenis_transaksi === 'Barang Keluar') 
                        ? -intval($oldItem->kuantitas) 
                        : intval($oldItem->kuantitas);

                    $inventory = $inventories->get($oldItem->nama);
                    if ($inventory) {
                        $inventory->update([
                            'kuantitas' => $inventory->kuantitas - $oldDiff,
                        ]);
                    }
                }

                // Delete old items
                $newTrx->items()->delete();

                // Update Transaction
                $newTrx->update([
                    'nomor_surat' => $data['nomorSurat'],
                    'tanggal' => $data['tanggal'],
                    'jenis_transaksi' => $data['jenisTransaksi'],
                    'penerima_nama' => $data['penerimaNama'] ?? null,
                    'penerima_jabatan' => $data['penerimaJabatan'] ?? null,
                    'penerima_instansi' => $data['penerimaInstansi'] ?? null,
                    'pengirim_nama' => $data['pengirimNama'] ?? null,
                    'pengirim_jabatan' => $data['pengirimJabatan'] ?? null,
                    'pengirim_instansi' => $data['pengirimInstansi'] ?? null,
                    'mengetahui_nama' => $data['mengetahuiNama'] ?? null,
                    'mengetahui_jabatan' => $data['mengetahuiJabatan'] ?? null,
                    'lokasi' => $data['lokasi'] ?? null,
                ]);
            } else {
                // Create Transaction
                $newTrx = Transaction::create([
                    'nomor_surat' => $data['nomorSurat'],
                    'tanggal' => $data['tanggal'],
                    'jenis_transaksi' => $data['jenisTransaksi'],
                    'penerima_nama' => $data['penerimaNama'] ?? null,
                    'penerima_jabatan' => $data['penerimaJabatan'] ?? null,
                    'penerima_instansi' => $data['penerimaInstansi'] ?? null,
                    'pengirim_nama' => $data['pengirimNama'] ?? null,
                    'pengirim_jabatan' => $data['pengirimJabatan'] ?? null,
                    'pengirim_instansi' => $data['pengirimInstansi'] ?? null,
                    'mengetahui_nama' => $data['mengetahuiNama'] ?? null,
                    'mengetahui_jabatan' => $data['mengetahuiJabatan'] ?? null,
                    'lokasi' => $data['lokasi'] ?? null,
                ]);
            }

            // Save items & update stock
            foreach ($data['items'] as $item) {
                // Insert transaction item
                TransactionItem::create([
                    'transaction_id' => $newTrx->id,
                    'nama' => $item['nama'],
                    'kuantitas' => $item['kuantitas'],
                    'satuan' => $item['satuan'],
                    'sn' => $item['sn'] ?? null,
                    'keterangan' => $item['keterangan'] ?? null,
                    'outlet_id' => $item['outlet_id'] ?? null,
                    'outlet' => $item['outlet'] ?? null,
                ]);

                // Update inventory
                $diff = ($data['jenisTransaksi'] === 'Barang Keluar') 
                    ? -intval($item['kuantitas']) 
                    : intval($item['kuantitas']);

                $inventory = $inventories->get($item['nama']);

                if ($inventory) {
                    $inventory->update([
                        'kuantitas' => $inventory->kuantitas + $diff,
                    ]);
                } else {
                    $newInv = Inventory::create([
                        'nama' => $item['nama'],
                        'kuantitas' => $diff,
                        'satuan' => $item['satuan'],
                        'deskripsi' => 'Dibuat otomatis dari transaksi',
                    ]);
                    // Store the newly created inventory in our mapping just in case of multiple items of the same type in one transaction
                    $inventories[$item['nama']] = $newInv;
                }
            }

            // Log activity
            ActivityLog::create([
                'user_email' => auth()->user()->email,
                'action' => isset($data['id']) && $data['id'] ? 'UBAH' : 'BUAT',
                'module' => 'TRANSAKSI',
                'details' => "Surat {$data['jenisTransaksi']} No: {$data['nomorSurat']}",
            ]);
        });

        // Load items relation to return to frontend
        $newTrx->load('items');

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil disimpan & Stok diperbarui!',
            'transaction' => $newTrx,
        ]);
    }

    public function destroy($id)
    {
        $transaction = Transaction::findOrFail($id);
        $nomorSurat = $transaction->nomor_surat;
        $transaction->delete(); // Cascade delete handles items

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'HAPUS',
            'module' => 'TRANSAKSI',
            'details' => "Menghapus Transaksi No: {$nomorSurat}",
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil dihapus!',
        ]);
    }
}
