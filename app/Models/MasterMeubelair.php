<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterMeubelair extends Model
{
    protected $table = 'master_meubelairs';

    protected $fillable = [
        'nama_barang',
        'jenis_barang',
        'stok',
        'tanggal_registrasi',
        'vendor',
        'harga_satuan',
        'biaya',
        'keterangan',
    ];

    protected $casts = [
        'stok' => 'integer',
        'harga_satuan' => 'integer',
        'biaya' => 'integer',
        'tanggal_registrasi' => 'date:Y-m-d',
    ];
}
