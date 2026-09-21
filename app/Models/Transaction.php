<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    protected $fillable = [
        'nomor_surat',
        'tanggal',
        'jenis_transaksi',
        'penerima_nama',
        'penerima_jabatan',
        'penerima_instansi',
        'pengirim_nama',
        'pengirim_jabatan',
        'pengirim_instansi',
        'mengetahui_nama',
        'mengetahui_jabatan',
        'lokasi',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }

    public function printers(): HasMany
    {
        return $this->hasMany(Printer::class);
    }

    public function computers(): HasMany
    {
        return $this->hasMany(Computer::class);
    }
}
