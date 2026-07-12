const mongoose = require('mongoose');

const extemporeSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  durationSeconds: { type: Number, required: true },
  transcript: { type: String, required: true },
  metrics: {
    wordCount: Number,
    wordsPerMinute: Number,
    fillerWordCount: Number,
    fillerWords: [{ word: String, count: Number, timestamps: [Number] }], // seconds into recording
    longestPauseSeconds: Number,
  },
  // add this field to the schema, alongside `metrics`:
audioAnalysis: {
  frames: [{ time: Number, rms: Number, pitch: Number }],
  pauseSegments: [{ start: Number, end: Number, duration: Number }],
  pitchMean: Number,
  pitchStdDev: Number,
  monotoneScore: Number,
  silenceRatio: Number,
},
  coachFeedback: {
    overallScore: Number,
    strengths: [String],
    improvements: [String],
    summary: String,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ExtemporeSession', extemporeSessionSchema);