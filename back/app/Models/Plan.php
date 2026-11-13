<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
   protected $fillable = [
        'type',
        'period',
        'price',
        'off_price',
        'off_percent',
       
    ];

}