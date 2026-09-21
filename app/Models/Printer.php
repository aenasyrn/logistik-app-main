<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Printer extends Model
{
    public function histories(): MorphMany
    {
        return $this->morphMany(ContractHistory::class, 'contractable')->orderBy('id', 'desc');
    }
    protected $fillable = [
        'transaction_id',
        'outlet_id',
        'inventory_id',
        'outlet',
        'produk',
        'sn',
        'tanggal_mulai',
        'tanggal_selesai',
        'vendor',
        'status',
        'kondisi',
        'keterangan',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }

    public function outlet_rel(): BelongsTo
    {
        return $this->belongsTo(Outlet::class, 'outlet_id');
    }

    public function inventory(): BelongsTo
    {
        return $this->belongsTo(Inventory::class, 'inventory_id');
    }
}
