import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StatsCard from '../components/StatsCard';
import TopTracks from '../components/TopTracks';
import TopArtists from '../components/TopArtists';
import GenreChart from '../components/GenreChart';
import ListeningActivity from '../components/ListeningActivity';
import MoodAnalysis from '../components/MoodAnalysis';
import QuickStats from '../components/QuickStats';
import { 
  Music, 
  Users, 
  Clock, 
  TrendingUp, 
  Heart,
  PlayCircle,
  Calendar,
  Headphones,
  RefreshCw
} from 'lucide-react';

// Direct Spotify API service using stored access token
const createSpotifyService = (accessToken) => ({
  async getTopTracks(params = {}) {
    const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?${new URLSearchParams(params)}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!response.ok) throw new Error(`Failed to fetch top tracks: ${response.status}`);
    return response.json();
  },

  async getTopArtists(params = {}) {
    const response = await fetch(`https://api.spotify.com/v1/me/top/artists?${new URLSearchParams(params)}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!response.ok) throw new Error(`Failed to fetch top artists: ${response.status}`);
    return response.json();
  },

  async getRecentlyPlayed(params = {}) {
    const response = await fetch(`https://api.spotify.com/v1/me/player/recently-played?${new URLSearchParams(params)}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!response.ok) throw new Error(`Failed to fetch recently played: ${response.status}`);
    return response.json();
  },

  async getAudioFeatures(trackIds) {
    const ids = Array.isArray(trackIds) ? trackIds.join(',') : trackIds;
    const response = await fetch(`https://api.spotify.com/v1/audio-features?ids=${ids}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!response.ok) throw new Error(`Failed to fetch audio features: ${response.status}`);
    return response.json();
  },

  async getCurrentUser() {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!response.ok) throw new Error(`Failed to fetch user profile: ${response.status}`);
    return response.json();
  },

  async getUserPlaylists(params = {}) {
    const response = await fetch(`https://api.spotify.com/v1/me/playlists?${new URLSearchParams(params)}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!response.ok) throw new Error(`Failed to fetch playlists: ${response.status}`);
    return response.json();
  }
});

const Dashboard = () => {
  const { user, accessToken, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('medium_term');
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [dashboardData, setDashboardData] = useState({
    topTracks: null,
    topArtists: null,
    recentlyPlayed: null,
    listeningHabits: null,
    genreBreakdown: null,
    moodAnalysis: null,
    userPlaylists: null
  });

  const timeRanges = [
    { value: 'short_term', label: 'Last 4 weeks' },
    { value: 'medium_term', label: 'Last 6 months' },
    { value: 'long_term', label: 'All time' }
  ];

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      loadDashboardData();
    }
  }, [timeRange, isAuthenticated, accessToken]);

  const loadDashboardData = async (showRefreshing = false) => {
    if (!accessToken) {
      setError('No access token available');
      setLoading(false);
      return;
    }

    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('🚀 Loading dashboard data from Spotify API...');
      
      const spotifyService = createSpotifyService(accessToken);

      // Fetch all data in parallel
      const [
        topTracksRes,
        topArtistsRes,
        recentlyPlayedRes,
        userPlaylistsRes
      ] = await Promise.allSettled([
        spotifyService.getTopTracks({ time_range: timeRange, limit: 50 }),
        spotifyService.getTopArtists({ time_range: timeRange, limit: 50 }),
        spotifyService.getRecentlyPlayed({ limit: 50 }),
        spotifyService.getUserPlaylists({ limit: 50 })
      ]);

      // Process successful responses
      const topTracks = topTracksRes.status === 'fulfilled' ? topTracksRes.value : null;
      const topArtists = topArtistsRes.status === 'fulfilled' ? topArtistsRes.value : null;
      const recentlyPlayed = recentlyPlayedRes.status === 'fulfilled' ? recentlyPlayedRes.value : null;
      const userPlaylists = userPlaylistsRes.status === 'fulfilled' ? userPlaylistsRes.value : null;
      
      // Generate genre analysis from top artists
      let genreBreakdown = null;
      if (topArtists?.items) {
        const genreCounts = {};
        topArtists.items.forEach(artist => {
          if (artist.genres) {
            artist.genres.forEach(genre => {
              genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            });
          }
        });
        
        const topGenres = Object.entries(genreCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([genre, count]) => ({
            genre: genre.charAt(0).toUpperCase() + genre.slice(1),
            count,
            percentage: ((count / topArtists.items.length) * 100).toFixed(1)
          }));
        
        genreBreakdown = {
          totalGenres: Object.keys(genreCounts).length,
          topGenres,
          diversityScore: Math.min(100, ((Object.keys(genreCounts).length / topArtists.items.length) * 100)).toFixed(1)
        };
      }
      
      // Get audio features for mood analysis
      let moodAnalysis = null;
      if (topTracks?.items?.length > 0) {
        try {
          const trackIds = topTracks.items.slice(0, 20).map(track => track.id).filter(id => id);
          if (trackIds.length > 0) {
            const audioFeaturesRes = await spotifyService.getAudioFeatures(trackIds);
            const audioFeatures = audioFeaturesRes.audio_features.filter(af => af !== null);
            
            if (audioFeatures.length > 0) {
              const avgFeatures = {
                valence: audioFeatures.reduce((sum, af) => sum + af.valence, 0) / audioFeatures.length,
                energy: audioFeatures.reduce((sum, af) => sum + af.energy, 0) / audioFeatures.length,
                danceability: audioFeatures.reduce((sum, af) => sum + af.danceability, 0) / audioFeatures.length,
                acousticness: audioFeatures.reduce((sum, af) => sum + af.acousticness, 0) / audioFeatures.length,
                instrumentalness: audioFeatures.reduce((sum, af) => sum + af.instrumentalness, 0) / audioFeatures.length
              };
              
              // Determine mood based on valence and energy
              let overallMood = 'Balanced';
              let moodEmoji = '🎵';
              
              if (avgFeatures.valence > 0.7 && avgFeatures.energy > 0.7) {
                overallMood = 'Energetic & Happy';
                moodEmoji = '🎉';
              } else if (avgFeatures.valence > 0.6 && avgFeatures.energy <= 0.6) {
                overallMood = 'Happy & Calm';
                moodEmoji = '😌';
              } else if (avgFeatures.valence <= 0.4 && avgFeatures.energy > 0.6) {
                overallMood = 'Energetic & Intense';
                moodEmoji = '🔥';
              } else if (avgFeatures.valence <= 0.4 && avgFeatures.energy <= 0.4) {
                overallMood = 'Calm & Melancholic';
                moodEmoji = '🌙';
              } else if (avgFeatures.danceability > 0.7) {
                overallMood = 'Danceable';
                moodEmoji = '💃';
              }
              
              moodAnalysis = {
                overallMood,
                moodEmoji,
                audioFeatures: avgFeatures,
                insights: [
                  `Your music has ${Math.round(avgFeatures.valence * 100)}% positivity`,
                  `Energy level: ${Math.round(avgFeatures.energy * 100)}%`,
                  `Danceability: ${Math.round(avgFeatures.danceability * 100)}%`,
                  `Acoustic preference: ${Math.round(avgFeatures.acousticness * 100)}%`
                ]
              };
            }
          }
        } catch (audioError) {
          console.warn('Audio features failed:', audioError.message);
        }
      }
      
      // Create listening habits summary
      const listeningHabits = {
        overview: {
          totalTopTracks: topTracks?.items?.length || 0,
          totalTopArtists: topArtists?.items?.length || 0,
          recentTracksCount: recentlyPlayed?.items?.length || 0,
          totalPlaylists: userPlaylists?.items?.length || 0
        },
        topTracks: topTracks?.items?.slice(0, 5) || [],
        topArtists: topArtists?.items?.slice(0, 5) || [],
        recentActivity: recentlyPlayed?.items?.slice(0, 10) || []
      };

      setDashboardData({
        topTracks,
        topArtists,
        recentlyPlayed,
        listeningHabits,
        genreBreakdown,
        moodAnalysis,
        userPlaylists
      });
      
      console.log('✅ Dashboard data loaded successfully!', {
        topTracks: topTracks?.items?.length || 0,
        topArtists: topArtists?.items?.length || 0,
        recentlyPlayed: recentlyPlayed?.items?.length || 0,
        genres: genreBreakdown?.totalGenres || 0
      });

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <div className="text-purple-400 mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-white mb-4">Please log in</h2>
          <p className="text-gray-400 mb-6">
            You need to log in with Spotify to view your dashboard
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading your music insights..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-2xl p-8 text-center">
            <div className="text-red-400 mb-4 text-4xl">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => loadDashboardData()}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <button
                onClick={() => window.location.href = '/barkada'}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Go to Barkada
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, {user?.display_name || 'Music Lover'}! 👋
              </h1>
              <p className="text-gray-400">
                Here's what your music taste looks like {timeRanges.find(r => r.value === timeRange)?.label.toLowerCase()}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Time Range Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Period:</span>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {timeRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <QuickStats data={dashboardData} />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Top Tracks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <TopTracks 
              tracks={dashboardData.topTracks} 
              timeRange={timeRange}
            />
          </motion.div>

          {/* Top Artists */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <TopArtists 
              artists={dashboardData.topArtists}
              timeRange={timeRange}
            />
          </motion.div>

          {/* Genre Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
          >
            <GenreChart 
              genreData={dashboardData.genreBreakdown}
            />
          </motion.div>
        </div>

        {/* Secondary Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Listening Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <ListeningActivity 
              recentlyPlayed={dashboardData.recentlyPlayed}
            />
          </motion.div>

          {/* Mood Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <MoodAnalysis 
              moodData={dashboardData.moodAnalysis}
            />
          </motion.div>
        </div>

        {/* Bottom Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatsCard
            icon={<Music className="w-6 h-6" />}
            title="Tracks Analyzed"
            value={dashboardData.topTracks?.items?.length || 0}
            subtitle="In your top list"
            color="purple"
          />
          
          <StatsCard
            icon={<Users className="w-6 h-6" />}
            title="Artists"
            value={dashboardData.topArtists?.items?.length || 0}
            subtitle="You love listening to"
            color="pink"
          />
          
          <StatsCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Genres"
            value={dashboardData.genreBreakdown?.totalGenres || 0}
            subtitle="In your music taste"
            color="cyan"
          />
          
          <StatsCard
            icon={<Clock className="w-6 h-6" />}
            title="Playlists"
            value={dashboardData.userPlaylists?.items?.length || 0}
            subtitle="Created by you"
            color="green"
          />
        </motion.div>

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          {/* Barkada Session */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Start Barkada Session</h3>
                <p className="text-gray-400 text-sm">Compare music with friends</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Invite friends to join a music session and discover your shared musical chemistry!
            </p>
            <button
              onClick={() => window.location.href = '/barkada'}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-medium transition-all"
            >
              🎵 Start Session
            </button>
          </div>

          {/* Music Insights */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Music Analytics</h3>
                <p className="text-gray-400 text-sm">Deep dive into your taste</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Get detailed analytics about your listening habits and music preferences.
            </p>
            <button
              onClick={() => window.location.href = '/analytics'}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3 rounded-lg font-medium transition-all"
            >
              📊 View Analytics
            </button>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center"
        >
          <p className="text-gray-500 text-sm">
            Data syncs automatically with your Spotify account • Last updated: {new Date().toLocaleTimeString()} 🎵
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;