<?php

namespace App\Http\Controllers;

use App\Models\SoppHistory;
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

        $data = [
            'nomor_sopp' => $nomorSopp,
            'tanggal' => $tanggal,
            'tipe_sopp' => $request->input('type'),
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

        return response()->json($sopp);
    }

    public function destroy($id)
    {
        $sopp = SoppHistory::findOrFail($id);
        $sopp->delete();

        return response()->json(['success' => true]);
    }
}
