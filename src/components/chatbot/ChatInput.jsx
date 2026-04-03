import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

function ChatInput({ onSend, isLoading, disabled }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSend = message.trim().length > 0 && !isLoading && !disabled;

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border-t border-white/10 bg-dark/50"
    >
      <div className="flex items-end gap-2">
        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this chapter..."
            disabled={disabled}
            rows={1}
            className={`
              w-full px-4 py-3 pr-12 rounded-xl resize-none
              bg-white/5 border border-white/10
              text-white text-sm placeholder:text-white/30
              focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            `}
            style={{ maxHeight: '120px' }}
          />

          {/* Character count (optional) */}
          {message.length > 100 && (
            <span className="absolute right-3 bottom-3 text-xs text-white/30">
              {message.length}/500
            </span>
          )}
        </div>

        {/* Send button */}
        <motion.button
          type="submit"
          disabled={!canSend}
          whileHover={canSend ? { scale: 1.05 } : undefined}
          whileTap={canSend ? { scale: 0.95 } : undefined}
          className={`
            w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
            transition-all duration-200
            ${canSend
              ? 'bg-gradient-to-br from-accent-primary to-accent-secondary text-white shadow-lg shadow-accent-primary/30'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
            }
          `}
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Hint text */}
      <p className="text-xs text-white/30 mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
}

export default ChatInput;
