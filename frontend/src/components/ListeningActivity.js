import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Headphones } from 'lucide-react';

const ListeningActivity = ({ recentlyPlayed }) => {
  if (!recentlyPlayed || !recentlyPlayed.items) {
    return (
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">⏰ Recent Activity</h2>
        <div className="text-gray-400 text-center py-8">
          No recent activity data available
        </div>
      </div>
    );
  }

  const formatPlayTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getListeningStats = () => {
    const tracks = recentlyPlayed.items;
    const uniqueTracks = new Set(tracks.map(item => item.track.id)).size;
    const uniqueArtists = new Set(tracks.flatMap(item => item.track.artists.map(artist => artist.name))).size;
    
    // Calculate listening time (rough estimate)
    const totalDuration = tracks.reduce((sum, item) => sum + (item.track.duration_ms || 0), 0);
    const avgDuration = totalDuration / tracks.length;
    const estimatedListeningTime = Math.round((avgDuration * tracks.length) / 60000); // in minutes
    
    return {
      uniqueTracks,
      uniqueArtists,
      estimatedListeningTime,
      totalPlays: tracks.length
    };
  };

  const stats = getListeningStats();

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">⏰ Recent Activity</h2>
        <span className="text-sm text-gray-400">Last 50 tracks</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-purple-400 mb-1">
            <Headphones className="w-5 h-5 mx-auto" />
          </div>
          <div className="text-white font-bold text-lg">{stats.totalPlays}</div>
          <div className="text-gray-400 text-xs">Total Plays</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-cyan-400 mb-1">
            <Clock className="w-5 h-5 mx-auto" />
          </div>
          <div className="text-white font-bold text-lg">{stats.estimatedListeningTime}m</div>
          <div className="text-gray-400 text-xs">Listening Time</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-green-400 mb-1">
            <Calendar className="w-5 h-5 mx-auto" />
          </div>
          <div className="text-white font-bold text-lg">{stats.uniqueTracks}</div>
          <div className="text-gray-400 text-xs">Unique Tracks</div>
        </div>
      </div>

      {/* Recent Tracks List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {recentlyPlayed.items.slice(0, 10).map((item, index) => (
          <motion.div
            key={`${item.track.id}-${item.played_at}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {/* Album Art */}
            <img
              src={item.track.album?.images?.[2]?.url || item.track.album?.images?.[0]?.url}
              alt={item.track.name}
              className="w-10 h-10 rounded-lg object-cover"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzc0MTUxIiByeD0iNCIvPgo8cGF0aCBkPSJNMjAgMjZjMy4zIDAgNi0yLjcgNi02cy0yLjctNi02LTYtNiAyLjctNiA2IDIuNyA2IDYgNnptMC04YzEuMSAwIDIgLjkgMiAycy0uOSAyLTIgMi0yLS45LTItMiAuOS0yIDItMnoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cg==';
              }}
            />

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">
                {item.track.name}
              </div>
              <div className="text-gray-400 text-xs truncate">
                {item.track.artists?.map(artist => artist.name).join(', ')}
              </div>
            </div>

            {/* Play Time */}
            <div className="text-gray-400 text-xs whitespace-nowrap">
              {formatPlayTime(item.played_at)}
            </div>
          </motion.div>
        ))}
      </div>

      {/* View More */}
      {recentlyPlayed.items.length > 10 && (
        <div className="mt-4 text-center">
          <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
            View all recent tracks →
          </button>
        </div>
      )}
    </div>
  );
};

export default ListeningActivity;