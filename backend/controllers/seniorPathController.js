const SeniorPath = require('../models/SeniorPath');
const { ErrorResponse } = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/async');

// GET /api/v1/paths
exports.getPaths = asyncHandler(async (req, res) => {
  let query = {};
  if (req.query.branch) query.branch = { $regex: req.query.branch, $options: 'i' };
  if (req.query.search) query.title = { $regex: req.query.search, $options: 'i' };

  const paths = await SeniorPath.find(query)
    .populate('author', 'name avatar branch currentRole company')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: paths.length, data: paths });
});

// GET /api/v1/paths/:id
exports.getPath = asyncHandler(async (req, res, next) => {
  const path = await SeniorPath.findById(req.params.id)
    .populate('author', 'name avatar branch year currentRole company linkedinUrl');
  if (!path) return next(new ErrorResponse('Path not found', 404));
  res.status(200).json({ success: true, data: path });
});

// POST /api/v1/paths
exports.createPath = asyncHandler(async (req, res) => {
  req.body.author = req.user.id;
  const path = await SeniorPath.create(req.body);
  res.status(201).json({ success: true, data: path });
});

// PUT /api/v1/paths/:id
exports.updatePath = asyncHandler(async (req, res, next) => {
  let path = await SeniorPath.findById(req.params.id);
  if (!path) return next(new ErrorResponse('Path not found', 404));
  if (path.author.toString() !== req.user.id) return next(new ErrorResponse('Not authorized', 403));

  path = await SeniorPath.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: path });
});

// DELETE /api/v1/paths/:id
exports.deletePath = asyncHandler(async (req, res, next) => {
  const path = await SeniorPath.findById(req.params.id);
  if (!path) return next(new ErrorResponse('Path not found', 404));
  if (path.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized', 403));
  }
  await path.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

// PUT /api/v1/paths/:id/like
exports.likePath = asyncHandler(async (req, res, next) => {
  const path = await SeniorPath.findById(req.params.id);
  if (!path) return next(new ErrorResponse('Path not found', 404));
  const liked = path.likes.includes(req.user.id);
  if (liked) path.likes.pull(req.user.id);
  else path.likes.push(req.user.id);
  await path.save();
  res.status(200).json({ success: true, isLiked: !liked, likeCount: path.likes.length });
});
