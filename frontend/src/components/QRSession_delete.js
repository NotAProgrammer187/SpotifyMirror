import React, { useState } from 'react';
import { useBarkada } from '../context/BarkadaContext';
import { Users, QrCode, Copy, Smartphone, Wifi } from 'lucide-react';

const QRSession = () => {
  const { users, sessionId } = useBarkada();
  const [sessionCode] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());
  const [showQR, setShowQR] = useState(false);

  const generateQRCode = () => {
    const joinUrl = `${window.location.origin}/join/${sessionCode}`;
    setShowQR(true);
    
    // Store session data for this code
    const sessionData = {
      hostId: users[0]?.id || 'host',
      hostName: users[0]?.name || 'Host',
      users: users,
      createdAt: new Date().toISOString()
    };
    
    // In a real app, this would go to your backend
    localStorage.setItem(`session_${sessionCode}`, JSON.stringify(sessionData));
    
    return joinUrl;
  };

  const joinUrl = `${window.location.origin}/join/${sessionCode}`;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Barkada Session</h1>
        <p className="text-gray-300">Share your music taste with friends!</p>
      </div>

      {/* Current Members */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <Users className="w-6 h-6" />
          <span>Session Members ({users.length})</span>
        </h2>
        
        {users.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No members yet - start by adding yourself!</p>
        ) : (
          <div className="space-y-3">
            {users.map((user, index) => (
              <div key={user.id} className="flex items-center space-x-3 bg-gray-700 p-3 rounded-lg">
                <img src={user.avatar || '/api/placeholder/40/40'} className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-gray-400 text-sm">{index === 0 ? 'Host' : 'Friend'}</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session Sharing Options */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* QR Code Method */}
        <div className="bg-blue-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-bold mb-3 flex items-center space-x-2">
            <QrCode className="w-5 h-5" />
            <span>QR Code</span>
          </h3>
          <p className="text-sm opacity-90 mb-4">Friends scan to join from their phones</p>
          
          {!showQR ? (
            <button
              onClick={generateQRCode}
              className="w-full bg-white text-blue-600 py-2 rounded-lg font-medium hover:bg-gray-100"
            >
              Generate QR Code
            </button>
          ) : (
            <div className="text-center">
              {/* QR Code placeholder - in real app, use a QR code library */}
              <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-xs opacity-75">Friends scan this with their camera</p>
            </div>
          )}
        </div>

        {/* Link Sharing Method */}
        <div className="bg-green-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-bold mb-3 flex items-center space-x-2">
            <Smartphone className="w-5 h-5" />
            <span>Share Link</span>
          </h3>
          <p className="text-sm opacity-90 mb-4">Send link via text/WhatsApp</p>
          
          <div className="space-y-2">
            <div className="bg-white bg-opacity-20 p-2 rounded text-xs font-mono break-all">
              {joinUrl}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(joinUrl);
                alert('Link copied!');
              }}
              className="w-full bg-white text-green-600 py-2 rounded-lg font-medium hover:bg-gray-100 flex items-center justify-center space-x-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      </div>

      {/* Session Code */}
      <div className="bg-gray-800 rounded-xl p-6 text-center">
        <h3 className="text-lg font-bold text-white mb-3">Session Code</h3>
        <div className="text-3xl font-bold text-purple-400 tracking-wider mb-2">
          {sessionCode}
        </div>
        <p className="text-gray-400 text-sm">
          Friends can also go to the app and enter this code
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-3">How friends join:</h3>
        <div className="space-y-2 text-gray-300 text-sm">
          <p>📱 <strong>Method 1:</strong> Scan QR code with phone camera</p>
          <p>🔗 <strong>Method 2:</strong> Click the shared link</p>
          <p>🔢 <strong>Method 3:</strong> Go to app and enter code: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{sessionCode}</span></p>
        </div>
      </div>

      {/* Ready State */}
      {users.length >= 2 && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Ready to Analyze! 🎵</h3>
          <p className="mb-4">You have {users.length} friends connected</p>
          <button
            onClick={() => window.location.href = '/barkada?view=analytics'}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100"
          >
            Analyze Our Music!
          </button>
        </div>
      )}
    </div>
  );
};

export default QRSession;
