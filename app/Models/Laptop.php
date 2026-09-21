<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Laptop extends Model
{
    protected $fillable = [
        'inventory_id',
        'nik_pegawai',
        'nama_pengguna',
        'jabatan',
        'departemen',
        'produk',
        'hostname',
        'sn',
        'os',
        'kondisi',
        'penyedia',
        'tanggal_mulai',
        'tanggal_selesai',
        'masa_sewa_bulan',
        'status',
        'keterangan',
    ];

    public function histories(): MorphMany
    {
        return $this->morphMany(ContractHistory::class, 'contractable')->orderBy('id', 'desc');
    }

    public function inventory(): BelongsTo
    {
        return $this->belongsTo(Inventory::class, 'inventory_id');
    }
}
