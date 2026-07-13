const { generateAIJson } = require('./aiService');

const SYSTEM = `You are an expert group discussion evaluator who has judged GD rounds for campus placements at 
top companies. Give specific, honest feedback referencing what was actually said. Respond with valid JSON only.`;

async function generateGDReport(session) {
  const transcript = session.transcript.map(t => {
    const label = t.speaker === 'student' ? 'Student' : t.speaker;
    return `${label}${t.wasInterruption ? ' (interrupting)' : ''}: ${t.text}`;
  }).join('\n');

  const studentTurns = session.transcript.filter(t => t.speaker === 'student');
  const timesInterrupted = session.transcript.filter(t => t.wasInterruption).length;

  const prompt = `Full group discussion transcript on topic "${session.topic}":

${transcript}

The student spoke ${studentTurns.length} times and interrupted others ${timesInterrupted} times.

Return JSON:
{
  "speakingTimePercent": <0-100, student's share of total turns>,
  "initiatorVsReactor": { "initiated": <count of times student raised a new point>, "reacted": <count of times student only responded to others> },
  "builtOnOthersPoints": <true/false, did the student reference and build on what others said, or just repeat their own points>,
  "summary": "3-4 sentence honest assessment of the student's GD performance",
  "strengths": ["specific strength 1", "specific strength 2"],
  "improvements": ["specific actionable improvement 1", "specific actionable improvement 2"]
}`;

  const result = await generateAIJson(prompt, SYSTEM);
  return { ...result, timesInterrupted };
}

module.exports = { generateGDReport };