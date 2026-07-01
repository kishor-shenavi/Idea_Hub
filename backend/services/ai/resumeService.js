const { generateAIJson } = require('./aiService');

const SYSTEM = `You are an expert ATS (Applicant Tracking System) analyst and resume coach with 10+ years of experience in tech hiring. 
Analyze resumes objectively and give actionable, specific feedback.
Always respond with valid JSON only — no markdown, no explanation outside JSON.`;

async function analyzeResume({ resumeText, jobDescription, targetRole }) {
  const jdSection = jobDescription
    ? `Job Description:\n${jobDescription}\n\n`
    : '';

  const prompt = `Analyze the following resume${targetRole ? ` for a ${targetRole} role` : ''}:

${jdSection}Resume Content:
${resumeText}

Provide a comprehensive ATS analysis. Return JSON with this exact structure:
{
  "atsScore": <number 0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "missingKeywords": ["keyword1", "keyword2"],
  "presentKeywords": ["keyword1", "keyword2"],
  "improvements": [
    "specific actionable improvement 1",
    "specific actionable improvement 2",
    "specific actionable improvement 3",
    "specific actionable improvement 4",
    "specific actionable improvement 5"
  ],
  "sectionFeedback": {
    "summary": "feedback on summary/objective section",
    "experience": "feedback on work experience section",
    "education": "feedback on education section",
    "skills": "feedback on skills section",
    "projects": "feedback on projects section"
  },
  "overallFeedback": "2-3 sentence overall assessment",
  "scoreBreakdown": {
    "formatting": <0-20>,
    "keywords": <0-25>,
    "experience": <0-25>,
    "skills": <0-15>,
    "education": <0-15>
  }
}

ATS Score guide: 0-40 = poor, 41-60 = average, 61-80 = good, 81-100 = excellent.
Be honest and specific. Do not inflate the score.`;

  return await generateAIJson(prompt, SYSTEM);
}

module.exports = { analyzeResume };
