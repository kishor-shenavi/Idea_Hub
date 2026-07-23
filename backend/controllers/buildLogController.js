// backend/controllers/buildLogController.js
const buildLogRepository = require('../repositories/buildLog.repository');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/async');

exports.getBuildLogs = asyncHandler(async (req, res) => {
  let query = {};
  if (req.query.author) query.author = req.query.author;
  if (req.query.project) query.project = req.query.project;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const total = await buildLogRepository.count(query);
  const logs = await buildLogRepository.find(query, { skip: (page - 1) * limit, limit });
  res.status(200).json({ success: true, count: logs.length, total, data: logs });
});

exports.getBuildLog = asyncHandler(async (req, res, next) => {
  const log = await buildLogRepository.findById(req.params.id);
  if (!log) return next(AppError.notFound('Log not found'));
  res.status(200).json({ success: true, data: log });
});

exports.createBuildLog = asyncHandler(async (req, res) => {
  req.body.author = req.user.id;
  const log = await buildLogRepository.create(req.body);
  const populated = await buildLogRepository.findByIdPopulated(log._id);
  res.status(201).json({ success: true, data: populated });
});

exports.updateBuildLog = asyncHandler(async (req, res, next) => {
  let log = await buildLogRepository.findById(req.params.id);
  if (!log) return next(AppError.notFound('Log not found'));
  if (log.author.toString() !== req.user.id) return next(AppError.forbidden());
  log = await buildLogRepository.updateById(req.params.id, req.body);
  res.status(200).json({ success: true, data: log });
});

exports.deleteBuildLog = asyncHandler(async (req, res, next) => {
  const log = await buildLogRepository.findById(req.params.id);
  if (!log) return next(AppError.notFound('Log not found'));
  if (log.author.toString() !== req.user.id && req.user.role !== 'admin') return next(AppError.forbidden());
  await log.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

exports.likeBuildLog = asyncHandler(async (req, res, next) => {
  const log = await buildLogRepository.findById(req.params.id);
  if (!log) return next(AppError.notFound('Log not found'));
  const liked = log.likes.includes(req.user.id);
  if (liked) log.likes.pull(req.user.id); else log.likes.push(req.user.id);
  await log.save();
  res.status(200).json({ success: true, isLiked: !liked, likeCount: log.likes.length });
});

exports.getMyBuildLogs = asyncHandler(async (req, res) => {
  const logs = await buildLogRepository.findByAuthor(req.user.id);
  res.status(200).json({ success: true, count: logs.length, data: logs });
});