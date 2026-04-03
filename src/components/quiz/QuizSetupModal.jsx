import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, AlertCircle, Check } from 'lucide-react';
import Button from '../common/Button';

function QuizSetupModal({
  isOpen,
  maxChapters,
  availableChapters, // Array of { index, title } for visited chapters
  onClose,
  onStart,
  isGenerating,
  error,
}) {
  const [selectedChapterIndices, setSelectedChapterIndices] = useState([]);

  // Initialize with all available chapters selected
  useEffect(() => {
    if (isOpen && availableChapters?.length > 0) {
      setSelectedChapterIndices(availableChapters.map(ch => ch.index));
    }
  }, [isOpen, availableChapters]);

  const handleToggleChapter = (index) => {
    setSelectedChapterIndices(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index].sort((a, b) => a - b);
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedChapterIndices(availableChapters.map(ch => ch.index));
  };

  const handleDeselectAll = () => {
    setSelectedChapterIndices([]);
  };

  const handleStart = () => {
    if (selectedChapterIndices.length > 0) {
      onStart(selectedChapterIndices);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const contentVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', damping: 25, stiffness: 300 },
    },
    exit: { opacity: 0, scale: 0.9, y: 20 },
  };

  if (maxChapters === 0 || !availableChapters || availableChapters.length === 0) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              variants={contentVariants}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-8 rounded-2xl max-w-md w-full text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-heading font-bold text-white mb-2">
                No Chapters Yet
              </h3>
              <p className="text-white/60 mb-6">
                Complete at least one chapter before taking a quiz.
              </p>
              <Button onClick={onClose} variant="secondary">
                Got it
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            variants={contentVariants}
            onClick={(e) => e.stopPropagation()}
            className="glass-card p-8 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center"
              >
                <Zap className="w-8 h-8 text-white" fill="currentColor" />
              </motion.div>
              <h3 className="text-2xl font-heading font-bold text-white mb-2">
                Start an Adaptive Quiz!
              </h3>
              <p className="text-white/60">
                Select which chapters you want to be quizzed on
              </p>
            </div>

            {/* Chapter selection */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Select all / deselect all */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-white/60">
                  {selectedChapterIndices.length} of {availableChapters.length} chapters selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-xs text-accent-primary hover:text-accent-primary/80 transition-colors"
                    disabled={isGenerating}
                  >
                    Select All
                  </button>
                  <span className="text-white/30">|</span>
                  <button
                    onClick={handleDeselectAll}
                    className="text-xs text-white/60 hover:text-white/80 transition-colors"
                    disabled={isGenerating}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Chapter list */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar mb-4">
                {availableChapters.map((chapter, idx) => {
                  const isSelected = selectedChapterIndices.includes(chapter.index);
                  return (
                    <motion.button
                      key={chapter.index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleToggleChapter(chapter.index)}
                      disabled={isGenerating}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                        isSelected
                          ? 'bg-accent-primary/20 border border-accent-primary/40'
                          : 'bg-white/5 border border-transparent hover:bg-white/10'
                      } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-accent-primary text-white'
                            : 'bg-white/10 border border-white/20'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>

                      {/* Chapter info */}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-white/40 block">
                          Chapter {chapter.index + 1}
                        </span>
                        <span className="text-sm text-white truncate block">
                          {chapter.title}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Info note */}
              {/* <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 mb-4">
                <BookOpen className="w-5 h-5 text-accent-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-white/60">
                  Each chapter adds 3 questions. Total:{' '}
                  <span className="text-white font-medium">
                    {selectedChapterIndices.length * 3} questions
                  </span>
                </p>
              </div> */}
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30"
              >
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Start button */}
            <Button
              onClick={handleStart}
              size="lg"
              fullWidth
              glow
              isLoading={isGenerating}
              disabled={selectedChapterIndices.length === 0}
              icon={Zap}
              iconPosition="right"
            >
              {selectedChapterIndices.length === 0
                ? 'Select at least one chapter'
                : `Start Quiz questions)`}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default QuizSetupModal;
