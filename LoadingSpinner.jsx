import React from 'react';
import { motion } from 'framer-motion';

export const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <motion.div
        className={`${sizeClasses[size]} rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-600`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {message && <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>}
    </div>
  );
};

export const SkeletonLoader = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    ))}
  </div>
);

export default LoadingSpinner;
