import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ icon, title, value, subtitle, color = 'purple' }) => {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
    cyan: 'from-cyan-500 to-cyan-600',
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="glass rounded-xl p-6 relative overflow-hidden group"
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        {/* Icon */}
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} text-white mb-4`}>
          {icon}
        </div>

        {/* Value */}
        <div className="text-3xl font-bold text-white mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>

        {/* Title */}
        <div className="text-gray-300 font-medium mb-1">
          {title}
        </div>

        {/* Subtitle */}
        <div className="text-sm text-gray-400">
          {subtitle}
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;