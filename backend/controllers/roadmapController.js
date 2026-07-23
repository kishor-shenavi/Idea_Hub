// backend/controllers/roadmapController.js
const roadmapRepository = require('../repositories/roadmap.repository');
const { generateRoadmap, suggestProjects, generateQuiz, generateTopicResources } = require('../services/ai/roadmapService');
const { getMarketInsights } = require('../services/ai/marketService');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/async');
const logger = require('../utils/logger');
const aiQueue = require('../queues/aiQueue'); // add this import

exports.generateUserRoadmap = asyncHandler(async (req, res) => {
  const { year, branch, goalType, interests } = req.body;
  const roadmap = await roadmapRepository.create({
    user: req.user.id, year, branch, goalType, interests: interests || [], weeks: [], status: 'pending',
  });
  await aiQueue.add('roadmap-generate', { roadmapId: roadmap._id.toString() });
  logger.info('Roadmap generation queued', { requestId: req.id, userId: req.user.id, roadmapId: roadmap._id });
  res.status(202).json({ success: true, data: roadmap });
});

exports.getMyRoadmaps = asyncHandler(async (req, res) => {
  const roadmaps = await roadmapRepository.findByUser(req.user.id);
  res.status(200).json({ success: true, count: roadmaps.length, data: roadmaps });
});

exports.getRoadmap = asyncHandler(async (req, res, next) => {
  const roadmap = await roadmapRepository.findById(req.params.id);
  if (!roadmap) return next(AppError.notFound('Roadmap not found'));
  if (roadmap.user.toString() !== req.user.id && req.user.role !== 'admin') return next(AppError.forbidden());
  res.status(200).json({ success: true, data: roadmap });
});

exports.markWeekComplete = asyncHandler(async (req, res, next) => {
  const roadmap = await roadmapRepository.findById(req.params.id);
  if (!roadmap) return next(AppError.notFound('Roadmap not found'));
  if (roadmap.user.toString() !== req.user.id) return next(AppError.forbidden());
  const weekNum = parseInt(req.params.weekNumber);
  const week = roadmap.weeks.find(w => w.week === weekNum);
  if (!week) return next(AppError.notFound('Week not found'));
  week.completed = !week.completed;
  roadmap.updatedAt = Date.now();
  await roadmap.save();
  res.status(200).json({ success: true, data: roadmap });
});

exports.deleteRoadmap = asyncHandler(async (req, res, next) => {
  const roadmap = await roadmapRepository.findById(req.params.id);
  if (!roadmap) return next(AppError.notFound('Roadmap not found'));
  if (roadmap.user.toString() !== req.user.id) return next(AppError.forbidden());
  await roadmap.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

exports.suggestProjectIdeas = asyncHandler(async (req, res) => {
  const { year, branch, interests, difficulty } = req.body;
  const result = await suggestProjects({ year, branch, interests: interests || [], difficulty });
  res.status(200).json({ success: true, data: result.projects });
});

exports.generateTopicQuiz = asyncHandler(async (req, res) => {
  const { topic, difficulty, count } = req.body;
  const result = await generateQuiz({ topic, difficulty, count: count || 5 });
  res.status(200).json({ success: true, data: result.quiz });
});

exports.getWeekResources = asyncHandler(async (req, res) => {
  const { topic, context } = req.body;
  const result = await generateTopicResources({ topic, context });
  res.status(200).json({ success: true, data: result });
});

exports.getMarketData = asyncHandler(async (req, res) => {
  const { branch, goalType, year } = req.body;
  const result = await getMarketInsights({ branch: branch || req.user.branch, goalType: goalType || req.user.goalType, year: year || req.user.year });
  res.status(200).json({ success: true, data: result });
});
