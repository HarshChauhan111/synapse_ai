import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Infinity } from 'lucide-react';

function QuizProgress({ current, total, isLoadingMore = false, className = '' }) {
  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {/* Progress text */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-white/60">
          Question {current} of {total}+
        </span>
        <div className="flex items-center gap-2">
          {isLoadingMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 text-xs text-amber-400"
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Loading more...</span>
            </motion.div>
          )}
          <div className="flex items-center gap-1 text-sm text-white/60">
            <Infinity className="w-4 h-4" />
            <span>Continuous</span>
          </div>
        </div>
      </div>

      {/* Progress bar - shows current position */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((current / total) * 100, 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full relative"
        >
          {/* Shimmer effect */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>
      </div>

      {/* Question dots - show max 20 dots */}
      <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap">
        {Array.from({ length: Math.min(total, 20) }, (_, index) => {
          const questionNum = index + 1;
          const isCompleted = questionNum < current;
          const isCurrent = questionNum === current;

          return (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.03 }}
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${isCurrent
                  ? 'w-6 bg-gradient-to-r from-amber-500 to-orange-500'
                  : isCompleted
                    ? 'bg-amber-500/60'
                    : 'bg-white/20'
                }
              `}
            />
          );
        })}
        {total > 20 && (
          <span className="text-xs text-white/40 ml-2">+{total - 20} more</span>
        )}
        {isLoadingMore && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 rounded-full bg-amber-500/40 animate-pulse ml-1"
          />
        )}
      </div>
    </div>
  );
}

export default QuizProgress;
