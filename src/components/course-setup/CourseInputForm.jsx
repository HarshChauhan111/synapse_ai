import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, BookOpen } from 'lucide-react';
import Button from '../common/Button';

const DURATION_OPTIONS = [
  { value: '15 min', label: '15 minutes', description: 'Quick overview' },
  { value: '30 min', label: '30 minutes', description: 'Standard lesson' },
  { value: '45 min', label: '45 minutes', description: 'In-depth coverage' },
  { value: '1 hour', label: '1 hour', description: 'Comprehensive study' },
];

function CourseInputForm({ onSubmit, isLoading }) {
  const [courseTitle, setCourseTitle] = useState('');
  const [chapterDuration, setChapterDuration] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!courseTitle.trim()) {
      newErrors.courseTitle = 'Please enter a course title';
    } else if (courseTitle.trim().length < 3) {
      newErrors.courseTitle = 'Course title must be at least 3 characters';
    }
    if (!chapterDuration) {
      newErrors.chapterDuration = 'Please select a chapter duration';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(courseTitle.trim(), chapterDuration);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white border border-neutral-200 p-8 md:p-10 rounded-2xl shadow-sm space-y-8">
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-600 flex items-center justify-center"
          >
            <BookOpen className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-2">
            Create Your Course
          </h2>
          <p className="text-neutral-500">
            Tell us what you want to learn, and AI will design the perfect curriculum
          </p>
        </div>

        {/* Course Title Input */}
        <div className="space-y-2">
          <label
            htmlFor="courseTitle"
            className="flex items-center gap-2 text-sm font-medium text-neutral-700"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            Course Title
          </label>
          <motion.input
            whileFocus={{ scale: 1.01 }}
            type="text"
            id="courseTitle"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            placeholder="e.g., Machine Learning for Beginners"
            className={`
              w-full px-4 py-4 rounded-xl
              bg-neutral-50 border
              ${errors.courseTitle ? 'border-red-500' : 'border-neutral-200'}
              text-neutral-900 placeholder:text-neutral-400
              focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white
              transition-all duration-200
            `}
            disabled={isLoading}
          />
          {errors.courseTitle && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm"
            >
              {errors.courseTitle}
            </motion.p>
          )}
        </div>

        {/* Duration Selection */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <Clock className="w-4 h-4 text-blue-600" />
            Duration per Chapter
          </label>
          <div className="grid grid-cols-2 gap-3">
            {DURATION_OPTIONS.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setChapterDuration(option.value)}
                disabled={isLoading}
                className={`
                  relative p-4 rounded-xl text-left transition-all duration-200
                  ${chapterDuration === option.value
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-neutral-50 border border-neutral-200 hover:border-neutral-300'
                  }
                `}
              >
                <span className={`block font-medium ${chapterDuration === option.value ? 'text-blue-700' : 'text-neutral-900'}`}>
                  {option.label}
                </span>
                <span className="block text-sm text-neutral-500 mt-0.5">
                  {option.description}
                </span>
                {chapterDuration === option.value && (
                  <motion.div
                    layoutId="duration-selected"
                    className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500"
                  />
                )}
              </motion.button>
            ))}
          </div>
          {errors.chapterDuration && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm"
            >
              {errors.chapterDuration}
            </motion.p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isLoading}
          icon={Sparkles}
          iconPosition="right"
        >
          Generate Course Structure
        </Button>

        {/* Hint text */}
        <p className="text-center text-sm text-neutral-400">
          Our AI will analyze your topic and suggest an optimal course structure
        </p>
      </div>
    </motion.form>
  );
}

export default CourseInputForm;
