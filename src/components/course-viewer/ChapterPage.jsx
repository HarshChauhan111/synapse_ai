import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChapterHero from './ChapterHero';
import ChapterContent from './ChapterContent';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';
import { RefreshCw } from 'lucide-react';

function ChapterPage({
  chapterData,
  chapterIndex,
  totalChapters,
  isLoading,
  error,
  onRetry,
}) {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center py-20 bg-neutral-50"
      >
        <div className="text-center space-y-6">
          <LoadingSpinner type="chapter" size="lg" />
          <p className="text-neutral-500">
            Generating Chapter {chapterIndex + 1} content...
          </p>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        key="error"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center py-20 bg-neutral-50"
      >
        <div className="bg-white border border-neutral-200 p-8 rounded-2xl text-center max-w-md shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <span className="text-3xl">😕</span>
          </div>
          <h3 className="text-xl font-heading font-bold text-neutral-900 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-neutral-500 mb-6">{error}</p>
          <Button
            onClick={onRetry}
            icon={RefreshCw}
            variant="primary"
          >
            Retry Chapter
          </Button>
        </div>
      </motion.div>
    );
  }

  // No data state
  if (!chapterData) {
    return (
      <motion.div
        key="no-data"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center py-20 bg-neutral-50"
      >
        <div className="text-center">
          <p className="text-neutral-500">No chapter content available</p>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.article
        key={`chapter-${chapterIndex}`}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.4 }}
        className="bg-white"
      >
        {/* Chapter Hero */}
        <ChapterHero
          chapterData={chapterData}
          chapterIndex={chapterIndex}
          totalChapters={totalChapters}
        />

        {/* Chapter Content */}
        <ChapterContent
          chapterData={chapterData}
          chapterIndex={chapterIndex}
        />
      </motion.article>
    </AnimatePresence>
  );
}

export default ChapterPage;
