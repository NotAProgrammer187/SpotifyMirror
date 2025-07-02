import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Users } from 'lucide-react';

const TopArtists = ({ artists, timeRange }) => {
  if (!artists || !artists.items) {
    return (
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">🎤 Top Artists</h2>
        <div className="text-gray-400 text-center py-8">
          No artist data available
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

  const formatFollowers = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">🎤 Top Artists</h2>
        <span className="text-sm text-gray-400">{getTimeRangeText(timeRange)}</span>
      </div>

      <div className="space-y-3">
        {artists.items.slice(0, 10).map((artist, index) => (
          <motion.div
            key={artist.id}
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

            {/* Artist Image */}
            <div className="relative">
              <img
                src={artist.images?.[2]?.url || artist.images?.[0]?.url}
                alt={artist.name}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA0OCA0OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiMzNzQxNTEiLz4KPHBhdGggZD0iTTI0IDI4YzIuMiAwIDQtMS44IDQtNHMtMS44LTQtNC00LTQgMS44LTQgNCAxLjggNCA0IDR6bTAtMTBjMS4xIDAgMiAuOSAyIDJzLS45IDItMiAyLTItLjktMi0yIC45LTIgMi0yeiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                }}
              />
              {/* Verified badge for popular artists */}
              {artist.followers?.total > 1000000 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>

            {/* Artist Info */}
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium truncate">
                {artist.name}
              </div>
              <div className="text-gray-400 text-sm flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{formatFollowers(artist.followers?.total || 0)} followers</span>
              </div>
            </div>

            {/* Genres */}
            <div className="hidden md:flex flex-col items-end">
              <div className="text-xs text-gray-400">
                {artist.genres?.slice(0, 2).join(', ') || 'No genre data'}
              </div>
              {/* Popularity */}
              <div className="flex items-center space-x-1 mt-1">
                <div className="w-12 bg-gray-700 rounded-full h-1">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full"
                    style={{ width: `${artist.popularity}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-6 text-right">
                  {artist.popularity}
                </span>
              </div>
            </div>

            {/* External Link */}
            <a
              href={artist.external_urls?.spotify}
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
      {artists.items.length > 10 && (
        <div className="mt-4 text-center">
          <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
            View all artists →
          </button>
        </div>
      )}
    </div>
  );
};

export default TopArtists;