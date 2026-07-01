const Roadmap = require('../models/Roadmap');
const { generateRoadmap, suggestProjects, generateQuiz, generateTopicResources } = require('../services/ai/roadmapService');
const { getMarketInsights } = require('../services/ai/marketService');
const { ErrorResponse } = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/async');

// POST /api/v1/roadmap/generate
exports.generateUserRoadmap = asyncHandler(async (req, res, next) => {
  const { year, branch, goalType, interests } = req.body;

  if (!year || !branch || !goalType) {
    return next(new ErrorResponse('year, branch and goalType are required', 400));
  }

  const aiResult = await generateRoadmap({
    year,
    branch,
    goalType,
    interests: interests || [],
  });

  const roadmap = await Roadmap.create({
    user: req.user.id,
    title: aiResult.title,
    year,
    branch,
    goalType,
    interests: interests || [],
    weeks: aiResult.weeks,
    isAIGenerated: true,
  });

  res.status(201).json({ success: true, data: roadmap });
});

// GET /api/v1/roadmap/my
exports.getMyRoadmaps = asyncHandler(async (req, res) => {
  const roadmaps = await Roadmap.find({ user: req.user.id }).sort('-createdAt');
  res.status(200).json({ success: true, count: roadmaps.length, data: roadmaps });
});

// GET /api/v1/roadmap/:id
exports.getRoadmap = asyncHandler(async (req, res, next) => {
  const roadmap = await Roadmap.findById(req.params.id);
  if (!roadmap) return next(new ErrorResponse('Roadmap not found', 404));

  if (roadmap.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized', 403));
  }

  res.status(200).json({ success: true, data: roadmap });
});

// PUT /api/v1/roadmap/:id/week/:weekNumber/complete
exports.markWeekComplete = asyncHandler(async (req, res, next) => {
  const roadmap = await Roadmap.findById(req.params.id);
  if (!roadmap) return next(new ErrorResponse('Roadmap not found', 404));
  if (roadmap.user.toString() !== req.user.id) return next(new ErrorResponse('Not authorized', 403));

  const weekNum = parseInt(req.params.weekNumber);
  const week = roadmap.weeks.find(w => w.week === weekNum);
  if (!week) return next(new ErrorResponse('Week not found', 404));

  week.completed = !week.completed;
  roadmap.updatedAt = Date.now();
  await roadmap.save();

  res.status(200).json({ success: true, data: roadmap });
});

// DELETE /api/v1/roadmap/:id
exports.deleteRoadmap = asyncHandler(async (req, res, next) => {
  const roadmap = await Roadmap.findById(req.params.id);
  if (!roadmap) return next(new ErrorResponse('Roadmap not found', 404));
  if (roadmap.user.toString() !== req.user.id) return next(new ErrorResponse('Not authorized', 403));
  await roadmap.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

// POST /api/v1/roadmap/suggest-projects
exports.suggestProjectIdeas = asyncHandler(async (req, res, next) => {
  const { year, branch, interests, difficulty } = req.body;
  if (!year || !branch) return next(new ErrorResponse('year and branch are required', 400));

  const result = await suggestProjects({
    year,
    branch,
    interests: interests || [],
    difficulty,
  });

  res.status(200).json({ success: true, data: result.projects });
});

// POST /api/v1/roadmap/quiz
exports.generateTopicQuiz = asyncHandler(async (req, res, next) => {
  const { topic, difficulty, count } = req.body;
  if (!topic) return next(new ErrorResponse('topic is required', 400));

  const result = await generateQuiz({ topic, difficulty, count: count || 5 });
  res.status(200).json({ success: true, data: result.quiz });
});

// POST /api/v1/roadmap/resources
exports.getWeekResources = asyncHandler(async (req, res, next) => {
  const { topic, context } = req.body;
  if (!topic) return next(new ErrorResponse('topic is required', 400));

  const result = await generateTopicResources({ topic, context });
  res.status(200).json({ success: true, data: result });
});

// POST /api/v1/roadmap/market-insights
exports.getMarketData = asyncHandler(async (req, res, next) => {
  const { branch, goalType, year } = req.body;
  const result = await getMarketInsights({
    branch: branch || req.user.branch,
    goalType: goalType || req.user.goalType,
    year: year || req.user.year,
  });
  res.status(200).json({ success: true, data: result });
});
