<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama',
        'pimpinan',
        'jabatan',
        'bidang',
        'sertifikat_drm',
        'tgl_awal_drm',
        'tgl_akhir_drm',
        'kota',
        'email',
        'no_telpon',
        'alamat',
    ];
}
