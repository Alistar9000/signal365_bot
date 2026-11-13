<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SymbolHistory extends Model
{
    
   protected $fillable = [
        'symbol_code',
        'high',
        'low',
        'date',
        
   ];

   public function symbol()
   {
    return $this->belongsTo(Symbol::class,'symbol_code','code');
   }
}
