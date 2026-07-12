const { generateAIJson } = require('./aiService');

const SYSTEM = `You are a senior technical recruiter with 10+ years hiring software engineers.
You read GitHub profiles and give brutally honest, specific assessments — not generic praise.
Always respond with valid JSON only, no markdown, no explanation outside JSON.`;

async function analyzePortfolio({ username, repos }) {
  const repoSummary = repos.map(r =>
    `- ${r.name}: ${r.description || 'no description'} | languages: ${Object.keys(r.languages).join(', ') || 'none'} | README: ${r.hasReadme ? 'yes' : 'no'} | ${r.commitCount} recent commits`
  ).join('\n');

  const prompt = `Analyze this GitHub portfolio for user "${username}":

${repoSummary}

Return JSON with this exact structure:
{
  "healthScore": <0-100>,
  "scoreBreakdown": { "codeQuality": <0-25>, "consistency": <0-25>, "documentation": <0-20>, "diversity": <0-15>, "activity": <0-15> },
  "recruiterPerception": {
    "firstImpression": "2-3 sentences, what a recruiter thinks in the first 30 seconds",
    "assumedSkills": ["skill1", "skill2"],
    "noticedGaps": ["gap1", "gap2"],
    "fixBeforeApplying": ["specific action 1", "specific action 2", "specific action 3"]
  }
}

Be honest and specific. Do not inflate the score. Reference actual repo names in your feedback.`;

  return await generateAIJson(prompt, SYSTEM);
}

module.exports = { analyzePortfolio };