<?php

namespace App\Http\Controllers;

use App\Models\OutletCabang;
use Illuminate\Http\Request;

class OutletCabangController extends Controller
{
    public function index(Request $request)
    {
        $query = OutletCabang::query();
        if ($request->filled('area')) {
            $query->where('area_nama', strtoupper(trim($request->area)));
        }
        $cabangs = $query->orderBy('nama')->get();
        return response()->json($cabangs);
    }

    public function store(Request $request)
    {
        if ($request->user() && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Hanya admin yang berhak menambah cabang.'], 403);
        }

        $validated = $request->validate([
            'area_nama' => 'required|string|max:255',
            'nama' => 'required|string|max:255',
        ]);

        $areaNama = strtoupper(trim($validated['area_nama']));
        $cabangNama = strtoupper(trim($validated['nama']));

        $exists = OutletCabang::where('area_nama', $areaNama)
            ->where('nama', $cabangNama)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => "Cabang '{$cabangNama}' sudah ada di {$areaNama}.",
            ], 422);
        }

        $cabang = OutletCabang::create([
            'area_nama' => $areaNama,
            'nama' => $cabangNama,
        ]);

        return response()->json([
            'message' => 'Kantor Cabang baru berhasil ditambahkan.',
            'data' => $cabang,
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user() && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Hanya admin yang berhak menghapus cabang.'], 403);
        }

        $cabang = OutletCabang::findOrFail($id);
        $nama = $cabang->nama;
        $cabang->delete();

        return response()->json([
            'message' => "Kantor Cabang '{$nama}' berhasil dihapus.",
        ]);
    }
}
