import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Users, BarChart3, ChevronDown } from 'lucide-react';

/**
 * Generate a fallback gradient based on course title
 */
const generateFallbackGradient = (courseTitle) => {
  let hash = 0;
  for (let i = 0; i < courseTitle.length; i++) {
    hash = courseTitle.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 50%) 0%, hsl(${hue2}, 80%, 40%) 100%)`;
};

function CourseHero({
  courseTitle,
  courseDescription,
  difficultyLevel,
  targetAudience,
  chapterDuration,
  selectedChapterCount,
  thumbnailData,
  onStartLearning,
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const thumbnailUrl = thumbnailData?.url;
  const fallbackGradient = generateFallbackGradient(courseTitle);

  // Difficulty colors
  const difficultyColors = {
    Beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
    Intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
    >
      {/* Background Image or Gradient */}
      <div className="absolute inset-0">
        {thumbnailUrl && !imageError ? (
          <>
            {/* Blurred placeholder */}
            {!imageLoaded && (
              <div
                className="absolute inset-0 skeleton"
                style={{ background: fallbackGradient }}
              />
            )}
            {/* Actual image */}
            <motion.img
              src={thumbnailUrl}
              alt={courseTitle}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              initial={{ scale: 1.1 }}
              animate={{ scale: imageLoaded ? 1 : 1.1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className={`
                absolute inset-0 w-full h-full object-cover
                ${imageLoaded ? 'opacity-100' : 'opacity-0'}
                transition-opacity duration-500
              `}
            />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: fallbackGradient }}
          />
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/80 to-dark/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/60 via-transparent to-dark/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Difficulty badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium mb-6 ${difficultyColors[difficultyLevel] || difficultyColors.Intermediate}`}
        >
          <BarChart3 className="w-4 h-4" />
          {difficultyLevel}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6"
        >
          {courseTitle}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8"
        >
          {courseDescription}
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 mb-10"
        >
          <div className="flex items-center gap-2 text-white/60">
            <BookOpen className="w-5 h-5 text-accent-primary" />
            <span>{selectedChapterCount} Chapters</span>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <Clock className="w-5 h-5 text-accent-secondary" />
            <span>{chapterDuration} per chapter</span>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <Users className="w-5 h-5 text-accent-tertiary" />
            <span>{targetAudience}</span>
          </div>
        </motion.div>

        {/* Start button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartLearning}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-semibold text-lg shadow-lg shadow-accent-primary/30 pulse-glow"
        >
          Start Learning
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </motion.button>

        {/* Photo credit */}
        {thumbnailData?.photographer && imageLoaded && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-xs text-white/30"
          >
            Photo by{' '}
            {thumbnailData.photographerUrl ? (
              <a
                href={thumbnailData.photographerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white/50"
              >
                {thumbnailData.photographer}
              </a>
            ) : (
              <span>{thumbnailData.photographer}</span>
            )}
            {' '}on {thumbnailData.source === 'pexels' ? 'Pexels' : 'Unsplash'}
          </motion.p>
        )}
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3], y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-white"
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

export default CourseHero;
