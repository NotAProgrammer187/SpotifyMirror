<?php

namespace App\Http\Controllers;

use App\Models\BarkadaSession;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class BarkadaSessionController extends Controller
{
    /**
     * Get all active sessions for the user
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            
            $sessions = BarkadaSession::active()
                ->where(function ($query) use ($user) {
                    $query->where('creator_id', $user->id)
                          ->orWhereHas('participants', function ($q) use ($user) {
                              $q->where('user_id', $user->id);
                          });
                })
                ->with(['creator', 'activeParticipants'])
                ->get();

            return response()->json([
                'success' => true,
                'data' => $sessions
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch sessions: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch sessions'
            ], 500);
        }
    }

    /**
     * Create a new Barkada session
     */
    public function createSession(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string|max:500',
                'max_participants' => 'nullable|integer|min:2|max:50',
                'duration_hours' => 'nullable|integer|min:1|max:24'
            ]);

            $user = $request->user();
            $sessionCode = BarkadaSession::generateSessionCode();

            $expiresAt = null;
            if ($request->duration_hours) {
                $expiresAt = now()->addHours($request->duration_hours);
            }

            $session = BarkadaSession::create([
                'session_code' => $sessionCode,
                'creator_id' => $user->id,
                'name' => $request->name,
                'description' => $request->description,
                'max_participants' => $request->max_participants,
                'is_active' => true,
                'expires_at' => $expiresAt,
            ]);

            // Auto-join creator to the session
            $session->participants()->attach($user->id, [
                'joined_at' => now(),
                'is_active' => true
            ]);

            $session->load(['creator', 'activeParticipants']);

            return response()->json([
                'success' => true,
                'data' => $session,
                'message' => 'Session created successfully'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Failed to create session: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create session'
            ], 500);
        }
    }

    /**
     * Get session details by code (public endpoint)
     */
    public function getSession($sessionCode)
    {
        try {
            $session = BarkadaSession::where('session_code', $sessionCode)
                ->active()
                ->with(['creator', 'activeParticipants'])
                ->first();

            if (!$session) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session not found or expired'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $session->id,
                    'session_code' => $session->session_code,
                    'name' => $session->name,
                    'description' => $session->description,
                    'creator' => [
                        'name' => $session->creator->name,
                        'avatar_url' => $session->creator->avatar_url
                    ],
                    'participant_count' => $session->activeParticipants->count(),
                    'max_participants' => $session->max_participants,
                    'is_full' => $session->isFull(),
                    'created_at' => $session->created_at,
                    'expires_at' => $session->expires_at
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch session: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch session'
            ], 500);
        }
    }

    /**
     * Join a session (public endpoint)
     */
    public function joinSession(Request $request, $sessionCode)
    {
        try {
            $request->validate([
                'user_name' => 'required|string|max:255',
                'spotify_id' => 'required|string'
            ]);

            $session = BarkadaSession::where('session_code', $sessionCode)
                ->active()
                ->first();

            if (!$session) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session not found or expired'
                ], 404);
            }

            if ($session->isFull()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session is full'
                ], 400);
            }

            // Create or find user
            $user = User::firstOrCreate(
                ['spotify_id' => $request->spotify_id],
                ['name' => $request->user_name]
            );

            // Check if already in session
            if ($session->hasParticipant($user->id)) {
                // Reactivate if inactive
                $session->participants()->updateExistingPivot($user->id, [
                    'is_active' => true,
                    'updated_at' => now()
                ]);
            } else {
                // Add to session
                $session->participants()->attach($user->id, [
                    'joined_at' => now(),
                    'is_active' => true
                ]);
            }

            $session->load(['creator', 'activeParticipants']);

            return response()->json([
                'success' => true,
                'data' => $session,
                'message' => 'Joined session successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to join session: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to join session'
            ], 500);
        }
    }

    /**
     * Get session users
     */
    public function getSessionUsers($sessionCode)
    {
        try {
            $session = BarkadaSession::where('session_code', $sessionCode)
                ->active()
                ->with('activeParticipants')
                ->first();

            if (!$session) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $session->activeParticipants
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch session users: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch session users'
            ], 500);
        }
    }

    /**
     * Leave a session
     */
    public function leaveSession(Request $request, $sessionCode)
    {
        try {
            $user = $request->user();
            
            $session = BarkadaSession::where('session_code', $sessionCode)
                ->active()
                ->first();

            if (!$session) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session not found'
                ], 404);
            }

            // Mark user as inactive in session
            $session->participants()->updateExistingPivot($user->id, [
                'is_active' => false,
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Left session successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to leave session: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to leave session'
            ], 500);
        }
    }

    /**
     * End a session (creator only)
     */
    public function endSession(Request $request, $sessionCode)
    {
        try {
            $user = $request->user();
            
            $session = BarkadaSession::where('session_code', $sessionCode)
                ->where('creator_id', $user->id)
                ->active()
                ->first();

            if (!$session) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session not found or you are not the creator'
                ], 404);
            }

            // Mark session as inactive
            $session->update(['is_active' => false]);

            // Mark all participants as inactive
            $session->participants()->updateExistingPivot(
                $session->participants->pluck('id')->toArray(),
                ['is_active' => false, 'updated_at' => now()]
            );

            return response()->json([
                'success' => true,
                'message' => 'Session ended successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to end session: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to end session'
            ], 500);
        }
    }

    /**
     * Sync playback state
     */
    public function syncPlayback(Request $request, $sessionCode)
    {
        try {
            $request->validate([
                'current_track' => 'nullable|array',
                'playback_state' => 'nullable|array',
                'position_ms' => 'nullable|integer',
                'is_playing' => 'nullable|boolean'
            ]);

            $user = $request->user();
            
            $session = BarkadaSession::where('session_code', $sessionCode)
                ->active()
                ->whereHas('participants', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->first();

            if (!$session) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session not found or you are not a participant'
                ], 404);
            }

            // Update session sync data
            $syncData = [
                'updated_by' => $user->id,
                'updated_at' => now()->toISOString(),
                'position_ms' => $request->position_ms,
                'is_playing' => $request->is_playing,
            ];

            $session->update([
                'current_track' => $request->current_track,
                'playback_state' => $request->playback_state,
                'sync_data' => $syncData
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'current_track' => $session->current_track,
                    'playback_state' => $session->playback_state,
                    'sync_data' => $session->sync_data
                ],
                'message' => 'Playback synced successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to sync playback: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync playback'
            ], 500);
        }
    }
}
