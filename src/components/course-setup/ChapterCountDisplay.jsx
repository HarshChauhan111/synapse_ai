import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, BarChart3, Lightbulb } from 'lucide-react';

function ChapterCountDisplay({ courseData }) {
  const {
    courseDescription,
    difficultyLevel,
    targetAudience,
    reasoning,
  } = courseData;

  // Difficulty badge colors
  const difficultyColors = {
    Beginner: 'from-green-500 to-emerald-500',
    Intermediate: 'from-amber-500 to-orange-500',
    Advanced: 'from-red-500 to-rose-500',
  };

  const difficultyBg = {
    Beginner: 'bg-green-500/10 border-green-500/30',
    Intermediate: 'bg-amber-500/10 border-amber-500/30',
    Advanced: 'bg-red-500/10 border-red-500/30',
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-2xl mx-auto"
    >
      <div className="glass-card p-6 md:p-8 rounded-2xl space-y-6">
        {/* Course Description */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h3 className="text-xl md:text-2xl font-heading font-bold text-white">
            Course Overview
          </h3>
          <p className="text-white/70 leading-relaxed">
            {courseDescription}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Difficulty */}
          <div
            className={`
              flex items-center gap-3 p-4 rounded-xl border
              ${difficultyBg[difficultyLevel] || difficultyBg.Intermediate}
            `}
          >
            <div
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                bg-gradient-to-br ${difficultyColors[difficultyLevel] || difficultyColors.Intermediate}
              `}
            >
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/50">Difficulty</p>
              <p className="font-medium text-white">{difficultyLevel}</p>
            </div>
          </div>

          {/* Target Audience */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-accent-primary to-accent-secondary">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/50">Best For</p>
              <p className="font-medium text-white">{targetAudience}</p>
            </div>
          </div>
        </motion.div>

        {/* AI Reasoning */}
        <motion.div
          variants={itemVariants}
          className="flex items-start gap-3 p-4 rounded-xl bg-accent-primary/10 border border-accent-primary/30"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent-primary/20 flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <p className="text-sm text-accent-primary font-medium mb-1">
              AI Recommendation
            </p>
            <p className="text-white/70 text-sm leading-relaxed">
              {reasoning}
            </p>
          </div>
        </motion.div>

        {/* Visual divider */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-4"
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <Target className="w-5 h-5 text-white/30" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </motion.div>

        {/* Next step indicator */}
        <motion.p
          variants={itemVariants}
          className="text-center text-white/50 text-sm"
        >
          Select how many chapters you'd like below
        </motion.p>
      </div>
    </motion.div>
  );
}

export default ChapterCountDisplay;
