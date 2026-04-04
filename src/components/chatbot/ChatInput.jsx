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
      className="px-5 py-4 border-t border-neutral-200 bg-white"
    >
      <div className="flex items-end gap-3">
        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            disabled={disabled}
            rows={1}
            className={`
              w-full px-4 py-3 rounded-xl resize-none
              bg-neutral-50 border border-neutral-200
              text-neutral-900 text-sm placeholder:text-neutral-400
              focus:outline-none focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            `}
            style={{ maxHeight: '120px' }}
          />
        </div>

        {/* Send button */}
        <motion.button
          type="submit"
          disabled={!canSend}
          whileHover={canSend ? { scale: 1.05 } : undefined}
          whileTap={canSend ? { scale: 0.95 } : undefined}
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
            transition-all duration-200
            ${canSend
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
            }
          `}
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Hint text */}
      <p className="text-[10px] text-neutral-400 mt-2.5 text-center">
        Enter to send · Shift+Enter for new line
      </p>
    </form>
  );
}

export default ChatInput;
