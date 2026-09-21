<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ContractHistory extends Model
{
    protected $fillable = [
        'contractable_type',
        'contractable_id',
        'tgl_mulai',
        'tgl_selesai',
        'periode',
        'biaya',
        'harga_satuan',
        'kuantitas',
        'satuan',
        'no_dokumen',
        'no_sertifikat',
        'no_imb',
        'no_spk',
        'no_pks',
        'vendor',
        'status',
        'keterangan',
        'user_email',
    ];

    public function contractable(): MorphTo
    {
        return $this->morphTo();
    }
}
