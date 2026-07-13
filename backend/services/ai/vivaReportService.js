const { generateAIJson } = require('./aiService');

const SYSTEM = `You are an examiner writing a final viva assessment. Be honest and specific, referencing actual 
questions and answers. Respond with valid JSON only.`;

async function generateVivaReport(session) {
  const transcript = session.exchanges.map((e, i) =>
    `Q${i + 1} [${e.rubric?.depth}]: ${e.question}\nA${i + 1}: ${e.answer}`
  ).join('\n\n');

  const prompt = `Full viva transcript for project "${session.reportTitle}":

${transcript}

Return JSON:
{
  "overallScore": <0-100>,
  "topicBreakdown": [{ "topic": "...", "depthScore": <0-100> }],
  "strengths": ["specific strength 1", "specific strength 2"],
  "weakPoints": ["specific weak point referencing an actual answer", "..."],
  "summary": "3-4 sentence honest assessment of how they'd do in a real viva"
}`;

  return await generateAIJson(prompt, SYSTEM);
}

module.exports = { generateVivaReport };