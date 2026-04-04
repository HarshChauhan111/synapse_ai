import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

function ChapterPagination({
  totalChapters,
  currentChapter,
  visitedChapters,
  onNavigate,
  isGenerating,
}) {
  const canGoBack = currentChapter > 0;
  const canGoForward = currentChapter < totalChapters - 1;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 shadow-lg"
    >
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Previous button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => canGoBack && onNavigate(currentChapter - 1)}
            disabled={!canGoBack || isGenerating}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center
              transition-all duration-200
              ${canGoBack && !isGenerating
                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                : 'bg-neutral-50 text-neutral-300 cursor-not-allowed'
              }
            `}
            aria-label="Previous chapter"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          {/* Chapter dots */}
          <div className="flex items-center gap-2 overflow-x-auto py-2 px-4 max-w-[70%]">
            {Array.from({ length: totalChapters }, (_, index) => {
              const isVisited = visitedChapters.includes(index);
              const isCurrent = index === currentChapter;


              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => !isGenerating && onNavigate(index)}
                  disabled={isGenerating}
                  className={`
                    relative flex-shrink-0 transition-all duration-300
                    ${isCurrent
                      ? 'w-10 h-10'
                      : 'w-8 h-8 hover:w-9 hover:h-9'
                    }
                  `}
                  aria-label={`Go to chapter ${index + 1}`}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {/* Dot background */}
                  <span
                    className={`
                      absolute inset-0 rounded-full transition-all duration-300
                      ${isCurrent
                        ? 'bg-blue-600'
                        : isVisited
                          ? 'bg-blue-100 border border-blue-300'
                          : 'bg-neutral-100 border border-neutral-200'
                      }
                    `}
                  />

                  {/* Pulse animation for current */}
                  {isCurrent && (
                    <motion.span
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="absolute inset-0 rounded-full bg-blue-600"
                    />
                  )}

                  {/* Content */}
                  <span className="absolute inset-0 flex items-center justify-center">
                    {isVisited && !isCurrent ? (
                      <Check className="w-3 h-3 text-blue-600" />
                    ) : (
                      <span
                        className={`
                          text-xs font-medium
                          ${isCurrent ? 'text-white' : 'text-neutral-500'}
                        `}
                      >
                        {index + 1}
                      </span>
                    )}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Next button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => canGoForward && onNavigate(currentChapter + 1)}
            disabled={!canGoForward || isGenerating}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center
              transition-all duration-200
              ${canGoForward && !isGenerating
                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                : 'bg-neutral-50 text-neutral-300 cursor-not-allowed'
              }
            `}
            aria-label="Next chapter"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
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
