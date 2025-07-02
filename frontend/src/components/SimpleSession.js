import React, { useState } from 'react';
import { useBarkada } from '../context/BarkadaContext';
import { Users, Plus, Music, ArrowRight } from 'lucide-react';

const SimpleSession = () => {
  const { users, addUser, getAuthUrl } = useBarkada();
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [step, setStep] = useState(1); // 1: explain, 2: adding

  const handleAddFriend = async () => {
    try {
      setIsAddingFriend(true);
      
      // Simple same-device approach
      const authUrl = await getAuthUrl();
      localStorage.setItem('barkada_adding_friend', 'true');
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('Error adding friend:', error);
      setIsAddingFriend(false);
    }
  };

  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white mb-6">
          <Users className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Barkada Music Session</h1>
          <p className="text-lg opacity-90">
            Ready to discover your group's musical chemistry?
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">How it works:</h2>
          <div className="space-y-3 text-left">
            <div className="flex items-start space-x-3">
              <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
              <p className="text-gray-300">You (the host) are already logged in</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
              <p className="text-gray-300">Hand your device to each friend</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
              <p className="text-gray-300">They log in with <strong>their own</strong> Spotify account</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
              <p className="text-gray-300">Analyze everyone's music together!</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setStep(2)}
          className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg font-medium flex items-center space-x-2 mx-auto"
        >
          <span>Let's Start!</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Current Users */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <Users className="w-6 h-6" />
          <span>Session Members ({users.length})</span>
        </h2>

        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No one connected yet</p>
            <p className="text-sm">Add yourself first, then your friends!</p>
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
                    {index === 0 ? 'Host' : 'Friend'} • {user.country || 'Unknown'}
                  </p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Friend Section */}
      {users.length < 6 && (
        <div className="bg-blue-600 rounded-xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-4">
            {users.length === 0 ? 'Add Yourself First' : 'Add Another Friend'}
          </h3>
          <p className="mb-6 opacity-90">
            {users.length === 0 
              ? 'Log in with your Spotify account to start the session'
              : 'Hand this device to your friend so they can log in with their Spotify account'
            }
          </p>
          <button
            onClick={handleAddFriend}
            disabled={isAddingFriend}
            className="bg-white text-blue-600 hover:bg-gray-100 disabled:bg-gray-300 py-3 px-6 rounded-lg font-medium flex items-center space-x-2 mx-auto"
          >
            {isAddingFriend ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span>Opening Spotify...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>{users.length === 0 ? 'Connect My Spotify' : 'Add Friend'}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Ready to Analyze */}
      {users.length >= 2 && (
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white text-center">
          <Music className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">Ready to Analyze!</h3>
          <p className="text-lg opacity-90 mb-6">
            You have {users.length} friends connected. Let's discover your musical chemistry!
          </p>
          <button
            onClick={() => window.location.href = '/barkada'}
            className="bg-white text-green-600 hover:bg-gray-100 py-3 px-8 rounded-lg font-bold text-lg"
          >
            🎵 Analyze Our Music!
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-3">💡 Quick Tips:</h3>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li>• Each person logs in with their own Spotify account on this device</li>
          <li>• Make sure everyone has used Spotify recently for better results</li>
          <li>• Works best with 2-4 friends</li>
          <li>• You'll see shared favorites, compatibility scores, and more!</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleSession;
