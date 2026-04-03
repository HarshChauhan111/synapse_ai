/**
 * Wikipedia/Wikimedia Commons API for educational images
 */

const USER_AGENT = 'SynapseAI/1.0 (educational-app)';

/**
 * Search Wikipedia Commons for images
 * @param {string} query - Search term
 * @param {number} limit - Number of results (default 10)
 * @returns {Promise<Array>} Array of image objects
 */
export const searchWikipediaImages = async (query, limit = 10) => {
  try {
    const response = await fetch(
      `https://commons.wikimedia.org/w/api.php?` +
      new URLSearchParams({
        action: 'query',
        format: 'json',
        generator: 'search',
        gsrsearch: query,
        gsrlimit: limit.toString(),
        prop: 'pageimages|imageinfo',
        piprop: 'original|thumbnail',
        pithumbsize: '400',
        iiprop: 'url|extmetadata',
        origin: '*',
      }),
      {
        headers: {
          'User-Agent': USER_AGENT,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Wikipedia API error: ${response.status}`);
    }

    const data = await response.json();
    const pages = data.query?.pages || {};

    return Object.values(pages)
      .filter(page => page.original?.source || page.thumbnail?.source)
      .map(page => ({
        id: page.pageid,
        title: page.title?.replace('File:', ''),
        url: page.original?.source || page.thumbnail?.source,
        thumbnail: page.thumbnail?.source,
        source: 'wikipedia',
      }));
  } catch (error) {
    console.error('Wikipedia API error:', error);
    return [];
  }
};

/**
 * Get Wikipedia article summary and main image
 * @param {string} title - Article title
 * @returns {Promise<Object|null>} Article data or null
 */
export const getWikipediaSummary = async (title) => {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      {
        headers: {
          'User-Agent': USER_AGENT,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    return {
      title: data.title,
      extract: data.extract,
      thumbnail: data.thumbnail?.source,
      image: data.originalimage?.source,
      url: data.content_urls?.desktop?.page,
      source: 'wikipedia',
    };
  } catch (error) {
    console.error('Wikipedia summary error:', error);
    return null;
  }
};

/**
 * Get a single best Wikipedia image for a query
 * @param {string} query - Search term
 * @returns {Promise<Object|null>} Single image object or null
 */
export const getWikipediaImage = async (query) => {
  // First try to get from article summary (usually best quality)
  const summary = await getWikipediaSummary(query);
  if (summary?.image) {
    return {
      url: summary.image,
      thumbnail: summary.thumbnail,
      title: summary.title,
      source: 'wikipedia',
    };
  }

  // Fallback to Commons search
  const images = await searchWikipediaImages(query, 1);
  return images.length > 0 ? images[0] : null;
};

export default { searchWikipediaImages, getWikipediaSummary, getWikipediaImage };
