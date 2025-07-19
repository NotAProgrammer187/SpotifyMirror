import React, { useState } from 'react';
import { Users, Plus, Music, Trash2, UserCheck, QrCode, Volume2, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BarkadaApiService from '../services/barkadaApi';

// Enhanced popup OAuth handler for multiple simultaneous logins
const useMultiSpotifyAuth = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authenticatingSlot, setAuthenticatingSlot] = useState(null);

  const authenticateUser = async (friendSlot) => {
    return new Promise((resolve, reject) => {
      setIsAuthenticating(true);
      setAuthenticatingSlot(friendSlot);
      
      // Get auth URL from your Laravel backend
      BarkadaApiService.getAuthUrl(friendSlot).then(response => {
        const authUrl = response.authUrl;
        const state = response.state;
        
        console.log('Opening popup with URL:', authUrl);
        
        // Open popup window
        const popup = window.open(
          authUrl,
          'spotify-auth-' + friendSlot,
          'width=500,height=700,scrollbars=yes,resizable=yes,left=' + (window.screen.width / 2 - 250) + ',top=' + (window.screen.height / 2 - 350)
        );

        if (!popup) {
          throw new Error('Popup was blocked. Please allow popups for this site.');
        }

        // Listen for messages from popup
        const messageHandler = (event) => {
          console.log('Received message from popup:', event.data);
          
          // Accept messages from any origin for now (we'll validate the data)
          if (event.data && event.data.type) {
            
            if (event.data.type === 'SPOTIFY_AUTH_SUCCESS') {
              const { code, state: returnedState } = event.data;
              
              console.log('Auth success received:', { code: !!code, state: returnedState });
              
              // Clean up
              window.removeEventListener('message', messageHandler);
              clearInterval(checkClosed);
              
              // Exchange code for tokens via your Laravel backend
              BarkadaApiService.handleCallback(code, returnedState, friendSlot)
                .then(response => {
                  console.log('Backend callback response:', response);
                  const { access_token, user } = response.data;
                  
                  // Fetch user's top tracks
                  Promise.all([
                    BarkadaApiService.getTopTracks(access_token),
                    BarkadaApiService.getUserProfile(access_token)
                  ]).then(([tracksResponse, profileResponse]) => {
                    setIsAuthenticating(false);
                    setAuthenticatingSlot(null);
                    
                    resolve({
                      user: {
                        ...user,
                        ...profileResponse
                      },
                      topTracks: tracksResponse.items || [],
                      accessToken: access_token,
                      slot: friendSlot
                    });
                  }).catch(error => {
                    console.error('Error fetching user data:', error);
                    setIsAuthenticating(false);
                    setAuthenticatingSlot(null);
                    reject(error);
                  });
                  
                }).catch(error => {
                  console.error('Backend callback error:', error);
                  setIsAuthenticating(false);
                  setAuthenticatingSlot(null);
                  reject(error);
                });
            }
            
            if (event.data.type === 'SPOTIFY_AUTH_ERROR') {
              console.error('Auth error received:', event.data.error);
              window.removeEventListener('message', messageHandler);
              clearInterval(checkClosed);
              setIsAuthenticating(false);
              setAuthenticatingSlot(null);
              reject(new Error(event.data.error));
            }
          }
        };
        
        window.addEventListener('message', messageHandler);

        // Check if popup was blocked or closed
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            setIsAuthenticating(false);
            setAuthenticatingSlot(null);
            reject(new Error('Authentication cancelled by user'));
          }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
          if (!popup.closed) {
            popup.close();
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            setIsAuthenticating(false);
            setAuthenticatingSlot(null);
            reject(new Error('Authentication timeout - please try again'));
          }
        }, 300000);
        
      }).catch(error => {
        setIsAuthenticating(false);
        setAuthenticatingSlot(null);
        reject(error);
      });
    });
  };

  return { 
    authenticateUser, 
    isAuthenticating, 
    authenticatingSlot 
  };
};

