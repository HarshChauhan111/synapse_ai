import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY

// Validate API key exists
if (!API_KEY) {
  console.warn('REACT_APP_GEMINI_API_KEY is not set. Please add it to your .env file.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const getModel = () => {
  if (!genAI) {
    throw new Error('Gemini API key is not configured. Please add REACT_APP_GEMINI_API_KEY to your .env file.');
  }
  return genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 8192,
    },
  });
};

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry wrapper with exponential backoff for rate limit errors
 */
const withRetry = async (fn, maxRetries = 4, initialDelay = 3000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const errorMessage = error?.message || error?.toString() || '';
      
      // Retry on quota/rate limit errors OR generic API errors
      const isRetryableError = errorMessage.includes('quota') || 
                               errorMessage.includes('rate') ||
                               errorMessage.includes('429') ||
                               errorMessage.includes('500') ||
                               errorMessage.includes('503') ||
                               errorMessage.includes('RESOURCE_EXHAUSTED') ||
                               errorMessage.includes('UNAVAILABLE') ||
                               errorMessage.includes('INTERNAL') ||
                               errorMessage.includes('Invalid response format');
      
      if (!isRetryableError || attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff: 3s, 6s, 12s, 24s
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`API error. Retrying in ${delay/1000}s... (attempt ${attempt + 1}/${maxRetries})`);
      await sleep(delay);
    }
  }
  
  throw lastError;
};

/**
 * Parse JSON from Gemini response, handling markdown code blocks
 */
