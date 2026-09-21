<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OutletArea extends Model
{
    use HasFactory;

    protected $table = 'outlet_areas';

    protected $fillable = [
        'nama',
    ];

    public function cabangs()
    {
        return $this->hasMany(OutletCabang::class, 'area_nama', 'nama')->orderBy('nama');
    }
}
