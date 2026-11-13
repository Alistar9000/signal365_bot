<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BroadcastJob extends Model
{
    //
    protected $fillable = [
        'message',
        'type',
        'sent_count',
        'failed_count',
    ];
}
