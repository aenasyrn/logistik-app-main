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
            'kode' => 'nullable|string|max:50|unique:outlets,code',
            'nama' => 'required|string|max:255',
            'alamat' => 'nullable|string',
        ]);

        $code = $request->kode;
        $outlet = new Outlet();
        
        if ($code) {
            if (is_numeric($code)) {
                $outlet->id = intval($code);
            }
            $outlet->code = $code;
        }
        
        $outlet->nama = $request->nama;
        $outlet->alamat = $request->alamat;
        $outlet->save();

        if (!$outlet->code) {
            $outlet->code = (string) $outlet->id;
            $outlet->save();
        }

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
            'kode' => 'nullable|string|max:50|unique:outlets,code,' . $id,
            'nama' => 'required|string|max:255',
            'alamat' => 'nullable|string',
        ]);

        $outlet = Outlet::findOrFail($id);
        $oldNama = $outlet->nama;
        
        $outlet->nama = $request->nama;
        $outlet->alamat = $request->alamat;
        if ($request->has('kode')) {
            $outlet->code = $request->kode;
        }
        $outlet->save();

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
