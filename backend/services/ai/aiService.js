const { GoogleGenAI } = require("@google/genai");
const Groq = require("groq-sdk");
const OpenAI = require("openai");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// ─── Core fallback chain: Groq → OpenRouter → Gemini ─────────────────────────

async function generateAI(prompt, systemPrompt = "") {
  const errors = [];

  // ── 1. Groq ──────────────────────────────────────────────────────────────
  try {
    console.log("🤖 Trying Groq...");
    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });
    console.log("✅ Groq responded");
    return result.choices[0].message.content;
  } catch (err) {
    console.warn(`⚠️ Groq failed: ${err.message}`);
    errors.push(`Groq: ${err.message}`);
  }

  // ── 2. OpenRouter ─────────────────────────────────────────────────────────
  try {
    console.log("🤖 Trying OpenRouter...");
    const result = await openrouter.chat.completions.create({
      model: "meta-llama/llama-3.2-11b-vision-instruct",
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });
    console.log("✅ OpenRouter responded");
    return result.choices[0].message.content;
  } catch (err) {
    console.warn(`⚠️ OpenRouter failed: ${err.message}`);
    errors.push(`OpenRouter: ${err.message}`);
  }

  // ── 3. Gemini ─────────────────────────────────────────────────────────────
  try {
    console.log("🤖 Trying Gemini...");
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
    const result = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });
    console.log("✅ Gemini responded");
    return result.text;
  } catch (err) {
    console.warn(`⚠️ Gemini failed: ${err.message}`);
    errors.push(`Gemini: ${err.message}`);
  }

  throw new Error(`All AI providers failed:\n${errors.join("\n")}`);
}

// ─── JSON-safe wrapper ────────────────────────────────────────────────────────

// async function generateAIJson(prompt, systemPrompt = "") {
//   const raw = await generateAI(prompt, systemPrompt);
//   try {
//     const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
//     return JSON.parse(clean);
//   } catch (e) {
//     console.error("JSON parse failed. Raw output:", raw.slice(0, 300));
//     throw new Error("AI returned invalid JSON. Please try again.");
//   }
// }
async function generateAIJson(prompt, systemPrompt = "") {
  const raw = await generateAI(prompt, systemPrompt);
  try {
    let clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // NEW: extract the JSON object even if the model added prose before/after it
    const firstBrace = clean.indexOf("{");
    const lastBrace = clean.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      clean = clean.slice(firstBrace, lastBrace + 1);
    }

    return JSON.parse(clean);
  } catch (e) {
    console.error("JSON parse failed. Raw output:", raw.slice(0, 300));
    throw new Error("AI returned invalid JSON. Please try again.");
  }
}

module.exports = { generateAI, generateAIJson };
