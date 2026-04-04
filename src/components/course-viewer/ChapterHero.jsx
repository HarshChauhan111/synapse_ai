import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { getHeroLayout, getHeroLayoutClasses, getHeroAnimations } from '../../utils/chapterStyler';
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

  const layout = getHeroLayout(chapterIndex);
  const classes = getHeroLayoutClasses(layout);
  const animations = getHeroAnimations(layout);

  // Parallax effect
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  const renderVisual = () => {
    if (heroType === 'chart' && heroChartData) {
      return (
        <ChapterChart
          chartData={heroChartData}
          accentColor={accentColor}
          layout={layout}
        />
      );
    }
    return (
      <ChapterImageHero
        imagePrompt={heroImagePrompt}
        accentColor={accentColor}
        chapterIndex={chapterIndex}
        layout={layout}
      />
    );
  };

  const renderContent = () => (
    <motion.div
      {...animations.content}
      className="space-y-4"
    >
      {/* Chapter number */}
      <div
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-white border border-neutral-200 shadow-sm"
        style={{
          color: accentColor,
        }}
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
        transition={{ delay: 0.5, duration: 0.8 }}
        className="h-1 w-24 rounded-full"
        style={{ backgroundColor: accentColor, originX: 0 }}
      />
    </motion.div>
  );

  // Override classes for white theme
  const whiteThemeClasses = {
    ...classes,
    overlay: classes.overlay?.replace('bg-gradient-to-t from-dark', 'bg-gradient-to-t from-white').replace('from-dark', 'from-white'),
  };

  // Different layouts
  switch (layout) {
    case 'full-bleed':
      return (
        <motion.section
          {...animations.container}
          className={classes.container?.replace('bg-dark', 'bg-white')}
        >
          <motion.div style={{ y }} className="absolute inset-0">
            {renderVisual()}
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/40" />
          <motion.div style={{ opacity }} className={classes.content}>
            {renderContent()}
          </motion.div>
        </motion.section>
      );

    case 'split-left':
      return (
        <motion.section
          {...animations.container}
          className={classes.container?.replace('bg-dark', 'bg-neutral-50')}
        >
          <motion.div {...animations.visual} className="relative overflow-hidden">
            {renderVisual()}
          </motion.div>
          <div className={classes.content}>
            {renderContent()}
          </div>
        </motion.section>
      );

    case 'text-top':
      return (
        <motion.section className={classes.container?.replace('bg-dark', 'bg-neutral-50')}>
          <div className={classes.content}>
            {renderContent()}
          </div>
          {classes.divider && (
            <motion.div
              {...animations.divider}
              className={classes.divider}
              style={{ backgroundColor: accentColor }}
            />
          )}
          <motion.div {...animations.visual} className="relative overflow-hidden">
            {renderVisual()}
            <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" />
          </motion.div>
        </motion.section>
      );

    case 'diagonal':
      return (
        <motion.section className={classes.container?.replace('bg-dark', 'bg-neutral-50')}>
          <div
            className={`${classes.visual} ${classes.visualClip}`}
            style={{
              clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0 100%)',
            }}
          >
            <motion.div {...animations.visual}>
              {renderVisual()}
            </motion.div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
          <motion.div {...animations.content} className={classes.content}>
            {renderContent()}
          </motion.div>
        </motion.section>
      );

    case 'immersive':
      return (
        <motion.section {...animations.container} className={classes.container?.replace('bg-dark', 'bg-neutral-50')}>
          <motion.div {...animations.visual} className={classes.visual}>
            {renderVisual()}
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-white/40" />
          <div
            className={classes.glow}
            style={{
              background: `radial-gradient(ellipse at center, ${accentColor}15 0%, transparent 70%)`,
            }}
          />
          <motion.div {...animations.content} className={classes.content}>
            {renderContent()}
          </motion.div>
        </motion.section>
      );

    default:
      return (
        <section className={classes.container?.replace('bg-dark', 'bg-neutral-50')}>
          {renderVisual()}
          <div className={classes.content}>
            {renderContent()}
          </div>
        </section>
      );
  }
}

export default ChapterHero;
