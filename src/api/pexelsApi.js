/**
 * Pexels API for high-quality stock photos
 */

const PEXELS_API_KEY = process.env.REACT_APP_PEXELS_API_KEY || 'MfkG23hMqiQmM0tUMFdwRSSdUYHgggqdIhOw8e7PjLQMWCaeejeMVtf8';

/**
 * Search Pexels for photos
 * @param {string} query - Search term
 * @param {number} perPage - Number of results (default 5)
 * @returns {Promise<Array>} Array of image objects
 */
export const searchPexelsImages = async (query, perPage = 5) => {
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.photos.map(photo => ({
      id: photo.id,
      url: photo.src.large2x || photo.src.large,
      thumbnail: photo.src.medium,
      small: photo.src.small,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      alt: photo.alt || query,
      source: 'pexels',
    }));
  } catch (error) {
    console.error('Pexels API error:', error);
    return [];
  }
};

/**
 * Get a single best Pexels image for a query
 * @param {string} query - Search term
 * @returns {Promise<Object|null>} Single image object or null
 */
export const getPexelsImage = async (query) => {
  const images = await searchPexelsImages(query, 1);
  return images.length > 0 ? images[0] : null;
};

export default { searchPexelsImages, getPexelsImage };
