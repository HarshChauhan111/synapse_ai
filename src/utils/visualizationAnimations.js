/**
 * Animation presets for visualizations
 */

export const animationPresets = {
  // Chart animations
  chartGrow: {
    initial: { scaleY: 0, opacity: 0 },
    animate: { scaleY: 1, opacity: 1 },
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  
  // Pie chart animation
  pieReveal: {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0 },
    transition: { duration: 0.8, ease: 'easeOut' },
  },

  // Line draw animation
  lineDraw: {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { duration: 1.2, ease: 'easeInOut' },
  },

  // Stagger children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },

  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' },
  },

  // Timeline animations
  timelineReveal: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },

  // Process flow animations
  flowStep: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, type: 'spring', stiffness: 200 },
  },

  flowArrow: {
    initial: { scaleX: 0, opacity: 0 },
    animate: { scaleX: 1, opacity: 1 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Table animations
  tableRow: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Fade in
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 },
  },

  // Slide up
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },

  // Bounce in
  bounceIn: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    transition: { type: 'spring', stiffness: 300, damping: 15 },
  },

  // Diagram draw
  diagramDraw: {
    initial: { pathLength: 0 },
    animate: { pathLength: 1 },
    transition: { duration: 1, ease: 'easeInOut' },
  },
};

/**
 * Get animation preset by type
 */
export const getAnimation = (type) => {
  return animationPresets[type] || animationPresets.fadeIn;
};

/**
 * Create stagger animation config
 */
export const createStaggerConfig = (staggerDelay = 0.1, childDuration = 0.4) => ({
  container: {
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: childDuration, ease: 'easeOut' },
  },
});

/**
 * Create scroll-triggered animation
 */
export const scrollTriggerConfig = {
  whileInView: { opacity: 1, y: 0 },
  initial: { opacity: 0, y: 30 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6, ease: 'easeOut' },
};

export default animationPresets;
