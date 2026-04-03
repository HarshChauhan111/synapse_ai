import { useState, useCallback, useRef } from 'react';
import { generateQuizBatch } from '../api/gemini';
import { useCourse } from '../context/CourseContext';

const BATCH_SIZE = 10; // Generate 10 questions at a time

/**
 * Hook for quiz generation and scoring with batch loading
 */
export function useQuiz() {
  const { courseTitle, generatedChapters, visitedChapters } = useCourse();

  // Quiz state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionNumber: selectedAnswer }
  const [showResult, setShowResult] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  
  // Batch tracking refs (to persist across renders without causing re-renders)
  const batchNumberRef = useRef(1);
  const selectedChaptersRef = useRef([]);
  const chaptersDataRef = useRef([]);
  const isLoadingMoreRef = useRef(false);

  /**
   * Get available chapters for quiz (visited chapters with titles)
   */
  const getAvailableChapters = useCallback(() => {
    return visitedChapters
      .filter(index => generatedChapters[index])
      .map(index => ({
        index,
        title: generatedChapters[index]?.chapterTitle || `Chapter ${index + 1}`,
      }));
  }, [visitedChapters, generatedChapters]);

  /**
   * Open the quiz setup modal
   */
  const openQuizSetup = useCallback(() => {
    setIsModalOpen(true);
    setError(null);
  }, []);

  /**
   * Close the quiz setup modal
   */
  const closeQuizSetup = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  /**
   * Load more questions (next batch)
   */
  const loadMoreQuestions = useCallback(async () => {
    // Prevent duplicate calls
    if (isLoadingMoreRef.current) return;
    
    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);

    try {
      const nextBatch = batchNumberRef.current + 1;
      console.log(`Loading batch ${nextBatch}...`);

      const newQuestions = await generateQuizBatch(
        courseTitle,
        chaptersDataRef.current,
        BATCH_SIZE,
        nextBatch
      );

      if (newQuestions && newQuestions.length > 0) {
        // Renumber questions to continue from where we left off
        const lastQuestionNumber = questions.length;
        const renumberedQuestions = newQuestions.map((q, idx) => ({
          ...q,
          questionNumber: lastQuestionNumber + idx + 1,
        }));

        setQuestions(prev => [...prev, ...renumberedQuestions]);
        batchNumberRef.current = nextBatch;
        console.log(`Loaded ${renumberedQuestions.length} more questions`);
      }
    } catch (err) {
      console.error('Error loading more questions:', err);
      // Don't show error - just continue with existing questions
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [courseTitle, questions.length]);

  /**
   * Generate initial quiz questions batch
   */
  const startQuiz = useCallback(async (selectedChapterIndices) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Get chapter data for selected indices
      const chaptersData = selectedChapterIndices
        .filter(index => generatedChapters[index])
        .map(index => generatedChapters[index]);
      
      if (chaptersData.length === 0) {
        throw new Error('No valid chapters selected for quiz');
      }

      // Store for batch loading
      selectedChaptersRef.current = selectedChapterIndices;
      chaptersDataRef.current = chaptersData;
      batchNumberRef.current = 1;

      console.log('Generating initial quiz batch for chapters:', chaptersData.map(c => c.chapterTitle));

      const quizQuestions = await generateQuizBatch(
        courseTitle,
        chaptersData,
        BATCH_SIZE,
        1 // First batch
      );
      
      if (!quizQuestions) {
        throw new Error('Failed to generate quiz. The AI returned an empty response. Please try again.');
      }

      if (!Array.isArray(quizQuestions)) {
        throw new Error('Invalid quiz format received. Please try again.');
      }

      if (quizQuestions.length === 0) {
        throw new Error('No questions were generated. Please try again or select different chapters.');
      }

      // Number questions starting from 1
      const numberedQuestions = quizQuestions.map((q, idx) => ({
        ...q,
        questionNumber: idx + 1,
      }));

      setQuestions(numberedQuestions);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setShowResult(false);
      setIsModalOpen(false);
      setIsQuizActive(true);
    } catch (err) {
      console.error('Quiz generation error:', err);
      const errorMessage = err.message || 'Failed to generate quiz';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [courseTitle, generatedChapters]);

  /**
   * Submit answer for current question
   */
  const submitAnswer = useCallback((answer) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.questionNumber]: answer,
    }));
  }, [questions, currentQuestionIndex]);

  /**
   * Move to next question - with batch loading check
   */
  const nextQuestion = useCallback(() => {
    const nextIndex = currentQuestionIndex + 1;
    
    // Check if we need to load more questions
    // Load when we're at the last question of current batch
    if (nextIndex >= questions.length - 1 && !isLoadingMoreRef.current) {
      loadMoreQuestions();
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(nextIndex);
    }
  }, [currentQuestionIndex, questions.length, loadMoreQuestions]);

  /**
   * Move to previous question
   */
  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  /**
   * Finish quiz and show results
   */
  const finishQuiz = useCallback(() => {
    setShowResult(true);
  }, []);

  /**
   * Calculate quiz score
   */
  const calculateScore = useCallback(() => {
    let correct = 0;
    let answered = Object.keys(answers).length;

    questions.forEach(question => {
      const userAnswer = answers[question.questionNumber];
      if (userAnswer === question.correctAnswer) {
        correct++;
      }
    });

    return {
      correct,
      total: answered,
      totalQuestions: questions.length,
      percentage: answered > 0 ? Math.round((correct / answered) * 100) : 0,
    };
  }, [questions, answers]);

  /**
   * Get detailed results for review
   */
  const getDetailedResults = useCallback(() => {
    return questions
      .filter(question => answers[question.questionNumber] !== undefined)
      .map(question => ({
        ...question,
        userAnswer: answers[question.questionNumber] || null,
        isCorrect: answers[question.questionNumber] === question.correctAnswer,
      }));
  }, [questions, answers]);

  /**
   * Reset quiz state
   */
  const resetQuiz = useCallback(() => {
    setIsQuizActive(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResult(false);
    setError(null);
    setIsLoadingMore(false);
    batchNumberRef.current = 1;
    selectedChaptersRef.current = [];
    chaptersDataRef.current = [];
    isLoadingMoreRef.current = false;
  }, []);

  /**
   * Exit quiz and return to course
   */
  const exitQuiz = useCallback(() => {
    resetQuiz();
    setIsModalOpen(false);
  }, [resetQuiz]);

  /**
   * Get current question
   */
  const currentQuestion = questions[currentQuestionIndex] || null;

  /**
   * Check if current question is answered
   */
  const isCurrentAnswered = currentQuestion
    ? !!answers[currentQuestion.questionNumber]
    : false;

  /**
   * Get max chapters that can be quizzed
   */
  const maxQuizzableChapters = visitedChapters.length;

  /**
   * Get available chapters with titles for selection
   */
  const availableChapters = getAvailableChapters();

  /**
   * Check if at last loaded question
   */
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  /**
   * Get answered questions count
   */
  const answeredCount = Object.keys(answers).length;

  return {
    // State
    isModalOpen,
    isQuizActive,
    isGenerating,
    isLoadingMore,
    error,
    questions,
    currentQuestion,
    currentQuestionIndex,
    answers,
    showResult,
    isCurrentAnswered,
    maxQuizzableChapters,
    availableChapters,
    isLastQuestion,
    answeredCount,

    // Actions
    openQuizSetup,
    closeQuizSetup,
    startQuiz,
    submitAnswer,
    nextQuestion,
    previousQuestion,
    finishQuiz,
    resetQuiz,
    exitQuiz,
    loadMoreQuestions,

    // Computed
    calculateScore,
    getDetailedResults,
    totalQuestions: questions.length,
    progress: questions.length > 0
      ? Math.round(((currentQuestionIndex + 1) / questions.length) * 100)
      : 0,
  };
}

export default useQuiz;
