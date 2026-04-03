const POLLINATIONS_BASE_URL = 'https://image.pollinations.ai/prompt';

/**
 * Build Pollinations AI image URL from a prompt
 * Pollinations is free and requires no API key
 */
export const buildPollinationsUrl = (prompt, options = {}) => {
  const {
    width = 1200,
    height = 600,
    nologo = true,
    seed = null,
  } = options;

  const encodedPrompt = encodeURIComponent(prompt);
  let url = `${POLLINATIONS_BASE_URL}/${encodedPrompt}?width=${width}&height=${height}`;
  
  if (nologo) {
    url += '&nologo=true';
  }
  
  if (seed !== null) {
    url += `&seed=${seed}`;
  }

  return url;
};

/**
 * Enhanced prompt for better educational images
 */
export const enhanceImagePrompt = (basePrompt, chapterIndex) => {
  const styles = [
    'digital art style, vibrant colors, professional illustration',
    'modern minimalist design, clean lines, tech aesthetic',
    'futuristic concept art, neon accents, dark background',
    'abstract educational visualization, geometric shapes',
    'isometric 3D illustration, soft lighting, pastel accents',
  ];
  
  const style = styles[chapterIndex % styles.length];
  return `${basePrompt}, ${style}, high quality, 4k resolution`;
};

/**
 * Generate a fallback gradient when image fails to load
 */
export const generateChapterGradient = (accentColor, index) => {
  const gradients = [
    `linear-gradient(135deg, ${accentColor}33 0%, #0a0a0f 100%)`,
    `radial-gradient(ellipse at top right, ${accentColor}44 0%, #0a0a0f 70%)`,
    `linear-gradient(180deg, ${accentColor}22 0%, #0a0a0f 50%, ${accentColor}11 100%)`,
    `conic-gradient(from 180deg at 50% 50%, ${accentColor}22 0deg, #0a0a0f 180deg, ${accentColor}22 360deg)`,
    `linear-gradient(45deg, #0a0a0f 0%, ${accentColor}33 50%, #0a0a0f 100%)`,
  ];
  
  return gradients[index % gradients.length];
};
