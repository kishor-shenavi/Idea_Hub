// backend/controllers/regretController.js
const regretRepository = require('../repositories/regret.repository');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/async');

exports.getRegrets = asyncHandler(async (req, res) => {
  let query = {};
  if (req.query.category) query.category = req.query.category;
  if (req.query.year) query.yearItHappened = req.query.year;
  const regrets = await regretRepository.find(query);
  res.status(200).json({ success: true, count: regrets.length, data: regrets });
});

exports.createRegret = asyncHandler(async (req, res) => {
  const { content, yearItHappened, category } = req.body;
  const regret = await regretRepository.create({ content, yearItHappened, category, author: req.user.id });
  const safe = regret.toObject();
  delete safe.author;
  res.status(201).json({ success: true, data: safe });
});

exports.upvoteRegret = asyncHandler(async (req, res, next) => {
  const regret = await regretRepository.findById(req.params.id);
  if (!regret) return next(AppError.notFound('Post not found'));
  const upvoted = regret.upvotes.includes(req.user.id);
  if (upvoted) regret.upvotes.pull(req.user.id); else regret.upvotes.push(req.user.id);
  await regret.save();
  res.status(200).json({ success: true, isUpvoted: !upvoted, upvoteCount: regret.upvotes.length });
});

exports.deleteRegret = asyncHandler(async (req, res, next) => {
  const regret = await regretRepository.findById(req.params.id);
  if (!regret) return next(AppError.notFound('Post not found'));
  if (regret.author.toString() !== req.user.id && req.user.role !== 'admin') return next(AppError.forbidden());
  await regret.deleteOne();
  res.status(200).json({ success: true, data: {} });
});