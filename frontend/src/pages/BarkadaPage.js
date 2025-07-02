import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBarkada } from '../context/BarkadaContext';
import BarkadaLogin from '../components/BarkadaLogin';
import BarkadaAnalytics from '../components/BarkadaAnalytics';
import SimpleSession from '../components/SimpleSession';
import QRCodeSession from '../components/QRCodeSession';
import DebugSession from '../components/DebugSession';
import MultiLoginBarkada from '../components/MultiLoginBarkada';
import { Users, Music, ArrowLeft, QrCode, Zap } from 'lucide-react';

const BarkadaPage = () => {
  const navigate = useNavigate();
  const { 
    users, 
    isSessionActive, 
    hasAnalysis, 
    endSession 
  } = useBarkada();
  
  const [currentView, setCurrentView] = useState('multi'); // Default to new multi-login
  const [useSimpleMode, setUseSimpleMode] = useState(false);

  // Auto-switch views based on session state
  useEffect(() => {
    if (isSessionActive && users.length >= 2) {
      setCurrentView('analytics');
    } else if (users.length >= 1) {
      setCurrentView(useSimpleMode ? 'simple' : 'multi');
    } else {
      setCurrentView(useSimpleMode ? 'simple' : 'multi');
    }
  }, [isSessionActive, users.length, useSimpleMode]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleEndSession = () => {
    endSession();
    setCurrentView('multi');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      {/* Navigation Header */}
      <div className="max-w-6xl mx-auto px-6 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>

          {isSessionActive && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Session Active</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentView('multi')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'multi' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Zap className="w-4 h-4 inline mr-2" />
                  Multi-Login
                </button>
                
                <button
                  onClick={() => setCurrentView('simple')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'simple' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Classic
                </button>
                
                <button
                  onClick={() => setCurrentView('qr')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'qr' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <QrCode className="w-4 h-4 inline mr-2" />
                  QR Code
                </button>
                
                <button
                  onClick={() => setCurrentView('analytics')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'analytics' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Music className="w-4 h-4 inline mr-2" />
                  Analytics
                </button>
                
                <button
                  onClick={() => setCurrentView('debug')}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'debug' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  🐛
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {currentView === 'multi' && <MultiLoginBarkada />}
        {currentView === 'debug' && <DebugSession />}
        {currentView === 'qr' && <QRCodeSession />}
        {currentView === 'simple' && <SimpleSession />}
        {currentView === 'login' && <BarkadaLogin />}
        {currentView === 'analytics' && <BarkadaAnalytics />}
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-6 mt-12">
        <div className="text-center text-gray-400 border-t border-gray-700 pt-6">
          <p className="text-sm">
            🎵 Barkada Music Session - Discover your group's musical chemistry together!
          </p>
          <p className="text-xs mt-2 opacity-75">
            Data is processed securely and not stored permanently
          </p>
        </div>
      </div>
    </div>
  );
};

export default BarkadaPage;
