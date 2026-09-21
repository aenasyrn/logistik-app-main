<?php

namespace App\Http\Controllers;

use App\Models\JenisMeubelair;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class JenisMeubelairController extends Controller
{
    public function index()
    {
        return response()->json(JenisMeubelair::orderBy('nama', 'asc')->get());
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Hanya admin yang dapat menambahkan jenis barang.'], 403);
        }

        $data = $request->validate([
            'nama' => 'required|string|max:100|unique:jenis_meubelairs,nama',
        ]);

        $item = JenisMeubelair::create([
            'nama' => trim($data['nama']),
        ]);

        ActivityLog::create([
            'user_email' => $user->email,
            'action' => 'Tambah',
            'module' => 'Jenis Barang Meubelair',
            'details' => "Menambahkan jenis barang meubelair baru: {$item->nama}",
        ]);

        return response()->json($item, 201);
    }

    public function destroy($id)
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Hanya admin yang dapat menghapus jenis barang.'], 403);
        }

        $item = JenisMeubelair::findOrFail($id);
        $nama = $item->nama;
        $item->delete();

        ActivityLog::create([
            'user_email' => $user->email,
            'action' => 'Hapus',
            'module' => 'Jenis Barang Meubelair',
            'details' => "Menghapus jenis barang meubelair: {$nama}",
        ]);

        return response()->json(['message' => "Jenis barang '{$nama}' berhasil dihapus"]);
    }
}
