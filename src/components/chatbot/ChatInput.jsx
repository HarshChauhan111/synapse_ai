import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowLeft } from 'lucide-react';

function ChatInput({ onSend, isLoading, disabled, placeholder = 'Ask me anything...' }) {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full px-3 pb-4 sm:px-4">
      <motion.div
        layout
        className="relative flex items-center rounded-2xl border border-neutral-100/50 bg-white p-1.5 shadow-sm transition-colors duration-200 sm:rounded-[28px] sm:p-2"
      >
        {/* Add files button */}
        <button
          title="Add files"
          type="button"
          className="ml-1 flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-500 transition-colors hover:bg-neutral-100 sm:h-12 sm:w-12 sm:rounded-2xl"
        >
          <Plus size={20} className="sm:size-[22px]" strokeWidth={2.5} />
        </button>

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 py-2 text-[15px] text-neutral-700 transition-colors outline-none placeholder:text-neutral-400 sm:px-4 sm:py-3 sm:text-[17px]"
          disabled={isLoading || disabled}
        />

        {/* Send button */}
        <div className="mr-1">
          <button
            title="Send"
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading || disabled}
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 text-black/70 transition-colors hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed sm:h-12 sm:w-12 sm:rounded-2xl"
          >
            <motion.div
              animate={{ rotate: message.length > 0 ? 90 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <ArrowLeft
                size={20}
                className="sm:size-[22px]"
                strokeWidth={2.5}
              />
            </motion.div>
          </button>
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center rounded-[28px] bg-white/60 backdrop-blur-[1px]"
          />
        )}
      </motion.div>
    </div>
  );
}

export default ChatInput;
