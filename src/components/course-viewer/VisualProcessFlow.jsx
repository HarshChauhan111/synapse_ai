import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';

/**
 * Animated Process Flow Component
 * Shows step-by-step process with connecting arrows
 */
function VisualProcessFlow({
  steps = [],
  title,
  description,
  accentColor = '#3b82f6',
  className = '',
  compact = false,
  direction = 'horizontal', // 'horizontal' or 'vertical'
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const stepVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.4, type: 'spring', stiffness: 200 },
    },
  };

  const arrowVariants = {
    hidden: { opacity: 0, scaleX: 0 },
    visible: {
      opacity: 1,
      scaleX: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  const isVertical = direction === 'vertical' || steps.length > 5;

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

      <div className={`
        ${isVertical 
          ? 'flex flex-col gap-4' 
          : 'flex flex-wrap items-center justify-center gap-3'
        }
      `}>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step */}
            <motion.div
              variants={stepVariants}
              className={`
                ${isVertical ? 'flex items-start gap-4' : 'flex flex-col items-center'}
                ${compact ? '' : 'min-w-[120px]'}
              `}
            >
              {/* Step number/icon */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={`
                  flex items-center justify-center rounded-xl font-bold
                  ${compact ? 'w-8 h-8 text-sm' : 'w-12 h-12 text-lg'}
                  ${step.completed ? 'bg-green-50 text-green-600' : ''}
                `}
                style={!step.completed ? { 
                  backgroundColor: `${accentColor}15`, 
                  color: accentColor 
                } : {}}
              >
                {step.completed ? (
                  <CheckCircle className={compact ? 'w-4 h-4' : 'w-6 h-6'} />
                ) : (
                  step.icon || index + 1
                )}
              </motion.div>

              {/* Step content */}
              <div className={isVertical ? 'flex-1' : 'text-center mt-2'}>
                <h5 className={`text-neutral-900 font-medium ${compact ? 'text-sm' : ''}`}>
                  {step.title}
                </h5>
                {step.description && !compact && (
                  <p className="text-xs text-neutral-500 mt-1 max-w-[150px]">
                    {step.description}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Arrow (not after last item) */}
            {index < steps.length - 1 && (
              <motion.div
                variants={arrowVariants}
                className={`
                  flex items-center justify-center
                  ${isVertical ? 'ml-4 pl-2' : ''}
                `}
              >
                <ArrowRight 
                  className={`
                    text-neutral-300
                    ${isVertical ? 'rotate-90 w-4 h-4' : 'w-5 h-5'}
                  `}
                />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
}

export default VisualProcessFlow;
