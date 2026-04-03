import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CourseInputForm from '../components/course-setup/CourseInputForm';
import ChapterCountDisplay from '../components/course-setup/ChapterCountDisplay';
import ChapterSelector from '../components/course-setup/ChapterSelector';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { StepProgress } from '../components/common/ProgressBar';
import { useCourse } from '../context/CourseContext';
import { useCourseGenerator } from '../hooks/useCourseGenerator';

const STEPS = ['Topic', 'Structure', 'Chapters'];

function CourseSetupPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const {
    suggestedChapters,
    recommendedChapters,
    selectedChapterCount,
    setChapterCount,
    courseDescription,
    difficultyLevel,
    targetAudience,
    reasoning,
  } = useCourse();

  const {
    generateStructure,
    startCourse,
    structureLoading,
    structureError,
  } = useCourseGenerator();

  // Step 1: Handle course input form submission
  const handleFormSubmit = async (title, duration) => {
    try {
      await generateStructure(title, duration);
      setCurrentStep(1);
    } catch (error) {
      console.error('Failed to generate structure:', error);
    }
  };

  // Step 2 → Step 3: Automatically moves when structure is ready
  // Move to chapter selection when courseDescription is available
  React.useEffect(() => {
    if (currentStep === 1 && courseDescription && !structureLoading) {
      // Small delay for smooth transition
      const timer = setTimeout(() => setCurrentStep(2), 500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, courseDescription, structureLoading]);

  // Step 3: Handle chapter count selection
  const handleChapterSelect = (count) => {
    setChapterCount(count);
  };

  // Step 3: Handle final confirmation
  const handleConfirm = () => {
    startCourse();
    navigate('/course');
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen gradient-mesh pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Step progress indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <StepProgress steps={STEPS} currentStep={currentStep} />
        </motion.div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {/* Step 0: Course Input Form */}
          {currentStep === 0 && (
            <motion.div
              key="step-0"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <CourseInputForm
                onSubmit={handleFormSubmit}
                isLoading={structureLoading}
              />
              {structureError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-red-400 mt-4"
                >
                  {structureError}
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Step 1: Loading / Analyzing */}
          {currentStep === 1 && structureLoading && (
            <motion.div
              key="step-1-loading"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center min-h-[400px]"
            >
              <LoadingSpinner type="analyzing" size="xl" />
            </motion.div>
          )}

          {/* Step 2: Show structure and chapter selection */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Course structure display */}
              <ChapterCountDisplay
                courseData={{
                  courseDescription,
                  difficultyLevel,
                  targetAudience,
                  reasoning,
                }}
              />

              {/* Chapter selector */}
              <ChapterSelector
                suggestedChapters={suggestedChapters}
                recommendedChapters={recommendedChapters}
                selectedCount={selectedChapterCount}
                onSelect={handleChapterSelect}
                onConfirm={handleConfirm}
                isLoading={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CourseSetupPage;
