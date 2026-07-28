<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpkHistory extends Model
{
    protected $table = 'spk_histories';

    protected $fillable = [
        'nomor_spk',
        'tanggal',
        'tipe_spk',
        'perusahaan',
        'uraian',
        'jumlah',
        'content',
    ];

    protected $casts = [
        'content' => 'array',
    ];
}
