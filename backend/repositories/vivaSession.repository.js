const VivaSession = require('../models/VivaSession');

class VivaSessionRepository {
  async create(data) { return VivaSession.create(data); }
  async findByIdForUser(id, userId) { return VivaSession.findOne({ _id: id, user: userId }); }
  async findByUser(userId) {
    return VivaSession.find({ user: userId })
      .select('reportTitle status report.overallScore createdAt')
      .sort('-createdAt');
  }
}

module.exports = new VivaSessionRepository();