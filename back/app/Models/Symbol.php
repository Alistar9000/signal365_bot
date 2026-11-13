<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Symbol extends Model
{
     protected $fillable = [
        'name',
        'code',
        'close',
        'first',
        'high',
        'low',
        'final',
        'date'
    ];

    public function signals()
    {
        return $this->hasMany(Signal::class,'symbol_code','code');
    }

    public function histories()
    {
        return $this->hasMany(SymbolHistory::class,'symbol_code','code');
    }
    
    public function alerts()
    {
        return $this->hasMany(UserAlert::class,'symbol_code','code');
    }
    
}
