import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Heart, Zap, Music, Smile } from 'lucide-react';

const MoodAnalysis = ({ moodData }) => {
  if (!moodData || moodData.error) {
    return (
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">🎭 Mood Analysis</h2>
        <div className="text-gray-400 text-center py-8">
          {moodData?.error || 'No mood data available'}
        </div>
      </div>
    );
  }

  // Prepare data for chart
  const chartData = [
    {
      name: 'Valence',
      value: Math.round(moodData.audioFeatures?.valence * 100) || 0,
      color: '#EC4899',
      icon: <Smile className="w-4 h-4" />
    },
    {
      name: 'Energy',
      value: Math.round(moodData.audioFeatures?.energy * 100) || 0,
      color: '#F59E0B',
      icon: <Zap className="w-4 h-4" />
    },
    {
      name: 'Dance',
      value: Math.round(moodData.audioFeatures?.danceability * 100) || 0,
      color: '#10B981',
      icon: <Music className="w-4 h-4" />
    },
    {
      name: 'Acoustic',
      value: Math.round(moodData.audioFeatures?.acousticness * 100) || 0,
      color: '#06B6D4',
      icon: <Heart className="w-4 h-4" />
    }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.payload.name}</p>
          <p className="text-gray-300 text-sm">{data.value}%</p>
        </div>
      );
    }
    return null;
  };

  const getMoodDescription = (mood) => {
    const descriptions = {
      'Energetic & Happy': '🎉 You love upbeat, positive vibes!',
      'Happy & Calm': '😌 You prefer cheerful, relaxing music',
      'Energetic & Intense': '🔥 High-energy, intense tracks are your thing',
      'Calm & Melancholic': '🌙 Mellow, contemplative music suits you'
    };
    return descriptions[mood] || '🎵 Your music taste is unique!';
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">🎭 Mood Analysis</h2>
        <span className="text-sm text-gray-400">Audio Features</span>
      </div>

      {/* Overall Mood */}
      {moodData.overallMood && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
          <h3 className="text-white font-semibold mb-2">Your Music Mood</h3>
          <p className="text-purple-300 font-medium text-lg">{moodData.overallMood}</p>
          <p className="text-gray-300 text-sm mt-1">
            {getMoodDescription(moodData.overallMood)}
          </p>
        </div>
      )}

      {/* Audio Features Chart */}
      <div className="mb-6">
        <h3 className="text-white font-medium mb-3">Audio Characteristics</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
                fill={(entry) => entry.color}
              >
                {chartData.map((entry, index) => (
                  <Bar key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Breakdown */}
      <div className="space-y-3">
        {chartData.map((feature, index) => (
          <div key={feature.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${feature.color}20`, color: feature.color }}
              >
                {feature.icon}
              </div>
              <span className="text-gray-300 font-medium">{feature.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${feature.value}%`,
                    backgroundColor: feature.color
                  }}
                />
              </div>
              <span className="text-gray-400 text-sm w-8 text-right">
                {feature.value}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {moodData.recommendations && moodData.recommendations.length > 0 && (
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
          <h3 className="text-white font-medium mb-2">💡 Insights</h3>
          <ul className="space-y-1">
            {moodData.recommendations.slice(0, 3).map((rec, index) => (
              <li key={index} className="text-gray-300 text-sm flex items-start space-x-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MoodAnalysis;