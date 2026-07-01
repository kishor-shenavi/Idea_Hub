const Internship = require('../models/Internship');
const { ErrorResponse } = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/async');

// GET /api/v1/internships
exports.getInternships = asyncHandler(async (req, res) => {
  let query = { status: 'active' };
  if (req.user && req.user.role === 'admin') query = {};

  if (req.query.type) query.type = req.query.type;
  if (req.query.search) query.$or = [
    { company: { $regex: req.query.search, $options: 'i' } },
    { role: { $regex: req.query.search, $options: 'i' } },
    { tags: { $in: [new RegExp(req.query.search, 'i')] } },
  ];

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const total = await Internship.countDocuments(query);
  const internships = await Internship.find(query)
    .populate('postedBy', 'name avatar year branch')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({ success: true, count: internships.length, total, data: internships });
});

// GET /api/v1/internships/:id
exports.getInternship = asyncHandler(async (req, res, next) => {
  const internship = await Internship.findById(req.params.id)
    .populate('postedBy', 'name avatar year branch linkedinUrl');
  if (!internship) return next(new ErrorResponse('Not found', 404));
  res.status(200).json({ success: true, data: internship });
});

// POST /api/v1/internships
exports.createInternship = asyncHandler(async (req, res) => {
  req.body.postedBy = req.user.id;
  req.body.status = 'pending';
  const internship = await Internship.create(req.body);
  res.status(201).json({ success: true, data: internship });
});

// PUT /api/v1/internships/:id
exports.updateInternship = asyncHandler(async (req, res, next) => {
  let internship = await Internship.findById(req.params.id);
  if (!internship) return next(new ErrorResponse('Not found', 404));

  const isOwner = internship.postedBy.toString() === req.user.id;
  if (!isOwner && req.user.role !== 'admin') return next(new ErrorResponse('Not authorized', 403));
  if (req.body.status && req.user.role !== 'admin') delete req.body.status;

  internship = await Internship.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json({ success: true, data: internship });
});

// DELETE /api/v1/internships/:id
exports.deleteInternship = asyncHandler(async (req, res, next) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) return next(new ErrorResponse('Not found', 404));
  if (internship.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized', 403));
  }
  await internship.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

// PUT /api/v1/internships/:id/like
exports.likeInternship = asyncHandler(async (req, res, next) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) return next(new ErrorResponse('Not found', 404));
  const liked = internship.likes.includes(req.user.id);
  if (liked) internship.likes.pull(req.user.id);
  else internship.likes.push(req.user.id);
  await internship.save();
  res.status(200).json({ success: true, isLiked: !liked, likeCount: internship.likes.length });
});
