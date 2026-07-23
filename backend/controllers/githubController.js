const userRepository = require('../repositories/user.repository');
const portfolioScanRepository = require('../repositories/portfolioScan.repository');
const { getPortfolioData } = require('../services/github/githubApiService');
const { analyzePortfolio } = require('../services/ai/githubIntelligenceService');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/async');
const logger = require('../utils/logger');
const aiQueue =require('../queues/aiQueue');


exports.getConnectionStatus = asyncHandler(async (req, res) => {
  const user = await userRepository.findById(req.user.id);
  res.status(200).json({ success: true, connected: !!user.githubId, username: user.githubUsername });
});

exports.analyzeGithubProfile = asyncHandler(async (req, res, next) => {
  const user = await userRepository.findById(req.user.id, { withGithubToken: true });
  if (!user.githubAccessToken) return next(AppError.validation('GitHub account not connected'));

  const scan = await portfolioScanRepository.create({
    user: req.user.id, status: 'pending', rawStats: {},
  });

  await aiQueue.add('github-analyze', { scanId: scan._id.toString(), userId: req.user.id });

  logger.info('GitHub analysis queued', { requestId: req.id, userId: req.user.id, scanId: scan._id });

  res.status(202).json({ success: true, data: { scanId: scan._id, status: 'pending' } });
});

exports.getScanById = asyncHandler(async (req, res, next) => {
  const scan = await portfolioScanRepository.findByIdForUser
    ? await portfolioScanRepository.findByIdForUser(req.params.id, req.user.id)
    : null;
  // NOTE: portfolioScan.repository.js doesn't have this method yet — added below, don't skip that part
  if (!scan) return next(AppError.notFound('Scan not found'));
  res.status(200).json({ success: true, data: scan });
});

exports.getScanHistory = asyncHandler(async (req, res) => {
  const scans = await portfolioScanRepository.findByUser(req.user.id);
  res.status(200).json({ success: true, count: scans.length, data: scans });
});