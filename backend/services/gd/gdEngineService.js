const { PERSONAS } = require('./personas');
const { generateAIJson } = require('../ai/aiService');

// Heuristic eagerness — no AI call, cheap and fast, with cooldown so no persona dominates every turn
function computeEagerness(session) {
  const lastTurn = session.transcript[session.transcript.length - 1];
  const lastText = (lastTurn?.text || '').toLowerCase();

  const recentSpeakers = session.transcript.slice(-3).map(t => t.speaker);

  return PERSONAS.map(p => {
    let score = p.baseEagerness;

    // cooldown: reduce eagerness if this persona spoke very recently
    const turnsAgo = [...recentSpeakers].reverse().indexOf(p.id);
    if (turnsAgo === 0) score -= 0.4;
    else if (turnsAgo === 1) score -= 0.15;

    // simple keyword triggers per persona type
    if (p.id === 'devils_advocate' && /(should|must|always|never|definitely|obviously)/.test(lastText)) score += 0.25;
    if (p.id === 'aggressive_interrupter' && lastText.length > 0) score += 0.15;
    if (p.id === 'bandwagon' && /(agree|good point|exactly|right)/.test(lastText)) score += 0.1;

    score += Math.random() * 0.15; // jitter so it's not perfectly predictable

    return { personaId: p.id, name: p.name, style: p.style, eagerness: Math.round(Math.max(0, Math.min(1, score)) * 100) };
  }).sort((a, b) => b.eagerness - a.eagerness);
}

async function generatePersonaTurn(session, personaId) {
  const persona = PERSONAS.find(p => p.id === personaId);
  const history = session.transcript.slice(-8).map(t => {
    const speakerLabel = t.speaker === 'student' ? 'Student' : PERSONAS.find(p => p.id === t.speaker)?.name || t.speaker;
    return `${speakerLabel}: ${t.text}`;
  }).join('\n');

  const prompt = `Topic: "${session.topic}"

Conversation so far:
${history || '(discussion just started)'}

Respond as your character would, in 1-3 sentences, reacting to what was just said. Stay in character. 
Return JSON: { "message": "your response" }`;

  const result = await generateAIJson(prompt, persona.systemPrompt);
  return { personaId, name: persona.name, text: result.message };
}

module.exports = { computeEagerness, generatePersonaTurn, PERSONAS };