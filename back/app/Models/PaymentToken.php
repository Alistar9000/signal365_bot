<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PaymentToken extends Model
{
    
    protected $fillable = ['user_id','token','expires_at'];

    protected $casts = [
        'expires_at' => 'datetime'
        ];
        
   
    public function user()
    {
        return $this->belongsTo(User::class,'user_id','chat_id');
    }
    
    public static function generate($userId)
    {
        //  $tkn =4543534534;
        return self::updateOrCreate([
            'user_id' => $userId
            ],[
            'user_id' => $userId,
            'token' => Str::random(30),
            'expires_at' => now()->addMinutes(15)
            ]);
    }
    public function isValid()
    {
        return $this->expires_at && $this->expires_at->isFuture();
    }
    
    
}