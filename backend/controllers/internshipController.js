// backend/controllers/internshipController.js
const internshipRepository = require('../repositories/internship.repository');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/async');

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
  const total = await internshipRepository.count(query);
  const internships = await internshipRepository.find(query, { skip: (page - 1) * limit, limit });
  res.status(200).json({ success: true, count: internships.length, total, data: internships });
});

exports.getInternship = asyncHandler(async (req, res, next) => {
  const internship = await internshipRepository.findById(req.params.id);
  if (!internship) return next(AppError.notFound('Not found'));
  res.status(200).json({ success: true, data: internship });
});

exports.createInternship = asyncHandler(async (req, res) => {
  req.body.postedBy = req.user.id;
  req.body.status = 'pending';
  const internship = await internshipRepository.create(req.body);
  res.status(201).json({ success: true, data: internship });
});

exports.updateInternship = asyncHandler(async (req, res, next) => {
  let internship = await internshipRepository.findById(req.params.id);
  if (!internship) return next(AppError.notFound('Not found'));
  const isOwner = internship.postedBy.toString() === req.user.id;
  if (!isOwner && req.user.role !== 'admin') return next(AppError.forbidden());
  if (req.body.status && req.user.role !== 'admin') delete req.body.status;
  internship = await internshipRepository.updateById(req.params.id, req.body);
  res.status(200).json({ success: true, data: internship });
});

exports.deleteInternship = asyncHandler(async (req, res, next) => {
  const internship = await internshipRepository.findById(req.params.id);
  if (!internship) return next(AppError.notFound('Not found'));
  if (internship.postedBy.toString() !== req.user.id && req.user.role !== 'admin') return next(AppError.forbidden());
  await internship.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

exports.likeInternship = asyncHandler(async (req, res, next) => {
  const internship = await internshipRepository.findById(req.params.id);
  if (!internship) return next(AppError.notFound('Not found'));
  const liked = internship.likes.includes(req.user.id);
  if (liked) internship.likes.pull(req.user.id); else internship.likes.push(req.user.id);
  await internship.save();
  res.status(200).json({ success: true, isLiked: !liked, likeCount: internship.likes.length });
});