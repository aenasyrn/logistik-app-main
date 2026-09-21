<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class BuildingLand extends Model
{
    protected $table = 'aset_tanah';
    protected $guarded = [];

    public function histories(): MorphMany
    {
        return $this->morphMany(ContractHistory::class, 'contractable')->orderBy('id', 'desc');
    }

    protected $appends = [
        'no_sertifikat_gabungan',
        'tgl_mulai_shgb',
        'tgl_berakhir_shgb',
        'luas_tanah',
        'luas_pagar',
        'luas_bangunan',
    ];

    protected $hidden = [
        'no_sertifikat_gabung',
        'tgl_shgb_mulai',
        'tgl_shgb_berakhir',
        'luas_tanah_m2',
        'luas_pagar_m2',
        'luas_bangunan_m2',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (is_null($model->no)) {
                $model->no = (static::max('no') ?? 0) + 1;
            }
        });

        static::saving(function ($model) {
            if (empty($model->outlet_id) && !empty($model->unit_kerja)) {
                $unitKerja = trim($model->unit_kerja);
                $outlet = \App\Models\Outlet::firstOrCreate(
                    ['nama' => $unitKerja],
                    [
                        'code' => 'OT_' . strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $unitKerja), 0, 8)),
                        'alamat' => $model->alamat ?? null,
                    ]
                );
                $model->outlet_id = $outlet->id;
            }

            if (!empty($model->outlet_id)) {
                $outlet = \App\Models\Outlet::find($model->outlet_id);
                if ($outlet) {
                    if ((empty($outlet->alamat) || $outlet->alamat === '-') && !empty($model->alamat) && $model->alamat !== '-') {
                        $outlet->alamat = $model->alamat;
                        $outlet->save();
                    }
                }
            }
        });
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class, 'outlet_id');
    }


    // Map no_sertifikat_gabungan to no_sertifikat_gabung
    public function getNoSertifikatGabunganAttribute()
    {
        return $this->attributes['no_sertifikat_gabung'] ?? null;
    }
    public function setNoSertifikatGabunganAttribute($value)
    {
        $this->attributes['no_sertifikat_gabung'] = $value;
    }

    // Map tgl_mulai_shgb to tgl_shgb_mulai
    public function getTglMulaiShgbAttribute()
    {
        return $this->attributes['tgl_shgb_mulai'] ?? null;
    }
    public function setTglMulaiShgbAttribute($value)
    {
        $this->attributes['tgl_shgb_mulai'] = $value;
    }

    // Map tgl_berakhir_shgb to tgl_shgb_berakhir
    public function getTglBerakhirShgbAttribute()
    {
        return $this->attributes['tgl_shgb_berakhir'] ?? null;
    }
    public function setTglBerakhirShgbAttribute($value)
    {
        $this->attributes['tgl_shgb_berakhir'] = $value;
    }

    // Map luas_tanah to luas_tanah_m2
    public function getLuasTanahAttribute()
    {
        return $this->attributes['luas_tanah_m2'] ?? null;
    }
    public function setLuasTanahAttribute($value)
    {
        $this->attributes['luas_tanah_m2'] = $value;
    }

    // Map luas_pagar to luas_pagar_m2
    public function getLuasPagarAttribute()
    {
        return $this->attributes['luas_pagar_m2'] ?? null;
    }
    public function setLuasPagarAttribute($value)
    {
        $this->attributes['luas_pagar_m2'] = $value;
    }

    // Map luas_bangunan to luas_bangunan_m2
    public function getLuasBangunanAttribute()
    {
        return $this->attributes['luas_bangunan_m2'] ?? null;
    }
    public function setLuasBangunanAttribute($value)
    {
        $this->attributes['luas_bangunan_m2'] = $value;
    }
}
