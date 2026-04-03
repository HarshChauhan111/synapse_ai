import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Initial state
const initialState = {
  isOpen: false,
  messages: [],
  isLoading: false,
  error: null,
};

// Action types
const ACTIONS = {
  TOGGLE_PANEL: 'TOGGLE_PANEL',
  OPEN_PANEL: 'OPEN_PANEL',
  CLOSE_PANEL: 'CLOSE_PANEL',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
function chatbotReducer(state, action) {
  switch (action.type) {
    case ACTIONS.TOGGLE_PANEL:
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case ACTIONS.OPEN_PANEL:
      return {
        ...state,
        isOpen: true,
      };

    case ACTIONS.CLOSE_PANEL:
      return {
        ...state,
        isOpen: false,
      };

    case ACTIONS.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
        isLoading: false,
        error: null,
      };

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: null,
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case ACTIONS.CLEAR_MESSAGES:
      return {
        ...state,
        messages: [],
        error: null,
      };

    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Context
const ChatbotContext = createContext(null);

// Provider component
export function ChatbotProvider({ children }) {
  const [state, dispatch] = useReducer(chatbotReducer, initialState);

  // Action creators
  const togglePanel = useCallback(() => {
    dispatch({ type: ACTIONS.TOGGLE_PANEL });
  }, []);

  const openPanel = useCallback(() => {
    dispatch({ type: ACTIONS.OPEN_PANEL });
  }, []);

  const closePanel = useCallback(() => {
    dispatch({ type: ACTIONS.CLOSE_PANEL });
  }, []);

  const addMessage = useCallback((role, content) => {
    const message = {
      id: Date.now().toString(),
      role, // 'user' or 'assistant'
      content,
      timestamp: new Date().toISOString(),
    };
    dispatch({
      type: ACTIONS.ADD_MESSAGE,
      payload: message,
    });
    return message;
  }, []);

  const addUserMessage = useCallback((content) => {
    return addMessage('user', content);
  }, [addMessage]);

  const addAssistantMessage = useCallback((content) => {
    return addMessage('assistant', content);
  }, [addMessage]);

  const setLoading = useCallback((isLoading) => {
    dispatch({
      type: ACTIONS.SET_LOADING,
      payload: isLoading,
    });
  }, []);

  const setError = useCallback((error) => {
    dispatch({
      type: ACTIONS.SET_ERROR,
      payload: error,
    });
  }, []);

  const clearMessages = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_MESSAGES });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  }, []);

  // Get conversation history for API calls
  const getConversationHistory = useCallback(() => {
    return state.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }, [state.messages]);

  const value = {
    // State
    ...state,

    // Actions
    togglePanel,
    openPanel,
    closePanel,
    addMessage,
    addUserMessage,
    addAssistantMessage,
    setLoading,
    setError,
    clearMessages,
    clearError,
    getConversationHistory,
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
}

// Custom hook
export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
}

export default ChatbotContext;
