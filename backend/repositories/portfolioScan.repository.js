const PortfolioScan = require('../models/PortfolioScan');

class PortfolioScanRepository {
  async create(data) {
    return PortfolioScan.create(data);
  }

  async findByUser(userId) {
    return PortfolioScan.find({ user: userId }).sort('-createdAt');
  }

  async findLatestByUser(userId) {
    return PortfolioScan.findOne({ user: userId }).sort('-createdAt');
  }
  async findByIdForUser(id, userId) {
  return PortfolioScan.findOne({ _id: id, user: userId });
}
}


module.exports = new PortfolioScanRepository();