import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CourseHero from '../components/course-viewer/CourseHero';
import ChapterPage from '../components/course-viewer/ChapterPage';
import ChapterPagination from '../components/course-viewer/ChapterPagination';
import ChatbotToggleButton from '../components/chatbot/ChatbotToggleButton';
import ChatbotPanel from '../components/chatbot/ChatbotPanel';
import QuizTriggerButton from '../components/quiz/QuizTriggerButton';
import QuizSetupModal from '../components/quiz/QuizSetupModal';
import QuizQuestion from '../components/quiz/QuizQuestion';
import QuizProgress from '../components/quiz/QuizProgress';
import QuizResult from '../components/quiz/QuizResult';
import { useCourse } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { useChapterLoader } from '../hooks/useChapterLoader';
import { useChatbotHook } from '../hooks/useChatbot';
import { useQuiz } from '../hooks/useQuiz';
import { courseAPI, quizAPI } from '../api/backend';
import { Loader2 } from 'lucide-react';

function CoursePage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const contentRef = useRef(null);
  const hasShownHero = useRef(false);
  const [loadingCourse, setLoadingCourse] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const { isAuthenticated } = useAuth();

  const {
    courseTitle,
    courseDescription,
    difficultyLevel,
    targetAudience,
    chapterDuration,
    selectedChapterCount,
    thumbnailData,
    currentChapterIndex,
    currentChapter,
    visitedChapters,
    generatedChapters,
    navigateToChapter,
    courseSetupComplete,
    isGenerating,
    generationError,
    loadSavedCourse,
    courseId: contextCourseId,
  } = useCourse();

  const {
    chapterLoading,
    loadError: chapterLoadError,
    retryChapter,
  } = useChapterLoader();

  const chatbot = useChatbotHook();
  const quiz = useQuiz();

  // Load saved course if courseId provided
  useEffect(() => {
    if (courseId && isAuthenticated && !courseSetupComplete) {
      const loadCourse = async () => {
        setLoadingCourse(true);
        setLoadError(null);
        try {
          const response = await courseAPI.get(courseId);
          loadSavedCourse(response.course);
        } catch (err) {
          console.error('Failed to load course:', err);
          setLoadError(err.message);
        } finally {
          setLoadingCourse(false);
        }
      };
      loadCourse();
    }
  }, [courseId, isAuthenticated, courseSetupComplete, loadSavedCourse]);

  // Save progress when chapter changes
  useEffect(() => {
    if (isAuthenticated && contextCourseId && courseSetupComplete) {
      const saveProgress = async () => {
        try {
          await courseAPI.updateProgress(contextCourseId, {
            currentChapterIndex,
            visitedChapters,
            completed: visitedChapters.length >= selectedChapterCount,
            chaptersData: generatedChapters,
          });
        } catch (err) {
          console.error('Failed to save progress:', err);
        }
      };
      
      // Debounce save
      const timeoutId = setTimeout(saveProgress, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [currentChapterIndex, visitedChapters, generatedChapters, isAuthenticated, contextCourseId, courseSetupComplete, selectedChapterCount]);

  // Redirect if course setup not complete and not loading
  useEffect(() => {
    if (!loadingCourse && !courseSetupComplete && !courseId) {
      navigate('/setup');
    }
  }, [courseSetupComplete, loadingCourse, courseId, navigate]);

  // Scroll to content when navigating chapters
  useEffect(() => {
    if (contentRef.current && hasShownHero.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentChapterIndex]);

  const handleStartLearning = () => {
    hasShownHero.current = true;
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigateToChapter = (index) => {
    navigateToChapter(index);
  };

  // Handle quiz result saving
  const handleQuizFinish = async () => {
    quiz.finishQuiz();
    
    // Save quiz result to backend
    if (isAuthenticated && contextCourseId) {
      const score = quiz.calculateScore();
      const detailedResults = quiz.getDetailedResults();
      try {
        await quizAPI.saveResult({
          courseId: contextCourseId,
          chaptersQuizzed: quiz.selectedChapters || [],
          score: score.correct,
          totalQuestions: score.total,
          answersData: detailedResults,
        });
      } catch (err) {
        console.error('Failed to save quiz result:', err);
      }
    }
  };

  // Loading state for saved course
  if (loadingCourse) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#1DA1F2] mx-auto mb-4" />
          <p className="text-neutral-600">Loading your course...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl">😕</span>
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            Failed to load course
          </h2>
          <p className="text-neutral-600 mb-6">{loadError}</p>
          <button
            onClick={() => navigate('/my-courses')}
            className="px-6 py-3 bg-[#1DA1F2] text-white font-medium rounded-xl hover:bg-[#1a8cd8] transition-colors"
          >
            Go to My Courses
          </button>
        </div>
      </div>
    );
  }

  if (!courseSetupComplete) {
    return null;
  }

  return (
    <div
      className={`
        min-h-screen bg-neutral-50 transition-all duration-300
        ${chatbot.isOpen ? 'lg:mr-[20vw] lg:min-w-0' : ''}
      `}
    >
      {/* Course Hero - shown at top */}
      <CourseHero
        courseTitle={courseTitle}
        courseDescription={courseDescription}
        difficultyLevel={difficultyLevel}
        targetAudience={targetAudience}
        chapterDuration={chapterDuration}
        selectedChapterCount={selectedChapterCount}
        thumbnailData={thumbnailData}
        onStartLearning={handleStartLearning}
      />

      {/* Chapter Content Area */}
      <div ref={contentRef} className="pt-8">
        <ChapterPage
          chapterData={currentChapter}
          chapterIndex={currentChapterIndex}
          totalChapters={selectedChapterCount}
          isLoading={chapterLoading || isGenerating}
          error={chapterLoadError || generationError}
          onRetry={retryChapter}
        />

        {/* Chapter Pagination - at bottom of content */}
        <ChapterPagination
          totalChapters={selectedChapterCount}
          currentChapter={currentChapterIndex}
          visitedChapters={visitedChapters}
          onNavigate={handleNavigateToChapter}
          isGenerating={chapterLoading || isGenerating}
        />
      </div>

      {/* Chatbot */}
      <ChatbotToggleButton
        isOpen={chatbot.isOpen}
        onClick={chatbot.togglePanel}
      />
      <ChatbotPanel
        isOpen={chatbot.isOpen}
        onClose={chatbot.closePanel}
        messages={chatbot.messages}
        isLoading={chatbot.isLoading}
        error={chatbot.error}
        contextInfo={chatbot.getContextInfo()}
        onSendMessage={chatbot.sendMessage}
        onClearChat={chatbot.resetChat}
      />

      {/* Quiz System */}
      {!quiz.isQuizActive && (
        <QuizTriggerButton
          onClick={quiz.openQuizSetup}
          disabled={visitedChapters.length === 0}
        />
      )}

      <QuizSetupModal
        isOpen={quiz.isModalOpen}
        maxChapters={quiz.maxQuizzableChapters}
        availableChapters={quiz.availableChapters}
        onClose={quiz.closeQuizSetup}
        onStart={quiz.startQuiz}
        isGenerating={quiz.isGenerating}
        error={quiz.error}
      />

      {/* Quiz Active Overlay */}
      <AnimatePresence>
        {quiz.isQuizActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm overflow-y-auto"
          >
            <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4">
              {/* Header with close and finish buttons */}
              <div className="absolute top-6 right-6 flex items-center gap-3">
                {!quiz.showResult && quiz.answeredCount > 0 && (
                  <button
                    onClick={handleQuizFinish}
                    className="px-4 py-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    Finish Quiz ({quiz.answeredCount} answered)
                  </button>
                )}
                <button
                  onClick={() => {
                    // If user has answered questions, show results first
                    if (quiz.answeredCount > 0 && !quiz.showResult) {
                      handleQuizFinish();
                    } else {
                      quiz.exitQuiz();
                    }
                  }}
                  className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 transition-colors"
                  title={quiz.answeredCount > 0 && !quiz.showResult ? "View Results" : "Exit Quiz"}
                >
                  ✕
                </button>
              </div>

              {quiz.showResult ? (
                // Quiz Results
                <QuizResult
                  score={quiz.calculateScore()}
                  detailedResults={quiz.getDetailedResults()}
                  onContinue={quiz.exitQuiz}
                  onRetry={() => {
                    quiz.resetQuiz();
                    quiz.openQuizSetup();
                  }}
                />
              ) : (
                // Quiz Questions
                <>
                  <QuizProgress
                    current={quiz.currentQuestionIndex + 1}
                    total={quiz.totalQuestions}
                    isLoadingMore={quiz.isLoadingMore}
                    className="mb-12"
                  />
                  <QuizQuestion
                    question={quiz.currentQuestion}
                    selectedAnswer={quiz.answers[quiz.currentQuestion?.questionNumber]}
                    onSelectAnswer={quiz.submitAnswer}
                    onNext={quiz.nextQuestion}
                    isLoadingMore={quiz.isLoadingMore}
                    isLastQuestion={quiz.isLastQuestion}
                  />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CoursePage;
