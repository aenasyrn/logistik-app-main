<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BuildingRenovation extends Model
{
    protected $table = 'renovasi';
    protected $guarded = [];
    public $timestamps = false;

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            if (empty($model->outlet_id) && !empty($model->nama_outlet)) {
                $namaOutlet = trim($model->nama_outlet);
                $outlet = \App\Models\Outlet::firstOrCreate(
                    ['nama' => $namaOutlet],
                    [
                        'code' => 'OT_' . strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $namaOutlet), 0, 8)),
                        'alamat' => $model->cabang ?? null,
                    ]
                );
                $model->outlet_id = $outlet->id;
            }

            if (!empty($model->outlet_id)) {
                $outlet = \App\Models\Outlet::find($model->outlet_id);
                if ($outlet) {
                    $dirty = false;
                    if ((empty($outlet->status_gedung) || $outlet->status_gedung === '-') && !empty($model->status_gedung) && $model->status_gedung !== '-') {
                        $outlet->status_gedung = $model->status_gedung;
                        $dirty = true;
                    }
                    if ((empty($outlet->alamat) || $outlet->alamat === '-') && !empty($model->cabang) && $model->cabang !== '-') {
                        $outlet->alamat = $model->cabang;
                        $dirty = true;
                    }
                    if ($dirty) {
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


    protected $appends = [
        'tgl_memo',
        'norek',
        'tgl_tagihan',
        'tgl_spk',
        'no_spk',
        'tgl_bap_bast',
        'tagihan_nilai',
        'tagihan_dpp',
        'tagihan_ppn',
        'tagihan_pph',
        'tagihan_retensi',
        'tagihan_transfer',
        'retensi_nilai',
        'retensi_dpp',
        'retensi_ppn',
        'retensi_pph',
        'retensi_transfer',
    ];

    protected $hidden = [
        'tanggal_memo',
        'no_rekening',
        'tanggal_tagihan',
        'tanggal_spk',
        'nomor_spk',
        'tanggal_bap_bast',
        'nilai_tagihan',
        'dpp',
        'ppn',
        'pph',
        'retensi',
        'transfer',
        'retensi_5persen',
        'dpp_retensi_5persen',
        'ppn_retensi_5persen',
        'pph_retensi_5persen',
        'transfer_retensi_5persen',
    ];

    // tgl_memo -> tanggal_memo
    public function getTglMemoAttribute()
    {
        $val = $this->attributes['tanggal_memo'] ?? null;
        return ($val === '0000-00-00') ? null : $val;
    }
    public function setTglMemoAttribute($value)
    {
        $this->attributes['tanggal_memo'] = $value;
    }

    // norek -> no_rekening
    public function getNorekAttribute()
    {
        return $this->attributes['no_rekening'] ?? null;
    }
    public function setNorekAttribute($value)
    {
        $this->attributes['no_rekening'] = $value;
    }

    // tgl_tagihan -> tanggal_tagihan
    public function getTglTagihanAttribute()
    {
        $val = $this->attributes['tanggal_tagihan'] ?? null;
        return ($val === '0000-00-00') ? null : $val;
    }
    public function setTglTagihanAttribute($value)
    {
        $this->attributes['tanggal_tagihan'] = $value;
    }

    // tgl_spk -> tanggal_spk
    public function getTglSpkAttribute()
    {
        $val = $this->attributes['tanggal_spk'] ?? null;
        return ($val === '0000-00-00') ? null : $val;
    }
    public function setTglSpkAttribute($value)
    {
        $this->attributes['tanggal_spk'] = $value;
    }

    // no_spk -> nomor_spk
    public function getNoSpkAttribute()
    {
        return $this->attributes['nomor_spk'] ?? null;
    }
    public function setNoSpkAttribute($value)
    {
        $this->attributes['nomor_spk'] = $value;
    }

    // tgl_bap_bast -> tanggal_bap_bast
    public function getTglBapBastAttribute()
    {
        $val = $this->attributes['tanggal_bap_bast'] ?? null;
        return ($val === '0000-00-00') ? null : $val;
    }
    public function setTglBapBastAttribute($value)
    {
        $this->attributes['tanggal_bap_bast'] = $value;
    }

    // tagihan_nilai -> nilai_tagihan
    public function getTagihanNilaiAttribute()
    {
        return $this->attributes['nilai_tagihan'] ?? null;
    }
    public function setTagihanNilaiAttribute($value)
    {
        $this->attributes['nilai_tagihan'] = $value;
    }

    // tagihan_dpp -> dpp
    public function getTagihanDppAttribute()
    {
        return $this->attributes['dpp'] ?? null;
    }
    public function setTagihanDppAttribute($value)
    {
        $this->attributes['dpp'] = $value;
    }

    // tagihan_ppn -> ppn
    public function getTagihanPpnAttribute()
    {
        return $this->attributes['ppn'] ?? null;
    }
    public function setTagihanPpnAttribute($value)
    {
        $this->attributes['ppn'] = $value;
    }

    // tagihan_pph -> pph
    public function getTagihanPphAttribute()
    {
        return $this->attributes['pph'] ?? null;
    }
    public function setTagihanPphAttribute($value)
    {
        $this->attributes['pph'] = $value;
    }

    // tagihan_retensi -> retensi
    public function getTagihanRetensiAttribute()
    {
        return $this->attributes['retensi'] ?? null;
    }
    public function setTagihanRetensiAttribute($value)
    {
        $this->attributes['retensi'] = $value;
    }

    // tagihan_transfer -> transfer
    public function getTagihanTransferAttribute()
    {
        return $this->attributes['transfer'] ?? null;
    }
    public function setTagihanTransferAttribute($value)
    {
        $this->attributes['transfer'] = $value;
    }

    // retensi_nilai -> retensi_5persen
    public function getRetensiNilaiAttribute()
    {
        return $this->attributes['retensi_5persen'] ?? null;
    }
    public function setRetensiNilaiAttribute($value)
    {
        $this->attributes['retensi_5persen'] = $value;
    }

    // retensi_dpp -> dpp_retensi_5persen
    public function getRetensiDppAttribute()
    {
        return $this->attributes['dpp_retensi_5persen'] ?? null;
    }
    public function setRetensiDppAttribute($value)
    {
        $this->attributes['dpp_retensi_5persen'] = $value;
    }

    // retensi_ppn -> ppn_retensi_5persen
    public function getRetensiPpnAttribute()
    {
        return $this->attributes['ppn_retensi_5persen'] ?? null;
    }
    public function setRetensiPpnAttribute($value)
    {
        $this->attributes['ppn_retensi_5persen'] = $value;
    }

    // retensi_pph -> pph_retensi_5persen
    public function getRetensiPphAttribute()
    {
        return $this->attributes['pph_retensi_5persen'] ?? null;
    }
    public function setRetensiPphAttribute($value)
    {
        $this->attributes['pph_retensi_5persen'] = $value;
    }

    // retensi_transfer -> transfer_retensi_5persen
    public function getRetensiTransferAttribute()
    {
        return $this->attributes['transfer_retensi_5persen'] ?? null;
    }
    public function setRetensiTransferAttribute($value)
    {
        $this->attributes['transfer_retensi_5persen'] = $value;
    }
}
