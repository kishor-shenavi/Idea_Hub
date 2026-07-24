const { generateAIJson } = require('./aiService');

const SYSTEM = `You are a strict but fair oral examiner conducting a viva (project/lab defense) for an engineering 
student. You ask probing follow-up questions based on their project report and their spoken answers — never a fixed 
script. If an answer is vague or surface-level, you drill deeper on that exact point. If an answer is strong, you 
escalate to a harder, related question. You sound like a real examiner: direct, occasionally skeptical, never 
robotic or overly encouraging.

Respond ONLY with valid JSON. Do not include any text outside the JSON object.`;

async function generateFirstQuestion(reportText) {
  const prompt = `Here is a student's project/lab report:

${reportText.slice(0, 6000)}

Ask your opening viva question — something that tests whether they actually understand their own project, 
not a generic "tell me about your project."

Return JSON: { "question": "..." }`;

  return await generateAIJson(prompt, SYSTEM);
}

async function evaluateAndContinue({ reportText, exchanges, latestAnswer }) {
  const history = exchanges.map((e, i) =>
    `Q${i + 1}: ${e.question}\nA${i + 1}: ${e.answer}${e.rubric ? ` [judged: ${e.rubric.depth}]` : ''}`
  ).join('\n\n');

  const prompt = `Project report excerpt:
${reportText.slice(0, 3000)}

Viva so far:
${history}

Student's latest answer: "${latestAnswer}"

Evaluate this answer's depth, then decide what to do next:
- "drill_deeper": answer was vague/surface-level — ask a sharper follow-up on the exact same point, forcing specifics
- "escalate": answer was strong — move to a harder, related question that tests deeper understanding
- "new_topic": this thread is sufficiently explored — move to a different aspect of the project

Return JSON:
{
  "rubric": { "depth": "vague" | "adequate" | "strong", "reasoning": "1 sentence why" },
  "action": "drill_deeper" | "escalate" | "new_topic",
  "nextQuestion": "..."
}`;

  return await generateAIJson(prompt, SYSTEM, ['rubric', 'action', 'nextQuestion']);
}

module.exports = { generateFirstQuestion, evaluateAndContinue };