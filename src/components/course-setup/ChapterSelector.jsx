import React from 'react';
import { motion } from 'framer-motion';
import { BookMarked, Star, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

function ChapterSelector({
  suggestedChapters,
  recommendedChapters,
  selectedCount,
  onSelect,
  onConfirm,
  isLoading,
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  // Descriptions based on chapter count
  const getChapterDescription = (count) => {
    if (count <= 3) return 'Quick introduction';
    if (count <= 5) return 'Balanced overview';
    if (count <= 7) return 'Comprehensive coverage';
    return 'Deep dive mastery';
  };

  // Estimated time based on count
  const getEstimatedTime = (count, duration) => {
    const durationMinutes = parseInt(duration) || 30;
    const totalMinutes = count * durationMinutes;
    if (totalMinutes < 60) return `${totalMinutes} min total`;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return mins > 0 ? `${hours}h ${mins}m total` : `${hours}h total`;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* Section header */}
      <motion.div variants={itemVariants} className="text-center">
        <h3 className="text-xl font-heading font-bold text-white mb-2">
          Choose Your Journey
        </h3>
        <p className="text-white/60 text-sm">
          Select the number of chapters for your course
        </p>
      </motion.div>

      {/* Chapter options grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {suggestedChapters.map((count, index) => {
          const isRecommended = count === recommendedChapters;
          const isSelected = count === selectedCount;

          return (
            <motion.button
              key={count}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(count)}
              disabled={isLoading}
              className={`
                relative p-6 rounded-2xl text-center transition-all duration-300
                ${isSelected
                  ? 'bg-gradient-to-br from-accent-primary to-accent-secondary shadow-lg shadow-accent-primary/20'
                  : 'glass-card hover:border-white/20'
                }
              `}
            >
              {/* Recommended badge */}
              {isRecommended && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-amber-950 text-xs font-bold"
                >
                  <Star className="w-3 h-3" fill="currentColor" />
                  <span>Best</span>
                </motion.div>
              )}

              {/* Chapter count */}
              <div
                className={`
                  text-4xl font-heading font-bold mb-2
                  ${isSelected ? 'text-white' : 'text-gradient'}
                `}
              >
                {count}
              </div>

              {/* Label */}
              <div
                className={`
                  text-sm font-medium mb-1
                  ${isSelected ? 'text-white/90' : 'text-white'}
                `}
              >
                Chapters
              </div>

              {/* Description */}
              <div
                className={`
                  text-xs
                  ${isSelected ? 'text-white/70' : 'text-white/50'}
                `}
              >
                {getChapterDescription(count)}
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  layoutId="chapter-selection"
                  className="absolute inset-0 rounded-2xl border-2 border-white/50"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected info & confirm */}
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Selection summary */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center">
                <BookMarked className="w-6 h-6 text-accent-primary" />
              </div>
              <div>
                <p className="text-white font-medium">
                  {selectedCount} Chapter Course
                </p>
                <p className="text-white/50 text-sm">
                  {getEstimatedTime(selectedCount, '30')} of learning
                </p>
              </div>
            </div>

            {/* Confirm button */}
            <Button
              onClick={onConfirm}
              size="lg"
              glow
              isLoading={isLoading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Build My Course
            </Button>
          </div>
        </motion.div>
      )}

      {/* Helper text */}
      {!selectedCount && (
        <motion.p
          variants={itemVariants}
          className="text-center text-white/40 text-sm"
        >
          Click on a chapter count to select it
        </motion.p>
      )}
    </motion.div>
  );
}

export default ChapterSelector;
