import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Brain, Sparkles, BookOpen, FileQuestion } from 'lucide-react';

const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

const pulseVariants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const floatVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Loading type presets
const LOADING_TYPES = {
  default: {
    icon: Loader2,
    text: 'Loading...',
    color: 'accent-primary',
  },
  analyzing: {
    icon: Brain,
    text: 'Analyzing your course topic...',
    color: 'accent-secondary',
  },
  generating: {
    icon: Sparkles,
    text: 'Generating content...',
    color: 'accent-tertiary',
  },
  chapter: {
    icon: BookOpen,
    text: 'Loading chapter content...',
    color: 'accent-primary',
  },
  quiz: {
    icon: FileQuestion,
    text: 'Generating adaptive quiz...',
    color: 'accent-secondary',
  },
};

function LoadingSpinner({
  type = 'default',
  text,
  fullScreen = false,
  size = 'md',
  showText = true,
}) {
  const config = LOADING_TYPES[type] || LOADING_TYPES.default;
  const Icon = config.icon;
  const displayText = text || config.text;

  const sizeClasses = {
    sm: { icon: 'w-6 h-6', text: 'text-sm', container: 'gap-2' },
    md: { icon: 'w-10 h-10', text: 'text-base', container: 'gap-4' },
    lg: { icon: 'w-16 h-16', text: 'text-lg', container: 'gap-6' },
    xl: { icon: 'w-24 h-24', text: 'text-xl', container: 'gap-8' },
  };

  const sizeConfig = sizeClasses[size] || sizeClasses.md;

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center ${sizeConfig.container}`}
    >
      {/* Animated icon with glow */}
      <div className="relative">
        {/* Glow effect */}
        <motion.div
          variants={pulseVariants}
          animate="animate"
          className={`absolute inset-0 ${sizeConfig.icon} rounded-full bg-${config.color} blur-xl`}
        />
        
        {/* Spinning icon */}
        <motion.div
          variants={type === 'default' ? spinnerVariants : floatVariants}
          animate="animate"
          className="relative"
        >
          <Icon
            className={`${sizeConfig.icon} text-${config.color}`}
            strokeWidth={1.5}
          />
        </motion.div>
      </div>

      {/* Loading text */}
      {showText && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${sizeConfig.text} text-white/70 text-center font-medium`}
        >
          {displayText}
        </motion.p>
      )}

      {/* Animated dots */}
      {showText && (
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className={`w-2 h-2 rounded-full bg-${config.color}`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center gradient-mesh">
        <div className="glass-card p-12 rounded-2xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

// Simple inline spinner
export function InlineSpinner({ className = '', size = 'sm' }) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <motion.div
      variants={spinnerVariants}
      animate="animate"
      className={`${sizeClasses[size]} ${className}`}
    >
      <Loader2 className="w-full h-full" />
    </motion.div>
  );
}

export default LoadingSpinner;
