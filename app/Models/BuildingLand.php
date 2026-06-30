<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BuildingLand extends Model
{
    protected $table = 'aset_tanah';
    protected $guarded = [];

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
