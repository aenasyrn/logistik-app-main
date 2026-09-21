<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $areaCabangMap = [
            'AREA SENEN' => [
                'CP PETAMBURAN', 'CP SALEMBA', 'CP PASAR SENEN', 'CP PASAR BARU',
                'CP KEMAYORAN', 'CP KAMPUNG AMBON', 'CP CEMPAKA PUTIH', 'CP SUDIRMAN',
                'CP ITC CEMPAKA MAS', 'CPS KRAMAT RAYA'
            ],
            'AREA KRAMAT JATI' => [
                'CP JATINEGARA', 'CP PENGGILINGAN', 'CP KRAMAT JATI', 'CP RAWAMANGUN',
                'CP CIBUBUR', 'CP BUARAN', 'CP KEBON NANAS', 'CP KRANGGAN',
                'CP KOTA WISATA', 'CP PONDOK KELAPA', 'CPS DEWI SARTIKA'
            ],
            'AREA JATIWARINGIN' => [
                'CP PONDOK MELATI', 'CP PLAZA PONDOK GEDE', 'CP PONDOK UNGU', 'CP HARAPAN INDAH',
                'CP JATIWARINGIN', 'CP PONDOK BAMBU', 'CP PEKAYON', 'CP KRANJI',
                'CP KEMANG PRATAMA', 'CP GALAXI', 'CPS PLAZA THB'
            ],
            'AREA BEKASI' => [
                'CP BEKASI UTAMA', 'CP KARAWANG', 'CP RENGAS DENGKLOK', 'CP KALIMALANG',
                'CP TAMBUN', 'CP CIKARANG', 'CP BEKASI TIMUR', 'CP SETIA MEKAR',
                'CPS ISLAMIC CENTRE', 'CPS METRO BOULEVARD CIKARANG'
            ],
            'AREA BOGOR' => [
                'CP BOGOR', 'CP DEPOK', 'CP CIBINONG', 'CP PASAR MAWAR',
                'CP PANCORAN MAS', 'CP WARUNG JAMBU', 'CP KELAPA DUA', 'CP KEDUNGHALANG',
                'CP GUNUNG BATU', 'CP BOJONGSARI', 'CP CISALAK', 'CPS MARGONDA',
                'CPS BOGOR BARU', 'CP BOGOR 1', 'CP BOGOR 2', 'CP DEPOK 1',
                'CP DEPOK 2', 'CPS METRO BOU CKR'
            ]
        ];

        $cpToArea = [];
        foreach ($areaCabangMap as $area => $cps) {
            foreach ($cps as $cp) {
                $cpToArea[strtoupper($cp)] = $area;
            }
        }

        $security = \Illuminate\Support\Facades\DB::table('pengamanan_korporasi')->get();
        $codeMap = [];
        $nameMap = [];

        foreach ($security as $s) {
            $area = trim($s->kantor_area);
            if (strtoupper($area) === 'AREA KRAMATJATI') {
                $area = 'AREA KRAMAT JATI';
            }
            $cabang = trim($s->kantor_cabang);
            $code = trim($s->kode_unit_kerja);
            $nama = trim($s->nama_unit_kerja);

            if ($code) {
                $codeMap[$code] = ['area' => $area, 'cabang' => $cabang, 'nama' => $nama];
            }
            if ($nama) {
                $nameMap[strtoupper($nama)] = ['area' => $area, 'cabang' => $cabang, 'code' => $code];
            }
        }

        $specialMap = [
            '0733' => ['area' => 'AREA SENEN', 'cabang' => 'CP PETAMBURAN'],
            '0734' => ['area' => 'AREA KRAMAT JATI', 'cabang' => 'CP JATINEGARA'],
            '0735' => ['area' => 'AREA BEKASI', 'cabang' => 'CP BEKASI UTAMA'],
            '0736' => ['area' => 'AREA JATIWARINGIN', 'cabang' => 'CP JATIWARINGIN'],
            '0737' => ['area' => 'AREA BOGOR', 'cabang' => 'CP BOGOR'],
            'AREA SENEN' => ['area' => 'AREA SENEN', 'cabang' => 'CP PETAMBURAN'],
            'AREA KRAMAT JATI' => ['area' => 'AREA KRAMAT JATI', 'cabang' => 'CP JATINEGARA'],
            'AREA BEKASI' => ['area' => 'AREA BEKASI', 'cabang' => 'CP BEKASI UTAMA'],
            'AREA JATIWARINGIN' => ['area' => 'AREA JATIWARINGIN', 'cabang' => 'CP JATIWARINGIN'],
            'AREA BOGOR' => ['area' => 'AREA BOGOR', 'cabang' => 'CP BOGOR'],
            'PERLUASAN RUKO UPS MEDITERANIA' => ['area' => 'AREA SENEN', 'cabang' => 'CPS KRAMAT RAYA'],
            'GUDANG TERPADU AREA BEKASI (TAMBUN) - AREA BEKASI' => ['area' => 'AREA BEKASI', 'cabang' => 'CP TAMBUN'],
            'GUDANG TERPADU RAWA PANJANG - AREA BEKASI' => ['area' => 'AREA BEKASI', 'cabang' => 'CP BEKASI UTAMA'],
            'GUDANG TERPADU JATIMAKMUR - AREA JATIWARINGIN' => ['area' => 'AREA JATIWARINGIN', 'cabang' => 'CP JATIWARINGIN'],
            'GUDANG TERPADU KARADENAN - AREA BOGOR' => ['area' => 'AREA BOGOR', 'cabang' => 'CP BOGOR'],
            'GUDANG TERPADU PASAR KRANGGAN - AREA KRAMAT JATI' => ['area' => 'AREA KRAMAT JATI', 'cabang' => 'CP KRANGGAN'],
            'GUDANG TERPADU PASAR PUCUNG - AREA BOGOR' => ['area' => 'AREA BOGOR', 'cabang' => 'CP DEPOK'],
            'UPS GRAHA MAS' => ['area' => 'AREA BEKASI', 'cabang' => 'CPS METRO BOULEVARD CIKARANG'],
            'CP BOGOR 1' => ['area' => 'AREA BOGOR', 'cabang' => 'CP BOGOR'],
            'CP BOGOR 2' => ['area' => 'AREA BOGOR', 'cabang' => 'CP BOGOR'],
            'CP DEPOK 1' => ['area' => 'AREA BOGOR', 'cabang' => 'CP DEPOK'],
            'CP DEPOK 2' => ['area' => 'AREA BOGOR', 'cabang' => 'CP DEPOK'],
            'CPS METRO BOU CKR' => ['area' => 'AREA BEKASI', 'cabang' => 'CPS METRO BOULEVARD CIKARANG'],
            'KANWIL JAKARTA 1' => ['area' => 'KANWIL JAKARTA 1', 'cabang' => 'KANWIL JAKARTA 1'],
        ];

        $outlets = \App\Models\Outlet::all();

        foreach ($outlets as $o) {
            $code = trim($o->code ?? '');
            $nama = trim($o->nama ?? '');
            $upperNama = strtoupper($nama);

            $target = null;
            if ($code && isset($specialMap[$code])) {
                $target = $specialMap[$code];
            } elseif (isset($specialMap[$upperNama])) {
                $target = $specialMap[$upperNama];
            } elseif ($code && isset($codeMap[$code])) {
                $target = $codeMap[$code];
            } elseif (isset($nameMap[$upperNama])) {
                $target = $nameMap[$upperNama];
            }

            if ($target) {
                $area = $target['area'];
                $cabang = $target['cabang'];
            } else {
                $cabang = $o->cabang;
                $area = $o->area;
                if ($cabang && isset($cpToArea[strtoupper($cabang)])) {
                    $area = $cpToArea[strtoupper($cabang)];
                }
            }

            \Illuminate\Support\Facades\DB::table('outlets')
                ->where('id', $o->id)
                ->update([
                    'area' => $area,
                    'cabang' => $cabang,
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reverse operation needed for data correction
    }
};
