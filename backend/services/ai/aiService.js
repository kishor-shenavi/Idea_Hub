const { GoogleGenAI } = require("@google/genai");
const Groq = require("groq-sdk");
const OpenAI = require("openai");
const logger = require("../../utils/logger");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// ─── Retry wrapper — retries a single provider on transient failure before giving up on it ───
async function withRetry(fn, { retries = 2, delayMs = 500, label = "provider" } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        logger.warn(`${label} attempt ${attempt} failed, retrying...`, { error: err.message });
        await new Promise(r => setTimeout(r, delayMs * attempt)); // linear backoff: 500ms, 1000ms
      }
    }
  }
  throw lastErr;
}

// ─── Core fallback chain: Groq → OpenRouter → Gemini ─────────────────────────

async function generateAI(prompt, systemPrompt = "") {
  const errors = [];

  // ── 1. Groq ──────────────────────────────────────────────────────────────
  try {
    console.log("🤖 Trying Groq...");
    const result = await withRetry(() => groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }), { label: "Groq" });
    console.log("✅ Groq responded");
    return result.choices[0].message.content;
  } catch (err) {
    console.warn(`⚠️ Groq failed after retries: ${err.message}`);
    errors.push(`Groq: ${err.message}`);
  }

  // ── 2. OpenRouter ─────────────────────────────────────────────────────────
  try {
    console.log("🤖 Trying OpenRouter...");
    const result = await withRetry(() => openrouter.chat.completions.create({
      model: "meta-llama/llama-3.2-11b-vision-instruct",
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }), { label: "OpenRouter" });
    console.log("✅ OpenRouter responded");
    return result.choices[0].message.content;
  } catch (err) {
    console.warn(`⚠️ OpenRouter failed after retries: ${err.message}`);
    errors.push(`OpenRouter: ${err.message}`);
  }

  // ── 3. Gemini ─────────────────────────────────────────────────────────────
  try {
    console.log("🤖 Trying Gemini...");
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
    const result = await withRetry(() => gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    }), { label: "Gemini" });
    console.log("✅ Gemini responded");
    return result.text;
  } catch (err) {
    console.warn(`⚠️ Gemini failed after retries: ${err.message}`);
    errors.push(`Gemini: ${err.message}`);
  }

  throw new Error(`All AI providers failed:\n${errors.join("\n")}`);
}

// ─── JSON-safe wrapper ────────────────────────────────────────────────────────

// requiredKeys is optional — pass it only where a malformed shape would break real logic downstream,
// not on every call. Most calls are fine with just "is this valid JSON at all."
async function generateAIJson(prompt, systemPrompt = "", requiredKeys = null) {
  const raw = await generateAI(prompt, systemPrompt);
  let parsed;

  try {
    let clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const firstBrace = clean.indexOf("{");
    const lastBrace = clean.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      clean = clean.slice(firstBrace, lastBrace + 1);
    }

    parsed = JSON.parse(clean);
  } catch (e) {
    console.error("JSON parse failed. Raw output:", raw.slice(0, 300));
    throw new Error("AI returned invalid JSON. Please try again.");
  }

  if (requiredKeys) {
    const missing = requiredKeys.filter(key => !(key in parsed));
    if (missing.length > 0) {
      console.error("AI JSON missing required keys:", missing, "Raw:", JSON.stringify(parsed).slice(0, 300));
      throw new Error(`AI response was missing expected fields: ${missing.join(", ")}. Please try again.`);
    }
  }

  return parsed;
}

module.exports = { generateAI, generateAIJson };