<?php

namespace App\Http\Controllers;

use App\Models\BuildingLand;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class BuildingLandController extends Controller
{
    private function sanitizeRequestFields(Request $request)
    {
        $outletId = $request->input('outlet_id');
        $resolvedOutletId = (is_numeric($outletId) && intval($outletId) > 0) ? intval($outletId) : null;
        if ($resolvedOutletId && !\App\Models\Outlet::where('id', $resolvedOutletId)->exists()) {
            $resolvedOutletId = null;
        }

        $cleanDate = fn($val) => (!empty($val) && $val !== 'null' && $val !== '-') ? $val : null;
        $cleanNum = fn($val) => (isset($val) && is_numeric($val)) ? $val : null;

        $request->merge([
            'outlet_id' => $resolvedOutletId,
            'tgl_mulai_shgb' => $cleanDate($request->input('tgl_mulai_shgb')),
            'tgl_berakhir_shgb' => $cleanDate($request->input('tgl_berakhir_shgb')),
            'tahun_perolehan' => $cleanNum($request->input('tahun_perolehan')),
            'luas_tanah' => $cleanNum($request->input('luas_tanah')),
            'luas_pagar' => $cleanNum($request->input('luas_pagar')),
            'luas_bangunan' => $cleanNum($request->input('luas_bangunan')),
        ]);
    }

    public function store(Request $request)
    {
        $this->sanitizeRequestFields($request);

        $data = $request->validate([
            'outlet_id' => 'nullable|integer',
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
            'certificates' => 'nullable|array',
        ]);

        if ($request->has('certificates') && is_array($request->input('certificates')) && count($request->input('certificates')) > 0) {
            $certs = $request->input('certificates');
            $createdLands = [];

            // Compute merged values
            $allCertNo = array_values(array_filter(array_map(fn($c) => trim($c['no_sertifikat'] ?? ($c['no_shgb'] ?? '')), $certs)));
            $allImbNo = array_values(array_filter(array_map(fn($c) => trim($c['no_imb'] ?? ''), $certs)));
            $allPemilikImb = array_values(array_unique(array_filter(array_map(fn($c) => trim($c['nama_pemilik_imb'] ?? ''), $certs))));

            $isMulti = count($certs) > 1;

            $computedGabungan = $isMulti ? implode(', ', $allCertNo) : ($allCertNo[0] ?? null);
            $computedImb = $isMulti ? implode(', ', $allImbNo) : ($allImbNo[0] ?? null);
            $computedPemilikImb = $isMulti ? implode(', ', $allPemilikImb) : ($allPemilikImb[0] ?? null);

            $finalGabungan = !empty($data['no_sertifikat_gabungan']) ? $data['no_sertifikat_gabungan'] : ($isMulti ? $computedGabungan : null);
            $finalImb = !empty($data['no_imb']) ? $data['no_imb'] : $computedImb;
            $finalPemilikImb = !empty($data['nama_pemilik_imb']) ? $data['nama_pemilik_imb'] : $computedPemilikImb;

            unset($data['certificates']);

            foreach ($certs as $cert) {
                $itemData = array_merge($data, [
                    'no_shgb' => !empty($cert['no_shgb']) ? $cert['no_shgb'] : null,
                    'no_sertifikat' => !empty($cert['no_sertifikat']) ? $cert['no_sertifikat'] : null,
                    'no_sertifikat_gabungan' => $finalGabungan,
                    'no_imb' => !empty($cert['no_imb']) ? $cert['no_imb'] : $finalImb,
                    'nama_pemilik_imb' => !empty($cert['nama_pemilik_imb']) ? $cert['nama_pemilik_imb'] : $finalPemilikImb,
                    'tgl_mulai_shgb' => (!empty($cert['tgl_mulai_shgb']) && $cert['tgl_mulai_shgb'] !== 'null') ? $cert['tgl_mulai_shgb'] : ($data['tgl_mulai_shgb'] ?? null),
                    'tgl_berakhir_shgb' => (!empty($cert['tgl_berakhir_shgb']) && $cert['tgl_berakhir_shgb'] !== 'null') ? $cert['tgl_berakhir_shgb'] : ($data['tgl_berakhir_shgb'] ?? null),
                    'tahun_perolehan' => (isset($cert['tahun_perolehan']) && is_numeric($cert['tahun_perolehan'])) ? intval($cert['tahun_perolehan']) : ($data['tahun_perolehan'] ?? null),
                    'luas_tanah' => (isset($cert['luas_tanah']) && is_numeric($cert['luas_tanah'])) ? floatval($cert['luas_tanah']) : ($data['luas_tanah'] ?? null),
                    'luas_pagar' => (isset($cert['luas_pagar']) && is_numeric($cert['luas_pagar'])) ? floatval($cert['luas_pagar']) : ($data['luas_pagar'] ?? null),
                    'luas_bangunan' => (isset($cert['luas_bangunan']) && is_numeric($cert['luas_bangunan'])) ? floatval($cert['luas_bangunan']) : ($data['luas_bangunan'] ?? null),
                ]);
                $createdLands[] = BuildingLand::create($itemData);
            }

            ActivityLog::create([
                'user_email' => auth()->user()->email,
                'action' => 'Tambah',
                'module' => 'Daftar Tanah',
                'details' => "Menambahkan tanah: {$data['unit_kerja']} (" . count($createdLands) . " sertifikat)",
            ]);

            return redirect()->back()->with('message', 'Data tanah berhasil ditambahkan');
        }

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
        $this->sanitizeRequestFields($request);

        $data = $request->validate([
            'outlet_id' => 'nullable|integer',
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

        $modeEdit = $request->input('mode_edit', 'koreksi');

        if ($modeEdit === 'perpanjang') {
            $land->histories()->create([
                'tgl_mulai' => $land->tgl_shgb_mulai ?? $land->tgl_mulai_shgb,
                'tgl_selesai' => $land->tgl_shgb_berakhir ?? $land->tgl_berakhir_shgb,
                'no_dokumen' => $land->no_shgb ?? $land->no_sertifikat,
                'no_sertifikat' => $land->no_sertifikat ?? $land->no_sertifikat_gabungan,
                'no_imb' => $land->no_imb,
                'status' => $land->status,
                'keterangan' => $land->keterangan,
                'user_email' => auth()->user()->email ?? null,
            ]);
        }

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
            $defaultOutlet = \App\Models\Outlet::first();
            $defaultOutletId = $defaultOutlet ? $defaultOutlet->id : 1;

            // 1. Forward-fill unit_kerja and unit metadata if omitted in subsequent rows
            $filledRows = [];
            $lastUnitKerja = '';
            $lastAlamat = null;
            $lastPeruntukan = null;
            $lastAsetSap = null;
            $lastNoImb = null;
            $lastNamaPemilikImb = null;
            $lastLuasPagar = null;
            $lastLuasBangunan = null;
            $lastOutletId = null;

            foreach ($rows as $row) {
                $rawUnit = isset($row['unit_kerja']) ? trim($row['unit_kerja']) : '';
                $unitKerja = $rawUnit !== '' ? $rawUnit : $lastUnitKerja;

                if (empty($unitKerja)) {
                    continue;
                }

                if ($rawUnit !== '') {
                    $lastUnitKerja = $rawUnit;
                    $lastAlamat = !empty($row['alamat']) ? $row['alamat'] : null;
                    $lastPeruntukan = !empty($row['peruntukan']) ? $row['peruntukan'] : null;
                    $lastAsetSap = !empty($row['aset_sap']) ? $row['aset_sap'] : null;
                    $lastNoImb = !empty($row['no_imb']) ? $row['no_imb'] : null;
                    $lastNamaPemilikImb = !empty($row['nama_pemilik_imb']) ? $row['nama_pemilik_imb'] : null;
                    $lastLuasPagar = !empty($row['luas_pagar']) ? floatval($row['luas_pagar']) : null;
                    $lastLuasBangunan = !empty($row['luas_bangunan']) ? floatval($row['luas_bangunan']) : null;

                    $matchedOutlet = \App\Models\Outlet::where('nama', 'like', "%{$unitKerja}%")->first();
                    $lastOutletId = $matchedOutlet ? $matchedOutlet->id : ($row['outlet_id'] ?? $defaultOutletId);
                }

                $row['unit_kerja'] = $unitKerja;
                $row['alamat'] = !empty($row['alamat']) ? $row['alamat'] : $lastAlamat;
                $row['peruntukan'] = !empty($row['peruntukan']) ? $row['peruntukan'] : $lastPeruntukan;
                $row['aset_sap'] = !empty($row['aset_sap']) ? $row['aset_sap'] : $lastAsetSap;
                $row['no_imb'] = !empty($row['no_imb']) ? $row['no_imb'] : $lastNoImb;
                $row['nama_pemilik_imb'] = !empty($row['nama_pemilik_imb']) ? $row['nama_pemilik_imb'] : $lastNamaPemilikImb;
                $row['luas_pagar'] = !empty($row['luas_pagar']) ? floatval($row['luas_pagar']) : $lastLuasPagar;
                $row['luas_bangunan'] = !empty($row['luas_bangunan']) ? floatval($row['luas_bangunan']) : $lastLuasBangunan;
                $row['outlet_id'] = $row['outlet_id'] ?? $lastOutletId ?? $defaultOutletId;

                $filledRows[] = $row;
            }

            // 2. Expand rows where no_sertifikat contains multiple certificates (separated by comma or semicolon)
            $expandedRows = [];
            foreach ($filledRows as $row) {
                $rawCert = trim($row['no_sertifikat'] ?? '');
                $rawShgb = trim($row['no_shgb'] ?? '');

                // Normalize newlines in rawShgb
                $normalizedShgb = implode("\n", array_filter(array_map('trim', explode("\n", str_replace(["\r\n", "\r"], "\n", $rawShgb)))));

                $certList = preg_split('/[,;\n]+/', $rawCert);
                $certList = array_values(array_filter(array_map('trim', $certList)));

                if (count($certList) > 1) {
                    $shgbList = preg_split('/[;]+/', $rawShgb);
                    $shgbList = array_values(array_filter(array_map('trim', $shgbList)));

                    for ($i = 0; $i < count($certList); $i++) {
                        $newRow = $row;
                        $newRow['no_sertifikat'] = $certList[$i];
                        $sShgb = $shgbList[$i] ?? ($shgbList[0] ?? null);
                        if ($sShgb) {
                            $sShgb = implode("\n", array_filter(array_map('trim', explode("\n", str_replace(["\r\n", "\r"], "\n", $sShgb)))));
                            if (stripos($sShgb, 'HGB') === false && preg_match('/\.(\d+)$/', $certList[$i], $m)) {
                                $hgbNum = ltrim($m[1], '0');
                                if ($hgbNum !== '') {
                                    $sShgb = "HGB NO.{$hgbNum}\n{$sShgb}";
                                }
                            }
                        }
                        $newRow['no_shgb'] = $sShgb;
                        $expandedRows[] = $newRow;
                    }
                } else {
                    // Single certificate: format no_shgb to include HGB NO. if not already present
                    if (!empty($rawCert) && !empty($normalizedShgb) && stripos($normalizedShgb, 'HGB') === false) {
                        if (preg_match('/\.(\d+)$/', $rawCert, $m)) {
                            $hgbNum = ltrim($m[1], '0');
                            if ($hgbNum !== '') {
                                $normalizedShgb = "HGB NO.{$hgbNum}\n{$normalizedShgb}";
                            }
                        }
                    }
                    $row['no_shgb'] = $normalizedShgb !== '' ? $normalizedShgb : null;
                    $expandedRows[] = $row;
                }
            }

            // 3. Group by unit_kerja to compute / set no_sertifikat_gabungan for units with multiple certificates
            $unitGroups = [];
            foreach ($expandedRows as $row) {
                $uKey = strtolower(trim($row['unit_kerja']));
                $unitGroups[$uKey][] = $row;
            }

            $finalRowsToInsert = [];
            foreach ($unitGroups as $uKey => $groupRows) {
                $explicitGabungan = null;
                $allCertsInUnit = [];

                foreach ($groupRows as $gRow) {
                    if (!empty($gRow['no_sertifikat_gabungan'])) {
                        $explicitGabungan = trim($gRow['no_sertifikat_gabungan']);
                    }
                    $cNo = trim($gRow['no_sertifikat'] ?? ($gRow['no_shgb'] ?? ''));
                    if ($cNo !== '' && !in_array($cNo, $allCertsInUnit)) {
                        $allCertsInUnit[] = $cNo;
                    }
                }

                $computedGabungan = null;
                if ($explicitGabungan) {
                    $computedGabungan = $explicitGabungan;
                } elseif (count($groupRows) >= 2 || count($allCertsInUnit) >= 2) {
                    $computedGabungan = implode(', ', $allCertsInUnit);
                }

                foreach ($groupRows as $gRow) {
                    if (!empty($computedGabungan)) {
                        $gRow['no_sertifikat_gabungan'] = $computedGabungan;
                    }
                    $finalRowsToInsert[] = $gRow;
                }
            }

            // 4. Save/Update records in DB
            foreach ($finalRowsToInsert as $row) {
                $unitKerja = trim($row['unit_kerja']);
                $certNo = !empty($row['no_sertifikat']) ? trim($row['no_sertifikat']) : null;
                $shgbNo = !empty($row['no_shgb']) ? trim($row['no_shgb']) : null;

                $existing = null;
                if ($certNo) {
                    $existing = BuildingLand::where('unit_kerja', $unitKerja)
                        ->where('no_sertifikat', $certNo)
                        ->first();
                    if (!$existing) {
                        $existing = BuildingLand::where('no_sertifikat', $certNo)->first();
                    }
                }
                if (!$existing && $shgbNo) {
                    $existing = BuildingLand::where('unit_kerja', $unitKerja)
                        ->where('no_shgb', $shgbNo)
                        ->first();
                    if (!$existing) {
                        $existing = BuildingLand::where('no_shgb', $shgbNo)->first();
                    }
                }

                $matchedOutlet = \App\Models\Outlet::where('nama', 'like', "%{$unitKerja}%")->first();
                $outletId = $matchedOutlet ? $matchedOutlet->id : ($row['outlet_id'] ?? $defaultOutletId);

                $dataToSave = [
                    'outlet_id' => $outletId,
                    'unit_kerja' => $unitKerja,
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
            'imported_count' => $importedCount,
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
