import React from 'react';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const containerClasses = {
    small: 'p-4',
    medium: 'p-8',
    large: 'p-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${containerClasses[size]}`}>
      {/* Spinning Music Icon */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
        className={`${sizeClasses[size]} text-purple-400 mb-4`}
      >
        <Music className="w-full h-full" />
      </motion.div>

      {/* Pulsing Dots */}
      <div className="flex space-x-1 mb-4">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2
            }}
            className="w-2 h-2 bg-purple-400 rounded-full"
          />
        ))}
      </div>

      {/* Loading Message */}
      {message && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
          className="text-gray-400 text-sm font-medium"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

// Full screen loading component
export const FullScreenLoader = ({ message = 'Loading your music data...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <LoadingSpinner size="large" message={message} />
      </div>
    </div>
  );
};

export default LoadingSpinner;