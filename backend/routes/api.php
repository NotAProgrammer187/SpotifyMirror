<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\PlaylistController;
use App\Http\Controllers\BarkadaSessionController;
use App\Http\Controllers\SessionUserController;

// Public routes
Route::prefix('v1')->group(function () {
    // Simple test route without sessions
    Route::get('/test', function () {
        return response()->json(['status' => 'API Working', 'time' => now()]);
    });
    
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::get('/login', [AuthController::class, 'getAuthUrl']);
        Route::post('/callback', [AuthController::class, 'handleCallback']);
        Route::post('/refresh', [AuthController::class, 'refreshToken']);
        Route::post('/logout', [AuthController::class, 'logout']);
        
        // Multi-login Barkada routes
        Route::get('/barkada/users', [AuthController::class, 'getBarkadaUsers']);
        Route::post('/barkada/clear', [AuthController::class, 'clearBarkadaSession']);
    });

    // Session routes (public for joining)
    Route::get('/sessions/{code}', [BarkadaSessionController::class, 'getSession']);
    Route::post('/sessions/{code}/join', [BarkadaSessionController::class, 'joinSession']);
});

// Protected routes
Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    // User routes
    Route::prefix('user')->group(function () {
        Route::get('/profile', [UserController::class, 'getProfile']);
        Route::get('/top-tracks', [UserController::class, 'getTopTracks']);
        Route::get('/top-artists', [UserController::class, 'getTopArtists']);
        Route::get('/recently-played', [UserController::class, 'getRecentlyPlayed']);
        Route::get('/saved-tracks', [UserController::class, 'getSavedTracks']);
        Route::get('/following', [UserController::class, 'getFollowing']);
    });

    // Analytics routes
    Route::prefix('analytics')->group(function () {
        Route::get('/listening-habits', [AnalyticsController::class, 'getListeningHabits']);
        Route::get('/genre-breakdown', [AnalyticsController::class, 'getGenreBreakdown']);
        Route::get('/mood-analysis', [AnalyticsController::class, 'getMoodAnalysis']);
        Route::get('/listening-timeline', [AnalyticsController::class, 'getListeningTimeline']);
        Route::get('/discovery-insights', [AnalyticsController::class, 'getDiscoveryInsights']);
        Route::get('/artist-diversity', [AnalyticsController::class, 'getArtistDiversity']);
        
        // Barkada analysis endpoint
        Route::post('/barkada', [AnalyticsController::class, 'analyzeBarkadaMusic']);
    });

    // Playlist routes
    Route::prefix('playlists')->group(function () {
        Route::get('/', [PlaylistController::class, 'getUserPlaylists']);
        Route::get('/{id}', [PlaylistController::class, 'getPlaylistDetails']);
        Route::get('/{id}/analytics', [PlaylistController::class, 'getPlaylistAnalytics']);
        Route::get('/{id}/tracks', [PlaylistController::class, 'getPlaylistTracks']);
        Route::post('/compare', [PlaylistController::class, 'comparePlaylists']);
        
        // Group playlist creation (used by BarkadaContext)
        Route::post('/create-group', [PlaylistController::class, 'createGroupPlaylist']);
    });

    // Barkada session routes (protected)
    Route::prefix('sessions')->group(function () {
        Route::post('/', [BarkadaSessionController::class, 'createSession']);
        Route::get('/{code}/users', [BarkadaSessionController::class, 'getSessionUsers']);
        Route::delete('/{code}', [BarkadaSessionController::class, 'endSession']);
        Route::post('/{code}/leave', [BarkadaSessionController::class, 'leaveSession']);
        Route::put('/{code}/sync', [BarkadaSessionController::class, 'syncPlayback']);
    });
});
