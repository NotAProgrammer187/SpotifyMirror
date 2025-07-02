import React, { createContext, useContext, useState, useEffect } from 'react';
import { spotifyApi } from '../services/spotifyApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('spotify_access_token');
        const refresh = localStorage.getItem('spotify_refresh_token');
        const userData = localStorage.getItem('spotify_user');

        if (token && userData) {
          setAccessToken(token);
          setRefreshToken(refresh);
          setUser(JSON.parse(userData));
          
          // Set axios default header
          spotifyApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Validate token by fetching user profile
          try {
            await spotifyApi.get('/user/profile');
          } catch (error) {
            if (error.response?.status === 401 && refresh) {
              // Try to refresh token
              await refreshAccessToken();
            } else {
              // Clear invalid tokens
              clearAuth();
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (code, state) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Login - Starting with code:', code ? 'Present' : 'Missing');
      
      const response = await spotifyApi.post('/auth/callback', {
        code,
        state
      });

      console.log('🔍 Login - Response:', response.data);
      
      const { access_token, refresh_token, api_token, user: userData } = response.data.data;

      console.log('🔍 Login - Tokens:', {
        access_token: access_token ? 'Present' : 'Missing',
        refresh_token: refresh_token ? 'Present' : 'Missing',
        api_token: api_token ? 'Present' : 'Missing'
      });

      // Store tokens and user data (keep for backward compatibility)
      localStorage.setItem('spotify_access_token', access_token);
      if (refresh_token) {
        localStorage.setItem('spotify_refresh_token', refresh_token);
      }
      if (api_token) {
        localStorage.setItem('api_token', api_token);
      }
      localStorage.setItem('spotify_user', JSON.stringify(userData));

      console.log('🔍 Login - Stored in localStorage');

      // Update state
      setAccessToken(access_token);
      setRefreshToken(refresh_token);
      setUser(userData);

      // Set axios default headers (API token for backend, access token for direct Spotify calls)
      if (api_token) {
        spotifyApi.defaults.headers.common['Authorization'] = `Bearer ${api_token}`;
      }

      console.log('🔍 Login - Updated axios headers');

      return userData;
    } catch (error) {
      console.error('❌ Login error:', error);
      setError(error.response?.data?.message || 'Authentication failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refresh = refreshToken || localStorage.getItem('spotify_refresh_token');
      
      if (!refresh) {
        throw new Error('No refresh token available');
      }

      const response = await spotifyApi.post('/auth/refresh', {
        refresh_token: refresh
      });

      const { access_token, refresh_token: newRefreshToken } = response.data.data;

      // Update tokens
      localStorage.setItem('spotify_access_token', access_token);
      if (newRefreshToken) {
        localStorage.setItem('spotify_refresh_token', newRefreshToken);
        setRefreshToken(newRefreshToken);
      }

      setAccessToken(access_token);
      spotifyApi.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      return access_token;
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuth();
      throw error;
    }
  };

  const logout = () => {
    clearAuth();
    
    // Optional: Call backend logout endpoint
    spotifyApi.post('/auth/logout').catch(console.error);
  };

  const clearAuth = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_user');
    
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setError(null);
    
    delete spotifyApi.defaults.headers.common['Authorization'];
  };

  const getAuthUrl = async () => {
    try {
      const response = await spotifyApi.get('/auth/login');
      return response.data.authUrl;
    } catch (error) {
      console.error('Error getting auth URL:', error);
      
      // If rate limited, show user-friendly message
      if (error.response?.status === 429) {
        throw new Error('Too many login attempts. Please wait a moment and try again.');
      }
      
      throw error;
    }
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    login,
    logout,
    refreshAccessToken,
    getAuthUrl,
    isAuthenticated: !!user && !!accessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};