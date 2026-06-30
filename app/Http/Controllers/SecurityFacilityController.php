<?php

namespace App\Http\Controllers;

use App\Models\SecurityFacility;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class SecurityFacilityController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'nama_fasilitas' => 'required|string|max:255',
            'lokasi' => 'nullable|string',
            'jenis' => 'nullable|string',
            'jumlah' => 'nullable|integer',
            'kondisi' => 'nullable|string',
            'deskripsi' => 'nullable|string',
        ]);

        $facility = SecurityFacility::create($data);

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Tambah',
            'module' => 'Pengamanan dan Korporasi',
            'details' => "Menambahkan pengamanan & korporasi: {$facility->nama_fasilitas}",
        ]);

        return redirect()->back()->with('message', 'Data pengamanan dan korporasi berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'nama_fasilitas' => 'required|string|max:255',
            'lokasi' => 'nullable|string',
            'jenis' => 'nullable|string',
            'jumlah' => 'nullable|integer',
            'kondisi' => 'nullable|string',
            'deskripsi' => 'nullable|string',
        ]);

        $facility = SecurityFacility::findOrFail($id);
        $facility->update($data);

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Edit',
            'module' => 'Pengamanan dan Korporasi',
            'details' => "Mengubah pengamanan & korporasi: {$facility->nama_fasilitas}",
        ]);

        return redirect()->back()->with('message', 'Data pengamanan dan korporasi berhasil diperbarui');
    }

    public function destroy($id)
    {
        $facility = SecurityFacility::findOrFail($id);
        $nama = $facility->nama_fasilitas;
        $facility->delete();

        ActivityLog::create([
            'user_email' => auth()->user()->email,
            'action' => 'Hapus',
            'module' => 'Pengamanan dan Korporasi',
            'details' => "Menghapus pengamanan & korporasi: {$nama}",
        ]);

        return redirect()->back()->with('message', 'Data pengamanan dan korporasi berhasil dihapus');
    }
}
