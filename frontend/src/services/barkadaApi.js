// src/services/barkadaApi.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

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
  // Get Spotify auth URL
  static async getAuthUrl() {
    try {
      const response = await api.get('/auth/login');
      return response.data;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      throw new Error(error.response?.data?.error || 'Failed to get authorization URL');
    }
  }

  // Handle OAuth callback
  static async handleCallback(code, state) {
    try {
      const response = await api.post('/auth/callback', {
        code,
        state
      });
      return response.data;
    } catch (error) {
      console.error('Callback failed:', error);
      throw new Error(error.response?.data?.error || 'Authentication failed');
    }
  }

  // Get all Barkada session users (placeholder for now)
  static async getBarkadaUsers() {
    try {
      // For now, return mock data since we don't have session storage yet
      return { users: [] };
    } catch (error) {
      console.error('Failed to get Barkada users:', error);
      throw new Error('Failed to get users');
    }
  }

  // Clear Barkada session (placeholder for now)
  static async clearBarkadaSession() {
    try {
      // For now, just return success
      return { success: true };
    } catch (error) {
      console.error('Failed to clear Barkada session:', error);
      throw new Error('Failed to clear session');
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

  // Analyze Barkada music compatibility (mock for now)
  static async analyzeBarkadaMusic(usersData) {
    try {
      // Mock analysis since we don't have backend analytics yet
      return {
        compatibility_score: 85,
        shared_genres: ['Pop', 'Hip-Hop', 'R&B'],
        common_artists: ['Taylor Swift', 'Drake', 'Billie Eilish'],
        recommendations: []
      };
    } catch (error) {
      console.error('Barkada analysis failed:', error);
      throw new Error('Analysis failed');
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

  // Refresh access token (placeholder for now)
  static async refreshToken(refreshToken) {
    try {
      // This would need to be implemented in your API
      throw new Error('Token refresh not implemented yet');
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new Error('Token refresh failed');
    }
  }

  // Create Barkada session (placeholder for now)
  static async createBarkadaSession(sessionData) {
    try {
      // Mock session creation
      return {
        id: Date.now().toString(),
        code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        ...sessionData
      };
    } catch (error) {
      console.error('Failed to create Barkada session:', error);
      throw new Error('Failed to create session');
    }
  }

  // Join Barkada session by code (placeholder for now)
  static async joinBarkadaSession(sessionCode, userData) {
    try {
      // Mock session join
      return { success: true, sessionCode };
    } catch (error) {
      console.error('Failed to join Barkada session:', error);
      throw new Error('Failed to join session');
    }
  }

  // Get session details (placeholder for now)
  static async getSessionDetails(sessionCode) {
    try {
      // Mock session details
      return {
        code: sessionCode,
        name: 'Sample Session',
        participants: []
      };
    } catch (error) {
      console.error('Failed to get session details:', error);
      throw new Error('Failed to get session details');
    }
  }
}

export default BarkadaApiService;
export { api };