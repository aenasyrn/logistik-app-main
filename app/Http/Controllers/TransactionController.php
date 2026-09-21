<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Inventory;
use App\Models\Printer;
use App\Models\Computer;
use App\Models\MasterMeubelair;
use App\Models\Meubelair;
use App\Models\Outlet;
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
            'penerimaNama' => 'required|string|max:255',
            'penerimaJabatan' => 'required|string|max:255',
            'penerimaInstansi' => 'nullable|string|max:255',
            'pengirimNama' => 'required|string|max:255',
            'pengirimJabatan' => 'required|string|max:255',
            'pengirimInstansi' => 'nullable|string|max:255',
            'mengetahuiNama' => 'required|string|max:255',
            'mengetahuiJabatan' => 'required|string|max:255',
            'lokasi' => 'nullable|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.nama' => 'required|string|max:255',
            'items.*.kuantitas' => 'required|integer|min:1',
            'items.*.satuan' => 'required|string|max:50',
            'items.*.sn' => 'nullable|string|max:255',
            'items.*.keterangan' => 'nullable|string',
            'items.*.outlet_id' => 'nullable|integer',
            'items.*.outlet' => 'required|string|max:255',
            'items.*.vendor' => 'nullable|string|max:255',
        ]);

        // Pengecekan Hari Kerja (Senin - Jumat). Hari Sabtu & Minggu tidak bisa submit.
        $dayOfWeek = (int) date('N', strtotime($data['tanggal']));
        if ($dayOfWeek === 6 || $dayOfWeek === 7) {
            $hari = ($dayOfWeek === 6) ? 'Sabtu' : 'Minggu';
            return response()->json([
                'success' => false,
                'message' => "Surat Serah Terima tidak dapat disubmit pada hari {$hari}. Pembuatan surat hanya diperbolehkan pada hari kerja (Senin s.d. Jumat)."
            ], 422);
        }

        // Pengecekan Duplikat Nomor Surat (independen per jenis transaksi)
        $duplicateQuery = Transaction::where('jenis_transaksi', $data['jenisTransaksi'])
            ->where('nomor_surat', $data['nomorSurat']);
        if (!empty($data['id'])) {
            $duplicateQuery->where('id', '!=', $data['id']);
        }
        if ($duplicateQuery->exists()) {
            return response()->json([
                'success' => false,
                'message' => "Nomor surat '{$data['nomorSurat']}' sudah digunakan pada transaksi {$data['jenisTransaksi']} lain."
            ], 422);
        }

        // Pengecekan Kuota 20 Slot per Hari
        if (empty($data['id'])) {
            $countOnDate = Transaction::where('jenis_transaksi', $data['jenisTransaksi'])
                ->where('tanggal', $data['tanggal'])
                ->count();
            if ($countOnDate >= 20) {
                $formattedDate = date('d/m/Y', strtotime($data['tanggal']));
                return response()->json([
                    'success' => false,
                    'message' => "Batas kuota 20 surat per hari untuk tanggal {$formattedDate} telah penuh (maksimal 20 surat per hari)."
                ], 422);
            }
        }

        $newTrx = null;

        try {
            DB::transaction(function () use ($data, &$newTrx) {
                $itemNames = collect($data['items'])->pluck('nama')->toArray();
                
                if (isset($data['id']) && $data['id']) {
                    $newTrx = Transaction::findOrFail($data['id']);
                    $oldItemNames = $newTrx->items->pluck('nama')->toArray();
                    $itemNames = array_unique(array_merge($itemNames, $oldItemNames));
                }

                // Batch fetch all required inventories and master meubelairs to minimize DB roundtrips
                $inventories = Inventory::whereIn('nama', $itemNames)->get()->keyBy('nama');
                $masterMeubelairs = MasterMeubelair::whereIn('nama_barang', $itemNames)->get()->keyBy('nama_barang');

                if (isset($data['id']) && $data['id']) {
                    // Revert previous inventory & meubelair stock changes for existing items
                    foreach ($newTrx->items as $oldItem) {
                        $oldDiff = ($newTrx->jenis_transaksi === 'Barang Keluar') 
                            ? -intval($oldItem->kuantitas) 
                            : intval($oldItem->kuantitas);

                        $masterMeubelair = $masterMeubelairs->get($oldItem->nama) ?? MasterMeubelair::where('nama_barang', $oldItem->nama)->first();
                        $inventory = $inventories->get($oldItem->nama);

                        if ($masterMeubelair) {
                            $masterMeubelair->stok = max(0, $masterMeubelair->stok - $oldDiff);
                            $masterMeubelair->save();
                        } elseif ($inventory) {
                            $inventory->kuantitas = $inventory->kuantitas - $oldDiff;
                            $inventory->save();
                        }
                    }

                    // Delete old items & auto-generated printer/computer/meubelair records
                    $newTrx->items()->delete();
                    Printer::where('transaction_id', $newTrx->id)->delete();
                    Computer::where('transaction_id', $newTrx->id)->delete();
                    Meubelair::where('keterangan', 'like', "%{$newTrx->nomor_surat}%")->delete();

                    // Update Transaction header
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
                    // Create new Transaction header
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

                // Save new items & apply stock updates
                foreach ($data['items'] as $item) {
                    $inventory = $inventories->get($item['nama']);
                    $masterMeubelair = $masterMeubelairs->get($item['nama']);

                    // Verify stock availability if Barang Keluar
                    if ($data['jenisTransaksi'] === 'Barang Keluar') {
                        $available = 0;
                        if ($masterMeubelair) {
                            $available = intval($masterMeubelair->stok);
                        } elseif ($inventory) {
                            $available = intval($inventory->kuantitas);
                        }

                        if ($available < intval($item['kuantitas'])) {
                            throw new \Exception("Stok barang '{$item['nama']}' tidak mencukupi (Tersedia: {$available} {$item['satuan']}, Dibutuhkan: {$item['kuantitas']} {$item['satuan']}).");
                        }
                    }

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
                        'vendor' => $item['vendor'] ?? null,
                    ]);

                    // Update inventory / master meubelair stock
                    $diff = ($data['jenisTransaksi'] === 'Barang Keluar') 
                        ? -intval($item['kuantitas']) 
                        : intval($item['kuantitas']);

                    if ($masterMeubelair) {
                        $masterMeubelair->stok = max(0, $masterMeubelair->stok + $diff);
                        $masterMeubelair->save();
                    } elseif ($inventory) {
                        $inventory->kuantitas = $inventory->kuantitas + $diff;
                        $inventory->save();
                    } else {
                        $newInv = Inventory::create([
                            'nama' => $item['nama'],
                            'kuantitas' => $diff > 0 ? $diff : 0,
                            'satuan' => $item['satuan'],
                            'deskripsi' => 'Dibuat otomatis dari transaksi',
                        ]);
                        $inventories[$item['nama']] = $newInv;
                    }

                    // Auto-sync ke Data Printer, Data Komputer, dan Data Meubelair jika jenis transaksi adalah Barang Keluar
                    if ($data['jenisTransaksi'] === 'Barang Keluar') {
                        $resolvedOutletId = !empty($item['outlet_id']) ? intval($item['outlet_id']) : null;
                        $resolvedOutletName = !empty($item['outlet']) ? trim($item['outlet']) : null;

                        if (!$resolvedOutletId && $resolvedOutletName) {
                            $matchedOutlet = Outlet::where('nama', $resolvedOutletName)
                                ->orWhere('code', $resolvedOutletName)
                                ->first();
                            if ($matchedOutlet) {
                                $resolvedOutletId = $matchedOutlet->id;
                                $resolvedOutletName = $matchedOutlet->nama;
                            }
                        }

                        $itemNamaLower = strtolower(trim($item['nama']));
                        $jenisBarang = $inventory ? strtolower(trim($inventory->jenis_barang ?? '')) : '';

                        $isPrinter = ($jenisBarang === 'printer')
                            || (strpos($itemNamaLower, 'printer') !== false)
                            || (strpos($itemNamaLower, 'lq 310') !== false)
                            || (strpos($itemNamaLower, 'lq-310') !== false)
                            || (strpos($itemNamaLower, 'epson') !== false);

                        $isComputer = ($jenisBarang === 'komputer')
                            || (strpos($itemNamaLower, 'komputer') !== false)
                            || (strpos($itemNamaLower, 'pc ') !== false)
                            || (strpos($itemNamaLower, 'laptop') !== false)
                            || (strpos($itemNamaLower, 'all-in-one') !== false)
                            || (strpos($itemNamaLower, 'aio') !== false);

                        $isMeubelair = (bool) $masterMeubelair
                            || (strpos($itemNamaLower, 'kursi') !== false)
                            || (strpos($itemNamaLower, 'meja') !== false)
                            || (strpos($itemNamaLower, 'lemari') !== false)
                            || (strpos($itemNamaLower, 'sofa') !== false)
                            || (strpos($itemNamaLower, 'ac ') !== false)
                            || (strpos($itemNamaLower, 'mebel') !== false);

                        $note = "Serah terima No: {$newTrx->nomor_surat}" . (!empty($item['keterangan']) ? " ({$item['keterangan']})" : "");

                        if ($isMeubelair) {
                            $kategori = 'meubelair';
                            if ($masterMeubelair && !empty($masterMeubelair->jenis_barang)) {
                                $kategori = strtolower(trim($masterMeubelair->jenis_barang));
                            }
                            if (strpos($itemNamaLower, 'kursi') !== false) $kategori = 'kursi';
                            elseif (strpos($itemNamaLower, 'meja') !== false) $kategori = 'meja';
                            elseif (strpos($itemNamaLower, 'lemari') !== false) $kategori = 'lemari';
                            elseif (strpos($itemNamaLower, 'sofa') !== false) $kategori = 'sofa';
                            elseif (strpos($itemNamaLower, 'ac') !== false) $kategori = 'ac';

                            Meubelair::create([
                                'kategori' => $kategori,
                                'jenis' => $item['nama'],
                                'quantity' => max(1, intval($item['kuantitas'])),
                                'outlet_id' => $resolvedOutletId,
                                'lokasi' => $resolvedOutletName,
                                'kondisi' => 'BAIK',
                                'tanggal_register' => $newTrx->tanggal,
                                'keterangan' => $note,
                            ]);
                        }

                        if ($isPrinter || $isComputer) {
                            $rawSn = trim($item['sn'] ?? '');
                            $snList = [];
                            if (!empty($rawSn)) {
                                $parts = preg_split('/[\r\n,]+/', $rawSn);
                                foreach ($parts as $p) {
                                    $trimmed = trim($p);
                                    if (!empty($trimmed)) {
                                        $snList[] = $trimmed;
                                    }
                                }
                            }

                            $qty = max(1, intval($item['kuantitas']));
                            $createCount = max($qty, count($snList));
                            $note = "Serah terima No: {$newTrx->nomor_surat}" . (!empty($item['keterangan']) ? " ({$item['keterangan']})" : "");

                            for ($i = 0; $i < $createCount; $i++) {
                                $assignedSn = $snList[$i] ?? ($createCount === 1 ? ($rawSn ?: null) : null);
                                $itemVendor = $item['vendor'] ?? ($inventory ? $inventory->vendor_nama : null);
                                $itemStatus = ($inventory && !empty($inventory->status)) ? $inventory->status : 'Inventaris';

                                if ($isPrinter) {
                                    Printer::create([
                                        'transaction_id' => $newTrx->id,
                                        'outlet_id' => $resolvedOutletId,
                                        'outlet' => $resolvedOutletName,
                                        'produk' => $item['nama'],
                                        'sn' => $assignedSn,
                                        'tanggal_mulai' => $newTrx->tanggal,
                                        'vendor' => $itemVendor,
                                        'status' => $itemStatus,
                                        'kondisi' => 'BAIK',
                                        'keterangan' => $note,
                                    ]);
                                } elseif ($isComputer) {
                                    Computer::create([
                                        'transaction_id' => $newTrx->id,
                                        'outlet_id' => $resolvedOutletId,
                                        'outlet' => $resolvedOutletName,
                                        'produk' => $item['nama'],
                                        'sn' => $assignedSn,
                                        'tanggal_mulai' => $newTrx->tanggal,
                                        'penyedia' => $itemVendor,
                                        'status' => $itemStatus,
                                        'kondisi' => 'BAIK',
                                        'keterangan' => $note,
                                    ]);
                                }
                            }
                        }
                    }
                }

                // Log activity
                ActivityLog::create([
                    'user_email' => auth()->user()->email,
                    'action' => isset($data['id']) && $data['id'] ? 'UBAH' : 'BUAT',
                    'module' => 'TRANSAKSI',
                    'details' => "Surat {$data['jenisTransaksi']} No: {$data['nomorSurat']}",
                ]);

                // Update current_number in letter_number_settings
                if (preg_match('/^(\d+)/', $data['nomorSurat'], $m)) {
                    $numVal = (int) $m[1];
                    $letterType = ($data['jenisTransaksi'] === 'Barang Masuk') ? 'serah_terima_masuk' : 'serah_terima_keluar';
                    $setting = \App\Models\LetterNumberSetting::firstOrCreate(['letter_type' => $letterType]);
                    if ($numVal > $setting->current_number) {
                        $setting->current_number = $numVal;
                        $setting->save();
                    }
                }
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }

        // Load items relation to return to frontend
        $newTrx->load('items');

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil disimpan & stok barang telah disesuaikan!',
            'transaction' => $newTrx,
        ]);
    }

    public function destroy($id)
    {
        try {
            DB::transaction(function () use ($id) {
                $transaction = Transaction::with('items')->findOrFail($id);
                $nomorSurat = $transaction->nomor_surat;
                $jenisTransaksi = $transaction->jenis_transaksi;

                // Roll back stock for all items in the deleted transaction
                foreach ($transaction->items as $item) {
                    $masterMeubelair = MasterMeubelair::where('nama_barang', $item->nama)->first();
                    $inventory = Inventory::where('nama', $item->nama)->first();

                    $rollbackDiff = ($jenisTransaksi === 'Barang Keluar')
                        ? intval($item->kuantitas)
                        : -intval($item->kuantitas);

                    if ($masterMeubelair) {
                        $newStock = max(0, $masterMeubelair->stok + $rollbackDiff);
                        $masterMeubelair->update([
                            'stok' => $newStock,
                        ]);
                    } elseif ($inventory) {
                        $newQty = max(0, $inventory->kuantitas + $rollbackDiff);
                        $inventory->update([
                            'kuantitas' => $newQty,
                        ]);
                    }
                }

                // Delete auto-generated printer, computer, and meubelair records for this transaction
                Printer::where('transaction_id', $transaction->id)->delete();
                Computer::where('transaction_id', $transaction->id)->delete();
                Meubelair::where('keterangan', 'like', "%{$nomorSurat}%")->delete();

                // Delete items and transaction
                $transaction->items()->delete();
                $transaction->delete();

                ActivityLog::create([
                    'user_email' => auth()->user()->email,
                    'action' => 'HAPUS',
                    'module' => 'TRANSAKSI',
                    'details' => "Menghapus Transaksi No: {$nomorSurat} & mengembalikan stok barang",
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus transaksi: ' . $e->getMessage()
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil dihapus & stok barang dikembalikan!',
        ]);
    }
}
