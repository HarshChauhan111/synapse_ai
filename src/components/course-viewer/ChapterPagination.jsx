import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

// Page button with hover animation
function PageButton({ children, onClick, disabled }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        h-10 w-10 sm:h-14 sm:w-14 rounded-lg sm:rounded-xl flex items-center justify-center 
        text-neutral-500 hover:text-neutral-700 
        border border-neutral-200 bg-white shadow-[0_4px_10px_rgba(0,0,0,0.08)]
        transition-colors duration-200
        disabled:opacity-40 disabled:cursor-not-allowed
      `}
      whileHover={!disabled ? {
        scale: 1.08,
        y: -4,
        boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
      } : undefined}
      whileTap={!disabled ? { scale: 0.92 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {children}
    </motion.button>
  );
}

function ChapterPagination({
  totalChapters,
  currentChapter,
  visitedChapters,
  onNavigate,
  isGenerating,
}) {
  const canGoBack = currentChapter > 0;
  const canGoForward = currentChapter < totalChapters - 1;

  const paginate = (index) => {
    if (!isGenerating && index >= 0 && index < totalChapters) {
      onNavigate(index);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white border-t border-neutral-200 mt-8"
    >
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {/* Previous button */}
          <PageButton 
            onClick={() => paginate(currentChapter - 1)}
            disabled={!canGoBack || isGenerating}
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </PageButton>

          {/* Chapter buttons */}
          <div className="relative flex gap-1.5 sm:gap-2.5 overflow-x-auto py-1 px-2 max-w-[70%]">
            {Array.from({ length: totalChapters }).map((_, index) => {
              const isVisited = visitedChapters.includes(index);
              const isCurrent = index === currentChapter;

              return (
                <motion.button
                  key={index}
                  onClick={() => paginate(index)}
                  disabled={isGenerating}
                  className={`
                    relative z-10 h-10 w-10 sm:h-14 sm:w-14 rounded-lg sm:rounded-xl 
                    flex items-center justify-center text-sm font-medium 
                    transition-colors duration-300 
                    border border-neutral-200 shadow-[0_4px_10px_rgba(0,0,0,0.08)]
                    disabled:cursor-not-allowed
                    ${isCurrent
                      ? "text-white"
                      : isVisited
                        ? "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100"
                        : "text-neutral-500 hover:text-neutral-800 bg-white"
                    }
                  `}
                  whileHover={!isCurrent && !isGenerating ? {
                    y: -4,
                    boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
                  } : undefined}
                  whileTap={!isGenerating ? { scale: 0.92 } : undefined}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  aria-label={`Go to chapter ${index + 1}`}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {/* Active background with animation */}
                  <AnimatePresence>
                    {isCurrent && (
                      <motion.div
                        layoutId="active-chapter-bg"
                        className="absolute inset-0 rounded-lg sm:rounded-xl overflow-hidden"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 220, damping: 24, mass: 0.8 }}
                      >
                        {/* Dark gradient background */}
                        <div
                          className="absolute inset-0 rounded-lg sm:rounded-xl"
                          style={{
                            background: `linear-gradient(135deg, #2a2a2e 0%, #1a1a1c 50%, #0a0a0c 100%)`,
                            border: `1px solid #3a3a3e`,
                            boxShadow: `
                              0 8px 16px -4px rgba(0,0,0,0.5),
                              inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)
                            `,
                          }}
                        />
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/10 to-transparent skew-x-12"
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatDelay: 5,
                            ease: "easeInOut",
                          }}
                        />
                        {/* Inner shadow */}
                        <span
                          className="absolute inset-0 rounded-[inherit] pointer-events-none"
                          style={{
                            boxShadow: "inset 0 -4px 8px 0 rgba(0, 0, 0, 0.4)",
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Content */}
                  <span className="relative z-10 text-base sm:text-lg font-semibold flex items-center justify-center">
                    {isVisited && !isCurrent ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      index + 1
                    )}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Next button */}
          <PageButton
            onClick={() => paginate(currentChapter + 1)}
            disabled={!canGoForward || isGenerating}
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </PageButton>
        </div>

        {/* Chapter info */}
        <div className="text-center mt-2">
          <p className="text-sm text-neutral-500">
            Chapter {currentChapter + 1} of {totalChapters}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default ChapterPagination;
