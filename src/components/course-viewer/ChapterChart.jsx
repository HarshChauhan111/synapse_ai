import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  parseChartData,
  getChartConfig,
  getChartAnimation,
  formatAxisTick,
} from '../../utils/chartDataParser';

const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
  '#10b981', '#06b6d4', '#3b82f6', '#f59e0b', '#84cc16',
];

function ChapterChart({ chartData: rawChartData, accentColor, layout }) {
  const [isVisible, setIsVisible] = useState(false);
  const chartData = parseChartData(rawChartData, accentColor);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!chartData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-dark-100/50">
        <p className="text-white/50">Chart data unavailable</p>
      </div>
    );
  }

  const { type, title, description, data } = chartData;
  const config = getChartConfig(type, accentColor);
  const animation = getChartAnimation(type);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card-dark px-4 py-2 rounded-lg">
          <p className="text-white font-medium">{label}</p>
          <p className="text-accent-primary">
            {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: config.margin,
    };

    switch (type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="name"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              tickFormatter={(value) => value.length > 10 ? `${value.slice(0, 10)}...` : value}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              tickFormatter={formatAxisTick}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              fill={accentColor}
              radius={config.radius}
              animationDuration={animation.animationDuration}
              animationEasing={animation.animationEasing}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="name"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              tickFormatter={formatAxisTick}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={accentColor}
              strokeWidth={config.strokeWidth}
              dot={config.dot}
              activeDot={config.activeDot}
              animationDuration={animation.animationDuration}
              animationEasing={animation.animationEasing}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`areaGradient-${accentColor}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={accentColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="name"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              tickFormatter={formatAxisTick}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={accentColor}
              strokeWidth={config.strokeWidth}
              fill={`url(#areaGradient-${accentColor})`}
              animationDuration={animation.animationDuration}
              animationEasing={animation.animationEasing}
            />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
              animationDuration={animation.animationDuration}
              animationEasing={animation.animationEasing}
              animationBegin={animation.animationBegin}
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }}
              formatter={(value) => <span className="text-white/70">{value}</span>}
            />
          </PieChart>
        );

      case 'radar':
        return (
          <RadarChart {...commonProps}>
            <PolarGrid stroke="rgba(255,255,255,0.2)" />
            <PolarAngleAxis
              dataKey="name"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
            />
            <Radar
              dataKey="value"
              stroke={accentColor}
              fill={`${accentColor}44`}
              strokeWidth={2}
              animationDuration={animation.animationDuration}
              animationEasing={animation.animationEasing}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.95 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full min-h-[300px] lg:min-h-[400px] p-4 glass-card-dark rounded-2xl"
      style={{
        boxShadow: `0 0 40px ${accentColor}20, inset 0 0 20px ${accentColor}10`,
        borderColor: `${accentColor}40`,
        borderWidth: 1,
      }}
    >
      {/* Chart title */}
      <div className="mb-4 text-center">
        <h4 className="text-lg font-heading font-bold text-white">
          {title}
        </h4>
        {description && (
          <p className="text-sm text-white/50 mt-1">{description}</p>
        )}
      </div>

      {/* Chart container */}
      <div className="w-full h-[calc(100%-80px)]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default ChapterChart;
