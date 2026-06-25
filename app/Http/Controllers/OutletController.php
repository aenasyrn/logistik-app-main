<?php

namespace App\Http\Controllers;

use App\Models\Outlet;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class OutletController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'id' => 'required|integer|unique:outlets,id',
            'nama' => 'required|string|max:255',
            'alamat' => 'nullable|string',
        ]);

        $outlet = Outlet::create([
            'id' => $request->id,
            'code' => (string) $request->id,
            'nama' => $request->nama,
            'alamat' => $request->alamat,
        ]);

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Tambah',
            'module' => 'Master Instansi',
            'details' => "Menambahkan instansi: {$outlet->nama} (ID: {$outlet->id})",
        ]);

        return redirect()->back()->with('message', 'Outlet berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'alamat' => 'nullable|string',
        ]);

        $outlet = Outlet::findOrFail($id);
        $oldNama = $outlet->nama;
        $outlet->update([
            'nama' => $request->nama,
            'alamat' => $request->alamat,
        ]);

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Edit',
            'module' => 'Master Instansi',
            'details' => "Mengubah instansi: {$oldNama} menjadi {$outlet->nama}",
        ]);

        return redirect()->back()->with('message', 'Outlet berhasil diperbarui');
    }

    public function destroy($id)
    {
        $outlet = Outlet::findOrFail($id);
        $nama = $outlet->nama;
        $outlet->delete();

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Hapus',
            'module' => 'Master Instansi',
            'details' => "Menghapus instansi: {$nama} (ID: {$id})",
        ]);

        return redirect()->back()->with('message', 'Outlet berhasil dihapus');
    }
}
