<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Meubelair extends Model
{
    protected $fillable = [
        'kategori',
        'jenis',
        'quantity',
        'outlet_id',
        'lokasi',
        'kondisi',
        'tanggal_register',
        'keterangan',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'outlet_id' => 'integer',
        'tanggal_register' => 'date:Y-m-d',
    ];

    public function outlet_rel(): BelongsTo
    {
        return $this->belongsTo(Outlet::class, 'outlet_id');
    }
}
