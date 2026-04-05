/**
 * API Service for Synapse AI Backend
 * Features: Retry mechanism with exponential backoff, fallback support
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Fallback API URL (secondary server if primary fails)
const FALLBACK_API_URL = process.env.REACT_APP_FALLBACK_API_URL || null;

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504], // Timeout, Rate limit, Server errors
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ENETUNREACH', 'Failed to fetch'],
};

// Token management
const getToken = () => localStorage.getItem('synapse_token');
const setToken = (token) => localStorage.setItem('synapse_token', token);
const removeToken = () => localStorage.removeItem('synapse_token');

/**
 * Delay utility for retry backoff
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 */
const getBackoffDelay = (attempt) => {
  const exponentialDelay = RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
  const jitter = Math.random() * 500; // Add jitter to prevent thundering herd
  return Math.min(exponentialDelay + jitter, RETRY_CONFIG.maxDelay);
};

/**
 * Check if error is retryable
 */
const isRetryableError = (error, status) => {
  if (status && RETRY_CONFIG.retryableStatusCodes.includes(status)) {
    return true;
  }
  const errorMessage = error?.message || String(error);
  return RETRY_CONFIG.retryableErrors.some(retryable => 
    errorMessage.toLowerCase().includes(retryable.toLowerCase())
  );
};

/**
 * Single fetch attempt with timeout
 */
