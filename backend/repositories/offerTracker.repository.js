// backend/repositories/offerTracker.repository.js
const OfferTracker = require('../models/OfferTracker');
class OfferTrackerRepository {
  async find(query) { return OfferTracker.find(query).select('-author').sort('-createdAt'); }
  async aggregateByCompany() {
    return OfferTracker.aggregate([
      { $match: { type: 'placement' } },
      { $group: { _id: '$company', avgPackage: { $avg: '$package' }, maxPackage: { $max: '$package' }, minPackage: { $min: '$package' }, count: { $sum: 1 } } },
      { $sort: { avgPackage: -1 } },
      { $limit: 20 },
    ]);
  }
  async aggregateOverall() {
    return OfferTracker.aggregate([
      { $match: { type: 'placement' } },
      { $group: { _id: null, avgPackage: { $avg: '$package' }, maxPackage: { $max: '$package' }, totalOffers: { $sum: 1 } } },
    ]);
  }
  async create(data) { return OfferTracker.create(data); }
  async findById(id) { return OfferTracker.findById(id); }
}
module.exports = new OfferTrackerRepository();