const { generateAIJson } = require('./aiService');

const SYSTEM = `You are an expert public speaking coach who has trained candidates for campus placement 
group discussions and extempore rounds. Give specific, actionable feedback — not generic encouragement.
Always respond with valid JSON only.`;

async function generateCoachFeedback({ topic, transcript, metrics, audioAnalysis }) {
  const prompt = `A student spoke on the topic: "${topic}"

Transcript: "${transcript}"

Speech stats: ${metrics.wordsPerMinute} words/min, ${metrics.fillerWordCount} filler words used.
Vocal delivery: monotone score ${audioAnalysis.monotoneScore}/100 (lower = flatter delivery, higher = more expressive pitch variation),
${audioAnalysis.pauseSegments.length} pauses detected, longest pause ${
  audioAnalysis.pauseSegments.length ? Math.max(...audioAnalysis.pauseSegments.map(p => p.duration)) : 0
}s, silence ratio ${Math.round(audioAnalysis.silenceRatio * 100)}%.

Return JSON:
{
  "overallScore": <0-100>,
  "strengths": ["specific strength 1", "specific strength 2"],
  "improvements": ["specific actionable improvement 1", "specific actionable improvement 2"],
  "summary": "2-3 sentence honest assessment referencing what they actually said and how they delivered it"
}`;

  return await generateAIJson(prompt, SYSTEM);
}

module.exports = { generateCoachFeedback };