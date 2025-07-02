<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;

class PlaylistController extends Controller
{
    /**
     * Get user playlists
     */
    public function getUserPlaylists(Request $request)
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
            ])->get('https://api.spotify.com/v1/me/playlists', $params);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch playlists'
                ], $response->status());
            }

            return response()->json([
                'success' => true,
                'data' => $response->json()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch playlists: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch playlists'
            ], 500);
        }
    }

    /**
     * Create group playlist
     * Expected by BarkadaContext.js
     */
    public function createGroupPlaylist(Request $request)
    {
        try {
            $accessToken = $request->input('accessToken');
            $playlistName = $request->input('playlistName', 'Barkada Hits');
            $description = $request->input('description', '');
            $trackUris = $request->input('trackUris', []);

            if (!$accessToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access token required'
                ], 400);
            }

            // Get user ID first
            $userResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->get('https://api.spotify.com/v1/me');

            if (!$userResponse->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to get user info'
                ], 400);
            }

            $userId = $userResponse->json()['id'];

            // Create playlist
            $playlistResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'Content-Type' => 'application/json',
            ])->post("https://api.spotify.com/v1/users/{$userId}/playlists", [
                'name' => $playlistName,
                'description' => $description,
                'public' => false
            ]);

            if (!$playlistResponse->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create playlist'
                ], 400);
            }

            $playlist = $playlistResponse->json();

            // Add tracks if provided
            if (!empty($trackUris)) {
                $addTracksResponse = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $accessToken,
                    'Content-Type' => 'application/json',
                ])->post("https://api.spotify.com/v1/playlists/{$playlist['id']}/tracks", [
                    'uris' => $trackUris
                ]);

                if (!$addTracksResponse->successful()) {
                    Log::warning('Failed to add tracks to playlist: ' . $addTracksResponse->body());
                }
            }

            return response()->json([
                'success' => true,
                'data' => $playlist
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to create group playlist: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create playlist'
            ], 500);
        }
    }

    /**
     * Get playlist details
     */
    public function getPlaylistDetails(Request $request, $id)
    {
        try {
            $accessToken = Session::get('spotify_access_token');
            
            if (!$accessToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'No access token found'
                ], 401);
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->get("https://api.spotify.com/v1/playlists/{$id}");

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch playlist details'
                ], $response->status());
            }

            return response()->json([
                'success' => true,
                'data' => $response->json()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch playlist details: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch playlist details'
            ], 500);
        }
    }

    /**
     * Get playlist analytics
     */
    public function getPlaylistAnalytics(Request $request, $id)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'playlist_id' => $id,
                'analytics' => [],
                'message' => 'Playlist analytics coming soon'
            ]
        ]);
    }

    /**
     * Get playlist tracks
     */
    public function getPlaylistTracks(Request $request, $id)
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
                'limit' => $request->get('limit', 50),
                'offset' => $request->get('offset', 0),
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->get("https://api.spotify.com/v1/playlists/{$id}/tracks", $params);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch playlist tracks'
                ], $response->status());
            }

            return response()->json([
                'success' => true,
                'data' => $response->json()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch playlist tracks: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch playlist tracks'
            ], 500);
        }
    }

    /**
     * Compare playlists
     */
    public function comparePlaylists(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'comparison' => [],
                'message' => 'Playlist comparison coming soon'
            ]
        ]);
    }
}
