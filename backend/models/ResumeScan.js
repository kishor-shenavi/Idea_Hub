const mongoose = require('mongoose');

const resumeScanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobDescription: { type: String },
  targetRole: { type: String },

  atsScore: { type: Number, min: 0, max: 100 },
  result: {
    strengths: [String],
    weaknesses: [String],
    missingKeywords: [String],
    presentKeywords: [String],
    improvements: [String],
    sectionFeedback: {
      summary: String,
      experience: String,
      education: String,
      skills: String,
      projects: String,
    },
    overallFeedback: String,
  },
  resumeText: { type: String }, // worker needs the raw text to run the AI call, so it must be persisted, not just passed in-request
status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
errorMessage: { type: String },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ResumeScan', resumeScanSchema);
