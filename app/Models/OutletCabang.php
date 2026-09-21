<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OutletCabang extends Model
{
    use HasFactory;

    protected $table = 'outlet_cabangs';

    protected $fillable = [
        'area_nama',
        'nama',
    ];

    public function area()
    {
        return $this->belongsTo(OutletArea::class, 'area_nama', 'nama');
    }
}
