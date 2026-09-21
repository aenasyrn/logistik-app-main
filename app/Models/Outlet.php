<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Outlet extends Model
{
    protected $fillable = [
        'code',
        'nama',
        'area',
        'cabang',
        'alamat',
        'type_outlet',
        'type_bangunan',
        'status_gedung',
        'kelurahan',
        'kecamatan',
        'kab_kota',
        'provinsi',
    ];

    public function computers(): HasMany
    {
        return $this->hasMany(Computer::class);
    }

    public function printers(): HasMany
    {
        return $this->hasMany(Printer::class);
    }
}
