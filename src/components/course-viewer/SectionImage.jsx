import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, User, ImageOff } from 'lucide-react';

/**
 * Section Image Component
 * Displays inline images with captions and credits
 */
function SectionImage({
  url,
  thumbnail,
  alt,
  caption,
  photographer,
  photographerUrl,
  source = 'unknown',
  className = '',
  layout = 'default', // 'default', 'full', 'float-left', 'float-right'
}) {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const layoutClasses = {
    default: 'w-full max-w-2xl mx-auto',
    full: 'w-full',
    'float-left': 'float-left w-1/2 mr-4 mb-4',
    'float-right': 'float-right w-1/2 ml-4 mb-4',
  };

  // Source badge colors
  const sourceColors = {
    pexels: '#05A081',
    wikipedia: '#000000',
    pollinations: '#8B5CF6',
    unsplash: '#000000',
  };

  if (imageError) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className={`${layoutClasses[layout]} ${className}`}
      >
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="aspect-video flex items-center justify-center bg-white/5">
            <div className="text-center text-white/40">
              <ImageOff className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Image unavailable</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.figure
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={`${layoutClasses[layout]} ${className}`}
    >
      <div className="glass-card rounded-xl overflow-hidden">
        {/* Image container */}
        <div className="relative aspect-video overflow-hidden">
          {/* Loading skeleton */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-white/5 animate-pulse" />
          )}

          {/* Image */}
          <motion.img
            src={url || thumbnail}
            alt={alt || caption || 'Image'}
            onError={handleImageError}
            onLoad={handleImageLoad}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 1.1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full object-cover"
          />

          {/* Source badge */}
          {source && source !== 'unknown' && (
            <div
              className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium text-white/90"
              style={{ backgroundColor: sourceColors[source] || '#6366f1' }}
            >
              {source.charAt(0).toUpperCase() + source.slice(1)}
            </div>
          )}
        </div>

        {/* Caption and credits */}
        {(caption || photographer) && (
          <div className="p-3 border-t border-white/5">
            {caption && (
              <figcaption className="text-sm text-white/70 mb-1">
                {caption}
              </figcaption>
            )}
            {photographer && (
              <div className="flex items-center gap-2 text-xs text-white/50">
                <User className="w-3 h-3" />
                <span>Photo by </span>
                {photographerUrl ? (
                  <a
                    href={photographerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-primary hover:underline inline-flex items-center gap-1"
                  >
                    {photographer}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span>{photographer}</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.figure>
  );
}

export default SectionImage;
