// backend/controllers/seniorPathController.js
const seniorPathRepository = require('../repositories/seniorPath.repository');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/async');

exports.getPaths = asyncHandler(async (req, res) => {
  let query = {};
  if (req.query.branch) query.branch = { $regex: req.query.branch, $options: 'i' };
  if (req.query.search) query.title = { $regex: req.query.search, $options: 'i' };
  const paths = await seniorPathRepository.find(query);
  res.status(200).json({ success: true, count: paths.length, data: paths });
});

exports.getPath = asyncHandler(async (req, res, next) => {
  const path = await seniorPathRepository.findById(req.params.id);
  if (!path) return next(AppError.notFound('Path not found'));
  res.status(200).json({ success: true, data: path });
});

exports.createPath = asyncHandler(async (req, res) => {
  req.body.author = req.user.id;
  const path = await seniorPathRepository.create(req.body);
  res.status(201).json({ success: true, data: path });
});

exports.updatePath = asyncHandler(async (req, res, next) => {
  let path = await seniorPathRepository.findById(req.params.id);
  if (!path) return next(AppError.notFound('Path not found'));
  if (path.author.toString() !== req.user.id) return next(AppError.forbidden());
  path = await seniorPathRepository.updateById(req.params.id, req.body);
  res.status(200).json({ success: true, data: path });
});

exports.deletePath = asyncHandler(async (req, res, next) => {
  const path = await seniorPathRepository.findById(req.params.id);
  if (!path) return next(AppError.notFound('Path not found'));
  if (path.author.toString() !== req.user.id && req.user.role !== 'admin') return next(AppError.forbidden());
  await path.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

exports.likePath = asyncHandler(async (req, res, next) => {
  const path = await seniorPathRepository.findById(req.params.id);
  if (!path) return next(AppError.notFound('Path not found'));
  const liked = path.likes.includes(req.user.id);
  if (liked) path.likes.pull(req.user.id); else path.likes.push(req.user.id);
  await path.save();
  res.status(200).json({ success: true, isLiked: !liked, likeCount: path.likes.length });
});