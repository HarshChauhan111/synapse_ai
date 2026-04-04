import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const DEFAULT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b',
  '#3b82f6', '#ef4444', '#06b6d4', '#84cc16', '#f97316'
];

/**
 * Animated Chart Component - Supports bar, line, pie, area, radar
 */
function VisualChart({
  type = 'bar',
  data = [],
  title,
  description,
  accentColor = '#6366f1',
  height = 300,
  animate = true,
  className = '',
  compact = false,
}) {
  // Ensure data is always an array with valid values
  const normalizedData = Array.isArray(data) 
    ? data.map((item, index) => ({
        name: item?.name || `Item ${index + 1}`,
        value: typeof item?.value === 'number' ? item.value : (parseFloat(item?.value) || 0),
        color: item?.color || item?.fill || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      }))
    : [];

  // Don't render if no valid data
  if (normalizedData.length === 0) {
    return (
      <div className={`glass-card p-6 rounded-2xl ${className}`}>
        {title && <h4 className="text-lg font-heading font-bold text-white mb-2">{title}</h4>}
        <p className="text-white/50 text-sm">No chart data available</p>
      </div>
    );
  }

  const colors = normalizedData.map((item) => item.color);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && payload[0]?.value !== undefined) {
      return (
        <div className="glass-card p-3 text-sm">
          <p className="text-white font-medium">{label || payload[0]?.name || ''}</p>
          <p className="text-accent-primary">
            {typeof payload[0].value === 'number' ? payload[0].value.toLocaleString() : payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const chartHeight = compact ? 200 : height;

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={normalizedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                animationDuration={animate ? 1000 : 0}
              >
                {normalizedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={normalizedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={accentColor}
                strokeWidth={3}
                dot={{ fill: accentColor, strokeWidth: 2 }}
                activeDot={{ r: 6, fill: accentColor }}
                animationDuration={animate ? 1500 : 0}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={normalizedData}
                cx="50%"
                cy="50%"
                innerRadius={compact ? 40 : 60}
                outerRadius={compact ? 70 : 100}
                paddingAngle={2}
                dataKey="value"
                animationDuration={animate ? 1000 : 0}
                label={!compact ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : false}
                labelLine={!compact ? { stroke: 'rgba(255,255,255,0.3)' } : false}
              >
                {normalizedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={normalizedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={accentColor}
                fill={`${accentColor}40`}
                strokeWidth={2}
                animationDuration={animate ? 1200 : 0}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <RadarChart data={normalizedData}>
              <PolarGrid stroke="rgba(255,255,255,0.2)" />
              <PolarAngleAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <PolarRadiusAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
              <Radar
                dataKey="value"
                stroke={accentColor}
                fill={`${accentColor}40`}
                fillOpacity={0.6}
                animationDuration={animate ? 1000 : 0}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={`glass-card p-6 rounded-2xl ${className}`}
    >
      {title && (
        <h4 className="text-lg font-heading font-bold text-white mb-2">{title}</h4>
      )}
      {description && (
        <p className="text-sm text-white/60 mb-4">{description}</p>
      )}
      {renderChart()}
      
      {/* Legend for pie charts in compact mode */}
      {type === 'pie' && compact && (
        <div className="flex flex-wrap gap-2 mt-3 justify-center">
          {normalizedData.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5 text-xs">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: colors[index] }}
              />
              <span className="text-white/70">{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default VisualChart;
