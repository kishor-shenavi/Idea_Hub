const ResumeScan = require('../models/ResumeScan');

class ResumeScanRepository {
  async create(data) {
    return ResumeScan.create(data);
  }

  async findByUser(userId) {
    return ResumeScan.find({ user: userId })
      .select('atsScore targetRole status createdAt result.overallFeedback')
      .sort('-createdAt');
  }

  async findById(id) {
    return ResumeScan.findById(id);
  }
}

module.exports = new ResumeScanRepository();