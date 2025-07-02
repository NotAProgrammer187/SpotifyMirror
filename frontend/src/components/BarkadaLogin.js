import React, { useState, useEffect } from 'react';
import { useBarkada } from '../context/BarkadaContext';
import { Users, Plus, Music, Trash2, Play, UserCheck } from 'lucide-react';

const BarkadaLogin = () => {
  const { 
    users, 
    addUser, 
    removeUser, 
    startSession, 
    endSession, 
    getAuthUrl, 
    isSessionActive, 
    canStartSession 
  } = useBarkada();
  
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [error, setError] = useState(null);
  const [showSessionCode, setShowSessionCode] = useState(false);
  const [sessionCode, setSessionCode] = useState(null);

  const handleAddFriend = async () => {
    // Show options for adding friend
    const addMethod = window.confirm(
      "How would you like to add a friend?\n\n" +
      "OK = Pass this device to your friend (they log in here)\n" +
      "Cancel = Generate session code (they join from their device)"
    );
    
    if (addMethod) {
      // Same device method
      const confirmed = window.confirm(
        "Ready to add a friend?\n\n" +
        "1. Hand this device to your friend\n" +
        "2. They will log in with THEIR Spotify account\n" +
        "3. Device will return to this session\n\n" +
        "Click OK when your friend is ready to log in!"
      );
      
      if (confirmed) {
        try {
          setIsAddingFriend(true);
          setError(null);
          
          const authUrl = await getAuthUrl();
          
          // Store that we're adding to barkada session
          localStorage.setItem('barkada_adding_friend', 'true');
          
          // Redirect to Spotify auth
          window.location.href = authUrl;
          
        } catch (error) {
          console.error('Error adding friend:', error);
          setError('Failed to get Spotify authorization URL');
          setIsAddingFriend(false);
        }
      }
    } else {
      // Session code method
      generateSessionCode();
    }
  };
  
  const generateSessionCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setSessionCode(code);
    setShowSessionCode(true);
    
    // Create session data
    const sessionData = {
      code: code,
      hostUser: users[0] || { name: 'Host', id: 'host' },
      createdAt: new Date().toISOString(),
      users: users,
      status: 'active'
    };
    
    // Store locally for the host
    localStorage.setItem(`barkada_session_${code}`, JSON.stringify(sessionData));
    localStorage.setItem('barkada_session_code', code);
    
    // Also store globally accessible version (this is a workaround)
    // In a real app, this would be sent to your backend
    window.GLOBAL_BARKADA_SESSIONS = window.GLOBAL_BARKADA_SESSIONS || {};
    window.GLOBAL_BARKADA_SESSIONS[code] = sessionData;
    
    console.log('📱 Generated session:', code, 'with data:', sessionData);
    console.log('🌍 Global sessions:', window.GLOBAL_BARKADA_SESSIONS);
  };

  const handleStartSession = () => {
    try {
      startSession();
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRemoveUser = (userId) => {
    removeUser(userId);
  };

  const handleEndSession = () => {
    endSession();
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Users className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl font-bold text-white">Barkada Music Session</h1>
        </div>
        <p className="text-gray-300 text-lg">
          Add your friends and discover your group's music taste together!
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Session Status */}
      {isSessionActive && (
        <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span className="font-medium">Session Active with {users.length} friends</span>
            </div>
            <button
              onClick={handleEndSession}
              className="text-red-300 hover:text-red-100 underline"
            >
              End Session
            </button>
          </div>
        </div>
      )}

      {/* Current Users */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <UserCheck className="w-6 h-6" />
            <span>Connected Friends ({users.length})</span>
          </h2>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No friends connected yet</p>
            <p className="text-sm">Add friends to start your barkada session!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user, index) => (
              <div key={user.id} className="bg-gray-700 p-4 rounded-lg relative group">
                {/* Remove button */}
                {!isSessionActive && (
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover bg-gray-600"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/48/48';
                      }}
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-700"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{user.name}</p>
                    <p className="text-gray-400 text-sm">
                      {user.country && `${user.country} • `}
                      Joined {new Date(user.joinedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center space-x-2">
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Connected
                  </span>
                  {index === 0 && (
                    <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                      Host
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session Code Display */}
      {showSessionCode && (
        <div className="bg-blue-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4 text-center">Session Code Generated!</h3>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center mb-4">
            <p className="text-sm opacity-90 mb-2">Share this code with your friends:</p>
            <div className="text-3xl font-bold tracking-wider">{sessionCode}</div>
          </div>
          <div className="text-sm space-y-2">
            <p><strong>How friends can join:</strong></p>
            <p>1. Go to: <span className="bg-white bg-opacity-20 px-2 py-1 rounded">{window.location.origin}/join/{sessionCode}</span></p>
            <p>2. Log in with their Spotify account</p>
            <p>3. They'll automatically join your session!</p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/join/${sessionCode}`);
              alert('Session link copied to clipboard!');
            }}
            className="w-full mt-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 rounded-lg transition-colors"
          >
            📋 Copy Session Link
          </button>
          <button
            onClick={() => {
              setShowSessionCode(false);
              setSessionCode(null);
            }}
            className="w-full mt-2 text-white opacity-75 hover:opacity-100 py-2 transition-opacity"
          >
            Close
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-4">
        {/* Add Friend Button */}
        {users.length < 6 && !isSessionActive && (
          <button 
            onClick={handleAddFriend}
            disabled={isAddingFriend}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {isAddingFriend ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Getting Spotify Login...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Add Friend to Session</span>
              </>
            )}
          </button>
        )}

        {/* Start Session Button */}
        {canStartSession && !isSessionActive && (
          <button 
            onClick={handleStartSession}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Music className="w-5 h-5" />
            <span>Start Barkada Session! 🎵</span>
          </button>
        )}

        {/* Session Limit Message */}
        {users.length >= 6 && (
          <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 text-yellow-200 p-4 rounded-lg text-center">
            <p>Maximum 6 friends per session reached!</p>
            <p className="text-sm opacity-75">Remove someone to add more friends</p>
          </div>
        )}

        {/* Not Enough Friends Message */}
        {users.length === 1 && (
          <div className="bg-blue-500 bg-opacity-20 border border-blue-500 text-blue-200 p-4 rounded-lg text-center">
            <p>Add at least one more friend to start analyzing your music together!</p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-3">💡 Tips for the best experience:</h3>
        <ul className="space-y-2 text-gray-300">
          <li>• Make sure everyone has used Spotify for a while (for better data)</li>
          <li>• Each friend logs in on the same device</li>
          <li>• Works best with 2-4 friends for detailed analysis</li>
          <li>• We'll find your shared favorites and compatibility score!</li>
        </ul>
      </div>
    </div>
  );
};

export default BarkadaLogin;
