/**
 * Chart data parser for Recharts
 * Transforms AI-generated chart data into Recharts-compatible format
 */

// Default colors for chart elements
const CHART_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#84cc16', // Lime
];

/**
 * Parse and validate chart data from AI response
 */
export const parseChartData = (heroChartData, accentColor) => {
  if (!heroChartData || !heroChartData.data) {
    return null;
  }

  const { type, title, description, data } = heroChartData;

  // Validate chart type
  const validTypes = ['bar', 'line', 'pie', 'radar', 'area'];
  if (!validTypes.includes(type)) {
    console.warn(`Invalid chart type: ${type}, defaulting to bar`);
  }

  // Process data based on chart type
  const processedData = data.map((item, index) => ({
    name: item.name || `Item ${index + 1}`,
    value: typeof item.value === 'number' ? item.value : parseFloat(item.value) || 0,
    // Add color for pie charts
    fill: item.fill || CHART_COLORS[index % CHART_COLORS.length],
  }));

  return {
    type: validTypes.includes(type) ? type : 'bar',
    title: title || 'Data Visualization',
    description: description || '',
    data: processedData,
    accentColor: accentColor || CHART_COLORS[0],
  };
};

/**
 * Get Recharts configuration for different chart types
 */
export const getChartConfig = (chartType, accentColor) => {
  const baseConfig = {
    margin: { top: 20, right: 30, left: 20, bottom: 20 },
    style: {
      background: 'transparent',
    },
  };

  const configs = {
    bar: {
      ...baseConfig,
      barSize: 40,
      barGap: 8,
      fill: accentColor,
      radius: [4, 4, 0, 0],
    },
    line: {
      ...baseConfig,
      strokeWidth: 3,
      stroke: accentColor,
      dot: { fill: accentColor, strokeWidth: 2, r: 5 },
      activeDot: { fill: accentColor, strokeWidth: 2, r: 7 },
    },
    area: {
      ...baseConfig,
      strokeWidth: 2,
      stroke: accentColor,
      fill: `${accentColor}33`,
      fillOpacity: 0.6,
    },
    pie: {
      ...baseConfig,
      innerRadius: '40%',
      outerRadius: '80%',
      paddingAngle: 2,
      cornerRadius: 4,
    },
    radar: {
      ...baseConfig,
      fill: `${accentColor}44`,
      stroke: accentColor,
      strokeWidth: 2,
    },
  };

  return configs[chartType] || configs.bar;
};

/**
 * Get animation configuration for chart entrance
 */
export const getChartAnimation = (chartType) => {
  const animations = {
    bar: {
      animationDuration: 1500,
      animationEasing: 'ease-out',
      animationBegin: 0,
    },
    line: {
      animationDuration: 2000,
      animationEasing: 'ease-in-out',
      animationBegin: 0,
      // Line draw effect handled separately with SVG
    },
    area: {
      animationDuration: 1500,
      animationEasing: 'ease-out',
      animationBegin: 0,
    },
    pie: {
      animationDuration: 1500,
      animationEasing: 'ease-out',
      animationBegin: 0,
      startAngle: 90,
      endAngle: 450,
    },
    radar: {
      animationDuration: 1500,
      animationEasing: 'ease-out',
      animationBegin: 0,
    },
  };

  return animations[chartType] || animations.bar;
};

/**
 * Format axis tick values
 */
export const formatAxisTick = (value) => {
  if (typeof value === 'number') {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  }
  return value;
};

/**
 * Calculate chart dimensions based on container
 */
export const getResponsiveDimensions = (containerWidth, aspectRatio = 16 / 9) => {
  const width = Math.min(containerWidth, 800);
  const height = width / aspectRatio;
  return { width, height: Math.max(height, 300) };
};

/**
 * Generate tooltip content formatter
 */
export const tooltipFormatter = (value, name) => {
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
  return [formattedValue, name];
};

/**
 * Custom label formatter for pie charts
 */
export const pieChartLabelFormatter = ({ name, percent }) => {
  return `${name}: ${(percent * 100).toFixed(0)}%`;
};
