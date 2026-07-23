const GDSession = require('../models/GDSession');

class GDSessionRepository {
  async create(data) { return GDSession.create(data); }
  async findByIdForUser(id, userId) { return GDSession.findOne({ _id: id, user: userId }); }
async findByUser(userId) {
  return GDSession.find({ user: userId }).select('topic status report.speakingTimePercent createdAt').sort('-createdAt');
}
}

module.exports = new GDSessionRepository();