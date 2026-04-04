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

  // Difficulty badge colors - white theme
  const difficultyColors = {
    Beginner: 'from-green-500 to-emerald-500',
    Intermediate: 'from-amber-500 to-orange-500',
    Advanced: 'from-red-500 to-rose-500',
  };

  const difficultyBg = {
    Beginner: 'bg-green-50 border-green-200',
    Intermediate: 'bg-amber-50 border-amber-200',
    Advanced: 'bg-red-50 border-red-200',
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
      <div className="bg-white border border-neutral-200 p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
        {/* Course Description */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h3 className="text-xl md:text-2xl font-heading font-bold text-neutral-900">
            Course Overview
          </h3>
          <p className="text-neutral-600 leading-relaxed">
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
              <p className="text-sm text-neutral-500">Difficulty</p>
              <p className="font-medium text-neutral-900">{difficultyLevel}</p>
            </div>
          </div>

          {/* Target Audience */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-600">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Best For</p>
              <p className="font-medium text-neutral-900">{targetAudience}</p>
            </div>
          </div>
        </motion.div>

        {/* AI Reasoning */}
        <motion.div
          variants={itemVariants}
          className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100 flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-blue-700 font-medium mb-1">
              AI Recommendation
            </p>
            <p className="text-neutral-600 text-sm leading-relaxed">
              {reasoning}
            </p>
          </div>
        </motion.div>

        {/* Visual divider */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-4"
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
          <Target className="w-5 h-5 text-neutral-300" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
        </motion.div>

        {/* Next step indicator */}
        <motion.p
          variants={itemVariants}
          className="text-center text-neutral-500 text-sm"
        >
          Select how many chapters you'd like below
        </motion.p>
      </div>
    </motion.div>
  );
}

export default ChapterCountDisplay;
