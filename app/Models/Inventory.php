<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $fillable = [
        'nama',
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
    ];
}
