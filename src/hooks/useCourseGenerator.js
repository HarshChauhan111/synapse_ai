import { useState, useCallback } from 'react';
import { generateCourseStructure } from '../api/gemini';
import { fetchCourseThumbnail } from '../api/unsplash';
import { useCourse } from '../context/CourseContext';

/**
 * Hook to orchestrate the full course generation flow
 */
export function useCourseGenerator() {
  const {
    setCourseMeta,
    setCourseStructure,
    setThumbnail,
    setGenerating,
    setError,
    completeSetup,
    courseTitle,
    chapterDuration,
  } = useCourse();

  const [structureLoading, setStructureLoading] = useState(false);
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const [structureError, setStructureError] = useState(null);

  /**
   * Fetch course thumbnail from Unsplash
   */
  const fetchThumbnailAsync = useCallback(async (title) => {
    setThumbnailLoading(true);
    
    try {
      const thumbnailData = await fetchCourseThumbnail(title);
      if (thumbnailData) {
        setThumbnail(thumbnailData);
      }
    } catch (error) {
      console.warn('Failed to fetch thumbnail, using fallback');
    } finally {
      setThumbnailLoading(false);
    }
  }, [setThumbnail]);

  /**
   * Step 1: Generate course structure from title and duration
   */
  const generateStructure = useCallback(async (title, duration) => {
    setStructureLoading(true);
    setStructureError(null);
    setCourseMeta(title, duration);

    try {
      const structure = await generateCourseStructure(title, duration);
      setCourseStructure({
        courseDescription: structure.courseDescription,
        difficultyLevel: structure.difficultyLevel,
        targetAudience: structure.targetAudience,
        reasoning: structure.reasoning,
        suggestedChapters: structure.suggestedChapters,
        recommendedChapters: structure.recommendedChapters,
      });
      
      // Start fetching thumbnail in the background
      fetchThumbnailAsync(title);
      
      return structure;
    } catch (error) {
      const errorMessage = error.message || 'Failed to generate course structure';
      setStructureError(errorMessage);
      setError(errorMessage);
      throw error;
    } finally {
      setStructureLoading(false);
    }
  }, [setCourseMeta, setCourseStructure, setError, fetchThumbnailAsync]);

  /**
   * Retry structure generation
   */
  const retryStructure = useCallback(async () => {
    if (courseTitle && chapterDuration) {
      return generateStructure(courseTitle, chapterDuration);
    }
  }, [courseTitle, chapterDuration, generateStructure]);

  /**
   * Start the course (called after chapter count is selected)
   */
  const startCourse = useCallback(() => {
    completeSetup();
    setGenerating(false);
  }, [completeSetup, setGenerating]);

  return {
    generateStructure,
    fetchThumbnail: fetchThumbnailAsync,
    retryStructure,
    startCourse,
    structureLoading,
    thumbnailLoading,
    structureError,
  };
}

export default useCourseGenerator;
