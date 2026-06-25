<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BuildingSewa extends Model
{
    protected $table = 'menu_sewa';

    protected $guarded = [];

    const UPDATED_AT = null;

    public function outletRelation(): BelongsTo
    {
        return $this->belongsTo(Outlet::class, 'outlet_id');
    }
}
