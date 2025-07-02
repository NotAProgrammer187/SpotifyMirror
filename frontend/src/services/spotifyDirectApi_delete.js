import axios from 'axios';

// Create axios instance for direct Spotify API calls
const spotifyDirectApi = axios.create({
  baseURL: 'https://api.spotify.com/v1',
  timeout: 10000,
});

// Request interceptor to add auth token
spotifyDirectApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('spotify_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
spotifyDirectApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      const refreshToken = localStorage.getItem('spotify_refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post('/api/v1/auth/refresh', {
            refresh_token: refreshToken
          });
          const { access_token } = response.data.data;
          localStorage.setItem('spotify_access_token', access_token);
          
          // Retry original request
          error.config.headers.Authorization = `Bearer ${access_token}`;
          return spotifyDirectApi.request(error.config);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.clear();
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Direct Spotify API service methods
export const spotifyDirectService = {
  // User Profile
  getProfile: () => spotifyDirectApi.get('/me'),
  
  // Top Items
  getTopTracks: (params = {}) => spotifyDirectApi.get('/me/top/tracks', { params }),
  getTopArtists: (params = {}) => spotifyDirectApi.get('/me/top/artists', { params }),
  
  // Listening History
  getRecentlyPlayed: (params = {}) => spotifyDirectApi.get('/me/player/recently-played', { params }),
  
  // Library
  getSavedTracks: (params = {}) => spotifyDirectApi.get('/me/tracks', { params }),
  getSavedAlbums: (params = {}) => spotifyDirectApi.get('/me/albums', { params }),
  
  // Audio Features (for mood analysis)
  getAudioFeatures: (trackIds) => {
    const ids = Array.isArray(trackIds) ? trackIds.join(',') : trackIds;
    return spotifyDirectApi.get('/audio-features', { params: { ids } });
  },
  
  // Playlists
  getUserPlaylists: (params = {}) => spotifyDirectApi.get('/me/playlists', { params }),
  getPlaylist: (playlistId, params = {}) => spotifyDirectApi.get(`/playlists/${playlistId}`, { params }),
  getPlaylistTracks: (playlistId, params = {}) => spotifyDirectApi.get(`/playlists/${playlistId}/tracks`, { params }),
  
  // Following
  getFollowedArtists: (params = {}) => spotifyDirectApi.get('/me/following', { 
    params: { type: 'artist', ...params } 
  }),
  
  // Search
  search: (query, type = 'track,artist,album', params = {}) => spotifyDirectApi.get('/search', {
    params: { q: query, type, ...params }
  }),
  
  // Player (if user has Spotify Premium)
  getCurrentlyPlaying: () => spotifyDirectApi.get('/me/player/currently-playing'),
  getPlaybackState: () => spotifyDirectApi.get('/me/player')
};

export default spotifyDirectService;