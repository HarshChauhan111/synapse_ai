import { useCallback, useRef } from 'react';
import { courseAPI, quizAPI } from '../api/backend';
import { useAuth } from '../context/AuthContext';

/**
 * Hook for syncing course data with backend
 */
export function useCourseSync() {
  const { isAuthenticated } = useAuth();
  const currentCourseIdRef = useRef(null);

  /**
   * Save a new course to backend
   */
  const saveCourse = useCallback(async (courseData) => {
    if (!isAuthenticated) return null;

    try {
      const response = await courseAPI.create({
        title: courseData.courseTitle,
        description: courseData.courseDescription,
        chapterDuration: courseData.chapterDuration,
        difficultyLevel: courseData.difficultyLevel,
        targetAudience: courseData.targetAudience,
        thumbnailUrl: courseData.thumbnailData?.url,
        thumbnailPhotographer: courseData.thumbnailData?.photographer,
        thumbnailSource: courseData.thumbnailData?.source,
        selectedChapterCount: courseData.selectedChapterCount,
        chaptersData: courseData.generatedChapters || {},
      });

      currentCourseIdRef.current = response.course.id;
      return response.course;
    } catch (error) {
      console.error('Failed to save course:', error);
      throw error;
    }
  }, [isAuthenticated]);

  /**
   * Load a saved course from backend
   */
  const loadCourse = useCallback(async (courseId) => {
    if (!isAuthenticated) return null;

    try {
      const response = await courseAPI.get(courseId);
      currentCourseIdRef.current = courseId;
      return response.course;
    } catch (error) {
      console.error('Failed to load course:', error);
      throw error;
    }
  }, [isAuthenticated]);

  /**
   * Update course progress
   */
  const updateProgress = useCallback(async (progress, chaptersData = null) => {
    if (!isAuthenticated || !currentCourseIdRef.current) return;

    try {
      await courseAPI.updateProgress(currentCourseIdRef.current, {
        currentChapterIndex: progress.currentChapterIndex,
        visitedChapters: progress.visitedChapters,
        completed: progress.completed,
        ...(chaptersData && { chaptersData }),
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
      // Don't throw - allow offline usage
    }
  }, [isAuthenticated]);

  /**
   * Update chapters data (when new chapter is generated)
   */
  const updateChaptersData = useCallback(async (chaptersData) => {
    if (!isAuthenticated || !currentCourseIdRef.current) return;

    try {
      await courseAPI.update(currentCourseIdRef.current, chaptersData);
    } catch (error) {
      console.error('Failed to update chapters:', error);
    }
  }, [isAuthenticated]);

  /**
   * Save quiz result
   */
  const saveQuizResult = useCallback(async (quizData) => {
    if (!isAuthenticated || !currentCourseIdRef.current) return;

    try {
      const response = await quizAPI.saveResult({
        courseId: currentCourseIdRef.current,
        chaptersQuizzed: quizData.chaptersQuizzed,
        score: quizData.score,
        totalQuestions: quizData.totalQuestions,
        answersData: quizData.answersData,
      });
      return response.quiz;
    } catch (error) {
      console.error('Failed to save quiz result:', error);
    }
  }, [isAuthenticated]);

  /**
   * Get all saved courses
   */
  const getAllCourses = useCallback(async () => {
    if (!isAuthenticated) return [];

    try {
      const response = await courseAPI.getAll();
      return response.courses;
    } catch (error) {
      console.error('Failed to get courses:', error);
      return [];
    }
  }, [isAuthenticated]);

  /**
   * Delete a course
   */
  const deleteCourse = useCallback(async (courseId) => {
    if (!isAuthenticated) return;

    try {
      await courseAPI.delete(courseId);
      if (currentCourseIdRef.current === courseId) {
        currentCourseIdRef.current = null;
      }
    } catch (error) {
      console.error('Failed to delete course:', error);
      throw error;
    }
  }, [isAuthenticated]);

  /**
   * Set current course ID (for existing courses)
   */
  const setCurrentCourseId = useCallback((courseId) => {
    currentCourseIdRef.current = courseId;
  }, []);

  /**
   * Get current course ID
   */
  const getCurrentCourseId = useCallback(() => {
    return currentCourseIdRef.current;
  }, []);

  return {
    saveCourse,
    loadCourse,
    updateProgress,
    updateChaptersData,
    saveQuizResult,
    getAllCourses,
    deleteCourse,
    setCurrentCourseId,
    getCurrentCourseId,
    isAuthenticated,
  };
}

export default useCourseSync;
