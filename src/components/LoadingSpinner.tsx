import React, { memo } from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = memo(() => {
  return (
    <div className="flex items-center justify-center min-h-64">
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 1,
          ease: 'linear'
        }}
      >
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full" />
      </motion.div>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;