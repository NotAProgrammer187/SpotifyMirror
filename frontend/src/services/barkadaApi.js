// src/services/barkadaApi.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8080/api/v1';

// Debug: log the API URL being used
console.log('🔍 BarkadaApi - Using API URL:', API_BASE_URL);
console.log('🔍 BarkadaApi - Environment variable:', process.env.REACT_APP_API_URL);

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
      console.log('🎵 Analyzing Barkada music...', usersData);
      
      // Generate mock playlist data using user tracks
      const mockTracks = usersData.users.flatMap(user => 
        (user.topTracks || []).slice(0, 3).map(track => ({
          id: track.id || Math.random().toString(36),
          name: track.name || 'Unknown Track',
          artists: track.artists || [{ name: 'Unknown Artist' }],
          album: track.album || { name: 'Unknown Album' },
          duration_ms: track.duration_ms || 180000,
          uri: track.uri || `spotify:track:${Math.random().toString(36)}`
        }))
      );

      console.log('🎵 Generated mock tracks:', mockTracks.length);

      // Mock analysis with proper structure
      const result = {
        compatibility_score: 85,
        shared_genres: ['Pop', 'Hip-Hop', 'R&B'],
        common_artists: ['Taylor Swift', 'Drake', 'Billie Eilish'],
        recommendedPlaylist: mockTracks.slice(0, 15), // Include recommended playlist
        sharedTracks: mockTracks.slice(0, 5).map(track => ({ track })),
        insights: [
          `Found ${mockTracks.length} tracks from your group!`,
          'Your music taste compatibility is high!',
          'Perfect for collaborative playlists! 🎵'
        ],
        recommendations: mockTracks.slice(5, 10)
      };
      
      console.log('🎵 Analysis result:', result);
      return result;
    } catch (error) {
      console.error('Barkada analysis failed:', error);
      throw new Error('Analysis failed');
    }
  }

  // Create group playlist directly on Spotify
  static async createGroupPlaylist(playlistData, accessToken) {
    try {
      console.log('🎵 Creating playlist with data:', playlistData);
      console.log('🎵 Using access token:', accessToken ? 'Present' : 'Missing');
      
      // First, get the user's Spotify ID
      const userProfile = await this.getUserProfile(accessToken);
      const userId = userProfile.id;
      console.log('🎵 User ID:', userId);
      
      // Create the playlist
      console.log('🎵 Creating playlist...');
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
      
      console.log('🎵 Create playlist response status:', createResponse.status);
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('🎵 Create playlist error:', errorText);
        throw new Error(`Failed to create playlist: ${createResponse.status} ${createResponse.statusText} - ${errorText}`);
      }
      
      const playlist = await createResponse.json();
      console.log('🎵 Playlist created successfully:', playlist.id, playlist.name);
      
      // Add tracks to the playlist if provided
      if (playlistData.tracks && playlistData.tracks.length > 0) {
        console.log('🎵 Adding', playlistData.tracks.length, 'tracks to playlist...');
        
        // Filter out invalid track IDs and create proper URIs
        const validTrackIds = playlistData.tracks.filter(trackId => 
          trackId && typeof trackId === 'string' && trackId.length > 10
        );
        
        console.log('🎵 Valid track IDs:', validTrackIds.length, 'out of', playlistData.tracks.length);
        
        if (validTrackIds.length === 0) {
          console.warn('🎵 No valid track IDs found, skipping track addition');
          return { success: true, playlist, message: 'Playlist created but no valid tracks to add' };
        }
        
        const trackUris = validTrackIds.map(trackId => `spotify:track:${trackId}`);
        console.log('🎵 Track URIs:', trackUris.slice(0, 3), '...');
        
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
        
        console.log('🎵 Add tracks response status:', addTracksResponse.status);
        if (!addTracksResponse.ok) {
          const errorText = await addTracksResponse.text();
          console.warn('🎵 Failed to add some tracks:', errorText);
        } else {
          console.log('🎵 Tracks added successfully!');
        }
      } else {
        console.log('🎵 No tracks provided, playlist created empty');
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