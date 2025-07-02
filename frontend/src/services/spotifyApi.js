import axios from 'axios';

// Create axios instance for Spotify Mirror API
export const spotifyApi = axios.create({
  baseURL: 'http://127.0.0.1:8080/api/v1', // Match the domain exactly
  timeout: 10000,
  withCredentials: true, // Re-enable credentials for session management
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
spotifyApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('spotify_access_token');
    console.log('🔍 API Request - Token:', token ? `Present (${token.substring(0, 20)}...)` : 'Missing');
    console.log('🔍 API Request - URL:', config.url);
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
spotifyApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('spotify_refresh_token');
        if (refreshToken) {
          const response = await axios.post('/api/v1/auth/refresh', {
            refresh_token: refreshToken
          });

          const { access_token } = response.data.data;
          localStorage.setItem('spotify_access_token', access_token);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return spotifyApi(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clear auth data and redirect to login
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_user');
        
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API service methods
export const authService = {
  getAuthUrl: () => spotifyApi.get('/auth/login'),
  handleCallback: (code, state) => spotifyApi.post('/auth/callback', { code, state }),
  refreshToken: (refreshToken) => spotifyApi.post('/auth/refresh', { refresh_token: refreshToken }),
  logout: () => spotifyApi.post('/auth/logout'),
};

export const userService = {
  getProfile: () => spotifyApi.get('/user/profile'),
  getTopTracks: (params = {}) => spotifyApi.get('/user/top-tracks', { params }),
  getTopArtists: (params = {}) => spotifyApi.get('/user/top-artists', { params }),
  getRecentlyPlayed: (params = {}) => spotifyApi.get('/user/recently-played', { params }),
  getSavedTracks: (params = {}) => spotifyApi.get('/user/saved-tracks', { params }),
  getFollowing: (params = {}) => spotifyApi.get('/user/following', { params }),
};

export const analyticsService = {
  getListeningHabits: (params = {}) => spotifyApi.get('/analytics/listening-habits', { params }),
  getGenreBreakdown: (params = {}) => spotifyApi.get('/analytics/genre-breakdown', { params }),
  getMoodAnalysis: (params = {}) => spotifyApi.get('/analytics/mood-analysis', { params }),
  getListeningTimeline: (params = {}) => spotifyApi.get('/analytics/listening-timeline', { params }),
  getDiscoveryInsights: (params = {}) => spotifyApi.get('/analytics/discovery-insights', { params }),
  getArtistDiversity: (params = {}) => spotifyApi.get('/analytics/artist-diversity', { params }),
};

export const playlistService = {
  getUserPlaylists: (params = {}) => spotifyApi.get('/playlists', { params }),
  getPlaylistDetails: (id, params = {}) => spotifyApi.get(`/playlists/${id}`, { params }),
  getPlaylistAnalytics: (id) => spotifyApi.get(`/playlists/${id}/analytics`),
  getPlaylistTracks: (id, params = {}) => spotifyApi.get(`/playlists/${id}/tracks`, { params }),
  comparePlaylists: (playlistIds) => spotifyApi.post('/playlists/compare', { playlist_ids: playlistIds }),
};

export default spotifyApi;