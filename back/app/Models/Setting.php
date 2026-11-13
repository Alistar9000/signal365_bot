<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'signal_price',
        'signal_domain',
        'vip_days',
       
    ];
    
}