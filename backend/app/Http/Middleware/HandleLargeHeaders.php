<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class HandleLargeHeaders
{
    public function handle(Request $request, Closure $next)
    {
        // Clear any problematic session data that might be causing large headers
        if ($request->hasSession()) {
            $session = $request->session();
            
            // Remove potentially large session data
            $session->forget(['spotify_state', 'spotify_data', 'large_session_data']);
            
            // If session is still too large, clear it completely
            if (strlen(serialize($session->all())) > 4000) {
                $session->flush();
            }
        }

        return $next($request);
    }
}
