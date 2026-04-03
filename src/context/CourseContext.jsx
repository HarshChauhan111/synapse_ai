import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Initial state
const initialState = {
  courseTitle: '',
  chapterDuration: '',
  selectedChapterCount: 0,
  courseDescription: '',
  difficultyLevel: '',
  targetAudience: '',
  reasoning: '',
  suggestedChapters: [],
  recommendedChapters: 0,
  thumbnailUrl: null,
  thumbnailData: null,
  currentChapterIndex: 0,
  generatedChapters: {}, // { 0: {...chapterData}, 1: {...} }
  visitedChapters: [], // Array of visited chapter indices
  isGenerating: false,
  generationError: null,
  courseSetupComplete: false,
};

// Action types
const ACTIONS = {
  SET_COURSE_META: 'SET_COURSE_META',
  SET_COURSE_STRUCTURE: 'SET_COURSE_STRUCTURE',
  SET_CHAPTER_COUNT: 'SET_CHAPTER_COUNT',
  SET_THUMBNAIL: 'SET_THUMBNAIL',
  CHAPTER_GENERATED: 'CHAPTER_GENERATED',
  NAVIGATE_TO_CHAPTER: 'NAVIGATE_TO_CHAPTER',
  SET_GENERATING: 'SET_GENERATING',
  SET_ERROR: 'SET_ERROR',
  MARK_CHAPTER_VISITED: 'MARK_CHAPTER_VISITED',
  COMPLETE_SETUP: 'COMPLETE_SETUP',
  RESET_COURSE: 'RESET_COURSE',
};

// Reducer
function courseReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_COURSE_META:
      return {
        ...state,
        courseTitle: action.payload.courseTitle,
        chapterDuration: action.payload.chapterDuration,
      };

    case ACTIONS.SET_COURSE_STRUCTURE:
      return {
        ...state,
        courseDescription: action.payload.courseDescription,
        difficultyLevel: action.payload.difficultyLevel,
        targetAudience: action.payload.targetAudience,
        reasoning: action.payload.reasoning,
        suggestedChapters: action.payload.suggestedChapters,
        recommendedChapters: action.payload.recommendedChapters,
      };

    case ACTIONS.SET_CHAPTER_COUNT:
      return {
        ...state,
        selectedChapterCount: action.payload,
      };

    case ACTIONS.SET_THUMBNAIL:
      return {
        ...state,
        thumbnailUrl: action.payload.url,
        thumbnailData: action.payload,
      };

    case ACTIONS.CHAPTER_GENERATED:
      return {
        ...state,
        generatedChapters: {
          ...state.generatedChapters,
          [action.payload.index]: action.payload.data,
        },
        isGenerating: false,
        generationError: null,
      };

    case ACTIONS.NAVIGATE_TO_CHAPTER:
      return {
        ...state,
        currentChapterIndex: action.payload,
      };

    case ACTIONS.MARK_CHAPTER_VISITED:
      if (state.visitedChapters.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        visitedChapters: [...state.visitedChapters, action.payload].sort((a, b) => a - b),
      };

    case ACTIONS.SET_GENERATING:
      return {
        ...state,
        isGenerating: action.payload,
        generationError: null,
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        isGenerating: false,
        generationError: action.payload,
      };

    case ACTIONS.COMPLETE_SETUP:
      return {
        ...state,
        courseSetupComplete: true,
      };

    case ACTIONS.RESET_COURSE:
      return initialState;

    default:
      return state;
  }
}

// Context
const CourseContext = createContext(null);

// Provider component
export function CourseProvider({ children }) {
  const [state, dispatch] = useReducer(courseReducer, initialState);

  // Action creators
  const setCourseMeta = useCallback((courseTitle, chapterDuration) => {
    dispatch({
      type: ACTIONS.SET_COURSE_META,
      payload: { courseTitle, chapterDuration },
    });
  }, []);

  const setCourseStructure = useCallback((structure) => {
    dispatch({
      type: ACTIONS.SET_COURSE_STRUCTURE,
      payload: structure,
    });
  }, []);

  const setChapterCount = useCallback((count) => {
    dispatch({
      type: ACTIONS.SET_CHAPTER_COUNT,
      payload: count,
    });
  }, []);

  const setThumbnail = useCallback((thumbnailData) => {
    dispatch({
      type: ACTIONS.SET_THUMBNAIL,
      payload: thumbnailData,
    });
  }, []);

  const addGeneratedChapter = useCallback((index, data) => {
    dispatch({
      type: ACTIONS.CHAPTER_GENERATED,
      payload: { index, data },
    });
  }, []);

  const navigateToChapter = useCallback((index) => {
    dispatch({
      type: ACTIONS.NAVIGATE_TO_CHAPTER,
      payload: index,
    });
  }, []);

  const markChapterVisited = useCallback((index) => {
    dispatch({
      type: ACTIONS.MARK_CHAPTER_VISITED,
      payload: index,
    });
  }, []);

  const setGenerating = useCallback((isGenerating) => {
    dispatch({
      type: ACTIONS.SET_GENERATING,
      payload: isGenerating,
    });
  }, []);

  const setError = useCallback((error) => {
    dispatch({
      type: ACTIONS.SET_ERROR,
      payload: error,
    });
  }, []);

  const completeSetup = useCallback(() => {
    dispatch({ type: ACTIONS.COMPLETE_SETUP });
  }, []);

  const resetCourse = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_COURSE });
  }, []);

  // Computed values
  const currentChapter = state.generatedChapters[state.currentChapterIndex];
  const isCurrentChapterGenerated = !!currentChapter;
  const completedChaptersCount = state.visitedChapters.length;
  const progressPercentage = state.selectedChapterCount > 0
    ? (completedChaptersCount / state.selectedChapterCount) * 100
    : 0;

  // Get chapters as array for quiz
  const getChaptersArray = useCallback(() => {
    return Object.entries(state.generatedChapters)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([, data]) => data);
  }, [state.generatedChapters]);

  const value = {
    // State
    ...state,
    currentChapter,
    isCurrentChapterGenerated,
    completedChaptersCount,
    progressPercentage,

    // Actions
    setCourseMeta,
    setCourseStructure,
    setChapterCount,
    setThumbnail,
    addGeneratedChapter,
    navigateToChapter,
    markChapterVisited,
    setGenerating,
    setError,
    completeSetup,
    resetCourse,
    getChaptersArray,
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
}

// Custom hook
export function useCourse() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
}

export default CourseContext;
