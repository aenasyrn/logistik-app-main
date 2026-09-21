<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'pimpinan' => 'nullable|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'bidang' => 'nullable|string|max:255',
            'sertifikat_drm' => 'nullable|string|max:255',
            'tgl_awal_drm' => 'nullable|date',
            'tgl_akhir_drm' => 'nullable|date',
            'kota' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'no_telpon' => 'required|string|max:100',
            'alamat' => 'nullable|string',
        ]);

        $vendor = Vendor::create($validated);

        ActivityLog::create([
            'user_email' => auth()->user()->email ?? 'admin@system.com',
            'action' => 'Tambah',
            'module' => 'Master Vendor',
            'details' => "Menambahkan vendor: {$vendor->nama} (Email: " . ($vendor->email ?? '-') . ", Telp: " . ($vendor->no_telpon ?? '-') . ")",
        ]);

        return redirect()->back()->with('success', 'Vendor berhasil ditambahkan!');
    }

    public function update(Request $request, $id)
    {
        $vendor = Vendor::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'pimpinan' => 'nullable|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'bidang' => 'nullable|string|max:255',
            'sertifikat_drm' => 'nullable|string|max:255',
            'tgl_awal_drm' => 'nullable|date',
            'tgl_akhir_drm' => 'nullable|date',
            'kota' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'no_telpon' => 'required|string|max:100',
            'alamat' => 'nullable|string',
        ]);

        $vendor->update($validated);

        ActivityLog::create([
            'user_email' => auth()->user()->email ?? 'admin@system.com',
            'action' => 'Edit',
            'module' => 'Master Vendor',
            'details' => "Memperbarui vendor: {$vendor->nama}",
        ]);

        return redirect()->back()->with('success', 'Data vendor berhasil diperbarui!');
    }

    public function destroy($id)
    {
        $vendor = Vendor::findOrFail($id);
        $nama = $vendor->nama;
        $vendor->delete();

        ActivityLog::create([
            'user_email' => auth()->user()->email ?? 'admin@system.com',
            'action' => 'Hapus',
            'module' => 'Master Vendor',
            'details' => "Menghapus vendor: {$nama}",
        ]);

        return redirect()->back()->with('success', 'Data vendor berhasil dihapus!');
    }

    public function import(Request $request)
    {
        $data = $request->input('data');
        if (!is_array($data) || empty($data)) {
            return response()->json(['message' => 'Data CSV kosong atau format tidak sesuai.'], 422);
        }

        $getValue = function($row, array $possibleKeys) {
            if (!is_array($row)) return null;
            foreach ($row as $key => $value) {
                $cleanKey = trim(preg_replace('/[\x{EF}\x{BB}\x{BF}\x{FEFF}]/u', '', $key));
                foreach ($possibleKeys as $pk) {
                    if (strcasecmp($cleanKey, $pk) === 0) {
                        return is_string($value) ? trim($value) : $value;
                    }
                }
            }
            return null;
        };

        $importedCount = 0;
        foreach ($data as $row) {
            if (!is_array($row)) continue;

            $nama = $getValue($row, [
                'Nama Perusahaan / PT', 'Nama Perusahaan', 'Nama Vendor', 'nama_vendor', 'nama', 'Perusahaan', 'Company'
            ]);

            if (!$nama) continue;

            $pimpinanRaw = $getValue($row, [
                'Pimpinan', 'pimpinan', 'Nama Pimpinan / Penanggung Jawab', 'Nama Pimpinan', 'Pimpinan & Jabatan'
            ]);
            $jabatan = $getValue($row, [
                'Jabatan', 'jabatan'
            ]);
            $pimpinan = $pimpinanRaw;

            if (!$jabatan && $pimpinanRaw && preg_match('/^(.*?)\s*\((.*?)\)$/', $pimpinanRaw, $matches)) {
                $pimpinan = trim($matches[1]);
                $jabatan = trim($matches[2]);
            }

            $bidang = $getValue($row, [
                'Bidang Pekerjaan / Keterangan', 'Bidang', 'bidang', 'Keterangan'
            ]);
            $sertifikatDrm = $getValue($row, [
                'Sertifikat DRM', 'sertifikat_drm', 'No Sertifikat DRM', 'Nomor Sertifikat DRM'
            ]);
            $tglAwalDrmRaw = $getValue($row, [
                'Masa Berlaku Awal', 'tgl_awal_drm', 'Tanggal Awal DRM', 'Tanggal Awal', 'Masa Berlaku (Awal)'
            ]);
            $tglAkhirDrmRaw = $getValue($row, [
                'Masa Berlaku Akhir', 'tgl_akhir_drm', 'Tanggal Akhir DRM', 'Tanggal Akhir', 'Masa Berlaku (Akhir)'
            ]);

            $parseDate = function($val) {
                if (!$val) return null;
                if (is_numeric($val)) {
                    $unixDate = ($val - 25569) * 86400;
                    return gmdate("Y-m-d", $unixDate);
                }
                $ts = strtotime($val);
                return $ts ? date("Y-m-d", $ts) : null;
            };

            $kota = $getValue($row, [
                'Kota Operasional', 'Kota', 'kota'
            ]);
            $noTelp = $getValue($row, [
                'No. Telepon / WhatsApp', 'No Telpon', 'No. Telepon', 'No Telepon', 'Kontak', 'no_telpon', 'no_telp', 'telepon', 'Telp'
            ]);
            $alamat = $getValue($row, [
                'Alamat Perusahaan', 'Alamat', 'alamat'
            ]);

            Vendor::updateOrCreate(
                ['nama' => $nama],
                [
                    'pimpinan' => $pimpinan ?: null,
                    'jabatan' => $jabatan ?: null,
                    'bidang' => $bidang ?: null,
                    'sertifikat_drm' => $sertifikatDrm ?: null,
                    'tgl_awal_drm' => $parseDate($tglAwalDrmRaw),
                    'tgl_akhir_drm' => $parseDate($tglAkhirDrmRaw),
                    'kota' => $kota ?: null,
                    'no_telpon' => $noTelp ?: '-',
                    'alamat' => $alamat ?: null,
                ]
            );
            $importedCount++;
        }

        ActivityLog::create([
            'user_email' => auth()->user()->email ?? 'admin@system.com',
            'action' => 'Import',
            'module' => 'Master Vendor',
            'details' => "Mengimpor {$importedCount} vendor via file CSV",
        ]);

        return response()->json(['total' => $importedCount, 'message' => "Import {$importedCount} vendor berhasil."]);
    }
}
