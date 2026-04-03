import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, BookOpen } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { IconButton } from '../common/Button';

function ChatbotPanel({
  isOpen,
  onClose,
  messages,
  isLoading,
  error,
  contextInfo,
  onSendMessage,
  onClearChat,
}) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const panelVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
      },
    },
    exit: {
      x: '100%',
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[320px] lg:w-[20vw] lg:min-w-[280px] lg:max-w-[400px] glass-card-dark border-l border-white/10 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-sm">
                    AI Tutor
                  </h3>
                  <p className="text-xs text-white/50 truncate max-w-[150px]">
                    {contextInfo.chapterTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <IconButton
                    icon={Trash2}
                    size="sm"
                    variant="ghost"
                    label="Clear chat"
                    onClick={onClearChat}
                  />
                )}
                <IconButton
                  icon={X}
                  size="sm"
                  variant="ghost"
                  label="Close chat"
                  onClick={onClose}
                />
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Welcome message if no messages */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center">
                    <span className="text-3xl">👋</span>
                  </div>
                  <h4 className="font-heading font-bold text-white mb-2">
                    Hi there!
                  </h4>
                  <p className="text-sm text-white/60 max-w-xs mx-auto">
                    I'm your AI tutor for this course. Ask me anything about the
                    current chapter or any topic you're learning!
                  </p>
                </motion.div>
              )}

              {/* Messages */}
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex justify-start"
                >
                  <div className="glass-card px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="typing-indicator">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-2"
                >
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <ChatInput
              onSend={onSendMessage}
              isLoading={isLoading}
              disabled={isLoading}
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default ChatbotPanel;
