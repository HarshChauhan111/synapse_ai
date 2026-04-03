/**
 * Prompt templates for Gemini AI interactions
 */

export const getCourseStructurePrompt = (title, duration) => `
You are a professional curriculum designer. Analyze the course topic and chapter duration.

Course Title: "${title}"
Duration per Chapter: "${duration}"

Return ONLY a valid JSON object (no markdown, no explanation) in exactly this format:
{
  "suggestedChapters": [3, 5, 7, 10],
  "recommendedChapters": 5,
  "reasoning": "Brief one-sentence explanation of why these counts suit this topic",
  "courseDescription": "A 2-sentence overview of what this course will cover",
  "difficultyLevel": "Beginner | Intermediate | Advanced",
  "targetAudience": "Short description of ideal learner"
}
`;

export const getChapterContentPrompt = (courseTitle, chapterNumber, totalChapters, chapterDuration) => `
You are an expert educator and content designer.

Course: "${courseTitle}"
Chapter: ${chapterNumber} of ${totalChapters}
Duration: ${chapterDuration}

Generate comprehensive chapter content and return ONLY a valid JSON object in exactly this format:

{
  "chapterTitle": "Chapter title here",
  "chapterSubtitle": "One engaging subtitle line",
  "heroType": "image" | "chart",
  "heroImagePrompt": "If heroType is image: a detailed Pollinations image prompt (vivid, specific, educational). If heroType is chart: null",
  "heroChartData": {
    "type": "bar" | "line" | "pie" | "radar" | "area",
    "title": "Chart title",
    "description": "What this chart shows",
    "data": [ { "name": "Label", "value": 42 } ]
  },
  "accentColor": "#hexcolor (a unique color that fits this chapter's mood)",
  "sections": [
    {
      "heading": "Section heading",
      "body": "Rich markdown content — use bold, bullet lists, code blocks, blockquotes, etc.",
      "hasCallout": true,
      "calloutText": "Key insight or important note for this section"
    }
  ],
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
  "chapterSummary": "A 2-3 sentence summary of what was covered"
}

Rules:
- heroType must alternate meaningfully — use "chart" when data or comparisons are central to the topic
- accentColor must be unique for each chapter
- sections should have 4-6 sections with rich educational content
- All markdown in body fields must be valid and render cleanly
`;

export const getChatbotSystemPrompt = (courseTitle, chapterTitle, chapterContent) => `
You are an expert AI tutor for the course "${courseTitle}", currently on chapter "${chapterTitle}".

Chapter content summary: ${chapterContent}

Answer student questions helpfully, concisely, and encouragingly.
If a question is unrelated to the course, gently redirect.
Keep responses under 150 words unless a detailed explanation is truly needed.
`;

export const getQuizPrompt = (courseTitle, chaptersData, numChapters) => `
You are a quiz generator for the course "${courseTitle}".

Based on the following chapter summaries, generate a quiz.

Chapters: ${JSON.stringify(chaptersData.slice(0, numChapters).map(c => ({ 
  title: c.chapterTitle, 
  summary: c.chapterSummary, 
  takeaways: c.keyTakeaways 
})))}

Return ONLY a valid JSON array of questions in exactly this format:
[
  {
    "questionNumber": 1,
    "question": "Question text",
    "type": "mcq" | "true_false",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "explanation": "Why this answer is correct"
  }
]

Rules:
- Generate 3 questions per chapter covered
- Mix MCQ and true/false
- Questions must test genuine comprehension, not trivia
- Difficulty should increase as question number increases
- For true_false type, options must be exactly ["True", "False"]
`;
