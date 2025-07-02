import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const GenreChart = ({ genreData }) => {
  if (!genreData || !genreData.topGenres || genreData.topGenres.length === 0) {
    return (
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">🎭 Genre Breakdown</h2>
        <div className="text-gray-400 text-center py-8">
          No genre data available
        </div>
      </div>
    );
  }

  // Prepare data for chart
  const chartData = genreData.topGenres.slice(0, 8).map((item, index) => ({
    name: item.genre,
    value: parseInt(item.count),
    percentage: parseFloat(item.percentage)
  }));

  // Color palette for genres
  const COLORS = [
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#10B981', // Green
    '#F59E0B', // Orange
    '#EF4444', // Red
    '#3B82F6', // Blue
    '#6366F1'  // Indigo
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-gray-300 text-sm">
            {data.value} artists ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-400 truncate max-w-20">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">🎭 Genre Breakdown</h2>
        <span className="text-sm text-gray-400">
          {genreData.totalGenres} total genres
        </span>
      </div>

      {/* Chart */}
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Genre List */}
      <div className="space-y-2">
        {genreData.topGenres.slice(0, 5).map((genre, index) => (
          <div key={genre.genre} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-gray-300 text-sm capitalize">
                {genre.genre}
              </span>
            </div>
            <span className="text-gray-400 text-sm">
              {genre.percentage}%
            </span>
          </div>
        ))}
      </div>

      {/* Diversity Score */}
      {genreData.diversityScore && (
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Diversity Score</span>
            <span className="text-white font-medium">
              {genreData.diversityScore}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${genreData.diversityScore}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {parseFloat(genreData.diversityScore) > 50 
              ? "Very diverse taste!" 
              : "You have focused preferences"}
          </p>
        </div>
      )}
    </div>
  );
};

export default GenreChart;