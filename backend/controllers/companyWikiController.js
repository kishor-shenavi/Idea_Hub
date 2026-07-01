const CompanyWiki = require('../models/CompanyWiki');
const { ErrorResponse } = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/async');

// GET /api/v1/wiki
exports.getWikiEntries = asyncHandler(async (req, res) => {
  let query = {};
  if (req.query.company) query.company = { $regex: req.query.company, $options: 'i' };
  if (req.query.type) query.type = req.query.type;
  if (req.query.role) query.role = { $regex: req.query.role, $options: 'i' };

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const total = await CompanyWiki.countDocuments(query);

  const entries = await CompanyWiki.find(query)
    .populate('postedBy', 'name avatar year branch')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({ success: true, count: entries.length, total, data: entries });
});

// GET /api/v1/wiki/companies  — unique company list for search
exports.getCompanyList = asyncHandler(async (req, res) => {
  const companies = await CompanyWiki.distinct('company');
  res.status(200).json({ success: true, data: companies.sort() });
});

// GET /api/v1/wiki/:id
exports.getWikiEntry = asyncHandler(async (req, res, next) => {
  const entry = await CompanyWiki.findById(req.params.id)
    .populate('postedBy', 'name avatar year branch linkedinUrl');
  if (!entry) return next(new ErrorResponse('Entry not found', 404));
  res.status(200).json({ success: true, data: entry });
});

// POST /api/v1/wiki
exports.createWikiEntry = asyncHandler(async (req, res) => {
  req.body.postedBy = req.user.id;
  const entry = await CompanyWiki.create(req.body);
  res.status(201).json({ success: true, data: entry });
});

// PUT /api/v1/wiki/:id
exports.updateWikiEntry = asyncHandler(async (req, res, next) => {
  let entry = await CompanyWiki.findById(req.params.id);
  if (!entry) return next(new ErrorResponse('Entry not found', 404));
  if (entry.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized', 403));
  }
  entry = await CompanyWiki.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: entry });
});

// DELETE /api/v1/wiki/:id
exports.deleteWikiEntry = asyncHandler(async (req, res, next) => {
  const entry = await CompanyWiki.findById(req.params.id);
  if (!entry) return next(new ErrorResponse('Entry not found', 404));
  if (entry.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized', 403));
  }
  await entry.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

// PUT /api/v1/wiki/:id/upvote
exports.upvoteWikiEntry = asyncHandler(async (req, res, next) => {
  const entry = await CompanyWiki.findById(req.params.id);
  if (!entry) return next(new ErrorResponse('Entry not found', 404));
  const upvoted = entry.upvotes.includes(req.user.id);
  if (upvoted) entry.upvotes.pull(req.user.id);
  else entry.upvotes.push(req.user.id);
  await entry.save();
  res.status(200).json({ success: true, isUpvoted: !upvoted, upvoteCount: entry.upvotes.length });
});
