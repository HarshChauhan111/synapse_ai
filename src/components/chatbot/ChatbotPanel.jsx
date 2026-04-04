import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Sparkles, GripVertical } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { IconButton } from '../common/Button';

// Constants for panel width
const MIN_WIDTH = 320;
const MAX_WIDTH = 700;
const DEFAULT_WIDTH = 420;
const STORAGE_KEY = 'synapse-chatbot-width';

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
  const scrollRef = useRef(null);
  const panelRef = useRef(null);
  const [panelWidth, setPanelWidth] = useState(() => {
    // Load saved width from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? Math.min(Math.max(parseInt(saved, 10), MIN_WIDTH), MAX_WIDTH) : DEFAULT_WIDTH;
    }
    return DEFAULT_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isLoading]);

  // Save width to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, panelWidth.toString());
    }
  }, [panelWidth]);

  // Handle resize drag
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const newWidth = window.innerWidth - e.clientX;
      setPanelWidth(Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

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
            ref={panelRef}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ width: window.innerWidth < 1024 ? '100%' : panelWidth }}
            className="fixed right-0 top-0 bottom-0 z-50 bg-[#F8F9FA] flex flex-col shadow-xl sm:max-w-[100vw]"
          >
            {/* Resize handle (desktop only) */}
            <div
              onMouseDown={handleMouseDown}
              className={`
                absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize 
                hidden lg:flex items-center justify-center
                hover:bg-blue-500/10 transition-colors group
                ${isResizing ? 'bg-blue-500/20' : ''}
              `}
            >
              <div className={`
                w-1 h-12 rounded-full transition-colors
                ${isResizing ? 'bg-blue-500' : 'bg-neutral-300 group-hover:bg-blue-400'}
              `} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#1DA1F2]" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-sm">
                    Synapse AI
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
            <div
              ref={scrollRef}
              className="flex-1 flex flex-col overflow-y-auto px-4"
            >
              {/* Spacer to push messages to bottom */}
              <div className="flex-grow" />
              
              {/* Messages container */}
              <div className="w-full pb-4">
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
                    <h4 className="font-semibold text-neutral-900 mb-2">
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
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="mb-3 flex w-full justify-start"
                  >
                    <div className="px-5 py-3 rounded-[16px] rounded-bl-[4px] border border-sky-400/20 bg-[#1DA1F2] shadow-sky-500/10">
                      <div className="flex items-center gap-1">
                        <motion.span
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 rounded-full bg-white"
                        />
                        <motion.span
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 rounded-full bg-white"
                        />
                        <motion.span
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 rounded-full bg-white"
                        />
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
              </div>
            </div>

            {/* Input area */}
            <div className="bg-[#F8F9FA] pt-2 pb-4">
              <ChatInput
                onSend={onSendMessage}
                isLoading={isLoading}
                disabled={isLoading}
                placeholder="Ask me anything..."
              />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default ChatbotPanel;
