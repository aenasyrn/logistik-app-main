<?php

namespace App\Http\Controllers;

use App\Models\OutletArea;
use App\Models\OutletCabang;
use Illuminate\Http\Request;

class OutletAreaController extends Controller
{
    public function index()
    {
        $areas = OutletArea::with('cabangs')->orderBy('nama')->get();
        return response()->json($areas);
    }

    public function store(Request $request)
    {
        if ($request->user() && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Hanya admin yang berhak menambah area.'], 403);
        }

        $validated = $request->validate([
            'nama' => 'required|string|max:255|unique:outlet_areas,nama',
        ]);

        $area = OutletArea::create([
            'nama' => strtoupper(trim($validated['nama'])),
        ]);

        return response()->json([
            'message' => 'Kantor Area baru berhasil ditambahkan.',
            'data' => $area,
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user() && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Hanya admin yang berhak menghapus area.'], 403);
        }

        $area = OutletArea::findOrFail($id);
        $nama = $area->nama;

        // Delete associated cabangs as well
        OutletCabang::where('area_nama', $nama)->delete();
        $area->delete();

        return response()->json([
            'message' => "Kantor Area '{$nama}' beserta seluruh cabangnya berhasil dihapus.",
        ]);
    }
}
