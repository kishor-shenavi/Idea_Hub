const { generateAIJson } = require('./aiService');

const SYSTEM = `You are a tech industry analyst with deep knowledge of the Indian job market, especially for engineering freshers and students. 
Give data-driven, realistic insights about current tech hiring trends.
Always respond with valid JSON only — no markdown, no explanation outside JSON.`;

async function getMarketInsights({ branch, goalType, year }) {
  const prompt = `Provide current job market insights for an Indian engineering student:
- Branch: ${branch || 'Computer Science'}
- Goal: ${goalType || 'product company'}
- Year: ${year || 3}
- Current date context: 2025

Return JSON:
{
  "trendingSkills": [
    { "skill": "string", "demand": "high|medium|low", "reason": "1 sentence why", "learningTime": "e.g. 4 weeks" }
  ],
  "topRoles": [
    { "role": "string", "avgPackage": "string e.g. 8-15 LPA", "companies": ["company1", "company2"] }
  ],
  "insights": [
    "insight 1 about current market",
    "insight 2",
    "insight 3"
  ],
  "upcomingTrends": ["trend1", "trend2", "trend3"],
  "avoidSkills": ["outdated skill or tech that is declining"],
  "adviceForYear": "specific advice for this student based on their year"
}`;

  return await generateAIJson(prompt, SYSTEM);
}

module.exports = { getMarketInsights };
