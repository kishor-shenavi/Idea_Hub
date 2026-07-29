// backend/repositories/mentorRequest.repository.js
const MentorRequest = require('../models/MentorRequest');
class MentorRequestRepository {
  async findPending(studentId, seniorId) { return MentorRequest.findOne({ student: studentId, senior: seniorId, status: 'pending' }); }
  async create(data) { return MentorRequest.create(data); }
  async findByIdPopulated(id) {
    return MentorRequest.findById(id).populate('student', 'name avatar year branch').populate('senior', 'name avatar').populate('project', 'title');
  }
  async findReceived(seniorId) {
    return MentorRequest.find({ senior: seniorId }).populate('student', 'name avatar year branch bio').populate('project', 'title category').sort('-createdAt');
  }
  async findSent(studentId) {
    return MentorRequest.find({ student: studentId }).populate('senior', 'name avatar branch currentRole company').populate('project', 'title').sort('-createdAt');
  }
  async findById(id) { return MentorRequest.findById(id); }

async findAcceptedSeniorIds(studentId) {
  const requests = await MentorRequest.find({ student: studentId, status: 'accepted' }).select('senior');
  return requests.map(r => r.senior.toString());
}



}


module.exports = new MentorRequestRepository();