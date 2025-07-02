import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Play } from 'lucide-react';

const TopTracks = ({ tracks, timeRange }) => {
  if (!tracks || !tracks.items) {
    return (
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">🎵 Top Tracks</h2>
        <div className="text-gray-400 text-center py-8">
          No track data available
        </div>
      </div>
    );
  }

  const getTimeRangeText = (range) => {
    switch (range) {
      case 'short_term': return 'Last 4 weeks';
      case 'medium_term': return 'Last 6 months';
      case 'long_term': return 'All time';
      default: return 'Last 6 months';
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">🎵 Top Tracks</h2>
        <span className="text-sm text-gray-400">{getTimeRangeText(timeRange)}</span>
      </div>

      <div className="space-y-3">
        {tracks.items.slice(0, 10).map((track, index) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
          >
            {/* Rank */}
            <div className="w-6 text-center">
              <span className="text-sm font-bold text-gray-400">
                {index + 1}
              </span>
            </div>

            {/* Album Art */}
            <div className="relative">
              <img
                src={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url}
                alt={track.name}
                className="w-12 h-12 rounded-lg object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA0OCA0OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzc0MTUxIiByeD0iOCIvPgo8cGF0aCBkPSJNMjQgMzJjNC40IDAgOC0zLjYgOC04cy0zLjYtOC04LTgtOCAzLjYtOCA4IDMuNiA4IDggOHptMC0xMmMyLjIgMCA0IDEuOCA0IDRzLTEuOCA0LTQgNC00LTEuOC00LTQgMS44LTQgNC00eiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                }}
              />
              {/* Play button overlay */}
              <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium truncate">
                {track.name}
              </div>
              <div className="text-gray-400 text-sm truncate">
                {track.artists?.map(artist => artist.name).join(', ')}
              </div>
            </div>

            {/* Popularity */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-16 bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-400 h-1.5 rounded-full"
                  style={{ width: `${track.popularity}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8 text-right">
                {track.popularity}
              </span>
            </div>

            {/* External Link */}
            <a
              href={track.external_urls?.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
              title="Open in Spotify"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>
        ))}
      </div>

      {/* View More */}
      {tracks.items.length > 10 && (
        <div className="mt-4 text-center">
          <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
            View all {tracks.total} tracks →
          </button>
        </div>
      )}
    </div>
  );
};

export default TopTracks;