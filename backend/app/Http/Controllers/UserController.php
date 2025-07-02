<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Get user profile from Spotify
     * Called by AuthContext to validate tokens
     */
    public function getProfile(Request $request)
    {
        try {
            $accessToken = Session::get('spotify_access_token');
            
            if (!$accessToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'No access token found'
                ], 401);
            }

            $response = Http::withOptions([
                'verify' => false, // Disable SSL verification for development
            ])->withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->get('https://api.spotify.com/v1/me');

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch user profile'
                ], $response->status());
            }

            // Return in format frontend expects
            return response()->json([
                'success' => true,
                'data' => $response->json()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch user profile: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user profile'
            ], 500);
        }
    }

    /**
     * Get user's top tracks
     */
    public function getTopTracks(Request $request)
    {
        try {
            $accessToken = Session::get('spotify_access_token');
            
            if (!$accessToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'No access token found'
                ], 401);
            }

            $params = [
                'limit' => $request->get('limit', 20),
                'time_range' => $request->get('time_range', 'medium_term'), // short_term, medium_term, long_term
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->get('https://api.spotify.com/v1/me/top/tracks', $params);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch top tracks'
                ], $response->status());
            }

            return response()->json([
                'success' => true,
                'data' => $response->json()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch top tracks: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch top tracks'
            ], 500);
        }
    }

    /**
     * Get user's top artists
     */
    public function getTopArtists(Request $request)
    {
        try {
            $accessToken = Session::get('spotify_access_token');
            
            if (!$accessToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'No access token found'
                ], 401);
            }

            $params = [
                'limit' => $request->get('limit', 20),
                'time_range' => $request->get('time_range', 'medium_term'),
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->get('https://api.spotify.com/v1/me/top/artists', $params);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch top artists'
                ], $response->status());
            }

            return response()->json([
                'success' => true,
                'data' => $response->json()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch top artists: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch top artists'
            ], 500);
        }
    }

    /**
     * Get recently played tracks
     */
    public function getRecentlyPlayed(Request $request)
    {
        try {
            $accessToken = Session::get('spotify_access_token');
            
            if (!$accessToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'No access token found'
                ], 401);
            }

            $params = [
                'limit' => $request->get('limit', 20),
            ];

            if ($request->has('after')) {
                $params['after'] = $request->get('after');
            }

            if ($request->has('before')) {
                $params['before'] = $request->get('before');
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->get('https://api.spotify.com/v1/me/player/recently-played', $params);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch recently played tracks'
                ], $response->status());
            }

            return response()->json([
                'success' => true,
                'data' => $response->json()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch recently played tracks: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch recently played tracks'
            ], 500);
        }
    }

    /**
     * Get saved tracks
     */
    public function getSavedTracks(Request $request)
    {
        try {
            $accessToken = Session::get('spotify_access_token');
            
            if (!$accessToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'No access token found'
                ], 401);
            }

            $params = [
                'limit' => $request->get('limit', 20),
                'offset' => $request->get('offset', 0),
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->get('https://api.spotify.com/v1/me/tracks', $params);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch saved tracks'
                ], $response->status());
            }

            return response()->json([
                'success' => true,
                'data' => $response->json()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch saved tracks: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch saved tracks'
            ], 500);
        }
    }

    /**
     * Get followed artists
     */
    public function getFollowing(Request $request)
    {
        try {
            $accessToken = Session::get('spotify_access_token');
            
            if (!$accessToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'No access token found'
                ], 401);
            }

            $params = [
                'type' => 'artist',
                'limit' => $request->get('limit', 20),
            ];

            if ($request->has('after')) {
                $params['after'] = $request->get('after');
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->get('https://api.spotify.com/v1/me/following', $params);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch following'
                ], $response->status());
            }

            return response()->json([
                'success' => true,
                'data' => $response->json()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch following: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch following'
            ], 500);
        }
    }
}
