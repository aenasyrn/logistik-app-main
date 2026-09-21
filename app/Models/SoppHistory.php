<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SoppHistory extends Model
{
    protected $table = 'sopp_histories';

    protected $fillable = [
        'nomor_sopp',
        'nomor_spk',
        'tanggal',
        'tipe_sopp',
        'dibayarkan_kepada',
        'jumlah',
        'content',
    ];

    protected $casts = [
        'content' => 'array',
    ];
}
