<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inventory extends Model
{
    public function histories(): MorphMany
    {
        return $this->morphMany(ContractHistory::class, 'contractable')->orderBy('id', 'desc');
    }

    public function computers(): HasMany
    {
        return $this->hasMany(Computer::class, 'inventory_id');
    }

    public function printers(): HasMany
    {
        return $this->hasMany(Printer::class, 'inventory_id');
    }

    public function laptops(): HasMany
    {
        return $this->hasMany(Laptop::class, 'inventory_id');
    }

    protected $fillable = [
        'nama',
        'jenis_barang',
        'kuantitas',
        'satuan',
        'vendor_nama',
        'no_spk',
        'no_pks',
        'tanggal_mulai',
        'tanggal_selesai',
        'masa_sewa_bulan',
        'status',
        'deskripsi',
        'biaya_sewa',
        'harga_satuan',
    ];
}
