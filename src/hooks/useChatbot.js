import { useCallback, useEffect } from 'react';
import { chatWithTutor } from '../api/gemini';
import { useChatbot as useChatbotContext } from '../context/ChatbotContext';
import { useCourse } from '../context/CourseContext';

/**
 * Hook for managing chatbot interactions
 */
export function useChatbotHook() {
  const {
    isOpen,
    messages,
    isLoading,
    error,
    pendingMessage,
    togglePanel,
    openPanel,
    closePanel,
    addUserMessage,
    addAssistantMessage,
    setLoading,
    setError,
    clearMessages,
    clearError,
    getConversationHistory,
    clearPendingMessage,
    openPanelWithMessage,
  } = useChatbotContext();

  const {
    courseTitle,
    currentChapter,
    currentChapterIndex,
  } = useCourse();

  /**
   * Send a message to the AI tutor
   */
  const sendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim()) return;
    if (!currentChapter) {
      setError('No chapter content available');
      return;
    }

    // Add user message immediately
    addUserMessage(userMessage);
    setLoading(true);
    clearError();

    try {
      // Build chapter content summary for context
      const chapterSummary = [
        currentChapter.chapterSummary,
        `Key takeaways: ${currentChapter.keyTakeaways.join(', ')}`,
      ].join('\n');

      // Get conversation history (without the message we just added)
      const history = getConversationHistory().slice(0, -1);

      const response = await chatWithTutor(
        courseTitle,
        currentChapter.chapterTitle,
        chapterSummary,
        history,
        userMessage
      );

      // Handle both new JSON format and legacy string format
      if (typeof response === 'object' && response.text) {
        // New format with potential visual data
        addAssistantMessage(response.text, response.visual);
      } else {
        // Legacy string format
        addAssistantMessage(response);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to get response. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    currentChapter,
    courseTitle,
    addUserMessage,
    addAssistantMessage,
    setLoading,
    setError,
    clearError,
    getConversationHistory,
  ]);

  // Handle pending message when panel opens
  useEffect(() => {
    if (isOpen && pendingMessage && !isLoading) {
      sendMessage(pendingMessage);
      clearPendingMessage();
    }
  }, [isOpen, pendingMessage, isLoading, sendMessage, clearPendingMessage]);

  /**
   * Clear chat and start fresh
   */
  const resetChat = useCallback(() => {
    clearMessages();
    clearError();
  }, [clearMessages, clearError]);

  /**
   * Get context info for display
   */
  const getContextInfo = useCallback(() => {
    return {
      courseTitle,
      chapterTitle: currentChapter?.chapterTitle || 'No chapter loaded',
      chapterNumber: currentChapterIndex + 1,
    };
  }, [courseTitle, currentChapter, currentChapterIndex]);

  return {
    // State
    isOpen,
    messages,
    isLoading,
    error,
    
    // Actions
    togglePanel,
    openPanel,
    closePanel,
    sendMessage,
    resetChat,
    clearError,
    openPanelWithMessage,
    
    // Utils
    getContextInfo,
  };
}

// Re-export the context hook with a clear name
export { useChatbot as useChatbotContext } from '../context/ChatbotContext';

export default useChatbotHook;
