const mongoose = require('mongoose');

const portfolioScanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  healthScore: { type: Number, required: true },
  scoreBreakdown: {
    codeQuality: Number,
    consistency: Number,
    documentation: Number,
    diversity: Number,
    activity: Number,
  },
  recruiterPerception: {
    assumedSkills: [String],
    noticedGaps: [String],
    firstImpression: String,
    fixBeforeApplying: [String],
  },
  rawStats: {
    repoCount: Number,
    languages: [{ name: String, percentage: Number }],
    totalCommits: Number,
    reposAnalyzed: [String],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PortfolioScan', portfolioScanSchema);