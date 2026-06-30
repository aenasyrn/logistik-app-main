<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Printer extends Model
{
    protected $fillable = [
        'outlet_id',
        'outlet',
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
