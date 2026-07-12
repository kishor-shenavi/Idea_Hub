const User = require('../models/User');
const PortfolioScan = require('../models/PortfolioScan');
const { getPortfolioData } = require('../services/github/githubApiService');
const { analyzePortfolio } = require('../services/ai/githubIntelligenceService');
const { ErrorResponse } = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/async');

exports.getConnectionStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, connected: !!user.githubId, username: user.githubUsername });
});

exports.analyzeGithubProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+githubAccessToken');
  if (!user.githubAccessToken) {
    return next(new ErrorResponse('GitHub account not connected', 400));
  }

  const { repos } = await getPortfolioData(user.githubAccessToken);
  if (repos.length === 0) {
    return next(new ErrorResponse('No public repositories found to analyze', 400));
  }

  const aiResult = await analyzePortfolio({ username: user.githubUsername, repos });

  const scan = await PortfolioScan.create({
    user: req.user.id,
    healthScore: aiResult.healthScore,
    scoreBreakdown: aiResult.scoreBreakdown,
    recruiterPerception: aiResult.recruiterPerception,
    rawStats: {
      repoCount: repos.length,
      reposAnalyzed: repos.map(r => r.name),
    },
  });

  res.status(200).json({ success: true, data: scan });
});

exports.getScanHistory = asyncHandler(async (req, res) => {
  const scans = await PortfolioScan.find({ user: req.user.id }).sort('-createdAt');
  res.status(200).json({ success: true, count: scans.length, data: scans });
});