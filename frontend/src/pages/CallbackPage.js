import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const CallbackPage = () => {
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check both search params and hash params
        const urlParams = new URLSearchParams(location.search);
        const hashParams = new URLSearchParams(location.hash.substring(1));
        
        const code = urlParams.get('code') || hashParams.get('code');
        const state = urlParams.get('state') || hashParams.get('state');
        const error = urlParams.get('error') || hashParams.get('error');

        console.log('CallbackPage - Processing:', { code: !!code, state, error, search: location.search, hash: location.hash });

        if (error) {
          console.error('OAuth error:', error);
          // Send error to parent window if in popup
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'SPOTIFY_AUTH_ERROR', 
              error: error 
            }, window.location.origin);
            window.close();
          } else {
            // Redirect to main app with error
            window.location.href = '/?error=' + encodeURIComponent(error);
          }
          return;
        }

        if (code) {
          console.log('CallbackPage - Found code, checking if popup...');
          // Check if this is a popup callback
          if (window.opener) {
            console.log('CallbackPage - Is popup, sending message to parent');
            // This is a popup window - send the code to parent
            window.opener.postMessage({ 
              type: 'SPOTIFY_AUTH_SUCCESS', 
              code: code,
              state: state
            }, window.location.origin);
            
            // Show success message before closing
            const successHTML = `
              <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                font-family: system-ui, -apple-system, sans-serif;
                text-align: center;
                padding: 20px;
              ">
                <div style="background: rgba(255,255,255,0.1); padding: 40px; border-radius: 20px; backdrop-filter: blur(10px);">
                  <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
                  <h1 style="margin: 0 0 10px 0; font-size: 24px;">Authentication Successful!</h1>
                  <p style="margin: 0; opacity: 0.9;">This window will close automatically...</p>
                  <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.7;">Code: ${code.substring(0, 10)}...</p>
                </div>
              </div>
            `;
            
            document.body.innerHTML = successHTML;
            
            // Close popup after a brief delay
            setTimeout(() => {
              window.close();
            }, 2000);
          } else {
            console.log('CallbackPage - Not popup, redirecting to dashboard');
            // This is a regular redirect - handle normally
            // For existing users who might use the direct callback
            window.location.href = '/dashboard';
          }
        } else {
          console.error('CallbackPage - No code found');
          throw new Error('No authorization code received');
        }
      } catch (error) {
        console.error('Callback handling error:', error);
        
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'SPOTIFY_AUTH_ERROR', 
            error: error.message 
          }, window.location.origin);
          window.close();
        } else {
          window.location.href = '/?error=' + encodeURIComponent(error.message);
        }
      }
    };

    handleCallback();
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-xl text-center">
        <LoadingSpinner />
        <h2 className="text-white text-xl font-bold mt-4 mb-2">
          Processing Authentication...
        </h2>
        <p className="text-gray-300">
          Please wait while we complete your login
        </p>
      </div>
    </div>
  );
};

export default CallbackPage;