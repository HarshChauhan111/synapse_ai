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
You are an expert educator and content designer focused on learner engagement.

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
      "calloutText": "Key insight or important note for this section",
      "visual": null
    }
  ],
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
  "chapterSummary": "A 2-3 sentence summary of what was covered"
}

VISUAL FIELD FOR SECTIONS:
For each section, analyze if the topic would benefit from an interactive animation. Include a "visual" field ONLY when animation genuinely improves understanding.

Animation IS useful when the concept involves:
- Movement, change, transformation, or flow (e.g., data flowing through a pipeline)
- Step-by-step processes or procedures (e.g., how to compile code, authentication flow)
- Algorithms or sequential operations (e.g., sorting, searching, parsing)
- Timelines or chronological events (e.g., history of AI, software evolution)
- Comparisons between concepts (e.g., SQL vs NoSQL, REST vs GraphQL)
- System interactions or architectures (e.g., client-server, microservices)
- State changes or transformations (e.g., lifecycle hooks, data transformation)

Animation is NOT needed for:
- Purely theoretical or philosophical discussions
- Simple definitions or terminology explanations
- Static facts or reference information

When animation would help, set the visual field as:
{
  "type": "animation",
  "animation_required": true,
  "animation_type": "process_flow" | "algorithm_stepper" | "timeline" | "comparison" | "system_flow" | "conceptual_transition",
  "title": "Animation title",
  "steps": [
    {
      "step_number": 1,
      "title": "Short step title",
      "visual_state": "What to show visually (description or array for algorithms)",
      "highlight": [0, 1],
      "explanation": "What is happening in this step"
    }
  ]
}

Animation type guidelines:
- process_flow: For step-by-step procedures (3-6 steps, each with title + explanation)
- algorithm_stepper: For algorithms showing data transformation (include visual_state as array/description, highlight indices)
- timeline: For chronological events (include year/time in each step)
- comparison: For comparing 2+ items (each step has items array with {title, description})
- system_flow: For architectures (each step has nodes array with {icon, label}, and active index)
- conceptual_transition: For abstract concept evolution (each step has title, icon emoji, explanation)

You may also use other visual types for variety:
- { "type": "chart", "chartType": "bar|line|pie", "title": "...", "data": [...] }
- { "type": "timeline", "title": "...", "events": [...] }
- { "type": "process", "title": "...", "steps": [...] }
- { "type": "infographic", "title": "...", "stats": [...] }
- { "type": "table", "title": "...", "columns": [...], "rows": [...] }

Rules:
- heroType must alternate meaningfully — use "chart" when data or comparisons are central to the topic
- accentColor must be unique for each chapter
- sections should have 4-6 sections with rich educational content
- All markdown in body fields must be valid and render cleanly
- Include "visual" with type "animation" for at least 1-2 sections if the chapter topic benefits from it
- Keep animation steps sequential, clear, and render-friendly (4-8 steps ideal)
- Do NOT force animation for sections that don't need it — quality over quantity
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
