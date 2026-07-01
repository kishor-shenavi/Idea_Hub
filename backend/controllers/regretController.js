const RegretPost = require('../models/RegretPost');
const { ErrorResponse } = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/async');

// GET /api/v1/regrets  — author field never sent to client
exports.getRegrets = asyncHandler(async (req, res) => {
  let query = {};
  if (req.query.category) query.category = req.query.category;
  if (req.query.year) query.yearItHappened = req.query.year;

  const regrets = await RegretPost.find(query)
    .select('-author') // anonymous — never expose
    .sort('-upvotes -createdAt');

  res.status(200).json({ success: true, count: regrets.length, data: regrets });
});

// POST /api/v1/regrets
exports.createRegret = asyncHandler(async (req, res, next) => {
  const { content, yearItHappened, category } = req.body;
  if (!content) return next(new ErrorResponse('Content is required', 400));

  const regret = await RegretPost.create({
    content,
    yearItHappened,
    category,
    author: req.user.id,
  });

  // Never send author in response
  const safe = regret.toObject();
  delete safe.author;

  res.status(201).json({ success: true, data: safe });
});

// PUT /api/v1/regrets/:id/upvote
exports.upvoteRegret = asyncHandler(async (req, res, next) => {
  const regret = await RegretPost.findById(req.params.id);
  if (!regret) return next(new ErrorResponse('Post not found', 404));

  const upvoted = regret.upvotes.includes(req.user.id);
  if (upvoted) regret.upvotes.pull(req.user.id);
  else regret.upvotes.push(req.user.id);
  await regret.save();

  res.status(200).json({ success: true, isUpvoted: !upvoted, upvoteCount: regret.upvotes.length });
});

// DELETE /api/v1/regrets/:id  — only admin or own post
exports.deleteRegret = asyncHandler(async (req, res, next) => {
  const regret = await RegretPost.findById(req.params.id);
  if (!regret) return next(new ErrorResponse('Post not found', 404));

  if (regret.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized', 403));
  }

  await regret.deleteOne();
  res.status(200).json({ success: true, data: {} });
});
