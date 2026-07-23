// backend/controllers/companyWikiController.js
const companyWikiRepository = require('../repositories/companyWiki.repository');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/async');

exports.getWikiEntries = asyncHandler(async (req, res) => {
  let query = {};
  if (req.query.company) query.company = { $regex: req.query.company, $options: 'i' };
  if (req.query.type) query.type = req.query.type;
  if (req.query.role) query.role = { $regex: req.query.role, $options: 'i' };
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const total = await companyWikiRepository.count(query);
  const entries = await companyWikiRepository.find(query, { skip: (page - 1) * limit, limit });
  res.status(200).json({ success: true, count: entries.length, total, data: entries });
});

exports.getCompanyList = asyncHandler(async (req, res) => {
  const companies = await companyWikiRepository.distinctCompanies();
  res.status(200).json({ success: true, data: companies.sort() });
});

exports.getWikiEntry = asyncHandler(async (req, res, next) => {
  const entry = await companyWikiRepository.findById(req.params.id);
  if (!entry) return next(AppError.notFound('Entry not found'));
  res.status(200).json({ success: true, data: entry });
});

exports.createWikiEntry = asyncHandler(async (req, res) => {
  req.body.postedBy = req.user.id;
  const entry = await companyWikiRepository.create(req.body);
  res.status(201).json({ success: true, data: entry });
});

exports.updateWikiEntry = asyncHandler(async (req, res, next) => {
  let entry = await companyWikiRepository.findById(req.params.id);
  if (!entry) return next(AppError.notFound('Entry not found'));
  if (entry.postedBy.toString() !== req.user.id && req.user.role !== 'admin') return next(AppError.forbidden());
  entry = await companyWikiRepository.updateById(req.params.id, req.body);
  res.status(200).json({ success: true, data: entry });
});

exports.deleteWikiEntry = asyncHandler(async (req, res, next) => {
  const entry = await companyWikiRepository.findById(req.params.id);
  if (!entry) return next(AppError.notFound('Entry not found'));
  if (entry.postedBy.toString() !== req.user.id && req.user.role !== 'admin') return next(AppError.forbidden());
  await entry.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

exports.upvoteWikiEntry = asyncHandler(async (req, res, next) => {
  const entry = await companyWikiRepository.findById(req.params.id);
  if (!entry) return next(AppError.notFound('Entry not found'));
  const upvoted = entry.upvotes.includes(req.user.id);
  if (upvoted) entry.upvotes.pull(req.user.id); else entry.upvotes.push(req.user.id);
  await entry.save();
  res.status(200).json({ success: true, isUpvoted: !upvoted, upvoteCount: entry.upvotes.length });
});