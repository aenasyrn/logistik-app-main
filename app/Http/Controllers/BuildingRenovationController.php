<?php

namespace App\Http\Controllers;

use App\Models\BuildingRenovation;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class BuildingRenovationController extends Controller
{
    private function mergeRequestFields(Request $request)
    {
        $request->merge([
            'no_memo' => $request->input('no_memo') ?? $request->input('noMemo'),
            'tgl_memo' => $request->input('tgl_memo') ?? $request->input('tglMemo') ?? $request->input('tanggal_memo') ?? $request->input('tanggalMemo'),
            'nama_pekerjaan' => $request->input('nama_pekerjaan') ?? $request->input('namaPekerjaan') ?? $request->input('nama_proyek') ?? $request->input('namaProyek'),
            'nilai_pembayaran' => $request->input('nilai_pembayaran') ?? $request->input('nilaiPembayaran') ?? $request->input('nilai'),
            'nama_outlet' => $request->input('nama_outlet') ?? $request->input('namaOutlet') ?? $request->input('lokasi'),
            'cabang' => $request->input('cabang'),
            'norek' => $request->input('norek') ?? $request->input('noRek') ?? $request->input('nomorRekening'),
            'bank' => $request->input('bank'),
            'pelaksana_pekerjaan' => $request->input('pelaksana_pekerjaan') ?? $request->input('pelaksanaPekerjaan') ?? $request->input('kontraktor'),
            'tgl_tagihan' => $request->input('tgl_tagihan') ?? $request->input('tglTagihan') ?? $request->input('tanggal_tagihan') ?? $request->input('tanggalTagihan'),
            'nilai_spk_pelaksanaan' => $request->input('nilai_spk_pelaksanaan') ?? $request->input('nilaiSpkPelaksanaan'),
            'nilai_addendum_spk' => $request->input('nilai_addendum_spk') ?? $request->input('nilaiAddendumSpk'),
            'tgl_spk' => $request->input('tgl_spk') ?? $request->input('tglSpk') ?? $request->input('tanggal_spk') ?? $request->input('tanggalSpk'),
            'no_spk' => $request->input('no_spk') ?? $request->input('noSpk') ?? $request->input('nomorSpk'),
            'pajak_pph' => $request->input('pajak_pph') ?? $request->input('pajakPph'),
            'tgl_bap_bast' => $request->input('tgl_bap_bast') ?? $request->input('tglBapBast') ?? $request->input('tanggal_bap_bast') ?? $request->input('tanggalBapBast'),

            'tagihan_nilai' => $request->input('tagihan_nilai') ?? $request->input('tagihanNilai'),
            'tagihan_dpp' => $request->input('tagihan_dpp') ?? $request->input('tagihanDpp'),
            'tagihan_ppn' => $request->input('tagihan_ppn') ?? $request->input('tagihanPpn'),
            'tagihan_pph' => $request->input('tagihan_pph') ?? $request->input('tagihanPph'),
            'tagihan_retensi' => $request->input('tagihan_retensi') ?? $request->input('tagihanRetensi'),
            'tagihan_transfer' => $request->input('tagihan_transfer') ?? $request->input('tagihanTransfer'),

            'retensi_nilai' => $request->input('retensi_nilai') ?? $request->input('retensiNilai'),
            'retensi_dpp' => $request->input('retensi_dpp') ?? $request->input('retensiDpp'),
            'retensi_ppn' => $request->input('retensi_ppn') ?? $request->input('retensiPpn'),
            'retensi_pph' => $request->input('retensi_pph') ?? $request->input('retensiPph'),
            'retensi_transfer' => $request->input('retensi_transfer') ?? $request->input('retensiTransfer'),
            'status_gedung' => $request->input('status_gedung') ?? $request->input('statusGedung'),
        ]);
    }

    public function store(Request $request)
    {
        $this->mergeRequestFields($request);

        $data = $request->validate([
            'no_memo' => 'nullable|string',
            'tgl_memo' => 'nullable|date',
            'nama_pekerjaan' => 'required|string|max:255',
            // nilai_pembayaran disimpan sebagai desimal 0-1 (kolom DB: decimal(5,4)).
            // Frontend mengirim hasil bagi 100 dari input persentase (0-100), jadi rentang valid 0-1.
            'nilai_pembayaran' => 'required|numeric|min:0|max:1',
            'nama_outlet' => 'nullable|string',
            'cabang' => 'nullable|string',
            'norek' => 'nullable|string',
            'bank' => 'nullable|string',
            'pelaksana_pekerjaan' => 'nullable|string',
            'tgl_tagihan' => 'nullable|date',
            'nilai_spk_pelaksanaan' => 'nullable|numeric',
            'nilai_addendum_spk' => 'nullable|numeric',
            'tgl_spk' => 'nullable|date',
            'no_spk' => 'nullable|string',
            'pajak_pph' => 'nullable|numeric',
            'tgl_bap_bast' => 'nullable|date',

            'tagihan_nilai' => 'nullable|numeric',
            'tagihan_dpp' => 'nullable|numeric',
            'tagihan_ppn' => 'nullable|numeric',
            'tagihan_pph' => 'nullable|numeric',
            'tagihan_retensi' => 'nullable|numeric',
            'tagihan_transfer' => 'nullable|numeric',

            'retensi_nilai' => 'nullable|numeric',
            'retensi_dpp' => 'nullable|numeric',
            'retensi_ppn' => 'nullable|numeric',
            'retensi_pph' => 'nullable|numeric',
            'retensi_transfer' => 'nullable|numeric',

            'status_gedung' => 'nullable|string',
            'status' => 'nullable|string',
            'deskripsi' => 'nullable|string',
        ]);

        $renovation = BuildingRenovation::create($data);

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Tambah',
            'module' => 'Renovasi Gedung',
            'details' => "Menambahkan proyek renovasi: {$renovation->nama_pekerjaan}",
        ]);

        return redirect()->back()->with('message', 'Data renovasi berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $this->mergeRequestFields($request);

        $data = $request->validate([
            'no_memo' => 'nullable|string',
            'tgl_memo' => 'nullable|date',
            'nama_pekerjaan' => 'required|string|max:255',
            // nilai_pembayaran disimpan sebagai desimal 0-1 (kolom DB: decimal(5,4)).
            'nilai_pembayaran' => 'nullable|numeric|min:0|max:1',
            'nama_outlet' => 'nullable|string',
            'cabang' => 'nullable|string',
            'norek' => 'nullable|string',
            'bank' => 'nullable|string',
            'pelaksana_pekerjaan' => 'nullable|string',
            'tgl_tagihan' => 'nullable|date',
            'nilai_spk_pelaksanaan' => 'nullable|numeric',
            'nilai_addendum_spk' => 'nullable|numeric',
            'tgl_spk' => 'nullable|date',
            'no_spk' => 'nullable|string',
            'pajak_pph' => 'nullable|numeric',
            'tgl_bap_bast' => 'nullable|date',

            'tagihan_nilai' => 'nullable|numeric',
            'tagihan_dpp' => 'nullable|numeric',
            'tagihan_ppn' => 'nullable|numeric',
            'tagihan_pph' => 'nullable|numeric',
            'tagihan_retensi' => 'nullable|numeric',
            'tagihan_transfer' => 'nullable|numeric',

            'retensi_nilai' => 'nullable|numeric',
            'retensi_dpp' => 'nullable|numeric',
            'retensi_ppn' => 'nullable|numeric',
            'retensi_pph' => 'nullable|numeric',
            'retensi_transfer' => 'nullable|numeric',

            'status_gedung' => 'nullable|string',
            'status' => 'nullable|string',
            'deskripsi' => 'nullable|string',
        ]);

        $renovation = BuildingRenovation::findOrFail($id);
        $renovation->update($data);

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Edit',
            'module' => 'Renovasi Gedung',
            'details' => "Mengubah proyek renovasi: {$renovation->nama_pekerjaan}",
        ]);

        return redirect()->back()->with('message', 'Data renovasi berhasil diperbarui');
    }

    public function destroy($id)
    {
        $renovation = BuildingRenovation::findOrFail($id);
        $nama = $renovation->nama_pekerjaan;
        $renovation->delete();

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Hapus',
            'module' => 'Renovasi Gedung',
            'details' => "Menghapus proyek renovasi: {$nama}",
        ]);

        return redirect()->back()->with('message', 'Data renovasi berhasil dihapus');
    }

    public function import(Request $request)
    {
        $request->validate([
            'rows' => 'required|array',
        ]);

        $rows = $request->input('rows');
        $importedCount = 0;

        \Illuminate\Support\Facades\DB::transaction(function () use ($rows, &$importedCount) {
            foreach ($rows as $row) {
                if (empty($row['nama_pekerjaan'])) {
                    continue;
                }

                $existing = null;
                if (!empty($row['no_memo'])) {
                    $existing = BuildingRenovation::where('no_memo', $row['no_memo'])->first();
                }
                if (!$existing && !empty($row['no_spk'])) {
                    $existing = BuildingRenovation::where('nomor_spk', $row['no_spk'])->first();
                }
                if (!$existing && !empty($row['nama_pekerjaan'])) {
                    $existing = BuildingRenovation::where('nama_pekerjaan', $row['nama_pekerjaan'])->first();
                }

                $dataToSave = [
                    'no_memo' => $row['no_memo'] ?? null,
                    'tgl_memo' => !empty($row['tgl_memo']) ? $row['tgl_memo'] : null,
                    'nama_pekerjaan' => $row['nama_pekerjaan'] ?? null,
                    'nilai_pembayaran' => !empty($row['nilai_pembayaran']) ? floatval($row['nilai_pembayaran']) : 0,
                    'nama_outlet' => $row['nama_outlet'] ?? null,
                    'cabang' => $row['cabang'] ?? null,
                    'norek' => $row['norek'] ?? null,
                    'bank' => $row['bank'] ?? null,
                    'pelaksana_pekerjaan' => $row['pelaksana_pekerjaan'] ?? null,
                    'tgl_tagihan' => !empty($row['tgl_tagihan']) ? $row['tgl_tagihan'] : null,
                    'nilai_spk_pelaksanaan' => !empty($row['nilai_spk_pelaksanaan']) ? floatval($row['nilai_spk_pelaksanaan']) : 0,
                    'nilai_addendum_spk' => !empty($row['nilai_addendum_spk']) ? floatval($row['nilai_addendum_spk']) : 0,
                    'tgl_spk' => !empty($row['tgl_spk']) ? $row['tgl_spk'] : null,
                    'no_spk' => $row['no_spk'] ?? null,
                    'pajak_pph' => !empty($row['pajak_pph']) ? floatval($row['pajak_pph']) : 0,
                    'tgl_bap_bast' => !empty($row['tgl_bap_bast']) ? $row['tgl_bap_bast'] : null,
                    'tagihan_nilai' => !empty($row['tagihan_nilai']) ? floatval($row['tagihan_nilai']) : 0,
                    'tagihan_dpp' => !empty($row['tagihan_dpp']) ? floatval($row['tagihan_dpp']) : 0,
                    'tagihan_ppn' => !empty($row['tagihan_ppn']) ? floatval($row['tagihan_ppn']) : 0,
                    'tagihan_pph' => !empty($row['tagihan_pph']) ? floatval($row['tagihan_pph']) : 0,
                    'tagihan_retensi' => !empty($row['tagihan_retensi']) ? floatval($row['tagihan_retensi']) : 0,
                    'tagihan_transfer' => !empty($row['tagihan_transfer']) ? floatval($row['tagihan_transfer']) : 0,
                    'retensi_nilai' => !empty($row['retensi_nilai']) ? floatval($row['retensi_nilai']) : 0,
                    'retensi_dpp' => !empty($row['retensi_dpp']) ? floatval($row['retensi_dpp']) : 0,
                    'retensi_ppn' => !empty($row['retensi_ppn']) ? floatval($row['retensi_ppn']) : 0,
                    'retensi_pph' => !empty($row['retensi_pph']) ? floatval($row['retensi_pph']) : 0,
                    'retensi_transfer' => !empty($row['retensi_transfer']) ? floatval($row['retensi_transfer']) : 0,
                    'status_gedung' => $row['status_gedung'] ?? null,
                    'status' => $row['status'] ?? 'Dalam Proses',
                    'deskripsi' => $row['deskripsi'] ?? null,
                ];

                if ($existing) {
                    $existing->update($dataToSave);
                } else {
                    BuildingRenovation::create($dataToSave);
                }

                $importedCount++;
            }
        });

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Import CSV',
            'module' => 'Renovasi Gedung',
            'details' => "Mengimpor massal {$importedCount} data renovasi gedung",
        ]);

        return response()->json([
            'success' => true,
            'message' => "{$importedCount} data renovasi gedung berhasil diimpor",
        ]);
    }
}