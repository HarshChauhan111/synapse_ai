import React from 'react';
import { motion } from 'framer-motion';
import { Circle, CheckCircle } from 'lucide-react';

/**
 * Animated Timeline Component
 * Displays events in a vertical timeline with animations
 */
function VisualTimeline({
  events = [],
  title,
  description,
  accentColor = '#3b82f6',
  className = '',
  compact = false,
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const lineVariants = {
    hidden: { scaleY: 0 },
    visible: {
      scaleY: 1,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={`bg-white border border-neutral-200 p-6 rounded-2xl shadow-sm ${className}`}
    >
      {title && (
        <h4 className="text-lg font-heading font-bold text-neutral-900 mb-2">{title}</h4>
      )}
      {description && (
        <p className="text-sm text-neutral-500 mb-6">{description}</p>
      )}

      <div className="relative">
        {/* Vertical line */}
        <motion.div
          variants={lineVariants}
          className="absolute left-3 top-2 bottom-2 w-0.5 origin-top"
          style={{ backgroundColor: `${accentColor}40` }}
        />

        {/* Events */}
        <div className="space-y-6">
          {events.map((event, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative pl-10"
            >
              {/* Dot */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: 'spring', stiffness: 300 }}
                className="absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                {event.completed ? (
                  <CheckCircle className="w-4 h-4" style={{ color: accentColor }} />
                ) : (
                  <Circle className="w-3 h-3" style={{ color: accentColor, fill: accentColor }} />
                )}
              </motion.div>

              {/* Content */}
              <div className={compact ? '' : 'bg-neutral-50 border border-neutral-100 p-4 rounded-xl'}>
                {event.year && (
                  <span 
                    className="text-xs font-medium px-2 py-0.5 rounded-full mb-2 inline-block"
                    style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                  >
                    {event.year}
                  </span>
                )}
                <h5 className="text-neutral-900 font-medium mb-1">{event.title}</h5>
                {event.description && (
                  <p className="text-sm text-neutral-500">{event.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default VisualTimeline;
