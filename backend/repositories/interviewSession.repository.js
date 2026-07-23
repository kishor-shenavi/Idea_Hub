// backend/repositories/interviewSession.repository.js
const InterviewSession = require('../models/InterviewSession');
class InterviewSessionRepository {
  async create(data) { return new InterviewSession(data); } // returns unsaved doc, matches original `new` + manual .save() pattern
  async findById(id) { return InterviewSession.findById(id); }
  async findByUser(userId) {
    return InterviewSession.find({ user: userId }).select('targetRole difficulty interviewType status report.overallScore createdAt').sort('-createdAt');
  }
}
module.exports = new InterviewSessionRepository();