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

        return response()->json($spk);
    }

    public function destroy($id)
    {
        $spk = SpkHistory::findOrFail($id);
        $spk->delete();

        return response()->json(['success' => true]);
    }
}
