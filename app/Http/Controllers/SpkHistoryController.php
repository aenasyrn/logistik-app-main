<?php

namespace App\Http\Controllers;

use App\Models\SpkHistory;
use Illuminate\Http\Request;

class SpkHistoryController extends Controller
{
    public function index()
    {
        return response()->json(SpkHistory::orderBy('created_at', 'desc')->get());
    }

    public function show($id)
    {
        return response()->json(SpkHistory::findOrFail($id));
    }

    public function store(Request $request)
    {
        $request->validate([
            'id' => 'nullable',
            'nomorSpk' => 'required|string',
            'tipeSpk' => 'nullable|string',
            'tanggal' => 'nullable|string',
            'perusahaan' => 'nullable|string',
            'uraian' => 'nullable|string',
            'jumlah' => 'nullable|string',
        ]);

        $id = $request->input('id');
        $nomorSpk = $request->input('nomorSpk');
        
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
                'message' => "Surat Perintah Kerja (SPK) tidak dapat disubmit pada hari {$hari}. Pembuatan surat hanya diperbolehkan pada hari kerja (Senin s.d. Jumat)."
            ], 422);
        }

        $data = [
            'nomor_spk' => $nomorSpk,
            'tanggal' => $tanggal,
            'tipe_spk' => $request->input('tipeSpk') ?? 'renovasi',
            'perusahaan' => $request->input('perusahaan') ?? 'Penerima/Perusahaan',
            'uraian' => $request->input('uraian') ?? 'Tidak ada uraian',
            'jumlah' => $request->input('jumlah') ?? '0',
            'content' => $request->all(),
        ];

        if ($id && is_numeric($id)) {
            $spk = SpkHistory::updateOrCreate(['id' => $id], $data);
        } else {
            $spk = SpkHistory::updateOrCreate(['nomor_spk' => $nomorSpk], $data);
        }

        // Update current_number in letter_number_settings
        if (preg_match('/^(\d+)/', (string)$nomorSpk, $m)) {
            $numVal = (int) $m[1];
            $setting = \App\Models\LetterNumberSetting::firstOrCreate(['letter_type' => 'spk']);
            if ($numVal > $setting->current_number) {
                $setting->current_number = $numVal;
                $setting->save();
            }
        }

        // Auto-sync to BuildingRenovation (Renovasi Gedung)
        if (($data['tipe_spk'] ?? '') === 'renovasi' && !empty($nomorSpk)) {
            try {
                $rawJumlah = $request->input('jumlah') ?? $request->input('content.formData.spkDibulatkan') ?? $request->input('content.formData.spkTotal') ?? '0';
                $cleanJumlah = floatval(preg_replace('/[^0-9]/', '', (string)$rawJumlah));

                $existingRenovasi = \App\Models\BuildingRenovation::where('nomor_spk', $nomorSpk)->first();

                $syncData = [
                    'nomor_spk' => $nomorSpk,
                    'tanggal_spk' => $tanggal,
                    'pelaksana_pekerjaan' => $data['perusahaan'] ?: ($existingRenovasi->pelaksana_pekerjaan ?? 'Penerima/Perusahaan'),
                    'nama_pekerjaan' => $data['uraian'] ?: ($existingRenovasi->nama_pekerjaan ?? 'Pekerjaan Renovasi'),
                    'nilai_spk_pelaksanaan' => $cleanJumlah ?: ($existingRenovasi->nilai_spk_pelaksanaan ?? 0),
                ];

                if ($existingRenovasi) {
                    $existingRenovasi->update($syncData);
                    \App\Models\ActivityLog::create([
                        'user_email' => auth()->check() ? auth()->user()->email : 'system',
                        'action' => 'Ubah',
                        'module' => 'Renovasi Gedung',
                        'details' => "Auto-sync update SPK Renovasi ({$nomorSpk}): {$syncData['nama_pekerjaan']}",
                    ]);
                } else {
                    $syncData['nilai_pembayaran'] = 0.9500;
                    $syncData['status'] = 'Dalam Proses';
                    $newRenovasi = \App\Models\BuildingRenovation::create($syncData);
                    \App\Models\ActivityLog::create([
                        'user_email' => auth()->check() ? auth()->user()->email : 'system',
                        'action' => 'Tambah',
                        'module' => 'Renovasi Gedung',
                        'details' => "Auto-sync SPK Renovasi ({$nomorSpk}): {$syncData['nama_pekerjaan']}",
                    ]);
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("SPK sync to Renovasi error: " . $e->getMessage());
            }
        }

        return response()->json($spk);
    }

    public function destroy($id)
    {
        $spk = SpkHistory::findOrFail($id);
        $spk->delete();

        return response()->json(['success' => true]);
    }
}
