const mongoose = require('mongoose');

const gdSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  transcript: [{
    speaker: { type: String, required: true }, // 'student' or personaId
    text: { type: String, required: true },
    wasInterruption: { type: Boolean, default: false },
    durationSeconds: { type: Number, default: 0 }, // for student turns, from transcript audio
    timestamp: { type: Date, default: Date.now },
  }],
  status: { type: String, enum: ['active', 'ended'], default: 'active' },
  report: {
    speakingTimePercent: Number,
    initiatorVsReactor: { initiated: Number, reacted: Number },
    timesInterrupted: Number,
    builtOnOthersPoints: Boolean,
    summary: String,
    strengths: [String],
    improvements: [String],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('GDSession', gdSessionSchema);