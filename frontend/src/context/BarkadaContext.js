import React, { createContext, useContext, useState, useEffect } from 'react';
import { spotifyApi } from '../services/spotifyApi';

const BarkadaContext = createContext();

export const useBarkada = () => {
  const context = useContext(BarkadaContext);
  if (!context) {
    throw new Error('useBarkada must be used within BarkadaProvider');
  }
  return context;
};

export const BarkadaProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [combinedData, setCombinedData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Initialize session from localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem('barkada_session');
    const savedUsers = localStorage.getItem('barkada_users');
    
    if (savedSession && savedUsers) {
      setActiveSession(JSON.parse(savedSession));
      setUsers(JSON.parse(savedUsers));
    }
  }, []);

  // Save to localStorage when users or session changes
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('barkada_users', JSON.stringify(users));
    }
  }, [users]);

  useEffect(() => {
    if (activeSession) {
      localStorage.setItem('barkada_session', JSON.stringify(activeSession));
    }
  }, [activeSession]);

  const addUser = async (code, state) => {
    try {
      console.log('🔍 Adding user to barkada session...');
      
      const response = await spotifyApi.post('/auth/callback', { code, state });
      const userData = response.data.data;
      
      const newUser = {
        id: userData.user.id,
        name: userData.user.display_name,
        accessToken: userData.access_token,
        refreshToken: userData.refresh_token,
        avatar: userData.user.images?.[0]?.url || '/default-avatar.png',
        email: userData.user.email,
        joinedAt: new Date().toISOString(),
        country: userData.user.country
      };

      // Check if user already exists
      const existingUser = users.find(user => user.id === newUser.id);
      if (existingUser) {
        console.log('User already in session, updating token...');
        setUsers(prev => prev.map(user => 
          user.id === newUser.id ? { ...user, accessToken: newUser.accessToken } : user
        ));
        return existingUser;
      }

      setUsers(prev => [...prev, newUser]);
      console.log(`✅ Added ${newUser.name} to barkada session`);
      
      return newUser;
    } catch (error) {
      console.error('❌ Error adding user to barkada:', error);
      throw error;
    }
  };

  const removeUser = (userId) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    
    // If session is active and user was part of it, update session
    if (activeSession && activeSession.users.some(user => user.id === userId)) {
      const updatedUsers = activeSession.users.filter(user => user.id !== userId);
      setActiveSession(prev => ({
        ...prev,
        users: updatedUsers
      }));
    }
  };

  const startSession = () => {
    if (users.length < 2) {
      throw new Error('Need at least 2 friends to start a session');
    }

    const newSessionId = Math.random().toString(36).substring(7);
    const session = {
      id: newSessionId,
      users: [...users],
      startedAt: new Date().toISOString(),
      combinedPlaylists: [],
      sharedTracks: [],
      status: 'active'
    };
    
    setActiveSession(session);
    setSessionId(newSessionId);
    console.log(`🎵 Started barkada session with ${users.length} friends`);
    
    return session;
  };

  const endSession = () => {
    setActiveSession(null);
    setUsers([]);
    setCombinedData(null);
    setSessionId(null);
    
    localStorage.removeItem('barkada_session');
    localStorage.removeItem('barkada_users');
    localStorage.removeItem('barkada_analysis');
    
    console.log('🏁 Ended barkada session');
  };

  const analyzeBarkadaMusic = async () => {
    if (!activeSession || users.length < 2) {
      throw new Error('Need active session with at least 2 users');
    }

    setIsAnalyzing(true);
    
    try {
      console.log(`🎵 Analyzing music for ${users.length} friends...`);
      
      const userTokens = users.map(user => user.accessToken);
      const response = await spotifyApi.post('/analytics/barkada', {
        userTokens,
        sessionId: activeSession.id
      });

      const analysisData = response.data.data;
      setCombinedData(analysisData);
      
      // Save analysis to localStorage
      localStorage.setItem('barkada_analysis', JSON.stringify(analysisData));
      
      console.log('✅ Barkada analysis complete');
      return analysisData;
      
    } catch (error) {
      console.error('❌ Error analyzing barkada music:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAuthUrl = async () => {
    try {
      const response = await spotifyApi.get('/auth/login');
      return response.data.authUrl;
    } catch (error) {
      console.error('Error getting auth URL:', error);
      throw error;
    }
  };

  const createGroupPlaylist = async (playlistName = 'Barkada Hits') => {
    if (!combinedData || !combinedData.sharedTracks.length) {
      throw new Error('No shared tracks to create playlist');
    }

    try {
      // Use the first user's token to create the playlist
      const primaryUser = users[0];
      const trackUris = combinedData.sharedTracks
        .slice(0, 30) // Limit to 30 tracks
        .map(item => item.track.uri);

      const response = await spotifyApi.post('/playlists/create-group', {
        accessToken: primaryUser.accessToken,
        playlistName,
        trackUris,
        description: `Created by ${users.map(u => u.name).join(', ')} - Barkada Session ${new Date().toLocaleDateString()}`
      });

      return response.data;
    } catch (error) {
      console.error('Error creating group playlist:', error);
      throw error;
    }
  };

  const value = {
    // State
    users,
    activeSession,
    combinedData,
    isAnalyzing,
    sessionId,
    
    // Actions
    addUser,
    removeUser,
    startSession,
    endSession,
    analyzeBarkadaMusic,
    getAuthUrl,
    createGroupPlaylist,
    
    // Computed
    isSessionActive: !!activeSession,
    canStartSession: users.length >= 2,
    hasAnalysis: !!combinedData
  };

  return (
    <BarkadaContext.Provider value={value}>
      {children}
    </BarkadaContext.Provider>
  );
};
