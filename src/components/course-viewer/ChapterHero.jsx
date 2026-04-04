import React from 'react';
import { motion } from 'framer-motion';
import ChapterChart from './ChapterChart';
import ChapterImageHero from './ChapterImageHero';

function ChapterHero({ chapterData, chapterIndex, totalChapters }) {
  const {
    chapterTitle,
    chapterSubtitle,
    heroType,
    heroImagePrompt,
    heroChartData,
    accentColor,
  } = chapterData;

  const renderVisual = () => {
    if (heroType === 'chart' && heroChartData) {
      return (
        <ChapterChart
          chartData={heroChartData}
          accentColor={accentColor}
          layout="default"
        />
      );
    }
    return (
      <ChapterImageHero
        imagePrompt={heroImagePrompt}
        accentColor={accentColor}
        chapterIndex={chapterIndex}
        layout="default"
      />
    );
  };

  return (
    <section className="w-full bg-white">
      {/* Content section */}
      <div className="px-6 md:px-12 lg:px-16 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-4"
        >
          {/* Chapter number */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-white border border-neutral-200 shadow-sm"
            style={{ color: accentColor }}
          >
            Chapter {chapterIndex + 1} of {totalChapters}
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-neutral-900">
            {chapterTitle}
          </h2>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-neutral-600 max-w-xl">
            {chapterSubtitle}
          </p>

          {/* Accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="h-1 w-24 rounded-full"
            style={{ backgroundColor: accentColor, originX: 0 }}
          />
        </motion.div>
      </div>

      {/* Visual section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full h-64 md:h-80 lg:h-96 overflow-hidden"
      >
        {renderVisual()}
      </motion.div>
    </section>
  );
}

export default ChapterHero;
