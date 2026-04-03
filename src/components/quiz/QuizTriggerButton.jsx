import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

function QuizTriggerButton({ onClick, disabled }) {
  return (
    <motion.button
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1.2, type: 'spring' }}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05, x: 4 }}
      whileTap={{ scale: 0.95 }}
      className={`
        fixed left-6 bottom-24 z-40
        flex items-center gap-2 px-4 py-3 rounded-xl
        bg-gradient-to-r from-amber-500 to-orange-500
        text-white font-medium shadow-lg shadow-amber-500/30
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
      `}
      aria-label="Start a quick quiz"
    >
      {/* Pulse effect */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-amber-500"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Content */}
      <span className="relative flex items-center gap-2">
        <Zap className="w-5 h-5" fill="currentColor" />
        <span>Quick Quiz</span>
      </span>

      {/* Bounce animation */}
      <motion.div
        className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white"
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.button>
  );
}

export default QuizTriggerButton;
