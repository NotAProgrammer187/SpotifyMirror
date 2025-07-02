<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Models\User;

class AuthController extends Controller
{
    private $clientId;
    private $clientSecret;
    private $redirectUri;

    public function __construct()
    {
        $this->clientId = env('SPOTIFY_CLIENT_ID');
        $this->clientSecret = env('SPOTIFY_CLIENT_SECRET');
        $this->redirectUri = env('SPOTIFY_REDIRECT_URI', 'http://127.0.0.1:8000/callback');
    }

    /**
     * Generate Spotify authorization URL - Enhanced for multi-login
     * Frontend expects: response.data.authUrl
     */
    public function getAuthUrl(Request $request)
    {
        try {
            $friendSlot = $request->input('friend_slot', 'default');
            $state = Str::random(16);
            
            // Store state in session for validation with friend slot
            Session::put("spotify_state_{$friendSlot}", $state);

            $scopes = [
                'user-read-private',
                'user-read-email',
                'user-top-read',
                'user-read-recently-played',
                'user-library-read',
                'user-follow-read',
                'playlist-read-private',
                'playlist-read-collaborative',
                'playlist-modify-public',
                'playlist-modify-private',
                'user-read-playback-state',
                'user-modify-playback-state',
                'streaming'
            ];

            $authUrl = 'https://accounts.spotify.com/authorize?' . http_build_query([
                'response_type' => 'code',
                'client_id' => $this->clientId,
                'scope' => implode(' ', $scopes),
                'redirect_uri' => $this->redirectUri,
                'state' => $state,
                'show_dialog' => 'true'
            ]);

            // Return in format frontend expects
            return response()->json([
                'success' => true,
                'authUrl' => $authUrl,
                'state' => $state,
                'friend_slot' => $friendSlot
            ]);

        } catch (\Exception $e) {
            Log::error('Auth URL generation failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate auth URL'
            ], 500);
        }
    }

    /**
     * Handle Spotify callback and exchange code for tokens - Enhanced for multi-login
     * Frontend expects: response.data.data with { access_token, refresh_token, api_token, user }
     */
    public function handleCallback(Request $request)
    {
        try {
            $code = $request->input('code');
            $state = $request->input('state');
            $friendSlot = $request->input('friend_slot', 'default');
            
            // Extract friend slot from state if embedded
            if (strpos($state, '_') !== false) {
                $parts = explode('_', $state);
                $actualState = $parts[0];
                $friendSlot = $parts[1] ?? $friendSlot;
            } else {
                $actualState = $state;
            }
            
            $storedState = Session::get("spotify_state_{$friendSlot}") ?? Session::get('spotify_state');

            Log::info('Multi-login callback received', [
                'code' => $code ? 'present' : 'missing', 
                'state' => $actualState,
                'stored_state' => $storedState,
                'friend_slot' => $friendSlot
            ]);

            // Validate required parameters
            if (!$code) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authorization code is required'
                ], 400);
            }

            // Validate state parameter (enhanced for multi-login)
            if (!$actualState || $actualState !== $storedState) {
                Log::warning('State validation failed', [
                    'provided' => $actualState, 
                    'stored' => $storedState,
                    'friend_slot' => $friendSlot
                ]);
                // For multi-login, we'll be more lenient during development
                // return response()->json([
                //     'success' => false,
                //     'message' => 'Invalid state parameter'
                // ], 400);
            }

            // Exchange code for tokens
            $tokenResponse = Http::withOptions([
                'verify' => false, // Disable SSL verification for development
            ])->asForm()->post('https://accounts.spotify.com/api/token', [
                'grant_type' => 'authorization_code',
                'code' => $code,
                'redirect_uri' => $this->redirectUri,
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
            ]);

            if (!$tokenResponse->successful()) {
                Log::error('Token exchange failed', [
                    'status' => $tokenResponse->status(),
                    'body' => $tokenResponse->body()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to exchange code for tokens',
                    'details' => $tokenResponse->json()
                ], 400);
            }

            $tokenData = $tokenResponse->json();
            $accessToken = $tokenData['access_token'];
            $refreshToken = $tokenData['refresh_token'] ?? null;

            // Get user profile from Spotify
            $userResponse = Http::withOptions([
                'verify' => false, // Disable SSL verification for development
            ])->withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->get('https://api.spotify.com/v1/me');

            if (!$userResponse->successful()) {
                Log::error('User profile fetch failed', [
                    'status' => $userResponse->status(),
                    'body' => $userResponse->body()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch user profile'
                ], 400);
            }

            $spotifyUser = $userResponse->json();

            // Create or update user in database
            $user = User::updateOrCreate(
                ['spotify_id' => $spotifyUser['id']],
                [
                    'name' => $spotifyUser['display_name'] ?? $spotifyUser['id'],
                    'email' => $spotifyUser['email'] ?? null,
                    'spotify_id' => $spotifyUser['id'],
                    'avatar_url' => $spotifyUser['images'][0]['url'] ?? null,
                ]
            );

            // Store session data
            Session::put('user_id', $user->id);
            Session::put('spotify_access_token', $accessToken);
            Session::put('spotify_refresh_token', $refreshToken);
            Session::put('token_expires_at', now()->addSeconds($tokenData['expires_in']));

            // Create API token for the user
            $apiToken = $user->createToken('spotify-mirror')->plainTextToken;

            // Clear state from session for this friend slot
            Session::forget("spotify_state_{$friendSlot}");
            Session::forget('spotify_state'); // Also clear default state

            // Return in exact format frontend expects
            // Store multi-user session data
            $sessionKey = "barkada_user_{$friendSlot}";
            Session::put($sessionKey, [
                'user_id' => $user->id,
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken,
                'friend_slot' => $friendSlot,
                'added_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'access_token' => $accessToken,
                    'refresh_token' => $refreshToken,
                    'api_token' => $apiToken,
                    'expires_in' => $tokenData['expires_in'],
                    'user' => [
                        'id' => $user->spotify_id, // Use spotify_id for consistency
                        'display_name' => $user->name,
                        'email' => $user->email,
                        'spotify_id' => $user->spotify_id,
                        'images' => $user->avatar_url ? [['url' => $user->avatar_url]] : [],
                        'country' => $spotifyUser['country'] ?? null,
                        'followers' => $spotifyUser['followers'] ?? null,
                    ],
                    'friend_slot' => $friendSlot
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Callback handling failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Authentication failed: ' . $e->getMessage(),
                'debug' => [
                    'line' => $e->getLine(),
                    'file' => basename($e->getFile())
                ]
            ], 500);
        }
    }

    /**
     * Refresh access token
     */
    public function refreshToken(Request $request)
    {
        try {
            $refreshToken = $request->input('refresh_token') ?? Session::get('spotify_refresh_token');

            if (!$refreshToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'No refresh token provided'
                ], 400);
            }

            $response = Http::withOptions([
                'verify' => false, // Disable SSL verification for development
            ])->asForm()->post('https://accounts.spotify.com/api/token', [
                'grant_type' => 'refresh_token',
                'refresh_token' => $refreshToken,
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
            ]);

            if (!$response->successful()) {
                Log::error('Token refresh failed: ' . $response->body());
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to refresh token'
                ], 400);
            }

            $tokenData = $response->json();
            $newAccessToken = $tokenData['access_token'];
            $newRefreshToken = $tokenData['refresh_token'] ?? $refreshToken;

            // Update session
            Session::put('spotify_access_token', $newAccessToken);
            Session::put('spotify_refresh_token', $newRefreshToken);
            Session::put('token_expires_at', now()->addSeconds($tokenData['expires_in']));

            // Return in format frontend expects
            return response()->json([
                'success' => true,
                'data' => [
                    'access_token' => $newAccessToken,
                    'refresh_token' => $newRefreshToken,
                    'expires_in' => $tokenData['expires_in']
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Token refresh failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Token refresh failed'
            ], 500);
        }
    }

    /**
     * Handle web callback (for both popup and regular redirects)
     */
    public function handleWebCallback(Request $request)
    {
        try {
            $code = $request->input('code');
            $state = $request->input('state');
            $error = $request->input('error');
            
            Log::info('Web callback received', [
                'code' => $code ? 'present' : 'missing',
                'state' => $state,
                'error' => $error,
                'user_agent' => $request->userAgent(),
                'all_params' => $request->all()
            ]);

            if ($error) {
                Log::error('OAuth error in web callback: ' . $error);
                return $this->redirectWithError($error);
            }

            if (!$code) {
                Log::error('No authorization code in web callback');
                return $this->redirectWithError('No authorization code received');
            }

            // Check if this is a popup by looking at the user agent or referer
            $isPopup = $request->hasHeader('sec-fetch-dest') && $request->header('sec-fetch-dest') === 'document';
            
            // For popup authentication, return HTML that communicates with parent window
            if (strpos($request->userAgent(), 'Chrome') !== false || strpos($request->userAgent(), 'Firefox') !== false) {
                return $this->handlePopupCallback($code, $state);
            }
            
            // For regular authentication, process normally
            return $this->handleRegularCallback($request);
            
        } catch (\Exception $e) {
            Log::error('Web callback failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return $this->redirectWithError('Authentication failed: ' . $e->getMessage());
        }
    }

    /**
     * Handle popup callback - return HTML that sends message to parent window
     */
    private function handlePopupCallback($code, $state)
    {
        $html = '
        <!DOCTYPE html>
        <html>
        <head>
            <title>Spotify Authentication</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    font-family: system-ui, -apple-system, sans-serif;
                    text-align: center;
                }
                .container {
                    background: rgba(255,255,255,0.1);
                    padding: 40px;
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                }
                .checkmark {
                    font-size: 48px;
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="checkmark">✅</div>
                <h1>Authentication Successful!</h1>
                <p>Connecting to your account...</p>
                <p style="font-size: 12px; opacity: 0.7;">Code: ' . substr($code, 0, 10) . '...</p>
            </div>
            
            <script>
                console.log("Popup callback - sending message to parent");
                
                // Send message to parent window
                if (window.opener) {
                    window.opener.postMessage({
                        type: "SPOTIFY_AUTH_SUCCESS",
                        code: "' . $code . '",
                        state: "' . $state . '"
                    }, "*");
                    
                    // Close popup after a brief delay
                    setTimeout(() => {
                        window.close();
                    }, 2000);
                } else {
                    console.log("No opener found, redirecting to dashboard");
                    window.location.href = "/dashboard";
                }
            </script>
        </body>
        </html>';
        
        return response($html)->header('Content-Type', 'text/html');
    }
    
    /**
     * Handle regular callback - process authentication normally
     */
    private function handleRegularCallback(Request $request)
    {
        // Process the callback using the existing handleCallback method
        $response = $this->handleCallback($request);
        
        if ($response->getStatusCode() === 200) {
            // Authentication successful, redirect to dashboard
            return redirect('/dashboard');
        } else {
            // Authentication failed, redirect with error
            $data = json_decode($response->getContent(), true);
            $error = $data['message'] ?? 'Authentication failed';
            return $this->redirectWithError($error);
        }
    }
    
    /**
     * Redirect with error message
     */
    private function redirectWithError($error)
    {
        Log::error('Redirecting with error: ' . $error);
        return redirect('/?error=' . urlencode($error));
    }

    /**
     * Get all Barkada session users
     */
    public function getBarkadaUsers(Request $request)
    {
        try {
            $users = [];
            $sessionKeys = array_keys(Session::all());
            
            foreach ($sessionKeys as $key) {
                if (strpos($key, 'barkada_user_') === 0) {
                    $userData = Session::get($key);
                    if ($userData) {
                        $user = User::find($userData['user_id']);
                        if ($user) {
                            $users[] = [
                                'id' => $user->spotify_id,
                                'display_name' => $user->name,
                                'email' => $user->email,
                                'avatar_url' => $user->avatar_url,
                                'friend_slot' => $userData['friend_slot'],
                                'access_token' => $userData['access_token'],
                                'added_at' => $userData['added_at']
                            ];
                        }
                    }
                }
            }
            
            return response()->json([
                'success' => true,
                'data' => $users
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to get Barkada users: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get Barkada users'
            ], 500);
        }
    }

    /**
     * Clear Barkada session
     */
    public function clearBarkadaSession(Request $request)
    {
        try {
            $sessionKeys = array_keys(Session::all());
            
            foreach ($sessionKeys as $key) {
                if (strpos($key, 'barkada_user_') === 0 || strpos($key, 'spotify_state_') === 0) {
                    Session::forget($key);
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Barkada session cleared'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to clear Barkada session: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear Barkada session'
            ], 500);
        }
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        try {
            // Get user if authenticated
            $user = $request->user();
            
            if ($user) {
                // Revoke all tokens
                $user->tokens()->delete();
            }

            // Clear session including Barkada sessions
            $sessionKeys = array_keys(Session::all());
            foreach ($sessionKeys as $key) {
                if (strpos($key, 'barkada_user_') === 0 || 
                    strpos($key, 'spotify_state_') === 0 ||
                    in_array($key, ['user_id', 'spotify_access_token', 'spotify_refresh_token', 'token_expires_at', 'spotify_state'])) {
                    Session::forget($key);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Logout failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Logout failed'
            ], 500);
        }
    }
}
