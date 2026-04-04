import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

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
      className="px-5 py-4 border-t border-white/[0.06] bg-[#0a0a0f]/80"
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
              bg-white/[0.03] border border-white/[0.08]
              text-white text-sm placeholder:text-white/25
              focus:outline-none focus:border-white/20 focus:bg-white/[0.04]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            `}
            style={{ maxHeight: '120px' }}
          />
        </div>

        {/* Send button - minimalist */}
        <motion.button
          type="submit"
          disabled={!canSend}
          whileHover={canSend ? { scale: 1.05 } : undefined}
          whileTap={canSend ? { scale: 0.95 } : undefined}
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
            transition-all duration-200
            ${canSend
              ? 'bg-white/90 text-[#0a0a0f]'
              : 'bg-white/[0.06] text-white/20 cursor-not-allowed'
            }
          `}
          aria-label="Send message"
        >
          <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
        </motion.button>
      </div>

      {/* Hint text */}
      <p className="text-[10px] text-white/20 mt-2.5 text-center">
        Enter to send · Shift+Enter for new line
      </p>
    </form>
  );
}

export default ChatInput;
