<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserState extends Model
{
    //
    protected $fillable = [
        'user_chat_id',
        'state',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array'
    ];

    public function user() 
    {
        return $this->belongTo(User::class,'user_chat_id','chat_id');
    }

}
