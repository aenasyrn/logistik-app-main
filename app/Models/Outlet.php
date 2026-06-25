<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Outlet extends Model
{
    protected $fillable = [
        'code',
        'nama',
        'alamat',
    ];

    public function computers(): HasMany
    {
        return $this->hasMany(Computer::class);
    }

    public function printers(): HasMany
    {
        return $this->hasMany(Printer::class);
    }
}
