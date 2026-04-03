/**
 * Chapter hero layout styler
 * Assigns unique visual styles to each chapter hero
 */

// 5 distinct hero layout variants
export const HERO_LAYOUTS = {
  FULL_BLEED: 'full-bleed',           // Full-width image with centered text overlay
  SPLIT_LEFT: 'split-left',            // Image/chart left, text right
  TEXT_TOP: 'text-top',                // Text top, visual bottom with animated divider
  DIAGONAL: 'diagonal',                // CSS clip-path with visual on right
  IMMERSIVE: 'immersive',              // Dark background, neon accent, visual as blurred background
};

const layoutOrder = [
  HERO_LAYOUTS.FULL_BLEED,
  HERO_LAYOUTS.SPLIT_LEFT,
  HERO_LAYOUTS.TEXT_TOP,
  HERO_LAYOUTS.DIAGONAL,
  HERO_LAYOUTS.IMMERSIVE,
];

/**
 * Get hero layout variant for a chapter
 */
export const getHeroLayout = (chapterIndex) => {
  return layoutOrder[chapterIndex % layoutOrder.length];
};

/**
 * Get CSS classes for hero layout
 */
export const getHeroLayoutClasses = (layout) => {
  const baseClasses = 'relative w-full overflow-hidden';
  
  switch (layout) {
    case HERO_LAYOUTS.FULL_BLEED:
      return {
        container: `${baseClasses} min-h-[60vh]`,
        visual: 'absolute inset-0 w-full h-full object-cover',
        overlay: 'absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent',
        content: 'absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10',
      };
      
    case HERO_LAYOUTS.SPLIT_LEFT:
      return {
        container: `${baseClasses} min-h-[50vh] grid grid-cols-1 lg:grid-cols-2 gap-0`,
        visual: 'w-full h-full min-h-[300px] lg:min-h-full object-cover',
        overlay: 'absolute inset-0 bg-gradient-to-r from-transparent to-dark/50 lg:bg-none',
        content: 'flex flex-col justify-center px-8 lg:px-12 py-12 bg-dark',
      };
      
    case HERO_LAYOUTS.TEXT_TOP:
      return {
        container: `${baseClasses} min-h-[60vh] flex flex-col`,
        visual: 'w-full h-64 lg:h-80 object-cover',
        overlay: 'absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-dark to-transparent',
        content: 'px-8 py-12 text-center',
        divider: 'w-full h-1 bg-gradient-to-r from-transparent via-accent-primary to-transparent',
      };
      
    case HERO_LAYOUTS.DIAGONAL:
      return {
        container: `${baseClasses} min-h-[50vh] relative`,
        visual: 'absolute right-0 top-0 w-full lg:w-3/5 h-full object-cover',
        visualClip: 'clip-path-diagonal',
        overlay: 'absolute inset-0 bg-gradient-to-r from-dark via-dark/80 to-transparent',
        content: 'relative z-10 flex flex-col justify-center px-8 lg:px-16 py-12 max-w-2xl',
      };
      
    case HERO_LAYOUTS.IMMERSIVE:
      return {
        container: `${baseClasses} min-h-[70vh] relative`,
        visual: 'absolute inset-0 w-full h-full object-cover filter blur-sm scale-105',
        overlay: 'absolute inset-0 bg-dark/80 backdrop-blur-sm',
        content: 'relative z-10 flex flex-col items-center justify-center text-center px-4 py-16',
        glow: 'absolute inset-0 opacity-30',
      };
      
    default:
      return {
        container: baseClasses,
        visual: '',
        overlay: '',
        content: '',
      };
  }
};

/**
 * Get animation variants for each layout type
 */
export const getHeroAnimations = (layout) => {
  const baseTransition = { duration: 0.8, ease: [0.22, 1, 0.36, 1] };
  
  switch (layout) {
    case HERO_LAYOUTS.FULL_BLEED:
      return {
        container: {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: baseTransition,
        },
        content: {
          initial: { opacity: 0, y: 40 },
          animate: { opacity: 1, y: 0 },
          transition: { ...baseTransition, delay: 0.3 },
        },
      };
      
    case HERO_LAYOUTS.SPLIT_LEFT:
      return {
        container: {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: baseTransition,
        },
        visual: {
          initial: { opacity: 0, x: -50 },
          animate: { opacity: 1, x: 0 },
          transition: baseTransition,
        },
        content: {
          initial: { opacity: 0, x: 50 },
          animate: { opacity: 1, x: 0 },
          transition: { ...baseTransition, delay: 0.2 },
        },
      };
      
    case HERO_LAYOUTS.TEXT_TOP:
      return {
        content: {
          initial: { opacity: 0, y: -30 },
          animate: { opacity: 1, y: 0 },
          transition: baseTransition,
        },
        visual: {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { ...baseTransition, delay: 0.2 },
        },
        divider: {
          initial: { scaleX: 0 },
          animate: { scaleX: 1 },
          transition: { ...baseTransition, delay: 0.4 },
        },
      };
      
    case HERO_LAYOUTS.DIAGONAL:
      return {
        visual: {
          initial: { opacity: 0, x: 100 },
          animate: { opacity: 1, x: 0 },
          transition: baseTransition,
        },
        content: {
          initial: { opacity: 0, x: -50 },
          animate: { opacity: 1, x: 0 },
          transition: { ...baseTransition, delay: 0.3 },
        },
      };
      
    case HERO_LAYOUTS.IMMERSIVE:
      return {
        container: {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 1.2 },
        },
        visual: {
          initial: { scale: 1.2, opacity: 0 },
          animate: { scale: 1.05, opacity: 1 },
          transition: { duration: 1.5 },
        },
        content: {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { ...baseTransition, delay: 0.5 },
        },
      };
      
    default:
      return {};
  }
};

/**
 * Generate accent glow styles
 */
export const getAccentGlow = (accentColor, intensity = 'medium') => {
  const intensities = {
    low: { spread: 20, opacity: 0.2 },
    medium: { spread: 40, opacity: 0.3 },
    high: { spread: 60, opacity: 0.5 },
  };
  
  const { spread, opacity } = intensities[intensity] || intensities.medium;
  
  return {
    boxShadow: `0 0 ${spread}px ${accentColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    borderColor: accentColor,
  };
};
