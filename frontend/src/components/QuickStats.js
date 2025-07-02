import React from 'react';
import { motion } from 'framer-motion';
import { Music, Users, TrendingUp, Clock, Heart, PlayCircle, Calendar, Headphones } from 'lucide-react';

const QuickStats = ({ data }) => {
  // Extract quick stats from dashboard data
  const getQuickStats = () => {
    const stats = [];

    // Total tracks in top list
    if (data.topTracks?.items) {
      stats.push({
        icon: <Music className="w-5 h-5" />,
        label: 'Top Tracks',
        value: data.topTracks.items.length,
        color: 'purple',
        description: 'In your favorites'
      });
    }

    // Total artists
    if (data.topArtists?.items) {
      stats.push({
        icon: <Users className="w-5 h-5" />,
        label: 'Top Artists',
        value: data.topArtists.items.length,
        color: 'pink',
        description: 'You listen to'
      });
    }

    // Total genres
    if (data.genreBreakdown?.totalGenres) {
      stats.push({
        icon: <TrendingUp className="w-5 h-5" />,
        label: 'Genres',
        value: data.genreBreakdown.totalGenres,
        color: 'cyan',
        description: 'In your taste'
      });
    }

    // Recent listening activity
    if (data.recentlyPlayed?.items) {
      stats.push({
        icon: <Clock className="w-5 h-5" />,
        label: 'Recent Tracks',
        value: data.recentlyPlayed.items.length,
        color: 'green',
        description: 'Played recently'
      });
    }

    // Average track popularity (if available)
    if (data.topTracks?.items) {
      const avgPopularity = Math.round(
        data.topTracks.items.reduce((sum, track) => sum + (track.popularity || 0), 0) / 
        data.topTracks.items.length
      );
      stats.push({
        icon: <Heart className="w-5 h-5" />,
        label: 'Popularity',
        value: `${avgPopularity}%`,
        color: 'orange',
        description: 'Average track rating'
      });
    }

    // Mood indicator (if available)
    if (data.moodAnalysis?.overallMood) {
      const moodEmojis = {
        'Energetic & Happy': '🎉',
        'Happy & Calm': '😌',
        'Energetic & Intense': '🔥',
        'Calm & Melancholic': '🌙'
      };
      
      stats.push({
        icon: <PlayCircle className="w-5 h-5" />,
        label: 'Mood',
        value: moodEmojis[data.moodAnalysis.overallMood] || '🎵',
        color: 'indigo',
        description: data.moodAnalysis.overallMood
      });
    }

    return stats.slice(0, 6); // Show max 6 stats
  };

  const quickStats = getQuickStats();

  const colorClasses = {
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
    cyan: 'from-cyan-500 to-cyan-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    indigo: 'from-indigo-500 to-indigo-600',
    blue: 'from-blue-500 to-blue-600'
  };

  if (quickStats.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {quickStats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="glass rounded-xl p-4 relative overflow-hidden group cursor-pointer"
        >
          {/* Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[stat.color]} opacity-5 group-hover:opacity-15 transition-opacity duration-300`}></div>
          
          <div className="relative z-10">
            {/* Icon */}
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[stat.color]} text-white mb-3`}>
              {stat.icon}
            </div>

            {/* Value */}
            <div className="text-2xl font-bold text-white mb-1">
              {stat.value}
            </div>

            {/* Label */}
            <div className="text-gray-300 font-medium text-sm mb-1">
              {stat.label}
            </div>

            {/* Description */}
            <div className="text-xs text-gray-400">
              {stat.description}
            </div>
          </div>

          {/* Hover Effect */}
          <div className="absolute inset-0 border border-transparent group-hover:border-white/10 rounded-xl transition-colors duration-300"></div>
        </motion.div>
      ))}
    </div>
  );
};

export default QuickStats;