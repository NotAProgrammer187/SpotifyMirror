import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useBarkada } from '../context/BarkadaContext';
import { Users, Music, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

const JoinSession = () => {
  const { sessionCode } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getAuthUrl } = useBarkada();
  const [status, setStatus] = useState('validating'); // validating, valid, invalid, joining, joined
  const [hostInfo, setHostInfo] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [error, setError] = useState(null);
  
  // Check if user just joined
  const hasJoined = searchParams.get('joined') === 'true';

  useEffect(() => {
    validateSessionCode();
  }, [sessionCode]);

  const validateSessionCode = async () => {
    try {
      console.log('🔍 Validating session code:', sessionCode);
      
      if (!sessionCode || sessionCode.length !== 6) {
        setStatus('invalid');
        setError('Invalid session code format');
        return;
      }
      
      // Call backend to get session info
      const response = await fetch(`/api/v1/sessions/${sessionCode}`);
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Found session:', data.session);
        setSessionInfo(data.session);
        setHostInfo({
          name: data.session.host.name,
          avatar: data.session.host.avatar
        });
        
        if (hasJoined) {
          setStatus('joined');
        } else {
          setStatus('valid');
        }
      } else {
        console.log('❌ Session not found:', data.error);
        setStatus('invalid');
        setError(data.message || 'Session not found or expired');
      }
      
    } catch (error) {
      console.error('❌ Session validation error:', error);
      setStatus('invalid');
      setError('Failed to validate session. Please check your connection.');
    }
  };

  const handleJoinSession = async () => {
    try {
      setStatus('joining');
      setError(null);
      
      // Set flags for callback to know this is a session join
      localStorage.setItem('barkada_joining_session', 'true');
      localStorage.setItem('barkada_session_code', sessionCode);
      
      const authUrl = await getAuthUrl();
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('Error joining session:', error);
      setError('Failed to start Spotify authentication');
      setStatus('valid');
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case 'validating':
        return {
          icon: <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto"></div>,
          title: 'Validating Session...',
          description: 'Checking if this session is still active',
          color: 'text-blue-400'
        };
      
      case 'joined':
        return {
          icon: <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />,
          title: 'Successfully Joined!',
          description: `You're now part of ${hostInfo?.name || 'the host'}'s barkada session`,
          color: 'text-green-400'
        };
      
      case 'valid':
        return {
          icon: <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />,
          title: 'Session Found!',
          description: `Ready to join ${hostInfo?.name || 'the host'}'s barkada session`,
          color: 'text-green-400'
        };
      
      case 'invalid':
        return {
          icon: <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />,
          title: 'Session Not Found',
          description: error || 'This session may have expired or the code is incorrect',
          color: 'text-red-400'
        };
      
      case 'joining':
        return {
          icon: <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto"></div>,
          title: 'Joining Session...',
          description: 'Redirecting to Spotify login',
          color: 'text-green-400'
        };
      
      default:
        return {
          icon: <Users className="w-16 h-16 text-gray-400 mx-auto" />,
          title: 'Unknown Status',
          description: 'Something went wrong',
          color: 'text-gray-400'
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl p-8 text-center border border-gray-700">
          {/* App Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Users className="w-8 h-8 text-purple-500" />
              <h1 className="text-3xl font-bold text-white">Barkada Session</h1>
            </div>
            <p className="text-gray-300">Join your friends' music session</p>
          </div>

          {/* Session Code Display */}
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-2">Session Code:</p>
            <div className="text-2xl font-bold text-white tracking-wider bg-gray-700 py-3 px-4 rounded-lg">
              {sessionCode}
            </div>
          </div>

          {/* Status Icon */}
          <div className="mb-6">
            {statusContent.icon}
          </div>

          {/* Status Message */}
          <div className="mb-8">
            <h2 className={`text-xl font-semibold mb-2 ${statusContent.color}`}>
              {statusContent.title}
            </h2>
            <p className="text-gray-300">{statusContent.description}</p>
          </div>

          {/* Host Info */}
          {status === 'valid' && hostInfo && (
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <p className="text-gray-400 text-sm mb-2">Hosted by:</p>
              <div className="flex items-center justify-center space-x-3">
                <img 
                  src={hostInfo.avatar || '/api/placeholder/40/40'} 
                  alt={hostInfo.name}
                  className="w-10 h-10 rounded-full"
                />
                <span className="text-white font-medium">{hostInfo.name}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {status === 'joined' && (
              <div className="space-y-3">
                <div className="bg-green-600 bg-opacity-20 border border-green-500 rounded-lg p-4">
                  <h4 className="text-green-200 font-medium mb-2">What's next?</h4>
                  <p className="text-green-300 text-sm">
                    You're now connected! The host can start the music analysis when everyone is ready.
                  </p>
                </div>
                
                {sessionInfo && sessionInfo.userCount >= 2 && (
                  <button
                    onClick={() => navigate(`/barkada?session=${sessionCode}`)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2"
                  >
                    <Music className="w-5 h-5" />
                    <span>View Session Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
            
            {status === 'valid' && (
              <button
                onClick={handleJoinSession}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Music className="w-5 h-5" />
                <span>Join with Spotify</span>
              </button>
            )}

            {status === 'invalid' && (
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/barkada')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Start Your Own Session
                </button>
                <button
                  onClick={validateSessionCode}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            <button
              onClick={() => navigate('/')}
              className="w-full text-gray-400 hover:text-white py-2 transition-colors"
            >
              ← Back to Home
            </button>
          </div>

          {/* Instructions */}
          {status === 'valid' && (
            <div className="mt-6 p-4 bg-blue-600 bg-opacity-20 rounded-lg border border-blue-500 border-opacity-30">
              <p className="text-blue-200 text-sm">
                <strong>What happens next:</strong><br />
                You'll log in with your Spotify account, then automatically join the group session to analyze everyone's music together!
              </p>
            </div>
          )}
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg text-xs text-gray-400">
            <p><strong>Debug Info:</strong></p>
            <p>Session Code: {sessionCode}</p>
            <p>Status: {status}</p>
            <p>Host: {hostInfo?.name || 'None'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinSession;
