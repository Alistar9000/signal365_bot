<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAlert extends Model
{
    //
    protected $fillable = ['symbol_code','user_chat_id'];

    public function user()
    {
        return $this->belongsTo(User::class,'user_chat_id','chat_id');
    }

     public function symbol()
    {
        return $this->belongsTo(Symbol::class, 'symbol_code', 'code');
       
    }
}
