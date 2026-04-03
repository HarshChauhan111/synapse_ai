import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ChevronLeft } from 'lucide-react';

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
        whileHover={{ x: -4 }}
        className="relative bg-gradient-to-b from-accent-primary to-accent-secondary py-6 px-3 rounded-l-2xl shadow-lg shadow-accent-primary/30"
      >
        {/* Pulse glow effect */}
        <motion.div
          className="absolute inset-0 rounded-l-2xl bg-accent-primary"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ filter: 'blur(12px)', zIndex: -1 }}
        />

        {/* Icon and text */}
        <div className="flex flex-col items-center gap-2 text-white">
          <MessageCircle className="w-5 h-5" />
          <span
            className="text-xs font-medium writing-mode-vertical"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            AI Tutor
          </span>
        </div>

        {/* Arrow indicator */}
        <motion.div
          animate={{ x: [0, -4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1"
        >
          <ChevronLeft className="w-4 h-4 text-white/70" />
        </motion.div>
      </motion.div>
    </motion.button>
  );
}

export default ChatbotToggleButton;
