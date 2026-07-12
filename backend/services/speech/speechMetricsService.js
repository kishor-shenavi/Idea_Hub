const FILLER_WORDS = ['um', 'uh', 'umm', 'uhh', 'like', 'so', 'actually', 'basically', 'you know'];

function analyzeTranscript({ text, words, audioDurationSeconds }) {
  const wordCount = words.length;
  const wordsPerMinute = Math.round((wordCount / audioDurationSeconds) * 60);

  const fillerMap = {};
  words.forEach(w => {
    const clean = w.text.toLowerCase().replace(/[.,!?]/g, '');
    if (FILLER_WORDS.includes(clean)) {
      if (!fillerMap[clean]) fillerMap[clean] = { word: clean, count: 0, timestamps: [] };
      fillerMap[clean].count++;
      fillerMap[clean].timestamps.push(Math.round(w.start / 1000)); // ms -> seconds
    }
  });

  // Pause detection: gap between end of word[i] and start of word[i+1]
  let longestPause = 0;
  for (let i = 0; i < words.length - 1; i++) {
    const gap = (words[i + 1].start - words[i].end) / 1000;
    if (gap > longestPause) longestPause = gap;
  }

  return {
    wordCount,
    wordsPerMinute,
    fillerWordCount: Object.values(fillerMap).reduce((sum, f) => sum + f.count, 0),
    fillerWords: Object.values(fillerMap),
    longestPauseSeconds: Math.round(longestPause * 10) / 10,
  };
}

module.exports = { analyzeTranscript };