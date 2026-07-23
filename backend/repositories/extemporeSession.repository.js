const ExtemporeSession = require('../models/ExtemporeSession');

class ExtemporeSessionRepository {
  async create(data) { return ExtemporeSession.create(data); }
async findByUser(userId) {
  return ExtemporeSession.find({ user: userId }).select('topic coachFeedback.overallScore createdAt').sort('-createdAt');
}}

module.exports = new ExtemporeSessionRepository();