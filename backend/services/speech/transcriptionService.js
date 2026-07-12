const { AssemblyAI } = require('assemblyai');

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

async function transcribeAudio(filePath) {
  const transcript = await client.transcripts.transcribe({
    audio: filePath,
    disfluencies: true, // keeps "um"/"uh" in the transcript instead of auto-cleaning them out
  });

  if (transcript.status === 'error') {
    throw new Error(`Transcription failed: ${transcript.error}`);
  }

  return {
    text: transcript.text,
    words: transcript.words, // [{ text, start, end, confidence }] — start/end in ms
    audioDurationSeconds: transcript.audio_duration,
  };
}

module.exports = { transcribeAudio };