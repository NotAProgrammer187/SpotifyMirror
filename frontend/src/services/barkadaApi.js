import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Enhanced API service for multi-login Barkada sessions
class BarkadaApiService {
  // Get Spotify auth URL for multi-login
  static async getAuthUrl(friendSlot = null) {
    try {
      const response = await api.get('/auth/login', {
        params: friendSlot ? { friend_slot: friendSlot } : {}
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      throw new Error(error.response?.data?.message || 'Failed to get authorization URL');
    }
  }

  // Handle OAuth callback for multi-login
  static async handleCallback(code, state, friendSlot = null) {
    try {
      const response = await api.post('/auth/callback', {
        code,
        state,
        friend_slot: friendSlot
      });
      return response.data;
    } catch (error) {
      console.error('Callback failed:', error);
      throw new Error(error.response?.data?.message || 'Authentication failed');
    }
  }

  // Get all Barkada session users
  static async getBarkadaUsers() {
    try {
      const response = await api.get('/auth/barkada/users');
      return response.data;
    } catch (error) {
      console.error('Failed to get Barkada users:', error);
      throw new Error(error.response?.data?.message || 'Failed to get users');
    }
  }

  // Clear Barkada session
  static async clearBarkadaSession() {
    try {
      const response = await api.post('/auth/barkada/clear');
      return response.data;
    } catch (error) {
      console.error('Failed to clear Barkada session:', error);
      throw new Error(error.response?.data?.message || 'Failed to clear session');
    }
  }

  // Get user's top tracks directly from Spotify
  static async getTopTracks(accessToken, timeRange = 'medium_term', limit = 50) {
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get top tracks from Spotify:', error);
      throw new Error(error.message || 'Failed to get top tracks');
    }
  }

  // Get user profile directly from Spotify
  static async getUserProfile(accessToken) {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get user profile from Spotify:', error);
      throw new Error(error.message || 'Failed to get user profile');
    }
  }

  // Analyze Barkada music compatibility
  static async analyzeBarkadaMusic(usersData) {
    try {
      const response = await api.post('/analytics/barkada', {
        users: usersData
      });
      return response.data;
    } catch (error) {
      console.error('Barkada analysis failed:', error);
      throw new Error(error.response?.data?.message || 'Analysis failed');
    }
  }

  // Create group playlist directly on Spotify
  static async createGroupPlaylist(playlistData, accessToken) {
    try {
      // First, get the user's Spotify ID
      const userProfile = await this.getUserProfile(accessToken);
      const userId = userProfile.id;
      
      // Create the playlist
      const createResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: playlistData.name,
          description: playlistData.description,
          public: false
        })
      });
      
      if (!createResponse.ok) {
        throw new Error(`Failed to create playlist: ${createResponse.status} ${createResponse.statusText}`);
      }
      
      const playlist = await createResponse.json();
      
      // Add tracks to the playlist if provided
      if (playlistData.tracks && playlistData.tracks.length > 0) {
        const trackUris = playlistData.tracks.map(trackId => `spotify:track:${trackId}`);
        
        const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uris: trackUris
          })
        });
        
        if (!addTracksResponse.ok) {
          console.warn('Failed to add some tracks to playlist');
        }
      }
      
      return { success: true, playlist };
    } catch (error) {
      console.error('Failed to create group playlist on Spotify:', error);
      throw new Error(error.message || 'Failed to create playlist');
    }
  }

  // Refresh access token
  static async refreshToken(refreshToken) {
    try {
      const response = await api.post('/auth/refresh', {
        refresh_token: refreshToken
      });
      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  }

  // Create Barkada session (for session codes)
  static async createBarkadaSession(sessionData) {
    try {
      const response = await api.post('/sessions', sessionData);
      return response.data;
    } catch (error) {
      console.error('Failed to create Barkada session:', error);
      throw new Error(error.response?.data?.message || 'Failed to create session');
    }
  }

  // Join Barkada session by code
  static async joinBarkadaSession(sessionCode, userData) {
    try {
      const response = await api.post(`/sessions/${sessionCode}/join`, userData);
      return response.data;
    } catch (error) {
      console.error('Failed to join Barkada session:', error);
      throw new Error(error.response?.data?.message || 'Failed to join session');
    }
  }

  // Get session details
  static async getSessionDetails(sessionCode) {
    try {
      const response = await api.get(`/sessions/${sessionCode}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get session details:', error);
      throw new Error(error.response?.data?.message || 'Failed to get session details');
    }
  }
}

export default BarkadaApiService;
export { api };