import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Clock, Star, BarChart3, Target } from 'lucide-react';

const ICON_MAP = {
  trending: TrendingUp,
  users: Users,
  clock: Clock,
  star: Star,
  chart: BarChart3,
  target: Target,
};

/**
 * Animated Infographic Component
 * Displays statistics and metrics with visual appeal
 */
function VisualInfographic({
  stats = [],
  title,
  description,
  accentColor = '#3b82f6',
  className = '',
  layout = 'grid', // 'grid' or 'row'
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
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, type: 'spring', stiffness: 200 },
    },
  };

  const numberVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, type: 'spring', stiffness: 150 },
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

      <div className={`
        ${layout === 'grid' 
          ? 'grid grid-cols-2 md:grid-cols-4 gap-4' 
          : 'flex flex-wrap justify-center gap-6'
        }
      `}>
        {stats.map((stat, index) => {
          const IconComponent = ICON_MAP[stat.icon] || BarChart3;
          const statColor = stat.color || accentColor;

          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-neutral-50 border border-neutral-100 p-4 rounded-xl text-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ rotate: -10 }}
                whileInView={{ rotate: 0 }}
                className="w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${statColor}15` }}
              >
                <IconComponent className="w-5 h-5" style={{ color: statColor }} />
              </motion.div>

              {/* Value */}
              <motion.div
                variants={numberVariants}
                className="text-2xl md:text-3xl font-heading font-bold mb-1"
                style={{ color: statColor }}
              >
                {stat.value}
                {stat.suffix && <span className="text-lg">{stat.suffix}</span>}
              </motion.div>

              {/* Label */}
              <p className="text-xs text-neutral-500">{stat.label}</p>

              {/* Optional change indicator */}
              {stat.change && (
                <div className={`
                  text-xs mt-2 flex items-center justify-center gap-1
                  ${stat.change > 0 ? 'text-green-600' : 'text-red-500'}
                `}>
                  <TrendingUp className={`w-3 h-3 ${stat.change < 0 ? 'rotate-180' : ''}`} />
                  <span>{Math.abs(stat.change)}%</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default VisualInfographic;
