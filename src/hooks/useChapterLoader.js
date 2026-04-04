import { useState, useCallback, useEffect } from 'react';
import { generateChapterContent, generateChapterContentFromPdf } from '../api/gemini';
import { useCourse } from '../context/CourseContext';

/**
 * Hook to lazy-load chapter content on navigation
 */
export function useChapterLoader() {
  const {
    courseTitle,
    chapterDuration,
    selectedChapterCount,
    currentChapterIndex,
    generatedChapters,
    addGeneratedChapter,
    markChapterVisited,
    setGenerating,
    setError,
    isGenerating,
    sourceType,
    sourcePdfContent,
    customPrompt,
  } = useCourse();

  const [chapterLoading, setChapterLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  /**
   * Load a specific chapter's content
   */
  const loadChapter = useCallback(async (chapterIndex) => {
    // Check if already generated
    if (generatedChapters[chapterIndex]) {
      markChapterVisited(chapterIndex);
      return generatedChapters[chapterIndex];
    }

    // Don't load if already loading
    if (isGenerating || chapterLoading) {
      return null;
    }

    setChapterLoading(true);
    setLoadError(null);
    setGenerating(true);

    // Debug logging
    console.log('Loading chapter with:', {
      sourceType,
      hasPdfContent: !!sourcePdfContent,
      pdfContentLength: sourcePdfContent?.length || 0,
      customPrompt: customPrompt || 'none'
    });

    try {
      let chapterData;
      
      // Use PDF-based generation if we have PDF content
      if (sourceType === 'pdf' && sourcePdfContent) {
        console.log('Generating chapter from PDF content...');
        chapterData = await generateChapterContentFromPdf(
          courseTitle,
          chapterIndex + 1,
          selectedChapterCount,
          chapterDuration,
          sourcePdfContent,
          customPrompt
        );
      } else {
        console.log('Generating chapter from topic (no PDF content)');
        chapterData = await generateChapterContent(
          courseTitle,
          chapterIndex + 1, // 1-indexed for display
          selectedChapterCount,
          chapterDuration
        );
      }

      addGeneratedChapter(chapterIndex, chapterData);
      markChapterVisited(chapterIndex);
      setRetryCount(0);
      
      return chapterData;
    } catch (error) {
      const errorMessage = error.message || `Failed to load chapter ${chapterIndex + 1}`;
      setLoadError(errorMessage);
      setError(errorMessage);
      throw error;
    } finally {
      setChapterLoading(false);
      setGenerating(false);
    }
  }, [
    courseTitle,
    chapterDuration,
    selectedChapterCount,
    generatedChapters,
    addGeneratedChapter,
    markChapterVisited,
    setGenerating,
    setError,
    isGenerating,
    chapterLoading,
    sourceType,
    sourcePdfContent,
    customPrompt,
  ]);

  /**
   * Retry loading the current chapter
   */
  const retryChapter = useCallback(async () => {
    setRetryCount(prev => prev + 1);
    return loadChapter(currentChapterIndex);
  }, [currentChapterIndex, loadChapter]);

  /**
   * Check if a chapter is loaded
   */
  const isChapterLoaded = useCallback((index) => {
    return !!generatedChapters[index];
  }, [generatedChapters]);

  /**
   * Get chapter data
   */
  const getChapter = useCallback((index) => {
    return generatedChapters[index] || null;
  }, [generatedChapters]);

  /**
   * Auto-load current chapter if not loaded
   */
  useEffect(() => {
    if (
      courseTitle &&
      selectedChapterCount > 0 &&
      !generatedChapters[currentChapterIndex] &&
      !chapterLoading &&
      !isGenerating
    ) {
      loadChapter(currentChapterIndex);
    }
  }, [
    courseTitle,
    selectedChapterCount,
    currentChapterIndex,
    generatedChapters,
    chapterLoading,
    isGenerating,
    loadChapter,
  ]);

  /**
   * Preload adjacent chapters for smoother navigation
   */
  const preloadAdjacentChapters = useCallback(async () => {
    const adjacentIndices = [
      currentChapterIndex - 1,
      currentChapterIndex + 1,
    ].filter(i => i >= 0 && i < selectedChapterCount);

    for (const index of adjacentIndices) {
      if (!generatedChapters[index] && !isGenerating && !chapterLoading) {
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          await loadChapter(index);
        } catch (e) {
          console.warn(`Failed to preload chapter ${index + 1}`);
        }
      }
    }
  }, [
    currentChapterIndex,
    selectedChapterCount,
    generatedChapters,
    isGenerating,
    chapterLoading,
    loadChapter,
  ]);

  return {
    loadChapter,
    retryChapter,
    isChapterLoaded,
    getChapter,
    preloadAdjacentChapters,
    chapterLoading,
    loadError,
    retryCount,
  };
}

export default useChapterLoader;
