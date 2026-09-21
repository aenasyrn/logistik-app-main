<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SecurityFacility extends Model
{
    protected $table = 'pengamanan_korporasi';

    public $timestamps = false;

    protected $guarded = [];

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            if (empty($model->outlet_id) && !empty($model->nama_unit_kerja)) {
                $namaUnit = trim($model->nama_unit_kerja);
                
                $outlet = null;
                if (!empty($model->kode_unit_kerja)) {
                    $outlet = \App\Models\Outlet::where('code', $model->kode_unit_kerja)->first();
                }
                if (!$outlet) {
                    $outlet = \App\Models\Outlet::where('nama', $namaUnit)->first();
                }

                if (!$outlet) {
                    $code = $model->kode_unit_kerja;
                    if (empty($code)) {
                        $code = 'OT_' . strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $namaUnit), 0, 8));
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
                        'nama' => $namaUnit,
                        'alamat' => $model->kantor_cabang ?? null,
                    ]);
                }

                $model->outlet_id = $outlet->id;
            }

            if (!empty($model->outlet_id)) {
                $outlet = \App\Models\Outlet::find($model->outlet_id);
                if ($outlet) {
                    if ((empty($outlet->alamat) || $outlet->alamat === '-') && !empty($model->kantor_cabang) && $model->kantor_cabang !== '-') {
                        $outlet->alamat = $model->kantor_cabang;
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
}

