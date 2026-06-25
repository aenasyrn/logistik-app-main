<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Computer extends Model
{
    protected $fillable = [
        'outlet_id',
        'outlet',
        'ip_address',
        'mac_address',
        'ram',
        'storage',
        'cpu',
        'os',
        'produk',
        'sn',
        'tanggal_mulai',
        'tanggal_selesai',
        'penyedia',
        'status',
        'kondisi',
        'deskripsi',
    ];

    public function outlet_rel(): BelongsTo
    {
        return $this->belongsTo(Outlet::class, 'outlet_id');
    }
}
