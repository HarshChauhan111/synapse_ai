import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot } from 'lucide-react';

function ChatMessage({ message }) {
  const { role, content, timestamp } = message;
  const isUser = role === 'user';

  const messageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`
          flex gap-2 max-w-[85%]
          ${isUser ? 'flex-row-reverse' : 'flex-row'}
        `}
      >
        {/* Avatar */}
        <div
          className={`
            w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
            ${isUser
              ? 'bg-gradient-to-br from-accent-primary to-accent-secondary'
              : 'bg-white/10'
            }
          `}
        >
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-accent-primary" />
          )}
        </div>

        {/* Message bubble */}
        <div
          className={`
            px-4 py-3 rounded-2xl
            ${isUser
              ? 'bg-gradient-to-br from-accent-primary to-accent-secondary text-white rounded-br-md'
              : 'glass-card text-white/90 rounded-bl-md'
            }
          `}
        >
          {/* Content */}
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          ) : (
            <div className="text-sm leading-relaxed markdown-content prose prose-sm prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          )}

          {/* Timestamp */}
          <p
            className={`
              text-[10px] mt-1
              ${isUser ? 'text-white/60 text-right' : 'text-white/40'}
            `}
          >
            {formatTime(timestamp)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default ChatMessage;
