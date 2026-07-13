const mongoose = require('mongoose');

const vivaSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportText: { type: String, required: true },
  reportTitle: { type: String, default: 'Untitled Project' },
  exchanges: [{
    question: String,
    answer: String,
    rubric: {
      depth: { type: String, enum: ['vague', 'adequate', 'strong'] },
      reasoning: String,
    },
    action: { type: String, enum: ['drill_deeper', 'escalate', 'new_topic'] },
  }],
  status: { type: String, enum: ['active', 'ended'], default: 'active' },
  report: {
    overallScore: Number,
    topicBreakdown: [{ topic: String, depthScore: Number }],
    strengths: [String],
    weakPoints: [String],
    summary: String,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('VivaSession', vivaSessionSchema);