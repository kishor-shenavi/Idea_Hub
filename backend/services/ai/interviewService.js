const fs = require('fs');
const Groq = require('groq-sdk');
const { generateAI, generateAIJson } = require('./aiService');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Transcribe candidate's speech recording to text using Groq Whisper.
 */
async function transcribeAudio(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Audio file not found at ${filePath}`);
    }
    const response = await groq.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-large-v3',
    });
    return response.text;
  } catch (err) {
    console.error('Groq transcription API failed:', err);
    throw new Error(`Audio transcription failed: ${err.message}`);
  }
}

/**
 * Generate the next question from the AI interviewer.
 */
async function generateQuestion(session) {
  const { targetRole, difficulty, interviewType, topics, resumeText, messages } = session;

  const dialogue = messages
    .map(m => `${m.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
    .join('\n');

  const questionsAsked = messages.filter(m => m.role === 'interviewer').length;

  const systemPrompt = `You are a professional technical interviewer conducting an adaptive mock interview.
Role: ${targetRole}
Baseline Difficulty: ${difficulty}
Interview Type: ${interviewType}
${resumeText ? `Candidate's Resume:\n${resumeText}\n` : ''}
${topics ? `Focus Topics:\n${topics}\n` : ''}

You must dynamically direct the interview. You decide the number of questions and adjust the difficulty based on the candidate's performance.

Guidelines:
1. Standard interview length is 3 to 6 questions. We are currently at question #${questionsAsked + 1}.
2. Assess the candidate's previous responses (if any) in the dialogue.
   - If they are doing well, maintain or slightly increase the difficulty.
   - If they are struggling (e.g. unable to answer, silent, or incorrect), you MUST immediately shift to an easier question, and decide to conclude/wrap up the interview in the next 1-2 turns.
3. If you decide the candidate has answered enough questions (minimum 3) or if they have failed to answer multiple times, you must wrap up the interview.
4. Greet the candidate on the first turn (no history), state the context, and ask the first question.
5. Do NOT give detailed feedback or scores during the interview turns. Save that for the final evaluation report.
6. Keep your interviewer messages brief and under 4 sentences.

You must respond with valid JSON ONLY matching this exact structure:
{
  "response": "Your friendly greeting/acknowledgment and the next question (or concluding wrap up statement)",
  "action": "continue" or "wrap_up"
}
Setting "action" to "wrap_up" will immediately conclude the interview and generate their report card. Set it to "wrap_up" only when concluding.`;

  const prompt = dialogue
    ? `Here is the dialogue history so far:\n${dialogue}\n\nCandidate has just responded. Generate your next interviewer response.`
    : `Start the interview. Greet the candidate and ask the first question.`;

  try {
    return await generateAIJson(prompt, systemPrompt);
  } catch (err) {
    console.warn("JSON generation failed for interview question. Using raw content fallback:", err.message);
    const raw = await generateAI(prompt, systemPrompt);
    return {
      response: raw.trim(),
      action: "continue"
    };
  }
}

/**
 * Generate the final report cards once the interview limit is reached.
 */
async function generateFeedbackReport(session) {
  const { targetRole, difficulty, interviewType, topics, resumeText, messages } = session;

  const dialogue = messages
    .map(m => `${m.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
    .join('\n');

  const systemPrompt = `You are an expert technical interviewer and talent assessor.
Your task is to analyze a completed mock interview dialogue and generate a detailed report.
Always respond with valid JSON only — no markdown, no explanation outside JSON.`;

  const prompt = `Analyze this mock interview for the role of "${targetRole}" (${difficulty} level, ${interviewType} interview).

${resumeText ? `Candidate Resume Context:\n${resumeText}\n\n` : ''}${topics ? `Focus Topics:\n${topics}\n\n` : ''}Dialogue history:
${dialogue}

Generate a comprehensive, rigorous feedback report. Return JSON with this exact structure:
{
  "overallScore": <number 0-100 representing average performance>,
  "summary": "2-3 sentences summarizing their strengths, weaknesses, and readiness",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "qaFeedback": [
    {
      "question": "The question asked by the interviewer",
      "answer": "The answer provided by the candidate",
      "score": <number 0-100>,
      "critique": "Actionable feedback on their answer. Point out what was correct, what was missing, and how to improve.",
      "modelAnswer": "Brief bullet points or key concepts the candidate should cover to get a perfect score."
    }
  ]
}

Make sure every Q&A pair from the dialogue is present in "qaFeedback". If the candidate didn't answer a question or answered poorly, give a low score and constructive critique.`;

  return await generateAIJson(prompt, systemPrompt);
}

module.exports = {
  transcribeAudio,
  generateQuestion,
  generateFeedbackReport,
};
