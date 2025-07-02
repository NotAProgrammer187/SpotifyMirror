<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class BarkadaSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_code',
        'creator_id',
        'name',
        'description',
        'is_active',
        'max_participants',
        'current_track',
        'playback_state',
        'sync_data',
        'expires_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'current_track' => 'array',
        'playback_state' => 'array',
        'sync_data' => 'array',
        'expires_at' => 'datetime',
    ];

    /**
     * Generate a unique session code
     */
    public static function generateSessionCode()
    {
        do {
            $code = strtoupper(Str::random(6));
        } while (self::where('session_code', $code)->exists());

        return $code;
    }

    /**
     * Get the creator of this session
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    /**
     * Get all participants in this session
     */
    public function participants()
    {
        return $this->belongsToMany(User::class, 'session_users')
                    ->withTimestamps()
                    ->withPivot(['joined_at', 'is_active']);
    }

    /**
     * Get active participants only
     */
    public function activeParticipants()
    {
        return $this->participants()->wherePivot('is_active', true);
    }

    /**
     * Check if session is full
     */
    public function isFull()
    {
        if (!$this->max_participants) {
            return false;
        }

        return $this->activeParticipants()->count() >= $this->max_participants;
    }

    /**
     * Check if user is in this session
     */
    public function hasParticipant($userId)
    {
        return $this->participants()->where('user_id', $userId)->exists();
    }

    /**
     * Check if session is expired
     */
    public function isExpired()
    {
        if (!$this->expires_at) {
            return false;
        }

        return now()->gt($this->expires_at);
    }

    /**
     * Scope for active sessions
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                    ->where(function ($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    });
    }
}
