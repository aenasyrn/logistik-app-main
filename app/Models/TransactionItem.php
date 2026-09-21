<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionItem extends Model
{
    protected $fillable = [
        'transaction_id',
        'nama',
        'kuantitas',
        'satuan',
        'sn',
        'keterangan',
        'outlet_id',
        'outlet',
        'vendor',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function outlet_rel(): BelongsTo
    {
        return $this->belongsTo(Outlet::class, 'outlet_id');
    }
}
