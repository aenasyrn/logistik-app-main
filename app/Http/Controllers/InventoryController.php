<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'kuantitas' => 'required|integer|min:0',
            'satuan' => 'required|string|max:50',
            'vendor_nama' => 'nullable|string|max:255',
            'no_spk' => 'nullable|string|max:255',
            'no_pks' => 'nullable|string|max:255',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
            'masa_sewa_bulan' => 'nullable|integer|min:0',
            'status' => 'nullable|string|max:100',
            'deskripsi' => 'nullable|string',
        ]);

        $item = Inventory::create($request->only([
            'nama', 'kuantitas', 'satuan', 'vendor_nama', 'no_spk', 'no_pks',
            'tanggal_mulai', 'tanggal_selesai', 'masa_sewa_bulan', 'status', 'deskripsi'
        ]));

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Tambah',
            'module' => 'Master Barang',
            'details' => "Menambahkan barang: {$item->nama} sebanyak {$item->kuantitas} {$item->satuan}",
        ]);

        return redirect()->back()->with('message', 'Barang berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'kuantitas' => 'required|integer|min:0',
            'satuan' => 'required|string|max:50',
            'vendor_nama' => 'nullable|string|max:255',
            'no_spk' => 'nullable|string|max:255',
            'no_pks' => 'nullable|string|max:255',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
            'masa_sewa_bulan' => 'nullable|integer|min:0',
            'status' => 'nullable|string|max:100',
            'deskripsi' => 'nullable|string',
        ]);

        $item = Inventory::findOrFail($id);
        $oldNama = $item->nama;
        $item->update($request->only([
            'nama', 'kuantitas', 'satuan', 'vendor_nama', 'no_spk', 'no_pks',
            'tanggal_mulai', 'tanggal_selesai', 'masa_sewa_bulan', 'status', 'deskripsi'
        ]));

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Edit',
            'module' => 'Master Barang',
            'details' => "Mengubah barang: {$oldNama} menjadi {$item->nama}",
        ]);

        return redirect()->back()->with('message', 'Barang berhasil diperbarui');
    }

    public function destroy($id)
    {
        $item = Inventory::findOrFail($id);
        $nama = $item->nama;
        $item->delete();

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Hapus',
            'module' => 'Master Barang',
            'details' => "Menghapus barang: {$nama}",
        ]);

        return redirect()->back()->with('message', 'Barang berhasil dihapus');
    }
}
