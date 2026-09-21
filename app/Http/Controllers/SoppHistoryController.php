<?php

namespace App\Http\Controllers;

use App\Models\SoppHistory;
use App\Models\BuildingRenovation;
use Illuminate\Http\Request;

class SoppHistoryController extends Controller
{
    public function index()
    {
        return response()->json(SoppHistory::orderBy('created_at', 'desc')->get());
    }

    public function show($id)
    {
        return response()->json(SoppHistory::findOrFail($id));
    }

    public function store(Request $request)
    {
        $request->validate([
            'id' => 'nullable',
            'nomorSopp' => 'required|string',
            'tanggal' => 'nullable|string',
            'type' => 'required|string', // 'sewa' or 'pengadaan'
            'dibayarkanKepada' => 'nullable|string',
            'jumlah' => 'nullable|string',
        ]);

        $id = $request->input('id');
        $nomorSopp = $request->input('nomorSopp');
        
        $tanggal = $request->input('tanggal');
        if ($tanggal) {
            $tanggal = date('Y-m-d', strtotime($tanggal));
        }

        // Pengecekan Hari Kerja (Senin - Jumat). Hari Sabtu & Minggu tidak bisa submit.
        $targetDate = $tanggal ?: date('Y-m-d');
        $dayOfWeek = (int) date('N', strtotime($targetDate));
        if ($dayOfWeek === 6 || $dayOfWeek === 7) {
            $hari = ($dayOfWeek === 6) ? 'Sabtu' : 'Minggu';
            return response()->json([
                'success' => false,
                'message' => "SOPP tidak dapat disubmit pada hari {$hari}. Pembuatan surat hanya diperbolehkan pada hari kerja (Senin s.d. Jumat)."
            ], 422);
        }

        $type = $request->input('type');
        $nomorSpk = $request->input('nomorSpk') ?? $request->input('nomor_spk') ?? $request->input('noSpk') ?? $request->input('no_spk');

        $data = [
            'nomor_sopp' => $nomorSopp,
            'nomor_spk' => $nomorSpk,
            'tanggal' => $tanggal,
            'tipe_sopp' => $type,
            'dibayarkan_kepada' => $request->input('dibayarkanKepada') ?? 'Penerima/Rekanan',
            'jumlah' => $request->input('jumlah') ?? '0',
            'content' => collect($request->all())
                ->except(['id'])
                ->toArray(),
        ];

        if ($id && is_numeric($id)) {
            $sopp = SoppHistory::updateOrCreate(['id' => $id], $data);
        } else {
            $sopp = SoppHistory::updateOrCreate(['nomor_sopp' => $nomorSopp], $data);
        }

        // Update current_number in letter_number_settings
        if (preg_match('/^(\d+)/', (string)$nomorSopp, $m)) {
            $numVal = (int) $m[1];
            $setting = \App\Models\LetterNumberSetting::firstOrCreate(['letter_type' => 'sopp']);
            if ($numVal > $setting->current_number) {
                $setting->current_number = $numVal;
                $setting->save();
            }
        }

        // Auto-integrate with BuildingRenovation (Renovasi Gedung) feature
        // Auto-integrate with BuildingRenovation (Renovasi Gedung) feature
        if ($type === 'renovasi') {
            try {
                $parseIndoNumber = function($val) {
                    if (is_numeric($val)) return floatval($val);
                    if (empty($val)) return 0.0;
                    $clean = str_replace('.', '', (string) $val);
                    $clean = str_replace(',', '.', $clean);
                    return floatval(preg_replace('/[^0-9.]/', '', $clean));
                };

                $rows = $request->input('rows', []);
                $r1 = !empty($rows) ? $rows[0] : null;

                $rawUraian = !empty($r1['uraian']) ? $r1['uraian'] : 'Biaya Pekerjaan Renovasi';
                $cleanNamaPekerjaan = trim(preg_replace('/\s*\((Termin\s*\d+|Pelunasan|Retensi\s*5%)\)/i', '', $rawUraian));
                $cleanNamaPekerjaan = trim(preg_replace('/^Biaya\s+Retensi\s+/i', 'Biaya ', $cleanNamaPekerjaan));
                $cleanNamaPekerjaan = trim(preg_replace('/^Retensi\s+/i', '', $cleanNamaPekerjaan));
                if (empty($cleanNamaPekerjaan)) {
                    $cleanNamaPekerjaan = 'Biaya Pekerjaan Renovasi';
                }

                $r1Debet = !empty($r1['debet']) ? $r1['debet'] : (!empty($request->input('dasarPengenaan')) ? $request->input('dasarPengenaan') : '0');
                $nilaiKontrak = $parseIndoNumber($r1Debet);

                $tagihanPpn = 0;
                $tagihanPph = 0;
                $tagihanRetensi = 0;
                $tagihanTransfer = 0;

                foreach ($rows as $row) {
                    $rowId = $row['id'] ?? null;
                    $uraianLower = strtolower($row['uraian'] ?? '');
                    $kode = $row['kode'] ?? '';
                    $kreditVal = $parseIndoNumber($row['kredit'] ?? '0');

                    if (($rowId == 5 || str_contains($uraianLower, 'retensi')) && $rowId != 1) {
                        $tagihanRetensi = $kreditVal;
                    } elseif (($rowId == 2 || $kode === '214.02.02' || str_contains($uraianLower, 'ppn')) && $rowId != 1) {
                        $tagihanPpn = $kreditVal;
                    } elseif (($rowId == 3 || $kode === '214.02.03' || str_contains($uraianLower, 'pph')) && $rowId != 1) {
                        $tagihanPph = $kreditVal;
                    } elseif (($rowId == 4 || $kode === '112.01.03' || str_contains($uraianLower, 'bank')) && $rowId != 1) {
                        $tagihanTransfer = $kreditVal;
                    }
                }

                if ($tagihanTransfer == 0) {
                    $tagihanTransfer = $parseIndoNumber(!empty($request->input('jumlah')) ? $request->input('jumlah') : '0');
                }

                $termin = !empty($request->input('termin')) ? $request->input('termin') : (!empty($request->input('content.termin')) ? $request->input('content.termin') : 'Termin 1');
                $terminStr = trim((string)$termin);
                $isPelunasan = (strcasecmp($terminStr, 'Pelunasan') === 0 || str_contains(strtolower($terminStr), 'pelunasan') || str_contains(strtolower($terminStr), 'retensi'));

                $dpp = round($nilaiKontrak * 100 / 111 * 11 / 12);
                $dibayarkanKepada = !empty($request->input('dibayarkanKepada')) ? $request->input('dibayarkanKepada') : 'Penerima/Rekanan';
                $unitKerjaInput = !empty($request->input('unitKerja')) ? $request->input('unitKerja') : null;
                
                $namaOutletInput = !empty($request->input('namaOutlet')) 
                    ? $request->input('namaOutlet') 
                    : (!empty($request->input('nama_outlet')) 
                        ? $request->input('nama_outlet') 
                        : null);

                $cabangInput = !empty($request->input('cabang')) && !in_array(strtoupper(trim($request->input('cabang'))), ['VA', 'KAS', 'CEK', 'BG'])
                    ? $request->input('cabang')
                    : (!empty($unitKerjaInput) 
                        ? $unitKerjaInput 
                        : null);

                $noMemo = !empty($request->input('nomorUrut')) ? $request->input('nomorUrut') : (!empty($nomorSopp) ? $nomorSopp : null);

                $tarifNum = floatval($request->input('tarif')) ?: ($request->input('kualifikasiUsaha') === 'Kecil' ? 1.75 : 2.65);

                $pctMap = [
                    'Termin 1' => 0.9500,
                    'Termin 2' => 0.5000,
                    'Retensi 5%' => 1.0000,
                    'Pelunasan' => 1.0000,
                ];

                $nilaiPembayaranPct = 0.9500;
                if (preg_match('/termin\s*2/i', $terminStr) || str_contains($terminStr, '50')) {
                    $nilaiPembayaranPct = 0.5000;
                } elseif ($isPelunasan || str_contains($terminStr, '100')) {
                    $nilaiPembayaranPct = 1.0000;
                } elseif (preg_match('/termin\s*1/i', $terminStr) || str_contains($terminStr, '95')) {
                    $nilaiPembayaranPct = 0.9500;
                } else {
                    $nilaiPembayaranPct = $pctMap[$terminStr] ?? 0.9500;
                }

                $tglSpk = null;
                $noSpk = $nomorSpk;
                if (!empty($noSpk)) {
                    $spk = \App\Models\SpkHistory::where('nomor_spk', $noSpk)->first();
                    if ($spk) {
                        $tglSpk = $spk->tanggal;
                        $noSpk = $spk->nomor_spk;
                    }
                }

                $renovationData = [
                    'no_memo' => $noMemo,
                    'tgl_memo' => $tanggal,
                    'nama_pekerjaan' => $cleanNamaPekerjaan,
                    'pelaksana_pekerjaan' => $dibayarkanKepada,
                    'nama_outlet' => $namaOutletInput,
                    'cabang' => $cabangInput,
                    'norek' => $request->input('noRekening'),
                    'bank' => $request->input('namaBank'),
                    'tgl_tagihan' => $tanggal,
                    'nilai_spk_pelaksanaan' => $nilaiKontrak,
                    'no_spk' => $noSpk,
                    'tgl_spk' => $tglSpk,
                    'pajak_pph' => $tarifNum,
                    'status' => $isPelunasan ? 'Selesai' : 'Dalam Proses',
                    'nilai_pembayaran' => $nilaiPembayaranPct,
                ];

                if ($isPelunasan) {
                    $renovationData['retensi_nilai'] = $tagihanTransfer;
                    $renovationData['retensi_dpp'] = 0;
                    $renovationData['retensi_ppn'] = 0;
                    $renovationData['retensi_pph'] = 0;
                    $renovationData['retensi_transfer'] = $tagihanTransfer;
                } else {
                    $renovationData['tagihan_nilai'] = $nilaiKontrak;
                    $renovationData['tagihan_dpp'] = $dpp;
                    $renovationData['tagihan_ppn'] = $tagihanPpn;
                    $renovationData['tagihan_pph'] = $tagihanPph;
                    $renovationData['tagihan_retensi'] = $tagihanRetensi;
                    $renovationData['tagihan_transfer'] = $tagihanTransfer;
                    $renovationData['retensi_nilai'] = $tagihanRetensi;
                    $renovationData['retensi_transfer'] = $tagihanRetensi;
                }

                $existingRenovasi = null;
                // 1. Prioritas utama: cocokkan dengan Nomor SPK karena unik per proyek
                if (!empty($noSpk)) {
                    $existingRenovasi = BuildingRenovation::where('nomor_spk', $noSpk)->first();
                }

                // 2. Jika belum cocok, cari berdasarkan nomor memo pada tahun yang sama
                if (!$existingRenovasi && !empty($noMemo)) {
                    $soppYear = !empty($tanggal) ? date('Y', strtotime($tanggal)) : date('Y');
                    $existingRenovasi = BuildingRenovation::where('no_memo', $noMemo)
                        ->where(function ($q) use ($soppYear, $nomorSopp) {
                            $q->whereYear('tanggal_memo', $soppYear)
                              ->orWhere('no_memo', $nomorSopp);
                        })
                        ->first();
                }

                if ($existingRenovasi) {
                    $existingRenovasi->update($renovationData);
                    \App\Models\ActivityLog::create([
                        'user_email' => auth()->check() ? auth()->user()->email : 'system',
                        'action' => 'Ubah',
                        'module' => 'Renovasi Gedung',
                        'details' => "Auto-sync update SOPP Renovasi ({$noMemo}): {$cleanNamaPekerjaan}",
                    ]);
                } else {
                    BuildingRenovation::create($renovationData);
                    \App\Models\ActivityLog::create([
                        'user_email' => auth()->check() ? auth()->user()->email : 'system',
                        'action' => 'Tambah',
                        'module' => 'Renovasi Gedung',
                        'details' => "Auto-sync SOPP Renovasi ({$noMemo}): {$cleanNamaPekerjaan}",
                    ]);
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Auto-sync BuildingRenovation failed: " . $e->getMessage());
            }
        }

        return response()->json($sopp);
    }

    public function destroy($id)
    {
        $sopp = SoppHistory::findOrFail($id);
        $sopp->delete();

        return response()->json([
            'success' => true,
            'id' => $sopp->id,
            'data' => $sopp,
        ]);
    }
}
