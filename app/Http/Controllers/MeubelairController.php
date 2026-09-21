<?php

namespace App\Http\Controllers;

use App\Models\Meubelair;
use App\Models\Outlet;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MeubelairController extends Controller
{
    private function resolveOutletId(?string $outletId, ?string $lokasi, ?string $kodeOutlet = null): ?int
    {
        $resolvedId = (is_numeric($outletId) && intval($outletId) > 0) ? intval($outletId) : null;
        if ($resolvedId && Outlet::where('id', $resolvedId)->exists()) {
            return $resolvedId;
        }

        if ($kodeOutlet) {
            $outlet = Outlet::where('code', $kodeOutlet)->first();
            if ($outlet) {
                return $outlet->id;
            }
        }

        if ($lokasi) {
            $outlet = Outlet::where('nama', $lokasi)
                ->orWhere('code', $lokasi)
                ->first();
            if ($outlet) {
                return $outlet->id;
            }
        }

        return null;
    }

    public function store(Request $request)
    {
        $outletId = $this->resolveOutletId(
            $request->input('outlet_id'),
            $request->input('lokasi'),
            $request->input('kode_outlet')
        );
        $request->merge(['outlet_id' => $outletId]);

        $data = $request->validate([
            'kategori' => 'required|string|max:255',
            'jenis' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'outlet_id' => 'nullable|integer',
            'lokasi' => 'nullable|string|max:255',
            'kondisi' => 'nullable|string|max:100',
            'tanggal_register' => 'nullable|date',
            'keterangan' => 'nullable|string',
        ]);

        if (empty($data['kondisi'])) {
            $data['kondisi'] = 'Baik';
        }

        $meubelair = Meubelair::create($data);
        $meubelair->load('outlet_rel');

        $kategoriLabel = $meubelair->kategori === 'ac' ? 'AC' : ucfirst($meubelair->kategori);
        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Tambah',
            'module' => "Data Meubelair",
            'details' => "Menambahkan data {$meubelair->kategori}: {$meubelair->jenis} (Qty: {$meubelair->quantity}) di {$meubelair->lokasi}",
        ]);

        return response()->json($meubelair);
    }

    public function update(Request $request, $id)
    {
        $outletId = $this->resolveOutletId(
            $request->input('outlet_id'),
            $request->input('lokasi'),
            $request->input('kode_outlet')
        );
        $request->merge(['outlet_id' => $outletId]);

        $data = $request->validate([
            'kategori' => 'required|string|max:255',
            'jenis' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'outlet_id' => 'nullable|integer',
            'lokasi' => 'nullable|string|max:255',
            'kondisi' => 'nullable|string|max:100',
            'tanggal_register' => 'nullable|date',
            'keterangan' => 'nullable|string',
        ]);

        $meubelair = Meubelair::findOrFail($id);
        $meubelair->update($data);
        $meubelair->load('outlet_rel');

        $kategoriLabel = $meubelair->kategori === 'ac' ? 'AC' : ucfirst($meubelair->kategori);
        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Edit',
            'module' => "Data {$kategoriLabel}",
            'details' => "Mengubah data {$meubelair->kategori}: {$meubelair->jenis} di {$meubelair->lokasi}",
        ]);

        return response()->json($meubelair);
    }

    public function destroy($id)
    {
        $meubelair = Meubelair::findOrFail($id);
        $jenis = $meubelair->jenis;
        $kategori = $meubelair->kategori;
        $meubelair->delete();

        $kategoriLabel = $kategori === 'ac' ? 'AC' : ucfirst($kategori);
        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Hapus',
            'module' => "Data {$kategoriLabel}",
            'details' => "Menghapus data {$kategori}: {$jenis}",
        ]);

        return response()->json(['success' => true]);
    }

    public function import(Request $request)
    {
        $rows = $request->input('rows', []);
        $kategori = $request->input('kategori', 'meja');

        if (empty($rows)) {
            return response()->json(['message' => 'Tidak ada data untuk diimpor'], 400);
        }

        $importedCount = 0;
        $existingOutlets = Outlet::all();
        $existingOutletsByCode = [];
        $existingOutletsByName = [];
        $existingOutletsById = [];
        foreach ($existingOutlets as $o) {
            if (!empty($o->code)) {
                $existingOutletsByCode[strtolower(trim($o->code))] = $o;
            }
            if (!empty($o->nama)) {
                $existingOutletsByName[strtolower(trim($o->nama))] = $o;
            }
            $existingOutletsById[$o->id] = $o;
        }

        DB::transaction(function () use ($rows, $kategori, &$importedCount, $existingOutletsByCode, $existingOutletsByName, $existingOutletsById) {
            $insertBatch = [];

            foreach ($rows as $row) {
                $jenis = trim($row['jenis'] ?? $row['jenis_meja'] ?? $row['jenis_kursi'] ?? $row['jenis_lemari'] ?? '');
                if (empty($jenis)) {
                    continue;
                }

                $quantity = isset($row['quantity']) && is_numeric($row['quantity']) ? intval($row['quantity']) : 1;
                $kodeOutlet = trim((string)($row['kode_outlet'] ?? $row['kode'] ?? $row['id_outlet'] ?? ''));
                $lokasi = trim((string)($row['lokasi'] ?? $row['outlet'] ?? ''));
                $outletId = isset($row['outlet_id']) && is_numeric($row['outlet_id']) ? intval($row['outlet_id']) : null;

                $matchedOutlet = null;

                // 1. Direct outlet_id
                if ($outletId && isset($existingOutletsById[$outletId])) {
                    $matchedOutlet = $existingOutletsById[$outletId];
                }

                // 2. Lookup by Kode Outlet
                if (!$matchedOutlet && !empty($kodeOutlet)) {
                    $normKode = strtolower($kodeOutlet);
                    if (isset($existingOutletsByCode[$normKode])) {
                        $matchedOutlet = $existingOutletsByCode[$normKode];
                    } elseif (is_numeric($kodeOutlet) && isset($existingOutletsById[intval($kodeOutlet)])) {
                        $matchedOutlet = $existingOutletsById[intval($kodeOutlet)];
                    }
                }

                // 3. Lookup by Lokasi / Outlet Name
                if (!$matchedOutlet && !empty($lokasi)) {
                    $normLokasi = strtolower($lokasi);
                    if (isset($existingOutletsByName[$normLokasi])) {
                        $matchedOutlet = $existingOutletsByName[$normLokasi];
                    } elseif (isset($existingOutletsByCode[$normLokasi])) {
                        $matchedOutlet = $existingOutletsByCode[$normLokasi];
                    }
                }

                // Jika ditemukan outlet, tautkan outlet_id dan lengkapi lokasi jika kosong
                if ($matchedOutlet) {
                    $outletId = $matchedOutlet->id;
                    if (empty($lokasi)) {
                        $lokasi = $matchedOutlet->nama;
                    }
                } elseif (empty($lokasi) && !empty($kodeOutlet)) {
                    $lokasi = $kodeOutlet;
                }

                $rawKondisi = strtolower(trim($row['kondisi'] ?? 'Baik'));
                $kondisi = (str_contains($rawKondisi, 'kurang') || str_contains($rawKondisi, 'rusak')) ? 'Kurang Baik' : 'Baik';

                $rawTglRegister = trim((string)($row['tanggal_register'] ?? $row['tgl_register'] ?? $row['tanggal_registrasi'] ?? ''));
                $tanggalRegister = null;
                if (!empty($rawTglRegister)) {
                    try {
                        $parsed = strtotime(str_replace('/', '-', $rawTglRegister));
                        if ($parsed) {
                            $tanggalRegister = date('Y-m-d', $parsed);
                        }
                    } catch (\Throwable $e) {
                        $tanggalRegister = null;
                    }
                }

                $keterangan = trim($row['keterangan'] ?? '');
                $rowKategori = trim($row['jenis_barang'] ?? $row['Jenis Barang'] ?? $row['JENIS BARANG'] ?? $row['kategori'] ?? $row['Kategori'] ?? '');

                $insertBatch[] = [
                    'kategori' => $rowKategori ?: $kategori,
                    'jenis' => $jenis,
                    'quantity' => $quantity,
                    'outlet_id' => $outletId,
                    'lokasi' => $lokasi,
                    'kondisi' => $kondisi,
                    'tanggal_register' => $tanggalRegister,
                    'keterangan' => $keterangan ?: null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                $importedCount++;
            }

            if (!empty($insertBatch)) {
                foreach (array_chunk($insertBatch, 500) as $chunk) {
                    DB::table('meubelairs')->insert($chunk);
                }
            }
        });

        $kategoriLabel = $kategori === 'ac' ? 'AC' : ucfirst($kategori);
        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Import CSV',
            'module' => "Data {$kategoriLabel}",
            'details' => "Mengimpor {$importedCount} data {$kategori} via CSV",
        ]);

        return response()->json([
            'success' => true,
            'count' => $importedCount,
            'message' => "Berhasil mengimpor {$importedCount} data {$kategoriLabel}.",
        ]);
    }
}
