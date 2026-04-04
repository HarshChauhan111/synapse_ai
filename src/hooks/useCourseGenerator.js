import { useState, useCallback } from 'react';
import { generateCourseStructure, generateCourseStructureFromPdf } from '../api/gemini';
import { getPexelsImage } from '../api/pexelsApi';
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
    setSourceInfo,
  } = useCourse();

  const [structureLoading, setStructureLoading] = useState(false);
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const [structureError, setStructureError] = useState(null);

  /**
   * Fetch course thumbnail from Pexels
   */
  const fetchThumbnailAsync = useCallback(async (title) => {
    setThumbnailLoading(true);
    
    try {
      const pexelsImage = await getPexelsImage(title);
      if (pexelsImage) {
        setThumbnail({
          url: pexelsImage.url,
          photographer: pexelsImage.photographer,
          photographerUrl: pexelsImage.photographerUrl,
          altDescription: pexelsImage.alt || title,
          source: 'pexels',
        });
      }
    } catch (error) {
      console.warn('Failed to fetch Pexels thumbnail, using fallback');
    } finally {
      setThumbnailLoading(false);
    }
  }, [setThumbnail]);

  /**
   * Step 1: Generate course structure from title and duration
   */
  const generateStructure = useCallback(async (title, duration, options = {}) => {
    setStructureLoading(true);
    setStructureError(null);
    setCourseMeta(title, duration);

    // Store source info if provided
    if (options.sourceType) {
      setSourceInfo?.(options.sourceType, options.sourcePdfNames || []);
    }

    try {
      let structure;
      
      if (options.sourceType === 'pdf' && options.sourceText) {
        // Generate from PDF content
        structure = await generateCourseStructureFromPdf(title, duration, options.sourceText);
      } else {
        // Generate from topic
        structure = await generateCourseStructure(title, duration);
      }
      
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
  }, [setCourseMeta, setCourseStructure, setError, fetchThumbnailAsync, setSourceInfo]);

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
