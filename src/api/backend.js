/**
 * API Service for Synapse AI Backend
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Token management
const getToken = () => localStorage.getItem('synapse_token');
const setToken = (token) => localStorage.setItem('synapse_token', token);
const removeToken = () => localStorage.removeItem('synapse_token');

// Helper for authenticated requests
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

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    // Handle token expiry
    if (response.status === 401) {
      removeToken();
      window.dispatchEvent(new Event('auth:logout'));
    }
    throw new Error(data.error || 'Request failed');
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

export default {
  auth: authAPI,
  courses: courseAPI,
  quiz: quizAPI,
  marketplace: marketplaceAPI,
  pdf: pdfAPI,
};
