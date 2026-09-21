<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class BuildingSewa extends Model
{
    protected $table = 'menu_sewa';

    protected $guarded = [];

    const UPDATED_AT = null;

    public function histories(): MorphMany
    {
        return $this->morphMany(ContractHistory::class, 'contractable')->orderBy('id', 'desc');
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            if (empty($model->outlet_id) && !empty($model->nama_outlet)) {
                $namaOutlet = trim($model->nama_outlet);
                
                $outlet = null;
                if (!empty($model->kode_outlet)) {
                    $outlet = \App\Models\Outlet::where('code', $model->kode_outlet)->first();
                }
                if (!$outlet) {
                    $outlet = \App\Models\Outlet::where('nama', $namaOutlet)->first();
                }

                if (!$outlet) {
                    $code = $model->kode_outlet;
                    if (empty($code)) {
                        $code = 'OT_' . strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $namaOutlet), 0, 8));
                    }
                    // Ensure code is unique in outlets table
                    $originalCode = $code;
                    $counter = 1;
                    while (\App\Models\Outlet::where('code', $code)->exists()) {
                        $code = substr($originalCode, 0, 8) . $counter;
                        $counter++;
                    }

                    $outlet = \App\Models\Outlet::create([
                        'code' => $code,
                        'nama' => $namaOutlet,
                        'alamat' => $model->alamat ?? null,
                    ]);
                }

                $model->outlet_id = $outlet->id;
            }

            if (!empty($model->outlet_id)) {
                $outlet = \App\Models\Outlet::find($model->outlet_id);
                if ($outlet) {
                    $fields = ['type_outlet', 'type_bangunan', 'status_gedung', 'alamat', 'kelurahan', 'kecamatan', 'kab_kota', 'provinsi'];
                    $dirty = false;
                    foreach ($fields as $field) {
                        if ((empty($outlet->$field) || $outlet->$field === '-') && !empty($model->$field) && $model->$field !== '-') {
                            $outlet->$field = $model->$field;
                            $dirty = true;
                        }
                    }
                    if ($dirty) {
                        $outlet->save();
                    }
                }
            }
        });
    }

    public function outletRelation(): BelongsTo
    {
        return $this->belongsTo(Outlet::class, 'outlet_id');
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class, 'outlet_id');
    }
}

