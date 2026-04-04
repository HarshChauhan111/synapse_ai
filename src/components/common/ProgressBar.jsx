import React from 'react';
import { motion } from 'framer-motion';

function ProgressBar({
  progress,
  total,
  showLabel = true,
  showPercentage = true,
  size = 'md',
  color = 'blue',
  animated = true,
  className = '',
}) {
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  };

  const colorClasses = {
    'blue': 'from-blue-600 to-blue-500',
    'green': 'from-green-500 to-emerald-400',
    'red': 'from-red-500 to-rose-400',
    'amber': 'from-amber-500 to-yellow-400',
    'indigo': 'from-indigo-600 to-indigo-500',
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-neutral-500">
            {progress} of {total}
          </span>
          {showPercentage && (
            <span className="text-sm font-medium text-neutral-700">
              {percentage}%
            </span>
          )}
        </div>
      )}

      {/* Progress bar container */}
      <div
        className={`w-full ${sizeClasses[size]} bg-neutral-200 rounded-full overflow-hidden`}
      >
        {/* Progress fill */}
        <motion.div
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${percentage}%` }}
          transition={
            animated
              ? { duration: 0.5, ease: 'easeOut' }
              : { duration: 0 }
          }
          className={`h-full bg-gradient-to-r ${colorClasses[color] || colorClasses.blue} rounded-full relative`}
        >
          {/* Shimmer effect */}
          {animated && percentage > 0 && percentage < 100 && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Circular progress variant
export function CircularProgress({
  progress,
  total,
  size = 100,
  strokeWidth = 8,
  color = '#3b82f6',
  showPercentage = true,
  animated = true,
}) {
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e5e5"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animated ? { strokeDashoffset: circumference } : false}
          animate={{ strokeDashoffset: offset }}
          transition={
            animated
              ? { duration: 1, ease: 'easeOut' }
              : { duration: 0 }
          }
          style={{
            filter: `drop-shadow(0 0 8px ${color}50)`,
          }}
        />
      </svg>
      
      {/* Percentage text */}
      {showPercentage && (
        <motion.span
          initial={animated ? { opacity: 0, scale: 0.5 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute text-neutral-900 font-heading font-bold"
          style={{ fontSize: size * 0.2 }}
        >
          {percentage}%
        </motion.span>
      )}
    </div>
  );
}

// Step progress indicator
export function StepProgress({
  steps,
  currentStep,
  className = '',
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        
        return (
          <React.Fragment key={index}>
            {/* Step dot */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative flex items-center justify-center w-8 h-8 rounded-full
                ${isCompleted
                  ? 'bg-blue-600 text-white'
                  : isCurrent
                    ? 'bg-blue-50 border-2 border-blue-600 text-blue-600'
                    : 'bg-neutral-100 text-neutral-400'
                }
              `}
            >
              {isCompleted ? (
                <motion.svg
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
              
              {/* Pulse animation for current step */}
              {isCurrent && (
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-2 border-blue-600"
                />
              )}
            </motion.div>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-neutral-200 relative overflow-hidden">
                {isCompleted && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-blue-600"
                  />
                )}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default ProgressBar;
