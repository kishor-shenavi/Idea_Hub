const OfferTracker = require('../models/OfferTracker');
const { ErrorResponse } = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/async');

// GET /api/v1/offers  — always anonymous, never send author
exports.getOffers = asyncHandler(async (req, res) => {
  let query = {};
  if (req.query.company) query.company = { $regex: req.query.company, $options: 'i' };
  if (req.query.type) query.type = req.query.type;
  if (req.query.branch) query.branch = { $regex: req.query.branch, $options: 'i' };
  if (req.query.batch) query.batch = req.query.batch;

  const offers = await OfferTracker.find(query)
    .select('-author')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: offers.length, data: offers });
});

// GET /api/v1/offers/stats  — aggregated salary stats
exports.getOfferStats = asyncHandler(async (req, res) => {
  const stats = await OfferTracker.aggregate([
    { $match: { type: 'placement' } },
    {
      $group: {
        _id: '$company',
        avgPackage: { $avg: '$package' },
        maxPackage: { $max: '$package' },
        minPackage: { $min: '$package' },
        count: { $sum: 1 },
      },
    },
    { $sort: { avgPackage: -1 } },
    { $limit: 20 },
  ]);

  const overall = await OfferTracker.aggregate([
    { $match: { type: 'placement' } },
    {
      $group: {
        _id: null,
        avgPackage: { $avg: '$package' },
        maxPackage: { $max: '$package' },
        totalOffers: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: { byCompany: stats, overall: overall[0] || {} },
  });
});

// POST /api/v1/offers
exports.createOffer = asyncHandler(async (req, res) => {
  req.body.author = req.user.id;
  const offer = await OfferTracker.create(req.body);
  const safe = offer.toObject();
  delete safe.author;
  res.status(201).json({ success: true, data: safe });
});

// DELETE /api/v1/offers/:id  — only own entry or admin
exports.deleteOffer = asyncHandler(async (req, res, next) => {
  const offer = await OfferTracker.findById(req.params.id);
  if (!offer) return next(new ErrorResponse('Not found', 404));
  if (offer.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized', 403));
  }
  await offer.deleteOne();
  res.status(200).json({ success: true, data: {} });
});
