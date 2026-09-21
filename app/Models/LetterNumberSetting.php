<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LetterNumberSetting extends Model
{
    protected $table = 'letter_number_settings';

    protected $fillable = [
        'letter_type',
        'mode',
        'current_number',
        'manual_start_number',
        'last_reset_year',
        'reset_at',
    ];

    protected $casts = [
        'reset_at' => 'datetime',
    ];
}
