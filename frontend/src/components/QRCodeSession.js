import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, QrCode, Copy, Smartphone, RefreshCw, Music, Share2 } from 'lucide-react';

const QRCodeSession = () => {
  const { accessToken, user } = useAuth();
  const [sessionData, setSessionData] = useState(null);
  const [users, setUsers] = useState([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(false);

  // Create session when component mounts
  useEffect(() => {
    if (accessToken && !sessionData) {
      createSession();
    }
  }, [accessToken]);

  // Poll for new users every 3 seconds
  useEffect(() => {
    let interval;
    if (sessionData && polling) {
      interval = setInterval(() => {
        checkForNewUsers();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionData, polling]);

  const createSession = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎵 Creating QR session with token:', accessToken ? 'Present' : 'Missing');
      
      const response = await fetch('/api/v1/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accessToken: accessToken
        })
      });
      
      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📊 Response data:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create session');
      }
      
      setSessionData(data);
      setUsers([{ 
        id: data.host.id, 
        name: data.host.name, 
        avatar: data.host.avatar, 
        isHost: true,
        joinedAt: new Date().toISOString()
      }]);
      
      // Generate simple QR code using a more reliable service
      const qrUrl = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(data.joinUrl)}`;
      setQrCodeUrl(qrUrl);
      
      console.log('🎯 QR URL generated:', qrUrl);
      
      // Start polling for new users
      setPolling(true);
      
      console.log('✅ Session created:', data.sessionId);
      
    } catch (error) {
      console.error('❌ Create session error:', error);
      setError(`Failed to create session: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewUsers = async () => {
    if (!sessionData) return;
    
    try {
      const response = await fetch(`/api/v1/sessions/${sessionData.sessionId}`);
      const data = await response.json();
      
      if (data.success && data.session.users.length !== users.length) {
        setUsers(data.session.users);
        console.log(`👥 Users updated: ${data.session.users.length} total`);
      }
      
    } catch (error) {
      console.error('❌ Check users error:', error);
    }
  };

  const copyJoinUrl = () => {
    if (sessionData) {
      navigator.clipboard.writeText(sessionData.joinUrl);
      // Show success message
      const button = document.getElementById('copy-button');
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    }
  };

  const shareSession = () => {
    if (!sessionData) return;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join my Barkada Music Session!',
        text: `Hey! Join my music session and let's discover our musical compatibility together 🎵`,
        url: sessionData.joinUrl
      });
    } else {
      copyJoinUrl();
    }
  };

  const startAnalysis = async () => {
    if (!sessionData || users.length < 2) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/v1/sessions/${sessionData.sessionId}/analyze`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Redirect to analysis results
        window.location.href = `/barkada?analysis=${sessionData.sessionId}`;
      } else {
        throw new Error(data.message || 'Analysis failed');
      }
      
    } catch (error) {
      console.error('❌ Analysis error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!accessToken) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-yellow-600 rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold mb-2">Login Required</h2>
          <p>Please log in with Spotify first to create a barkada session.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Debug Info */}
      <div className="bg-yellow-600 bg-opacity-20 border border-yellow-500 text-yellow-200 p-4 rounded-lg">
        <h3 className="font-bold mb-2">🐛 Debug Info:</h3>
        <ul className="text-sm space-y-1">
          <li>Access Token: {accessToken ? '✅ Available' : '❌ Missing'}</li>
          <li>User: {user?.display_name || '❌ Not logged in'}</li>
          <li>Session Data: {sessionData ? '✅ Available' : '❌ Missing'}</li>
          <li>Loading: {loading ? '🔄 Yes' : '✅ No'}</li>
          <li>Error: {error || '✅ None'}</li>
          <li>QR URL: {qrCodeUrl ? '✅ Generated' : '❌ Missing'}</li>
        </ul>
      </div>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">QR Code Barkada Session</h1>
        <p className="text-gray-300">Friends scan the QR code to join from their phones!</p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-blue-600 rounded-xl p-6 text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p>Creating your session...</p>
        </div>
      )}

      {/* Session Created */}
      {sessionData && (
        <>
          {/* QR Code & Session Info */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* QR Code */}
            <div className="bg-white rounded-xl p-6 text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-center space-x-2">
                <QrCode className="w-5 h-5" />
                <span>Scan to Join</span>
              </h3>
              
              {qrCodeUrl ? (
                <div className="space-y-4">
                  <img 
                    src={qrCodeUrl} 
                    alt="Session QR Code" 
                    className="mx-auto w-48 h-48" 
                    onLoad={() => console.log('✅ QR code image loaded successfully')}
                    onError={(e) => {
                      console.error('❌ QR code image failed to load:', e);
                      console.error('❌ QR URL was:', qrCodeUrl);
                    }}
                  />
                  <p className="text-sm text-gray-600">Friends can scan this with their phone camera</p>
                  
                  {/* Debug info */}
                  <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
                    <p>Debug: QR URL = {qrCodeUrl}</p>
                    <a href={qrCodeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      Test QR URL in new tab
                    </a>
                  </div>
                </div>
              ) : (
                <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center mx-auto">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Session Details */}
            <div className="bg-gray-800 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                <Smartphone className="w-5 h-5" />
                <span>Session Details</span>
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400">Session Code:</label>
                  <div className="text-2xl font-bold tracking-wider">{sessionData.sessionId}</div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Join Link:</label>
                  <div className="bg-gray-700 p-2 rounded text-xs font-mono break-all">
                    {sessionData.joinUrl}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    id="copy-button"
                    onClick={copyJoinUrl}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </button>
                  
                  <button
                    onClick={shareSession}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Connected Users */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Users className="w-6 h-6" />
                <span>Connected Friends ({users.length})</span>
              </h3>
              
              <button
                onClick={checkForNewUsers}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"
                title="Refresh users"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {users.length === 1 ? (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Waiting for friends to join...</p>
                <p className="text-sm">Share the QR code or link above!</p>
                {polling && (
                  <div className="flex items-center justify-center space-x-2 mt-4 text-blue-400">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Listening for new friends...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((user, index) => (
                  <div key={user.id} className="bg-gray-700 p-4 rounded-lg flex items-center space-x-3">
                    <img 
                      src={user.avatar || '/api/placeholder/48/48'} 
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-gray-400 text-sm">
                        {user.isHost ? 'Host' : 'Friend'} • 
                        {user.joinedAt && `Joined ${new Date(user.joinedAt).toLocaleTimeString()}`}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Analysis Button */}
          {users.length >= 2 && (
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white text-center">
              <Music className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Ready to Analyze! 🎵</h3>
              <p className="text-lg opacity-90 mb-6">
                You have {users.length} friends connected. Let's discover your musical chemistry!
              </p>
              <button
                onClick={startAnalysis}
                disabled={loading}
                className="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Analyzing...' : '🎵 Analyze Our Music!'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Instructions */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-3">📱 How friends join:</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-700 p-4 rounded-lg">
            <QrCode className="w-8 h-8 text-blue-400 mb-2" />
            <h4 className="font-medium text-white mb-1">Method 1: QR Code</h4>
            <p className="text-gray-300">Open phone camera and scan the QR code above</p>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <Smartphone className="w-8 h-8 text-green-400 mb-2" />
            <h4 className="font-medium text-white mb-1">Method 2: Share Link</h4>
            <p className="text-gray-300">Send the link via text, WhatsApp, or social media</p>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <Users className="w-8 h-8 text-purple-400 mb-2" />
            <h4 className="font-medium text-white mb-1">Method 3: Session Code</h4>
            <p className="text-gray-300">Go to the app and enter code: {sessionData?.sessionId}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeSession;
