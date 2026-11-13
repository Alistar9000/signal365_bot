<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Signal extends Model
{
    protected $fillable = [
        'symbol_code',
        'type',
        'close',
        'valid',
        'date'
    ];

   
    public function symbol()
    {
        return $this->belongsTo(Symbol::class,'symbol_code','code');
    }
}
