import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { buildPollinationsUrl, enhanceImagePrompt, generateChapterGradient } from '../../api/pollinations';

function ChapterImageHero({ imagePrompt, accentColor, chapterIndex, layout }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const enhancedPrompt = enhanceImagePrompt(imagePrompt, chapterIndex);
  const imageUrl = buildPollinationsUrl(enhancedPrompt, {
    width: 1200,
    height: 600,
    nologo: true,
    seed: chapterIndex * 1000, // Consistent seed per chapter
  });

  const fallbackGradient = generateChapterGradient(accentColor, chapterIndex);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Fallback view with gradient and prompt text
  if (imageError) {
    return (
      <div
        className="w-full h-full min-h-[300px] flex items-center justify-center relative overflow-hidden"
        style={{ background: fallbackGradient }}
      >
        {/* Animated pattern */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, ${accentColor}40 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, ${accentColor}30 0%, transparent 50%)
            `,
          }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Prompt text overlay */}
        <div className="relative z-10 text-center px-8 max-w-lg">
          <p className="text-white/50 text-sm italic leading-relaxed">
            "{imagePrompt}"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] relative overflow-hidden">
      {/* Loading skeleton */}
      {!imageLoaded && (
        <div
          className="absolute inset-0 skeleton"
          style={{ background: fallbackGradient }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(90deg, transparent 0%, ${accentColor}20 50%, transparent 100%)`,
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}

      {/* Actual image */}
      <motion.img
        src={imageUrl}
        alt={imagePrompt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{
          opacity: imageLoaded ? 1 : 0,
          scale: imageLoaded ? 1 : 1.1,
        }}
        transition={{ duration: 0.8 }}
        className="w-full h-full object-cover"
      />

      {/* Gradient overlay for text readability */}
      {imageLoaded && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, ${accentColor}10 50%, rgba(10, 10, 15, 0.9) 100%)`,
          }}
        />
      )}
    </div>
  );
}

export default ChapterImageHero;
