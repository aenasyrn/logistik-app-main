<?php

namespace App\Http\Controllers;

use App\Models\MasterMeubelair;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MasterMeubelairController extends Controller
{
    public function index()
    {
        return response()->json(MasterMeubelair::orderBy('id', 'desc')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama_barang' => 'required|string|max:255',
            'jenis_barang' => 'nullable|string|max:255',
            'stok' => 'required|integer|min:0',
            'tanggal_registrasi' => 'nullable|date',
            'vendor' => 'nullable|string|max:255',
            'harga_satuan' => 'nullable|numeric|min:0',
            'biaya' => 'nullable|numeric|min:0',
            'keterangan' => 'nullable|string',
        ]);

        $stok = intval($data['stok'] ?? 0);
        $hargaSatuan = isset($data['harga_satuan']) && $data['harga_satuan'] !== '' ? intval($data['harga_satuan']) : 0;
        $biaya = isset($data['biaya']) && $data['biaya'] !== '' ? intval($data['biaya']) : 0;

        if ($biaya === 0 && $hargaSatuan > 0 && $stok > 0) {
            $biaya = $hargaSatuan * $stok;
        } elseif ($hargaSatuan === 0 && $biaya > 0 && $stok > 0) {
            $hargaSatuan = intval(round($biaya / $stok));
        }

        $data['harga_satuan'] = $hargaSatuan;
        $data['biaya'] = $biaya;

        $item = MasterMeubelair::create($data);

        ActivityLog::create([
            'user_email' => auth()->user() ? auth()->user()->email : 'System',
            'action' => 'Tambah',
            'module' => 'Master Barang - Meubelair',
            'details' => "Menambahkan master meubelair: {$item->nama_barang} (Stok: {$item->stok})",
        ]);

        return response()->json($item, 201);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'nama_barang' => 'required|string|max:255',
            'jenis_barang' => 'nullable|string|max:255',
            'stok' => 'required|integer|min:0',
            'tanggal_registrasi' => 'nullable|date',
            'vendor' => 'nullable|string|max:255',
            'harga_satuan' => 'nullable|numeric|min:0',
            'biaya' => 'nullable|numeric|min:0',
            'keterangan' => 'nullable|string',
        ]);

        $stok = intval($data['stok'] ?? 0);
        $hargaSatuan = isset($data['harga_satuan']) && $data['harga_satuan'] !== '' ? intval($data['harga_satuan']) : 0;
        $biaya = isset($data['biaya']) && $data['biaya'] !== '' ? intval($data['biaya']) : 0;

        if ($biaya === 0 && $hargaSatuan > 0 && $stok > 0) {
            $biaya = $hargaSatuan * $stok;
        } elseif ($hargaSatuan === 0 && $biaya > 0 && $stok > 0) {
            $hargaSatuan = intval(round($biaya / $stok));
        }

        $data['harga_satuan'] = $hargaSatuan;
        $data['biaya'] = $biaya;

        $item = MasterMeubelair::findOrFail($id);
        $item->update($data);

        ActivityLog::create([
            'user_email' => auth()->user() ? auth()->user()->email : 'System',
            'action' => 'Edit',
            'module' => 'Master Barang - Meubelair',
            'details' => "Memperbarui master meubelair: {$item->nama_barang}",
        ]);

        return response()->json($item);
    }

    public function destroy($id)
    {
        $item = MasterMeubelair::findOrFail($id);
        $nama = $item->nama_barang;
        $item->delete();

        ActivityLog::create([
            'user_email' => auth()->user() ? auth()->user()->email : 'System',
            'action' => 'Hapus',
            'module' => 'Master Barang - Meubelair',
            'details' => "Menghapus master meubelair: {$nama}",
        ]);

        return response()->json(['message' => 'Data master meubelair berhasil dihapus']);
    }

    public function import(Request $request)
    {
        $rows = $request->input('data');
        if (!is_array($rows) || empty($rows)) {
            return response()->json(['message' => 'Data CSV kosong atau tidak valid.'], 422);
        }

        $insertedCount = 0;
        DB::beginTransaction();
        try {
            foreach ($rows as $row) {
                $nama = trim($row['nama_barang'] ?? $row['Nama Barang'] ?? $row['NAMA BARANG'] ?? '');
                if (!$nama) continue;

                $jenis = trim($row['jenis_barang'] ?? $row['Jenis Barang'] ?? $row['JENIS BARANG'] ?? '');
                $stokRaw = $row['stok'] ?? $row['Stok'] ?? $row['STOK'] ?? 0;
                $stok = is_numeric($stokRaw) ? intval($stokRaw) : 0;

                $tglReg = $row['tanggal_registrasi'] ?? $row['Tanggal Registrasi'] ?? $row['TANGGAL REGISTRASI'] ?? $row['Tanggal Register'] ?? $row['Tgl Register'] ?? null;
                $tglRegFormatted = null;
                if ($tglReg) {
                    $ts = strtotime(str_replace('/', '-', $tglReg));
                    if ($ts) {
                        $tglRegFormatted = date('Y-m-d', $ts);
                    }
                }

                $hargaSatuanRaw = $row['harga_satuan'] ?? $row['Harga Satuan'] ?? $row['HARGA SATUAN'] ?? 0;
                $hargaSatuanClean = preg_replace('/[^0-9]/', '', (string)$hargaSatuanRaw);
                $hargaSatuan = $hargaSatuanClean !== '' ? intval($hargaSatuanClean) : 0;

                $biayaRaw = $row['biaya'] ?? $row['Biaya'] ?? $row['BIAYA'] ?? $row['jumlah_biaya'] ?? $row['Jumlah Biaya'] ?? $row['JUMLAH BIAYA'] ?? 0;
                // Remove currency symbols, commas or dots if formatted as Rp
                $biayaClean = preg_replace('/[^0-9]/', '', (string)$biayaRaw);
                $biaya = $biayaClean !== '' ? intval($biayaClean) : 0;

                if ($biaya === 0 && $hargaSatuan > 0 && $stok > 0) {
                    $biaya = $hargaSatuan * $stok;
                } elseif ($hargaSatuan === 0 && $biaya > 0 && $stok > 0) {
                    $hargaSatuan = intval(round($biaya / $stok));
                }

                $vendor = trim($row['vendor'] ?? $row['Vendor'] ?? $row['VENDOR'] ?? '');

                $ket = trim($row['keterangan'] ?? $row['Keterangan'] ?? $row['KETERANGAN'] ?? '');

                MasterMeubelair::create([
                    'nama_barang' => $nama,
                    'jenis_barang' => $jenis ?: 'Lainnya',
                    'stok' => $stok,
                    'tanggal_registrasi' => $tglRegFormatted,
                    'vendor' => $vendor ?: null,
                    'harga_satuan' => $hargaSatuan,
                    'biaya' => $biaya,
                    'keterangan' => $ket,
                ]);

                $insertedCount++;
            }

            DB::commit();

            ActivityLog::create([
                'user_email' => auth()->user() ? auth()->user()->email : 'System',
                'action' => 'Import',
                'module' => 'Master Barang - Meubelair',
                'details' => "Mengimpor {$insertedCount} data master meubelair melalui CSV",
            ]);

            return response()->json(['count' => $insertedCount, 'message' => "Berhasil mengimpor {$insertedCount} data."]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal memproses data CSV: ' . $e->getMessage()], 500);
        }
    }
}
