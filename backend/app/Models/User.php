<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'spotify_id',
        'avatar_url',
        'spotify_data',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'remember_token',
        'spotify_data',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'spotify_data' => 'array',
    ];

    /**
     * Get the sessions this user has created
     */
    public function createdSessions()
    {
        return $this->hasMany(BarkadaSession::class, 'creator_id');
    }

    /**
     * Get the sessions this user has joined
     */
    public function joinedSessions()
    {
        return $this->belongsToMany(BarkadaSession::class, 'session_users')
                    ->withTimestamps()
                    ->withPivot(['joined_at', 'is_active']);
    }

    /**
     * Get all sessions (created or joined)
     */
    public function allSessions()
    {
        return $this->createdSessions()
                    ->union($this->joinedSessions());
    }
}
