import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Home } from 'lucide-react';
import { useCourse } from '../../context/CourseContext';

function Navbar() {
  const location = useLocation();
  const { courseTitle, courseSetupComplete, progressPercentage } = useCourse();

  const isCoursePage = location.pathname === '/course';

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-tertiary flex items-center justify-center"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <span className="font-heading font-bold text-xl text-white group-hover:text-gradient transition-all">
              CourseForge AI
            </span>
          </Link>

          {/* Center - Course Title (if on course page) */}
          {isCoursePage && courseTitle && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden md:flex items-center gap-3"
            >
              <BookOpen className="w-5 h-5 text-accent-primary" />
              <span className="text-sm text-white/80 max-w-md truncate">
                {courseTitle}
              </span>
            </motion.div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Progress indicator on course page */}
            {isCoursePage && courseSetupComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:flex items-center gap-2"
              >
                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-accent-primary to-accent-tertiary"
                  />
                </div>
                <span className="text-xs text-white/60">
                  {Math.round(progressPercentage)}%
                </span>
              </motion.div>
            )}

            {/* Navigation links */}
            {location.pathname !== '/' && (
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-white/80 hover:text-white"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar at very top */}
      {isCoursePage && courseSetupComplete && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-tertiary"
          />
        </div>
      )}
    </motion.nav>
  );
}

export default Navbar;
