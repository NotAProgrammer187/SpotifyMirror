<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Debug route to check if callback is being hit
Route::get('/debug-callback', function () {
    return response()->json([
        'message' => 'Callback route is working!',
        'request_data' => request()->all()
    ]);
});

// Handle Spotify callback - this is the main callback route
Route::get('/callback', [AuthController::class, 'handleWebCallback']);

// Redirect all API calls to /api prefix
Route::get('/', function () {
    return view('welcome');
});

// Handle React Router - catch all routes that don't match API or callback
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '^(?!api|callback|debug-callback).*$');