const fetchWithTimeout = async (url, config, timeout = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

/**
 * Attempt fetch with retry logic
 */
const fetchWithRetry = async (url, config, maxRetries = RETRY_CONFIG.maxRetries) => {
  let lastError;
  let lastStatus;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, config);
      
      // If response is OK or not retryable, return it
      if (response.ok || !RETRY_CONFIG.retryableStatusCodes.includes(response.status)) {
        return response;
      }
      
      lastStatus = response.status;
      lastError = new Error(`HTTP ${response.status}`);
      
      // Don't retry on last attempt
      if (attempt < maxRetries) {
        const backoffDelay = getBackoffDelay(attempt);
        console.warn(`API request failed (${response.status}), retrying in ${Math.round(backoffDelay)}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await delay(backoffDelay);
      }
    } catch (error) {
      lastError = error;
      
      if (!isRetryableError(error) || attempt >= maxRetries) {
        throw error;
      }
      
      const backoffDelay = getBackoffDelay(attempt);
      console.warn(`API request error: ${error.message}, retrying in ${Math.round(backoffDelay)}ms... (attempt ${attempt + 1}/${maxRetries})`);
      await delay(backoffDelay);
    }
  }

  throw lastError || new Error('Request failed after retries');
};

/**
 * Helper for authenticated requests with retry and fallback
 */
const authFetch = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  let response;
  let usedFallback = false;

  // Try primary API with retries
  try {
    response = await fetchWithRetry(`${API_URL}${endpoint}`, config);
  } catch (primaryError) {
    // If fallback URL exists, try it
    if (FALLBACK_API_URL) {
      console.warn(`Primary API failed, attempting fallback: ${primaryError.message}`);
      try {
        response = await fetchWithRetry(`${FALLBACK_API_URL}${endpoint}`, config);
        usedFallback = true;
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError.message);
        throw new Error(`Both primary and fallback APIs failed. Primary: ${primaryError.message}. Fallback: ${fallbackError.message}`);
      }
    } else {
      throw primaryError;
    }
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Invalid JSON response from server');
  }

  if (!response.ok) {
    // Handle token expiry
    if (response.status === 401) {
      removeToken();
      window.dispatchEvent(new Event('auth:logout'));
    }
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  // Log if fallback was used (for monitoring)
  if (usedFallback) {
    console.info('Request succeeded using fallback API');
  }

  return data;
};

// ============================================
// AUTH API
// ============================================

export const authAPI = {
  /**
   * Register new user
   */
  register: async (email, password, name) => {
    const data = await authFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    setToken(data.token);
    return data;
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    const data = await authFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return data;
  },

  /**
   * Get current user
   */
  me: async () => {
    return authFetch('/auth/me');
  },

  /**
   * Update user profile
   */
  updateProfile: async (updates) => {
    return authFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Logout (client-side only)
   */
  logout: () => {
    removeToken();
    window.dispatchEvent(new Event('auth:logout'));
  },

  /**
   * Check if user is logged in
   */
  isAuthenticated: () => !!getToken(),
};

// ============================================
// COURSE API
// ============================================

export const courseAPI = {
  /**
   * Create new course
   */
  create: async (courseData) => {
    return authFetch('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  },

  /**
   * Get all user courses
   */
  getAll: async () => {
    return authFetch('/courses');
  },

  /**
   * Get single course with progress
   */
  get: async (courseId) => {
    return authFetch(`/courses/${courseId}`);
  },

  /**
   * Update course chapters data
   */
  update: async (courseId, chaptersData) => {
    return authFetch(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify({ chaptersData }),
    });
  },

  /**
   * Update course progress
   */
  updateProgress: async (courseId, progress) => {
    return authFetch(`/courses/${courseId}/progress`, {
      method: 'PUT',
      body: JSON.stringify(progress),
    });
  },

  /**
   * Delete course
   */
  delete: async (courseId) => {
    return authFetch(`/courses/${courseId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// QUIZ API
// ============================================

export const quizAPI = {
  /**
   * Save quiz result
   */
  saveResult: async (quizData) => {
    return authFetch('/quiz', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  },

  /**
   * Get quiz history for course
   */
  getCourseQuizzes: async (courseId) => {
    return authFetch(`/quiz/course/${courseId}`);
  },

  /**
   * Get all quiz history
   */
  getAll: async () => {
    return authFetch('/quiz/all');
  },

  /**
   * Get quiz stats
   */
  getStats: async () => {
    return authFetch('/quiz/stats');
  },
};

// ============================================
// MARKETPLACE API
// ============================================

export const marketplaceAPI = {
  /**
   * Get public courses
   */
  getCourses: async (options = {}) => {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    if (options.sort) params.append('sort', options.sort);
    if (options.category) params.append('category', options.category);
    if (options.difficulty) params.append('difficulty', options.difficulty);
    
    const query = params.toString();
    return authFetch(`/marketplace${query ? `?${query}` : ''}`);
  },

  /**
   * Search courses
   */
  search: async (query, options = {}) => {
    const params = new URLSearchParams({ q: query });
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    
    return authFetch(`/marketplace/search?${params.toString()}`);
  },

  /**
   * Get trending courses
   */
  getTrending: async (limit = 6) => {
    return authFetch(`/marketplace/trending?limit=${limit}`);
  },

  /**
   * Get categories
   */
  getCategories: async () => {
    return authFetch('/marketplace/categories');
  },

  /**
   * Get single public course
   */
  getCourse: async (courseId) => {
    return authFetch(`/marketplace/course/${courseId}`);
  },

  /**
   * Record view for a course
   */
  recordView: async (courseId) => {
    return authFetch(`/marketplace/course/${courseId}/view`, {
      method: 'POST',
    });
  },

  /**
   * Save/bookmark a course
   */
  saveCourse: async (courseId) => {
    return authFetch(`/marketplace/course/${courseId}/save`, {
      method: 'POST',
    });
  },

  /**
   * Unsave a course
   */
  unsaveCourse: async (courseId) => {
    return authFetch(`/marketplace/course/${courseId}/save`, {
      method: 'DELETE',
    });
  },

  /**
   * Get saved courses
   */
  getSavedCourses: async () => {
    return authFetch('/marketplace/saved');
  },

  /**
   * Get user's public courses
   */
  getMyPublicCourses: async () => {
    return authFetch('/marketplace/my-courses');
  },

  /**
   * Publish course to marketplace
   */
  publishCourse: async (courseId, { category, tags } = {}) => {
    return authFetch(`/marketplace/course/${courseId}/publish`, {
      method: 'POST',
      body: JSON.stringify({ category, tags }),
    });
  },

  /**
   * Unpublish course from marketplace
   */
  unpublishCourse: async (courseId) => {
    return authFetch(`/marketplace/course/${courseId}/unpublish`, {
      method: 'POST',
    });
  },

  /**
   * Get course analytics
   */
  getCourseAnalytics: async (courseId) => {
    return authFetch(`/marketplace/course/${courseId}/analytics`);
  },
};

// ============================================
// PDF API
// ============================================

export const pdfAPI = {
  /**
   * Upload PDF with extracted text
   */
  upload: async (fileName, extractedText, pageCount) => {
    return authFetch('/pdf/upload', {
      method: 'POST',
      body: JSON.stringify({ fileName, extractedText, pageCount }),
    });
  },

  /**
   * Get user's uploaded PDFs
   */
  getUploads: async () => {
    return authFetch('/pdf/uploads');
  },

  /**
   * Delete uploaded PDF
   */
  deleteUpload: async (pdfId) => {
    return authFetch(`/pdf/uploads/${pdfId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get combined PDF content for course generation
   */
  generateFromPdfs: async (pdfIds, courseSettings = {}) => {
    return authFetch('/pdf/generate-structure', {
      method: 'POST',
      body: JSON.stringify({ pdfIds, courseSettings }),
    });
  },
};

const backendAPI = {
  auth: authAPI,
  courses: courseAPI,
  quiz: quizAPI,
  marketplace: marketplaceAPI,
  pdf: pdfAPI,
};

export default backendAPI;
