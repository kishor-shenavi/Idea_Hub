const BuildLog = require('../models/BuildLog');
const { ErrorResponse } = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/async');

// GET /api/v1/buildlogs
exports.getBuildLogs = asyncHandler(async (req, res) => {
  let query = {};
  if (req.query.author) query.author = req.query.author;
  if (req.query.project) query.project = req.query.project;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const total = await BuildLog.countDocuments(query);

  const logs = await BuildLog.find(query)
    .populate('author', 'name avatar year branch')
    .populate('project', 'title category')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({ success: true, count: logs.length, total, data: logs });
});

// GET /api/v1/buildlogs/:id
exports.getBuildLog = asyncHandler(async (req, res, next) => {
  const log = await BuildLog.findById(req.params.id)
    .populate('author', 'name avatar year branch bio githubUrl linkedinUrl')
    .populate('project', 'title category');
  if (!log) return next(new ErrorResponse('Log not found', 404));
  res.status(200).json({ success: true, data: log });
});

// POST /api/v1/buildlogs
exports.createBuildLog = asyncHandler(async (req, res) => {
  req.body.author = req.user.id;
  const log = await BuildLog.create(req.body);
  const populated = await BuildLog.findById(log._id)
    .populate('author', 'name avatar year branch');
  res.status(201).json({ success: true, data: populated });
});

// PUT /api/v1/buildlogs/:id
exports.updateBuildLog = asyncHandler(async (req, res, next) => {
  let log = await BuildLog.findById(req.params.id);
  if (!log) return next(new ErrorResponse('Log not found', 404));
  if (log.author.toString() !== req.user.id) return next(new ErrorResponse('Not authorized', 403));
  log = await BuildLog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: log });
});

// DELETE /api/v1/buildlogs/:id
exports.deleteBuildLog = asyncHandler(async (req, res, next) => {
  const log = await BuildLog.findById(req.params.id);
  if (!log) return next(new ErrorResponse('Log not found', 404));
  if (log.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized', 403));
  }
  await log.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

// PUT /api/v1/buildlogs/:id/like
exports.likeBuildLog = asyncHandler(async (req, res, next) => {
  const log = await BuildLog.findById(req.params.id);
  if (!log) return next(new ErrorResponse('Log not found', 404));
  const liked = log.likes.includes(req.user.id);
  if (liked) log.likes.pull(req.user.id);
  else log.likes.push(req.user.id);
  await log.save();
  res.status(200).json({ success: true, isLiked: !liked, likeCount: log.likes.length });
});

// GET /api/v1/buildlogs/my
exports.getMyBuildLogs = asyncHandler(async (req, res) => {
  const logs = await BuildLog.find({ author: req.user.id })
    .populate('project', 'title category')
    .sort('-createdAt');
  res.status(200).json({ success: true, count: logs.length, data: logs });
});
