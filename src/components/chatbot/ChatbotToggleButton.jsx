import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronLeft } from 'lucide-react';

function ChatbotToggleButton({ isOpen, onClick }) {
  return (
    <motion.button
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1, type: 'spring' }}
      onClick={onClick}
      className={`
        fixed right-0 top-1/2 -translate-y-1/2 z-50
        flex items-center gap-2
        ${isOpen ? 'translate-x-full' : 'translate-x-0'}
        transition-transform duration-300
      `}
      aria-label={isOpen ? 'Close AI Tutor' : 'Open AI Tutor'}
    >
      <motion.div
        whileHover={{ x: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative bg-white/5 backdrop-blur-xl border border-white/10 py-5 px-2.5 rounded-l-xl shadow-lg"
      >
        {/* Subtle accent line */}
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-full bg-gradient-to-b from-accent-primary/60 to-accent-secondary/60"
          animate={{
            opacity: [0.5, 1, 0.5],
            height: ['24px', '32px', '24px'],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Icon and text */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Sparkles className="w-4 h-4 text-white/70" />
          </motion.div>
          <span
            className="text-[10px] font-medium text-white/60 tracking-wide"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            Ask AI
          </span>
        </div>

        {/* Arrow indicator */}
        <motion.div
          animate={{ x: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5"
        >
          <ChevronLeft className="w-3 h-3 text-white/40" />
        </motion.div>
      </motion.div>
    </motion.button>
  );
}

export default ChatbotToggleButton;
