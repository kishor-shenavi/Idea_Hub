// backend/controllers/offerTrackerController.js
const offerTrackerRepository = require('../repositories/offerTracker.repository');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/async');

exports.getOffers = asyncHandler(async (req, res) => {
  let query = {};
  if (req.query.company) query.company = { $regex: req.query.company, $options: 'i' };
  if (req.query.type) query.type = req.query.type;
  if (req.query.branch) query.branch = { $regex: req.query.branch, $options: 'i' };
  if (req.query.batch) query.batch = req.query.batch;
  const offers = await offerTrackerRepository.find(query);
  res.status(200).json({ success: true, count: offers.length, data: offers });
});

exports.getOfferStats = asyncHandler(async (req, res) => {
  const stats = await offerTrackerRepository.aggregateByCompany();
  const overall = await offerTrackerRepository.aggregateOverall();
  res.status(200).json({ success: true, data: { byCompany: stats, overall: overall[0] || {} } });
});

exports.createOffer = asyncHandler(async (req, res) => {
  req.body.author = req.user.id;
  const offer = await offerTrackerRepository.create(req.body);
  const safe = offer.toObject();
  delete safe.author;
  res.status(201).json({ success: true, data: safe });
});

exports.deleteOffer = asyncHandler(async (req, res, next) => {
  const offer = await offerTrackerRepository.findById(req.params.id);
  if (!offer) return next(AppError.notFound('Not found'));
  if (offer.author.toString() !== req.user.id && req.user.role !== 'admin') return next(AppError.forbidden());
  await offer.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

exports.getOfferStats = asyncHandler(async (req, res) => {
  const stats = await offerTrackerRepository.aggregateByCompany();
  const overall = await offerTrackerRepository.aggregateOverall();
  const internshipStats = await offerTrackerRepository.aggregateInternshipStats();
  res.status(200).json({
    success: true,
    data: { byCompany: stats, overall: overall[0] || {}, internships: internshipStats[0] || {} },
  });
});