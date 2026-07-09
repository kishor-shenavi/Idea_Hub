const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRole: { type: String, required: true },
  difficulty: { type: String, enum: ['junior', 'mid', 'senior'], default: 'mid' },
  interviewType: { type: String, enum: ['behavioral', 'technical', 'system_design'], default: 'technical' },
  topics: { type: String },
  resumeText: { type: String },
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  questionsLimit: { type: Number, default: 5 },
  messages: [{
    role: { type: String, enum: ['interviewer', 'candidate'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  report: {
    overallScore: { type: Number, min: 0, max: 100 },
    summary: { type: String },
    strengths: [String],
    weaknesses: [String],
    qaFeedback: [{
      question: mongoose.Schema.Types.Mixed,
      answer: mongoose.Schema.Types.Mixed,
      score: Number,
      critique: mongoose.Schema.Types.Mixed,
      modelAnswer: mongoose.Schema.Types.Mixed
    }]
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
