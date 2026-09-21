<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JenisMeubelair extends Model
{
    protected $table = 'jenis_meubelairs';

    protected $fillable = [
        'nama',
    ];
}
