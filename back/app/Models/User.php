<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    //
    protected $fillable = [
        'chat_id',
        'username',
        'name',
        'role',
        'is_vip',
        'token',
        'vip_until',
        'last_activity',
        'purchase_count',
        'purchase_date',
    ];

    protected $casts = [
        'vip_until'     => 'datetime',
        'purchase_date'     => 'datetime',
        'last_activity' => 'datetime',
        'is_vip'        => 'boolean',
        'token' => 'string',
    ];

    public function alerts()
    {
        return $this->hasMany(UserAlert::class,'user_chat_id','chat_id');
    }

    public function isVip(): bool
    {
        return $this->is_vip && $this->vip_until->isFuture();
    }
    
    public function isAdmin(): bool
    {
        return $this->role == 'admin';
    }

    public function getRemainingDaysAttribute(): int
    {
        if (! $this->is_vip || $this->vip_until->isPast()) {
            return 0;
        }

        // $now = Carbon::now();
        if ($this->vip_until->lessThanOrEqualTo(now())) {
            return 0;
        }

        return round(now()->diffInDays($this->vip_until, false));
    }

    public function state()
    {
        return $this->hasOne(UserState::class,'user_chat_id','chat_id');
    }

    public function setState(string $state, array $meta = [])
    {
        \App\Models\UserState::updateOrCreate(
            ['user_chat_id' => $this->chat_id],
            ['state' => $state, 'meta' => $meta]
        );
    }

    public function clearState()
    {
        \App\Models\UserState::where('user_chat_id', $this->chat_id)->delete();
    }
    public function currentState()
    {
        $state = \App\Models\UserState::where('user_chat_id', $this->chat_id)->first();
        return $state ? $state->state : null;
    }
    
    public function getMeta($chatId)
    {
        $state = \App\Models\UserState::where('user_chat_id', $this->chat_id)->first();
        return $state->meta['chat_id'];
    }

}
