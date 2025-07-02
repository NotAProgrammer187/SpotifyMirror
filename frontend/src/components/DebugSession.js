import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const DebugSession = () => {
  const { accessToken, user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [sessionData, setSessionData] = useState(null);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`${timestamp} - ${message}`);
  };

  const testSessionAPI = async () => {
    try {
      addLog('🔍 Testing session API...', 'info');
      addLog(`Access token available: ${!!accessToken}`, 'info');
      
      if (!accessToken) {
        addLog('❌ No access token available', 'error');
        return;
      }

      addLog('📡 Making API call to /api/v1/sessions/create', 'info');
      
      const response = await fetch('/api/v1/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accessToken: accessToken
        })
      });

      addLog(`📊 Response status: ${response.status}`, response.ok ? 'success' : 'error');
      
      const data = await response.json();
      addLog(`📄 Response data: ${JSON.stringify(data, null, 2)}`, 'info');
      
      if (data.success) {
        setSessionData(data);
        addLog('✅ Session created successfully!', 'success');
      } else {
        addLog(`❌ Session creation failed: ${data.message}`, 'error');
      }

    } catch (error) {
      addLog(`💥 Error: ${error.message}`, 'error');
    }
  };

  const testHealthAPI = async () => {
    try {
      addLog('🔍 Testing health endpoint...', 'info');
      
      const response = await fetch('/health');
      const data = await response.json();
      
      addLog(`💚 Health check: ${data.status}`, 'success');
    } catch (error) {
      addLog(`💥 Health check failed: ${error.message}`, 'error');
    }
  };

  useEffect(() => {
    addLog('🚀 Debug component loaded', 'info');
    addLog(`User logged in: ${!!user}`, 'info');
    addLog(`User name: ${user?.display_name || 'N/A'}`, 'info');
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Debug Session API</h1>
        <p className="text-gray-300">Testing the backend session creation</p>
      </div>

      {/* Controls */}
      <div className="flex space-x-4">
        <button
          onClick={testHealthAPI}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Test Health API
        </button>
        <button
          onClick={testSessionAPI}
          disabled={!accessToken}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg"
        >
          Test Session API
        </button>
        <button
          onClick={() => setLogs([])}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
        >
          Clear Logs
        </button>
      </div>

      {/* Session Data */}
      {sessionData && (
        <div className="bg-green-600 bg-opacity-20 border border-green-500 rounded-lg p-4">
          <h3 className="text-green-200 font-bold mb-2">✅ Session Created!</h3>
          <div className="text-green-300 text-sm">
            <p>Session ID: <code className="bg-black bg-opacity-30 px-2 py-1 rounded">{sessionData.sessionId}</code></p>
            <p>Join URL: <code className="bg-black bg-opacity-30 px-2 py-1 rounded">{sessionData.joinUrl}</code></p>
            <p>Host: {sessionData.host.name}</p>
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Debug Logs</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-400">No logs yet...</p>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`p-2 rounded text-sm font-mono ${
                  log.type === 'error' ? 'bg-red-600 bg-opacity-20 text-red-300' :
                  log.type === 'success' ? 'bg-green-600 bg-opacity-20 text-green-300' :
                  'bg-gray-700 text-gray-300'
                }`}
              >
                <span className="text-gray-400">[{log.timestamp}]</span> {log.message}
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">User Info</h3>
        <div className="text-gray-300 text-sm space-y-1">
          <p>Logged in: {user ? '✅ Yes' : '❌ No'}</p>
          <p>Name: {user?.display_name || 'N/A'}</p>
          <p>Email: {user?.email || 'N/A'}</p>
          <p>Access Token: {accessToken ? '✅ Available' : '❌ Missing'}</p>
        </div>
      </div>
    </div>
  );
};

export default DebugSession;
