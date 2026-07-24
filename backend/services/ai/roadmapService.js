const { generateAIJson } = require('./aiService');

const SYSTEM = `You are an expert college career counselor for engineering students in India. 
You give practical, actionable advice tailored to the student's year, branch, and goal.
Always respond with valid JSON only — no markdown, no explanation outside JSON.`;

async function generateRoadmap({ year, branch, goalType, interests }) {
  const prompt = `Generate a detailed 12-week learning roadmap for an engineering student with these details:
- Current year: Year ${year}
- Branch: ${branch}
- Career goal: ${goalType}
- Interests: ${interests.join(', ')}

Return a JSON object with this exact structure:
{
  "title": "string — roadmap title",
  "weeks": [
    {
      "week": 1,
      "title": "string — week focus",
      "description": "string — what to do this week",
      "resources": [
        { "title": "resource name", "url": "url or empty string", "type": "video|article|course|book|other" }
      ]
    }
  ]
}

Make all 12 weeks. Be specific, practical, and relevant to Indian engineering students.`;

  return await generateAIJson(prompt, SYSTEM);
}

async function suggestProjects({ year, branch, interests, difficulty }) {
  const prompt = `Suggest 3 project ideas for an engineering student:
- Year: ${year}, Branch: ${branch}
- Interests: ${interests.join(', ')}
- Preferred difficulty: ${difficulty || 'intermediate'}

Return JSON:
{
  "projects": [
    {
      "title": "string",
      "description": "2-3 sentence description",
      "techStack": ["tech1", "tech2"],
      "difficulty": "beginner|intermediate|advanced",
      "estimatedWeeks": number,
      "whyGood": "why this is good for resume/learning"
    }
  ]
}`;

  return await generateAIJson(prompt, SYSTEM, ['title', 'weeks']);
}

async function generateQuiz({ topic, difficulty, count = 5 }) {
  const prompt = `Generate ${count} multiple choice questions on the topic: "${topic}"
Difficulty: ${difficulty || 'intermediate'}

Return JSON:
{
  "quiz": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "why this answer is correct"
    }
  ]
}`;

  return await generateAIJson(prompt, SYSTEM);
}

async function generateTopicResources({ topic, week, context }) {
  const prompt = `Generate learning resources for this topic: "${topic}"
Week context: ${context || ''}

Return JSON:
{
  "resources": [
    { "title": "string", "url": "string or empty", "type": "video|article|course|book|other", "description": "1 sentence" }
  ],
  "notes": "2-3 paragraph summary of the topic in simple language",
  "keyPoints": ["point1", "point2", "point3", "point4", "point5"]
}`;

  return await generateAIJson(prompt, SYSTEM);
}

module.exports = { generateRoadmap, suggestProjects, generateQuiz, generateTopicResources };
