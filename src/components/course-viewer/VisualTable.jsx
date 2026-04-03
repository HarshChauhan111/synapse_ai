import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';

/**
 * Animated Comparison Table Component
 * Shows feature comparison with animations
 */
function VisualTable({
  columns = [],
  rows = [],
  title,
  description,
  accentColor = '#6366f1',
  className = '',
  compact = false,
}) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  // Render cell value with icons for boolean-like values
  const renderCellValue = (value) => {
    if (value === true || value === 'yes' || value === '✓') {
      return <Check className="w-4 h-4 text-green-400 mx-auto" />;
    }
    if (value === false || value === 'no' || value === '✗') {
      return <X className="w-4 h-4 text-red-400 mx-auto" />;
    }
    if (value === null || value === '-' || value === 'N/A') {
      return <Minus className="w-4 h-4 text-white/30 mx-auto" />;
    }
    return value;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={`glass-card p-6 rounded-2xl ${className}`}
    >
      {title && (
        <h4 className="text-lg font-heading font-bold text-white mb-2">{title}</h4>
      )}
      {description && (
        <p className="text-sm text-white/60 mb-4">{description}</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[300px]">
          {/* Header */}
          <thead>
            <motion.tr variants={headerVariants}>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`
                    text-left py-3 px-4 text-sm font-medium
                    ${index === 0 ? 'text-white' : 'text-center'}
                    ${compact ? 'py-2 px-2 text-xs' : ''}
                  `}
                  style={index > 0 ? { color: accentColor } : {}}
                >
                  {col}
                </th>
              ))}
            </motion.tr>
          </thead>

          {/* Body */}
          <tbody>
            {rows.map((row, rowIndex) => (
              <motion.tr
                key={rowIndex}
                variants={rowVariants}
                className="border-t border-white/5 hover:bg-white/5 transition-colors"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`
                      py-3 px-4
                      ${cellIndex === 0 
                        ? 'text-white/80 font-medium text-sm' 
                        : 'text-center text-white/60 text-sm'
                      }
                      ${compact ? 'py-2 px-2 text-xs' : ''}
                    `}
                  >
                    {renderCellValue(cell)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default VisualTable;