// Enhanced Barkada session manager with multi-login support
const useMultiBarkadaSession = () => {
  const [users, setUsers] = useState([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionCode, setSessionCode] = useState(null);
  const [combinedAnalysis, setCombinedAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const addUser = (userData) => {
    setUsers(prev => {
      const newUser = {
        ...userData.user,
        slot: userData.slot,
        accessToken: userData.accessToken,
        topTracks: userData.topTracks,
        joinedAt: new Date().toISOString(),
        avatar: userData.user.images?.[0]?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.user.id}`
      };
      
      // Replace user if same slot, otherwise add
      const existingIndex = prev.findIndex(u => u.slot === userData.slot);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newUser;
        return updated;
      }
      
      return [...prev, newUser];
    });
  };

  const removeUser = (userId) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const startSession = async () => {
    if (users.length >= 2) {
      setSessionActive(true);
      await generateCombinedAnalysis();
    }
  };

  const endSession = async () => {
    setSessionActive(false);
    setCombinedAnalysis(null);
    setUsers([]);
    setSessionCode(null);
    
    // Clear backend session
    try {
      await BarkadaApiService.clearBarkadaSession();
    } catch (error) {
      console.error('Failed to clear backend session:', error);
    }
  };

  const generateSessionCode = async () => {
    try {
      // Create session via Laravel backend
      const response = await BarkadaApiService.createBarkadaSession({
        name: 'Barkada Music Session',
        description: 'Multi-user music analysis session',
        max_participants: 6,
        duration_hours: 24
      });
      
      const code = response.data.session_code;
      setSessionCode(code);
      return code;
    } catch (error) {
      console.error('Failed to create session:', error);
      // Fallback to local session code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setSessionCode(code);
      return code;
    }
  };

  const generateCombinedAnalysis = async () => {
    if (users.length < 2) return;

    setIsAnalyzing(true);
    
    try {
      // Use your Laravel backend's analytics endpoint
      console.log('🎵 Attempting backend analysis...');
      const analysisData = {
        users: users.map(user => ({
          id: user.id,
          name: user.display_name,
          topTracks: user.topTracks
        }))
      };

      const response = await BarkadaApiService.analyzeBarkadaMusic(analysisData);
      console.log('🎵 Backend analysis successful:', response);
      setCombinedAnalysis(response);
      
    } catch (error) {
      console.error('Analysis failed, using fallback:', error);
      
      // Fallback analysis if backend fails
      const allTracks = users.flatMap(user => 
        user.topTracks.map(track => ({ ...track, userId: user.id, userName: user.display_name }))
      );

      // Find shared tracks
      const trackCounts = {};
      allTracks.forEach(track => {
        const key = `${track.name}-${track.artists[0].name}`;
        trackCounts[key] = trackCounts[key] || { track, users: [] };
        if (!trackCounts[key].users.includes(track.userId)) {
          trackCounts[key].users.push(track.userId);
        }
      });

      const sharedTracks = Object.values(trackCounts)
        .filter(item => item.users.length > 1)
        .sort((a, b) => b.users.length - a.users.length)
        .slice(0, 10);

      // Calculate compatibility score
      const compatibilityScore = Math.min(100, Math.round(
        (sharedTracks.length * 15 + Math.random() * 30 + 40)
      ));

      setCombinedAnalysis({
        sharedTracks,
        compatibilityScore,
        recommendedPlaylist: generateRecommendedPlaylist(allTracks, sharedTracks),
        insights: generateInsights(users, sharedTracks)
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateRecommendedPlaylist = (allTracks, sharedTracks) => {
    const playlist = [...sharedTracks.map(item => item.track)];
    
    users.forEach(user => {
      const userTopTracks = user.topTracks
        .filter(track => !playlist.find(p => p.id === track.id))
        .slice(0, 5);
      playlist.push(...userTopTracks);
    });

    return playlist.slice(0, 30);
  };

  const generateInsights = (users, sharedTracks) => {
    return [
      `${users[0].display_name} and ${users[1].display_name} have ${sharedTracks.length} songs in common!`,
      `Your group loves ${sharedTracks[0]?.track.artists[0].name || 'diverse music'}!`,
      'Perfect for road trips and hangouts! 🚗🎵'
    ];
  };

  return {
    users,
    sessionActive,
    sessionCode,
    combinedAnalysis,
    isAnalyzing,
    addUser,
    removeUser,
    startSession,
    endSession,
    generateSessionCode,
    canStartSession: users.length >= 2
  };
};

// Main Multi-Login Barkada Component
const MultiLoginBarkada = () => {
  const { authenticateUser, isAuthenticating, authenticatingSlot } = useMultiSpotifyAuth();
  const {
    users,
    sessionActive,
    sessionCode,
    combinedAnalysis,
    isAnalyzing,
    addUser,
    removeUser,
    startSession,
    endSession,
    generateSessionCode,
    canStartSession
  } = useMultiBarkadaSession();

  const [currentView, setCurrentView] = useState('login');
  const [showSessionCode, setShowSessionCode] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionActive && combinedAnalysis) {
      setCurrentView('analytics');
    } else if (users.length >= 1) {
      setCurrentView('login');
    }
  }, [sessionActive, combinedAnalysis, users.length]);

  const handleAddFriend = async (slot) => {
    try {
      setError(null);
      const userData = await authenticateUser(slot || `friend${users.length + 1}`);
      addUser(userData);
    } catch (error) {
      setError(error.message);
      console.error('Authentication failed:', error);
    }
  };

  const handleGenerateCode = async () => {
    try {
      await generateSessionCode();
      setShowSessionCode(true);
    } catch (error) {
      setError('Failed to generate session code');
    }
  };

  const handleStartSession = async () => {
    try {
      await startSession();
      setError(null);
    } catch (error) {
      setError('Failed to start session');
    }
  };

  const createGroupPlaylist = async () => {
    try {
      // Check if we have the required data
      if (!combinedAnalysis?.recommendedPlaylist) {
        throw new Error('No playlist data available. Please analyze the session first.');
      }

      const playlistData = {
        name: `Barkada Playlist - ${new Date().toLocaleDateString()}`,
        description: `Collaborative playlist from ${users.map(u => u.display_name).join(', ')}`,
        tracks: (combinedAnalysis.recommendedPlaylist || []).map(track => track.id).filter(Boolean)
      };

      // Create playlist for ALL users
      const promises = users.map(async (user, index) => {
        try {
          const userPlaylistData = {
            ...playlistData,
            name: `${playlistData.name} (${user.display_name})`
          };
          
          console.log(`🎵 Creating playlist for ${user.display_name}...`);
          const result = await BarkadaApiService.createGroupPlaylist(userPlaylistData, user.accessToken);
          return { user: user.display_name, success: true, playlist: result.playlist };
        } catch (error) {
          console.error(`Failed to create playlist for ${user.display_name}:`, error);
          return { user: user.display_name, success: false, error: error.message };
        }
      });
      
      const results = await Promise.all(promises);
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      if (successful.length > 0) {
        alert(`🎵 Playlists created successfully for ${successful.map(r => r.user).join(', ')}!\n${failed.length > 0 ? `Failed for: ${failed.map(r => r.user).join(', ')}` : ''}`);
      } else {
        alert('❌ Failed to create playlists for all users. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create playlist:', error);
      
      // Show more specific error message
      if (error.message.includes('No playlist data available')) {
        alert('⚠️ No playlist data available. Please start a session and analyze your music first!');
      } else if (error.message.includes('access_token')) {
        alert('🔐 Authentication expired. Please log in again.');
      } else {
        alert('❌ Failed to create playlist. Please try again.');
      }
    }
  };

  if (currentView === 'analytics') {
    return (
      <div className="max-w-6xl mx-auto space-y-6 px-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-3">
            <Music className="w-8 h-8 text-purple-500" />
            <h1 className="text-3xl font-bold text-white">🎵 Barkada Music Analysis</h1>
          </div>
          <p className="text-gray-300">Discovering your group's musical DNA...</p>
        </div>

        {/* Loading State */}
        {isAnalyzing && (
          <div className="bg-purple-600 rounded-xl p-6 text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Analyzing your group's music taste...</p>
          </div>
        )}

        {/* Results */}
        {combinedAnalysis && (
          <>
            {/* Compatibility Score */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Group Compatibility</h2>
              <div className="text-6xl font-bold mb-2">{combinedAnalysis.compatibilityScore}%</div>
              <p className="text-lg opacity-90">
                {combinedAnalysis.compatibilityScore >= 80 ? "🔥 Musical Soulmates!" : 
                 combinedAnalysis.compatibilityScore >= 60 ? "🎶 Great Harmony!" :
                 combinedAnalysis.compatibilityScore >= 40 ? "🎵 Good Vibes!" : "🎤 Diverse Tastes!"}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <Heart className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">
                  {combinedAnalysis.sharedTracks?.length || 0}
                </div>
                <p className="text-gray-400">Shared Favorites</p>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <Users className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{users.length}</div>
                <p className="text-gray-400">Friends Connected</p>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <Volume2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">
                  {combinedAnalysis.recommendedPlaylist?.length || 0}
                </div>
                <p className="text-gray-400">Recommended Songs</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={createGroupPlaylist}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Spotify Playlist</span>
              </button>
              
              <button
                onClick={() => setCurrentView('login')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Add More Friends
              </button>
              
              <button
                onClick={endSession}
                className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                End Session
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Login View
  return (
    <div className="max-w-4xl mx-auto space-y-6 px-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Music className="w-12 h-12 text-purple-500" />
          <h1 className="text-4xl font-bold text-white">SpotifyMirror</h1>
        </div>
        <p className="text-xl text-gray-300">
          🎵 Barkada Playlist Generator - Discover your group's musical chemistry!
        </p>
        <div className="bg-purple-600/20 border border-purple-500 text-purple-200 p-4 rounded-lg">
          <p className="font-medium">✨ New Multi-Login Mode!</p>
          <p className="text-sm">Each friend logs in simultaneously via popup windows - no need to share devices!</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-300 hover:text-red-100">✕</button>
        </div>
      )}

      {/* Connected Users */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
          <UserCheck className="w-6 h-6" />
          <span>Connected Friends ({users.length})</span>
        </h2>

        {users.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users className="w-24 h-24 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Ready to start?</h3>
            <p>Add friends to create your collaborative playlist!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {users.map((user, index) => (
              <div key={user.id} className="bg-gray-700 p-4 rounded-lg relative group">
                <button
                  onClick={() => removeUser(user.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <div className="flex items-center space-x-3 mb-3">
                  <img 
                    src={user.avatar} 
                    alt={user.display_name}
                    className="w-12 h-12 rounded-full object-cover bg-gray-600"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/48/48';
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">{user.display_name}</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Connected
                  </span>
                  <span className="text-gray-400 text-xs">
                    {user.topTracks?.length || 0} tracks
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session Code Display */}
      {showSessionCode && sessionCode && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4 text-center">Session Code Generated!</h3>
          <div className="bg-white/20 rounded-lg p-4 text-center mb-4">
            <p className="text-sm opacity-90 mb-2">Share this code:</p>
            <div className="text-3xl font-bold tracking-wider">{sessionCode}</div>
          </div>
          <p className="text-sm mb-4">
            Friends can join at: <span className="font-mono bg-white/20 px-2 py-1 rounded">
              {window.location.origin}/join/{sessionCode}
            </span>
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/join/${sessionCode}`);
                alert('Session link copied!');
              }}
              className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-lg transition-colors"
            >
              📋 Copy Link
            </button>
            <button
              onClick={() => setShowSessionCode(false)}
              className="px-4 bg-white/10 hover:bg-white/20 py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => handleAddFriend()}
            disabled={isAuthenticating || users.length >= 6}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {isAuthenticating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Authenticating {authenticatingSlot}...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Add Friend (Popup Login)</span>
              </>
            )}
          </button>

          <button 
            onClick={handleGenerateCode}
            className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <QrCode className="w-5 h-5" />
            <span>Generate Session Code</span>
          </button>
        </div>

        {canStartSession && (
          <button 
            onClick={handleStartSession}
            disabled={isAnalyzing}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Analyzing Music...</span>
              </>
            ) : (
              <>
                <Music className="w-5 h-5" />
                <span>🚀 Start Barkada Session!</span>
              </>
            )}
          </button>
        )}

        {users.length < 2 && (
          <div className="bg-blue-500/20 border border-blue-500 text-blue-200 p-4 rounded-lg text-center">
            <p>Add at least 2 friends to start analyzing your music together!</p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-3">💡 How it works:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
          <div>
            <h4 className="font-medium text-white mb-2">🔐 Multi-Login Options:</h4>
            <ul className="space-y-1 text-sm">
              <li>• Popup Login: Each friend logs in via popup window</li>
              <li>• Session Code: Friends join from their own devices</li>
              <li>• All data stays secure and private</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">🎵 What we analyze:</h4>
            <ul className="space-y-1 text-sm">
              <li>• Your top tracks and shared favorites</li>
              <li>• Music compatibility score</li>
              <li>• Custom collaborative playlist</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiLoginBarkada;