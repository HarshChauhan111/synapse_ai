import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { buildPollinationsUrl, enhanceImagePrompt, generateChapterGradient } from '../../api/pollinations';
import { getChapterHeroImage } from '../../api/imageSearch';

function ChapterImageHero({ imagePrompt, accentColor, chapterIndex, layout }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageSource, setImageSource] = useState(null);

  const fallbackGradient = generateChapterGradient(accentColor, chapterIndex);

  // Try to fetch a real image from Pexels/Wikipedia first, fall back to Pollinations
  useEffect(() => {
    let cancelled = false;

    const fetchImage = async () => {
      try {
        // Try Pexels/Wikipedia first via unified search
        const result = await getChapterHeroImage(
          '', // courseTitle not needed for search
          imagePrompt,
          'auto',
          chapterIndex
        );
        
        if (!cancelled && result?.url) {
          setImageUrl(result.url);
          setImageSource(result.source);
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch real image, using Pollinations:', err);
      }

      // Fallback to Pollinations AI-generated image
      if (!cancelled) {
        const enhancedPrompt = enhanceImagePrompt(imagePrompt, chapterIndex);
        const pollinationsUrl = buildPollinationsUrl(enhancedPrompt, {
          width: 1200,
          height: 600,
          nologo: true,
          seed: chapterIndex * 1000,
        });
        setImageUrl(pollinationsUrl);
        setImageSource('pollinations');
      }
    };

    fetchImage();
    return () => { cancelled = true; };
  }, [imagePrompt, chapterIndex]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    // If a Pexels/Wikipedia image failed, try Pollinations as final fallback
    if (imageSource !== 'pollinations') {
      const enhancedPrompt = enhanceImagePrompt(imagePrompt, chapterIndex);
      const pollinationsUrl = buildPollinationsUrl(enhancedPrompt, {
        width: 1200,
        height: 600,
        nologo: true,
        seed: chapterIndex * 1000,
      });
      setImageUrl(pollinationsUrl);
      setImageSource('pollinations');
      setImageLoaded(false);
    } else {
      setImageError(true);
    }
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
          <p className="text-neutral-600 text-sm italic leading-relaxed">
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
      {imageUrl && (
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
      )}

      {/* Source badge */}
      {imageLoaded && imageSource && (
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-medium bg-white/90 text-neutral-700 backdrop-blur-sm shadow-sm border border-neutral-200">
          {imageSource === 'pexels' ? '📷 Pexels' : imageSource === 'wikipedia' ? '📚 Wikipedia' : '🎨 AI Generated'}
        </div>
      )}

      {/* Gradient overlay for text readability */}
      {imageLoaded && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, ${accentColor}10 50%, rgba(255, 255, 255, 0.95) 100%)`,
          }}
        />
      )}
    </div>
  );
}

export default ChapterImageHero;
