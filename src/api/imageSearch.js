/**
 * Unified Image Search - Orchestrates Pexels, Wikipedia, and Pollinations
 * 
 * Priority:
 * 1. Pexels - Best for real photos (people, objects, scenes)
 * 2. Wikipedia - Best for educational diagrams, historical images, scientific content
 * 3. Pollinations - Best for AI-generated creative/abstract visuals
 */

import { getPexelsImage, searchPexelsImages } from './pexelsApi';
import { getWikipediaImage, searchWikipediaImages } from './wikipediaApi';
import { buildPollinationsUrl, enhanceImagePrompt } from './pollinations';

/**
 * Image type categories to determine best source
 */
const IMAGE_CATEGORIES = {
  realWorld: ['photo', 'landscape', 'people', 'office', 'building', 'nature', 'city', 'food'],
  educational: ['diagram', 'anatomy', 'biology', 'chemistry', 'physics', 'history', 'map', 'chart', 'scientific'],
  creative: ['abstract', 'futuristic', 'concept', 'visualization', 'ai', 'neural', 'digital', 'artistic'],
};

/**
 * Determine best image source based on query keywords
 */
const determineBestSource = (query) => {
  const lowerQuery = query.toLowerCase();
  
  // Check for educational/scientific content - prefer Wikipedia
  if (IMAGE_CATEGORIES.educational.some(keyword => lowerQuery.includes(keyword))) {
    return 'wikipedia';
  }
  
  // Check for creative/abstract content - prefer Pollinations
  if (IMAGE_CATEGORIES.creative.some(keyword => lowerQuery.includes(keyword))) {
    return 'pollinations';
  }
  
  // Default to Pexels for real-world photos
  return 'pexels';
};

/**
 * Get the best image for a query, trying multiple sources
 * @param {string} query - Search term
 * @param {Object} options - Options
 * @param {string} options.preferredSource - Force a specific source
 * @param {number} options.chapterIndex - For Pollinations style variation
 * @returns {Promise<Object>} Image object with url, source, etc.
 */
export const getBestImage = async (query, options = {}) => {
  const { preferredSource, chapterIndex = 0 } = options;
  const source = preferredSource || determineBestSource(query);
  
  let result = null;

  // Try preferred/determined source first
  switch (source) {
    case 'pexels':
      result = await getPexelsImage(query);
      if (result) return result;
      // Fallback to Wikipedia
      result = await getWikipediaImage(query);
      if (result) return result;
      break;

    case 'wikipedia':
      result = await getWikipediaImage(query);
      if (result) return result;
      // Fallback to Pexels
      result = await getPexelsImage(query);
      if (result) return result;
      break;

    case 'pollinations':
      // Pollinations always works (generates on demand)
      return {
        url: buildPollinationsUrl(enhanceImagePrompt(query, chapterIndex)),
        thumbnail: buildPollinationsUrl(query, { width: 400, height: 300 }),
        source: 'pollinations',
        alt: query,
      };

    default:
      break;
  }

  // Final fallback - always use Pollinations
  return {
    url: buildPollinationsUrl(enhanceImagePrompt(query, chapterIndex)),
    thumbnail: buildPollinationsUrl(query, { width: 400, height: 300 }),
    source: 'pollinations',
    alt: query,
  };
};

/**
 * Get multiple images for a query
 * @param {string} query - Search term
 * @param {number} count - Number of images needed
 * @param {string} source - Preferred source
 * @returns {Promise<Array>} Array of image objects
 */
export const getMultipleImages = async (query, count = 5, source = 'pexels') => {
  switch (source) {
    case 'pexels':
      return await searchPexelsImages(query, count);
    case 'wikipedia':
      return await searchWikipediaImages(query, count);
    default:
      // Generate multiple Pollinations images with different seeds
      return Array.from({ length: count }, (_, i) => ({
        url: buildPollinationsUrl(query, { seed: i * 100 }),
        source: 'pollinations',
        alt: query,
      }));
  }
};

/**
 * Get hero image for a chapter based on content type
 * @param {string} courseTitle - Course title
 * @param {string} chapterTitle - Chapter title
 * @param {string} heroType - 'real' | 'educational' | 'creative'
 * @param {number} chapterIndex - For style variation
 */
export const getChapterHeroImage = async (courseTitle, chapterTitle, heroType = 'auto', chapterIndex = 0) => {
  const searchQuery = `${chapterTitle} ${courseTitle}`;
  
  let preferredSource;
  switch (heroType) {
    case 'real':
      preferredSource = 'pexels';
      break;
    case 'educational':
      preferredSource = 'wikipedia';
      break;
    case 'creative':
      preferredSource = 'pollinations';
      break;
    default:
      preferredSource = null; // Auto-detect
  }

  return await getBestImage(searchQuery, { preferredSource, chapterIndex });
};

/**
 * Get section inline image
 * @param {string} searchTerm - What to search for
 * @param {string} imageType - 'real' | 'educational' | 'diagram'
 */
export const getSectionImage = async (searchTerm, imageType = 'auto') => {
  let preferredSource;
  switch (imageType) {
    case 'real':
      preferredSource = 'pexels';
      break;
    case 'educational':
    case 'diagram':
      preferredSource = 'wikipedia';
      break;
    default:
      preferredSource = null;
  }

  return await getBestImage(searchTerm, { preferredSource });
};

export default {
  getBestImage,
  getMultipleImages,
  getChapterHeroImage,
  getSectionImage,
  determineBestSource,
};
