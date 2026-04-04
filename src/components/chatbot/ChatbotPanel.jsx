import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Sparkles } from 'lucide-react';
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
        damping: 28,
        stiffness: 180,
      },
    },
    exit: {
      x: '100%',
      opacity: 0,
      transition: { duration: 0.25, ease: 'easeIn' },
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] lg:w-[28vw] lg:min-w-[400px] lg:max-w-[520px] bg-white border-l border-neutral-200 flex flex-col shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 text-sm">
                    AI Assistant
                  </h3>
                  <p className="text-[11px] text-neutral-500 truncate max-w-[180px]">
                    {contextInfo.chapterTitle || 'Ready to help'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
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
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-neutral-50">
              {/* Welcome message if no messages */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center py-12"
                >
                  <motion.div 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center shadow-sm"
                  >
                    <span className="text-2xl">✨</span>
                  </motion.div>
                  <h4 className="font-medium text-neutral-900 mb-2">
                    How can I help?
                  </h4>
                  <p className="text-sm text-neutral-500 max-w-[280px] mx-auto leading-relaxed">
                    Ask me anything about your course content. I can explain concepts, create visualizations, and help you learn.
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
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div className="bg-white border border-neutral-200 px-4 py-3 rounded-2xl rounded-tl-md shadow-sm">
                      <div className="typing-indicator-minimal">
                        <span />
                        <span />
                        <span />
                      </div>
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
                  <p className="text-red-500 text-sm">{error}</p>
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