const parseGeminiJSON = (text) => {
  // Remove markdown code blocks if present
  let cleaned = text.trim();
  
  // Handle various markdown code block formats
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```JSON')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  
  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim();
  
  // Try to extract JSON if there's extra text before/after
  const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    cleaned = jsonMatch[1];
  }
  
  try {
    return JSON.parse(cleaned);
  } catch (parseError) {
    console.error('Failed to parse JSON response:', cleaned.substring(0, 500));
    throw new Error('Invalid response format from AI. Please try again.');
  }
};

/**
 * Generate course structure (chapter count suggestions)
 */
export const generateCourseStructure = async (title, duration) => {
  const prompt = `You are a professional curriculum designer. Analyze the course topic and chapter duration.

Course Title: "${title}"
Duration per Chapter: "${duration}"

Return ONLY a valid JSON object (no markdown, no explanation) in exactly this format:
{
  "suggestedChapters": [3, 5, 7, 10],
  "recommendedChapters": 5,
  "reasoning": "Brief one-sentence explanation of why these counts suit this topic",
  "courseDescription": "A 2-sentence overview of what this course will cover",
  "difficultyLevel": "Beginner",
  "targetAudience": "Short description of ideal learner"
}

Important: difficultyLevel must be exactly one of: "Beginner", "Intermediate", or "Advanced" (not a pipe-separated string).`;

  return withRetry(async () => {
    const model = getModel();
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('Course structure response:', text);
      return parseGeminiJSON(text);
    } catch (error) {
      console.error('Error generating course structure:', error);
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      
      if (errorMessage.includes('API key') || errorMessage.includes('API_KEY')) {
        throw new Error('Invalid API key. Please check your Gemini API key.');
      }
      if (errorMessage.includes('quota') || errorMessage.includes('rate') || errorMessage.includes('429')) {
        throw new Error('API quota exceeded. Please wait a moment and try again.');
      }
      if (errorMessage.includes('blocked') || errorMessage.includes('safety')) {
        throw new Error('Content was blocked by safety filters. Please try a different topic.');
      }
      throw new Error(`Failed to generate course structure: ${errorMessage}`);
    }
  });
};

/**
 * Generate content for a specific chapter
 */
export const generateChapterContent = async (courseTitle, chapterNumber, totalChapters, chapterDuration) => {
  const prompt = `You are an expert educator and content designer.

Course: "${courseTitle}"
Chapter: ${chapterNumber} of ${totalChapters}
Duration: ${chapterDuration}

Generate comprehensive chapter content and return ONLY a valid JSON object in exactly this format:

{
  "chapterTitle": "Chapter title here",
  "chapterSubtitle": "One engaging subtitle line",
  "heroType": "image",
  "heroImagePrompt": "A detailed Pollinations image prompt (vivid, specific, educational). Example: futuristic digital classroom with holographic displays showing neural networks, purple and blue lighting, cyberpunk aesthetic",
  "heroChartData": null,
  "accentColor": "#hexcolor (a unique color that fits this chapter's mood)",
  "sections": [
    {
      "heading": "Section heading",
      "body": "Rich markdown content — use **bold**, *italics*, bullet lists, code blocks, blockquotes, etc. Make it comprehensive and educational.",
      "hasCallout": true,
      "calloutText": "Key insight or important note for this section",
      "visual": null
    }
  ],
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
  "chapterSummary": "A 2-3 sentence summary of what was covered"
}

SECTION VISUAL FIELD - Only include when the content GENUINELY BENEFITS from it:

For charts (use when discussing data, statistics, comparisons, percentages):
{
  "type": "chart",
  "chartType": "bar" | "line" | "pie" | "area" | "radar",
  "title": "Chart title",
  "data": [{ "name": "Label", "value": 42 }, ...]
}

For timeline (use when discussing history, evolution, chronological events):
{
  "type": "timeline",
  "title": "Timeline title",
  "events": [{ "year": "2020", "title": "Event", "description": "Brief description" }, ...]
}

For process flow (use when explaining step-by-step procedures, workflows, cycles):
{
  "type": "process",
  "title": "Process title",
  "steps": [{ "title": "Step 1", "description": "What happens" }, ...]
}

For comparison table (use when comparing features, options, pros/cons):
{
  "type": "table",
  "title": "Comparison title",
  "columns": ["Feature", "Option A", "Option B"],
  "rows": [["Speed", "Fast", "Slow"], ["Cost", "$10", "$20"]]
}

For infographic stats (use when highlighting key numbers, metrics, facts):
{
  "type": "infographic",
  "title": "Key Stats",
  "stats": [{ "label": "Users", "value": "10M", "icon": "users" }, ...]
}

For image (use when a real-world photo would help understanding):
{
  "type": "image",
  "searchQuery": "specific search term for photo",
  "caption": "What this image shows"
}

If heroType is "chart" instead of "image", use this format for heroChartData:
{
  "type": "bar" | "line" | "pie" | "radar" | "area",
  "title": "Chart title",
  "description": "What this chart shows",
  "data": [ { "name": "Label", "value": 42 } ]
}

CRITICAL RULES:
- Most sections should have "visual": null - only add visuals when they genuinely enhance understanding
- Typically 1-2 sections per chapter should have visuals, NOT every section
- Choose the right visual type based on content (don't force charts on non-data content)
- heroType should be "chart" when data/statistics are central, otherwise use "image"
- accentColor must be unique - use colors like #6366f1 (indigo), #8b5cf6 (violet), #ec4899 (pink), #10b981 (emerald), #f59e0b (amber), #3b82f6 (blue), #ef4444 (red), #06b6d4 (cyan)
- sections should have 4-6 sections with rich educational content appropriate for ${chapterDuration}
- All markdown in body fields must be valid
- Make content progressively build on previous chapters`;

  return withRetry(async () => {
    const model = getModel();
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log(`Chapter ${chapterNumber} raw response length:`, text?.length || 0);
      return parseGeminiJSON(text);
    } catch (error) {
      console.error(`Error generating chapter ${chapterNumber} content:`, error);
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      
      if (errorMessage.includes('API key') || errorMessage.includes('API_KEY')) {
        throw new Error('Invalid API key. Please check your Gemini API key.');
      }
      if (errorMessage.includes('quota') || errorMessage.includes('rate') || errorMessage.includes('429')) {
        throw new Error(`API quota exceeded for chapter ${chapterNumber}. Please wait and try again.`);
      }
      if (errorMessage.includes('blocked') || errorMessage.includes('safety')) {
        throw new Error(`Content blocked for chapter ${chapterNumber}. Try a different topic.`);
      }
      throw new Error(`Failed to generate chapter ${chapterNumber} content. Please try again.`);
    }
  });
};

/**
 * Generate quiz questions based on chapter content
 */
export const generateQuiz = async (courseTitle, chaptersData, numChapters) => {
  // chaptersData is already filtered to include only selected chapters
  const chapterSummaries = chaptersData.map(c => ({
    title: c.chapterTitle || 'Untitled Chapter',
    summary: c.chapterSummary || 'No summary available',
    takeaways: c.keyTakeaways || []
  }));

  if (chapterSummaries.length === 0) {
    throw new Error('No chapter data available to generate quiz');
  }

  const questionCount = chapterSummaries.length * 3;

  const prompt = `You are a quiz generator for the course "${courseTitle}".

Based on the following chapter summaries, generate a quiz.

Chapters: ${JSON.stringify(chapterSummaries, null, 2)}

Return ONLY a valid JSON array of questions in exactly this format:
[
  {
    "questionNumber": 1,
    "question": "Question text here",
    "type": "mcq",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Why this answer is correct"
  }
]

Rules:
- Generate exactly ${questionCount} questions (3 per chapter)
- Mix MCQ and true_false types (roughly 70% MCQ, 30% true_false)
- Questions must test genuine comprehension, not trivia
- Difficulty should gradually increase as question number increases
- For true_false type, options must be exactly ["True", "False"]
- correctAnswer must exactly match one of the options
- Make questions specific to the chapter content provided`;

  return withRetry(async () => {
    const model = getModel();
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('Quiz raw response:', text);
      const questions = parseGeminiJSON(text);
      
      // Validate response
      if (!Array.isArray(questions)) {
        throw new Error('Quiz response is not an array');
      }
      
      return questions;
    } catch (error) {
      console.error('Error generating quiz:', error);
      const errorMessage = error?.message || 'Unknown error';
      if (errorMessage.includes('quota') || errorMessage.includes('rate')) {
        throw new Error('API quota exceeded. Please wait a moment and try again.');
      }
      throw new Error('Failed to generate quiz. Please try again.');
    }
  });
};

/**
 * Generate a batch of quiz questions (for continuous quiz mode)
 * @param {string} courseTitle - Course title
 * @param {Array} chaptersData - Array of chapter objects
 * @param {number} batchSize - Number of questions to generate (default 10)
 * @param {number} batchNumber - Which batch this is (1, 2, 3, etc.)
 */
export const generateQuizBatch = async (courseTitle, chaptersData, batchSize = 10, batchNumber = 1) => {
  const chapterSummaries = chaptersData.map(c => ({
    title: c.chapterTitle || 'Untitled Chapter',
    summary: c.chapterSummary || 'No summary available',
    takeaways: c.keyTakeaways || [],
    sections: c.sections?.map(s => s.heading) || []
  }));

  if (chapterSummaries.length === 0) {
    throw new Error('No chapter data available to generate quiz');
  }

  // Vary difficulty based on batch number
  const difficultyLevel = batchNumber === 1 ? 'easy to medium' : 
                          batchNumber === 2 ? 'medium' : 
                          batchNumber === 3 ? 'medium to hard' : 'hard';

  const prompt = `You are a quiz generator for the course "${courseTitle}".

Generate batch #${batchNumber} of quiz questions based on these chapters:

${JSON.stringify(chapterSummaries, null, 2)}

Return ONLY a valid JSON array with exactly ${batchSize} questions in this format:
[
  {
    "questionNumber": 1,
    "question": "Question text here",
    "type": "mcq",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Brief explanation why this is correct"
  }
]

Rules:
- Generate exactly ${batchSize} unique questions
- This is batch #${batchNumber}, so difficulty should be: ${difficultyLevel}
- Mix question types: ~70% mcq (4 options), ~30% true_false
- For true_false: options must be ["True", "False"]
- correctAnswer must exactly match one option
- Questions must test genuine understanding, not memorization
- Cover different aspects of the chapters - don't repeat similar questions
- Make questions engaging and thought-provoking
- Batch ${batchNumber > 1 ? `should have DIFFERENT questions from previous batches` : 'starts the quiz'}`;

  return withRetry(async () => {
    const model = getModel();
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log(`Quiz batch ${batchNumber} response:`, text.substring(0, 200) + '...');
      const questions = parseGeminiJSON(text);
      
      if (!Array.isArray(questions)) {
        throw new Error('Quiz response is not an array');
      }
      
      return questions;
    } catch (error) {
      console.error(`Error generating quiz batch ${batchNumber}:`, error);
      const errorMessage = error?.message || 'Unknown error';
      if (errorMessage.includes('quota') || errorMessage.includes('rate')) {
        throw new Error('API quota exceeded. Please wait a moment and try again.');
      }
      throw new Error('Failed to generate quiz questions. Please try again.');
    }
  });
};

/**
 * Chat with AI tutor - context-aware responses with visual data
 */
export const chatWithTutor = async (courseTitle, chapterTitle, chapterContent, conversationHistory, userMessage) => {
  const systemContext = `You are an expert AI tutor for the course "${courseTitle}", currently on chapter "${chapterTitle}".

Chapter content summary: ${chapterContent}

Your response MUST be a valid JSON object with this exact structure:
{
  "text": "Your markdown-formatted answer here. Be helpful, concise, and encouraging.",
  "visual": null or {
    "type": "chart" | "timeline" | "process" | "table" | "infographic" | "image" | "algorithm",
    "data": <visual-specific data object>
  }
}

VISUAL DATA FORMATS:

For "chart" type:
{
  "type": "chart",
  "data": {
    "chartType": "bar" | "line" | "pie" | "area" | "radar",
    "title": "Chart title",
    "description": "What this shows",
    "data": [{ "name": "Label", "value": 42 }, ...]
  }
}

For "timeline" type:
{
  "type": "timeline",
  "data": {
    "title": "Timeline title",
    "events": [{ "year": "2020", "title": "Event", "description": "Details" }, ...]
  }
}

For "process" type:
{
  "type": "process",
  "data": {
    "title": "Process title",
    "steps": [{ "title": "Step 1", "description": "What to do" }, ...]
  }
}

For "table" type:
{
  "type": "table",
  "data": {
    "title": "Comparison",
    "columns": ["Feature", "Option A", "Option B"],
    "rows": [["Feature 1", true, false], ["Feature 2", "value", "value"]]
  }
}

For "infographic" type:
{
  "type": "infographic",
  "data": {
    "title": "Key Stats",
    "stats": [{ "label": "Users", "value": "10M", "icon": "users" }, ...]
  }
}

For "image" type (will fetch real image):
{
  "type": "image",
  "data": {
    "searchQuery": "keyword to search for real photo",
    "imageType": "real" | "educational" | "diagram",
    "caption": "Image caption"
  }
}

For "algorithm" type (INTERACTIVE SORTING ALGORITHM ANIMATION - use when explaining sorting algorithms like bubble sort, quick sort, merge sort, etc.):
{
  "type": "algorithm",
  "data": {
    "algorithm": "bubble" | "selection" | "insertion" | "quick" | "merge",
    "title": "Optional custom title",
    "initialArray": [64, 34, 25, 12, 22, 11, 90],
    "compact": false
  }
}

RULES:
- Include visual only when it genuinely helps (comparisons, data, processes, timelines, sorting algorithms)
- **IMPORTANT**: When user asks about sorting algorithms (bubble sort, selection sort, insertion sort, quick sort, merge sort, or any sorting algorithm in any programming language like C++, Java, Python), ALWAYS include the "algorithm" visual type to show an interactive animation
- Keep text response under 150 words unless detailed explanation truly needed
- Use markdown in text field for formatting
- If no visual needed, set visual to null
- Be encouraging and helpful`;

  return withRetry(async () => {
    const model = getModel();
    const messages = [
      { role: 'user', parts: [{ text: systemContext }] },
      { role: 'model', parts: [{ text: '{"text": "I understand. I\'m ready to help students with this chapter, and I\'ll include helpful visuals when appropriate.", "visual": null}' }] },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: typeof msg.content === 'object' ? JSON.stringify(msg.content) : msg.content }]
      })),
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    try {
      const chat = model.startChat({ history: messages.slice(0, -1) });
      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse as JSON for visual data
      try {
        const parsed = parseGeminiJSON(text);
        return parsed;
      } catch {
        // If not JSON, return as plain text response
        return {
          text: text,
          visual: null
        };
      }
    } catch (error) {
      console.error('Error in chatbot:', error);
      throw new Error('Failed to get response. Please try again.');
    }
  });
};

/**
 * Generate visualization code (HTML/CSS/JS) for advanced diagrams
 */
export const generateVisualization = async (type, topic, data = null) => {
  const prompt = `Generate a self-contained visualization for: "${topic}"
Type: ${type}
${data ? `Data: ${JSON.stringify(data)}` : ''}

Return ONLY valid JSON:
{
  "html": "<div>...</div>",
  "css": "/* scoped styles */",
  "js": "// optional animation/interaction code",
  "title": "Visualization title",
  "description": "What this shows"
}

Rules:
- HTML must be a single container div with inline styles OR use the provided CSS
- CSS should be scoped (use unique class names)
- JS is optional, only for animations
- Keep it clean, educational, visually appealing
- Use modern CSS (flex, grid, gradients)
- Color scheme: dark background (#0a0a0f), accent colors (#6366f1, #8b5cf6, #ec4899)`;

  return withRetry(async () => {
    const model = getModel();
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return parseGeminiJSON(text);
    } catch (error) {
      console.error('Error generating visualization:', error);
      throw new Error('Failed to generate visualization.');
    }
  });
};
