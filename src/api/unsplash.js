const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = 'https://api.unsplash.com';

/**
 * Fetch a course thumbnail from Unsplash based on course title
 */
export const fetchCourseThumbnail = async (courseTitle) => {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('Unsplash API key not configured, using fallback');
    return null;
  }

  try {
    const query = encodeURIComponent(courseTitle);
    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${query}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const photo = data.results[0];
      return {
        url: photo.urls.regular,
        blurHash: photo.blur_hash,
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,
        altDescription: photo.alt_description || courseTitle,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching Unsplash thumbnail:', error);
    return null;
  }
};

/**
 * Generate a fallback gradient based on course title
 */
export const generateFallbackGradient = (courseTitle) => {
  // Generate a consistent color based on course title
  let hash = 0;
  for (let i = 0; i < courseTitle.length; i++) {
    hash = courseTitle.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 40) % 360;
  
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 50%) 0%, hsl(${hue2}, 80%, 40%) 100%)`;
};
