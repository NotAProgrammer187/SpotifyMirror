<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;

class AnalyticsController extends Controller
{
    /**
     * Get listening habits analysis
     */
    public function getListeningHabits(Request $request)
    {
        try {
            $accessToken = Session::get('spotify_access_token');
            
            if (!$accessToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'No access token found'
                ], 401);
            }

            // Get user's top tracks and artists for analysis
            $topTracks = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->get('https://api.spotify.com/v1/me/top/tracks', [
                'limit' => 50,
                'time_range' => $request->get('time_range', 'medium_term')
            ]);

            $topArtists = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->get('https://api.spotify.com/v1/me/top/artists', [
                'limit' => 50,
                'time_range' => $request->get('time_range', 'medium_term')
            ]);

            $recentlyPlayed = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->get('https://api.spotify.com/v1/me/player/recently-played', [
                'limit' => 50
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'top_tracks' => $topTracks->successful() ? $topTracks->json() : null,
                    'top_artists' => $topArtists->successful() ? $topArtists->json() : null,
                    'recently_played' => $recentlyPlayed->successful() ? $recentlyPlayed->json() : null,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch listening habits: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch listening habits'
            ], 500);
        }
    }

    /**
     * Analyze Barkada (group) music
     * Expected by BarkadaContext.js
     */
    public function analyzeBarkadaMusic(Request $request)
    {
        try {
            $userTokens = $request->input('userTokens', []);
            $sessionId = $request->input('sessionId');

            if (empty($userTokens)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No user tokens provided'
                ], 400);
            }

            $allUserData = [];
            $sharedTracks = [];
            $commonArtists = [];

            // Collect data from all users
            foreach ($userTokens as $token) {
                try {
                    $topTracks = Http::withHeaders([
                        'Authorization' => 'Bearer ' . $token,
                    ])->get('https://api.spotify.com/v1/me/top/tracks', ['limit' => 20]);

                    $topArtists = Http::withHeaders([
                        'Authorization' => 'Bearer ' . $token,
                    ])->get('https://api.spotify.com/v1/me/top/artists', ['limit' => 20]);

                    $userProfile = Http::withHeaders([
                        'Authorization' => 'Bearer ' . $token,
                    ])->get('https://api.spotify.com/v1/me');

                    if ($topTracks->successful() && $topArtists->successful() && $userProfile->successful()) {
                        $allUserData[] = [
                            'user' => $userProfile->json(),
                            'top_tracks' => $topTracks->json(),
                            'top_artists' => $topArtists->json()
                        ];
                    }
                } catch (\Exception $e) {
                    Log::warning('Failed to fetch data for user token: ' . $e->getMessage());
                }
            }

            // Find shared tracks (simplified logic)
            if (count($allUserData) >= 2) {
                $firstUserTracks = collect($allUserData[0]['top_tracks']['items']);
                
                foreach ($allUserData as $userData) {
                    $userTracks = collect($userData['top_tracks']['items']);
                    $shared = $firstUserTracks->filter(function ($track) use ($userTracks) {
                        return $userTracks->contains(function ($userTrack) use ($track) {
                            return $userTrack['id'] === $track['id'];
                        });
                    });
                    
                    $sharedTracks = array_merge($sharedTracks, $shared->take(5)->toArray());
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'users' => $allUserData,
                    'sharedTracks' => array_unique($sharedTracks, SORT_REGULAR),
                    'commonArtists' => $commonArtists,
                    'sessionId' => $sessionId,
                    'analyzedAt' => now()->toISOString(),
                    'summary' => [
                        'totalUsers' => count($allUserData),
                        'sharedTracksCount' => count($sharedTracks),
                        'commonGenres' => []
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Barkada analysis failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to analyze barkada music'
            ], 500);
        }
    }

    /**
     * Get genre breakdown
     */
    public function getGenreBreakdown(Request $request)
    {
        // Implementation for genre analysis
        return response()->json([
            'success' => true,
            'data' => [
                'genres' => [],
                'message' => 'Genre analysis coming soon'
            ]
        ]);
    }

    /**
     * Get mood analysis
     */
    public function getMoodAnalysis(Request $request)
    {
        // Implementation for mood analysis
        return response()->json([
            'success' => true,
            'data' => [
                'moods' => [],
                'message' => 'Mood analysis coming soon'
            ]
        ]);
    }

    /**
     * Get listening timeline
     */
    public function getListeningTimeline(Request $request)
    {
        // Implementation for timeline analysis
        return response()->json([
            'success' => true,
            'data' => [
                'timeline' => [],
                'message' => 'Timeline analysis coming soon'
            ]
        ]);
    }

    /**
     * Get discovery insights
     */
    public function getDiscoveryInsights(Request $request)
    {
        // Implementation for discovery insights
        return response()->json([
            'success' => true,
            'data' => [
                'insights' => [],
                'message' => 'Discovery insights coming soon'
            ]
        ]);
    }

    /**
     * Get artist diversity
     */
    public function getArtistDiversity(Request $request)
    {
        // Implementation for artist diversity
        return response()->json([
            'success' => true,
            'data' => [
                'diversity' => [],
                'message' => 'Artist diversity analysis coming soon'
            ]
        ]);
    }
}
