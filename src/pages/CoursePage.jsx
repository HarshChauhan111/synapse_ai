import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useChapterLoader } from '../hooks/useChapterLoader';
import { useChatbotHook } from '../hooks/useChatbot';
import { useQuiz } from '../hooks/useQuiz';

function CoursePage() {
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const hasShownHero = useRef(false);

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
    navigateToChapter,
    courseSetupComplete,
    isGenerating,
    generationError,
  } = useCourse();

  const {
    chapterLoading,
    loadError,
    retryChapter,
  } = useChapterLoader();

  const chatbot = useChatbotHook();
  const quiz = useQuiz();

  // Redirect if course setup not complete
  useEffect(() => {
    if (!courseSetupComplete || !courseTitle) {
      navigate('/setup');
    }
  }, [courseSetupComplete, courseTitle, navigate]);

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
          error={loadError || generationError}
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
                    onClick={quiz.finishQuiz}
                    className="px-4 py-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    Finish Quiz ({quiz.answeredCount} answered)
                  </button>
                )}
                <button
                  onClick={() => {
                    // If user has answered questions, show results first
                    if (quiz.answeredCount > 0 && !quiz.showResult) {
                      quiz.finishQuiz();
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
