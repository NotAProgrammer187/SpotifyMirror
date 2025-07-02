import React, { useState, useEffect } from 'react';
import { useBarkada } from '../context/BarkadaContext';
import { 
  BarChart3, 
  Heart, 
  Users, 
  TrendingUp, 
  Music, 
  Sparkles, 
  Play,
  Plus,
  Download,
  Share2
} from 'lucide-react';

const BarkadaAnalytics = () => {
  const { 
    users, 
    combinedData, 
    isAnalyzing, 
    analyzeBarkadaMusic, 
    createGroupPlaylist, 
    hasAnalysis,
    isSessionActive 
  } = useBarkada();
  
  const [error, setError] = useState(null);
  const [playlistCreating, setPlaylistCreating] = useState(false);

  const handleAnalyze = async () => {
    try {
      setError(null);
      await analyzeBarkadaMusic();
    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error.message || 'Failed to analyze your group\'s music');
    }
  };

  const handleCreatePlaylist = async () => {
    try {
      setPlaylistCreating(true);
      setError(null);
      
      const result = await createGroupPlaylist('Barkada Hits 🎵');
      alert('Playlist created successfully! Check your Spotify app.');
      
    } catch (error) {
      console.error('Playlist creation failed:', error);
      setError('Failed to create playlist. Make sure the host has Spotify Premium.');
    } finally {
      setPlaylistCreating(false);
    }
  };

  if (!isSessionActive) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-gray-800 rounded-xl p-8">
          <Music className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Active Session</h2>
          <p className="text-gray-400">Start a barkada session first to see your group's music analytics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <BarChart3 className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl font-bold text-white">Barkada Music Analytics</h1>
        </div>
        <p className="text-gray-300">
          Discover your group's musical chemistry with {users.length} friends
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Analysis Trigger */}
      {!hasAnalysis && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-center text-white">
          <Sparkles className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Ready to Analyze Your Group's Music?</h2>
          <p className="text-lg opacity-90 mb-6">
            We'll analyze everyone's Spotify data to find shared favorites, compatibility scores, and more!
          </p>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center space-x-2 mx-auto"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                <span>Analyzing Music...</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5" />
                <span>Analyze Our Music! 🎵</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="bg-gray-800 rounded-xl p-8 text-center">
          <div className="animate-spin text-6xl mb-4">🎵</div>
          <h3 className="text-xl font-bold text-white mb-2">Analyzing Your Barkada's Music...</h3>
          <p className="text-gray-400">This might take a few seconds as we process everyone's data</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {hasAnalysis && combinedData && (
        <div className="space-y-6">
          {/* Compatibility Score */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Group Compatibility</h3>
                <div className="text-5xl font-bold">{combinedData.summary?.compatibilityScore || 0}%</div>
                <p className="text-lg opacity-90">Musical chemistry score</p>
              </div>
              <Heart className="w-16 h-16 opacity-50" />
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-white">{combinedData.summary?.sharedTracksCount || 0}</div>
              <div className="text-gray-400">Shared Tracks</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-white">{combinedData.topGenres?.length || 0}</div>
              <div className="text-gray-400">Common Genres</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-white">{combinedData.groupArtists?.length || 0}</div>
              <div className="text-gray-400">Shared Artists</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-white">{combinedData.summary?.diversityScore || 0}</div>
              <div className="text-gray-400">Diversity Score</div>
            </div>
          </div>

          {/* Shared Tracks */}
          {combinedData.sharedTracks && combinedData.sharedTracks.length > 0 && (
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Heart className="w-6 h-6 text-red-500" />
                  <span>Your Group's Shared Favorites</span>
                </h3>
                <button
                  onClick={handleCreatePlaylist}
                  disabled={playlistCreating}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                >
                  {playlistCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create Playlist</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="space-y-3">
                {combinedData.sharedTracks.slice(0, 10).map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                    <span className="text-2xl font-bold text-purple-400 w-8">#{index + 1}</span>
                    <img 
                      src={item.track?.album?.images?.[2]?.url || '/api/placeholder/64/64'} 
                      alt={item.track?.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-white">{item.track?.name || 'Unknown Track'}</p>
                      <p className="text-gray-400">{item.track?.artists?.[0]?.name || 'Unknown Artist'}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {item.count} friends love this
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Genres */}
          {combinedData.topGenres && combinedData.topGenres.length > 0 && (
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Music className="w-6 h-6 text-blue-500" />
                <span>Your Group's Favorite Genres</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {combinedData.topGenres.slice(0, 10).map((genre, index) => (
                  <div key={index} className="bg-gray-700 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-white">{genre.count}</div>
                    <div className="text-gray-400 text-sm capitalize">{genre.genre}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group Artists */}
          {combinedData.groupArtists && combinedData.groupArtists.length > 0 && (
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Users className="w-6 h-6 text-purple-500" />
                <span>Artists You All Love</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {combinedData.groupArtists.slice(0, 8).map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-700 rounded-lg">
                    <img 
                      src={item.artist?.images?.[2]?.url || '/api/placeholder/48/48'} 
                      alt={item.artist?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-white">{item.artist?.name || 'Unknown Artist'}</p>
                      <p className="text-gray-400 text-sm">{item.count} friends listen to this artist</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fun Insights */}
          {combinedData.insights && combinedData.insights.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <Sparkles className="w-6 h-6" />
                <span>Barkada Insights</span>
              </h3>
              <div className="space-y-3">
                {combinedData.insights.map((insight, index) => (
                  <div key={index} className="bg-white bg-opacity-20 p-4 rounded-lg">
                    <p className="text-lg">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleAnalyze}
              className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              <TrendingUp className="w-5 h-5" />
              <span>Refresh Analysis</span>
            </button>
            
            <button
              onClick={() => {
                const data = JSON.stringify(combinedData, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `barkada-analysis-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Export Data</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarkadaAnalytics;
