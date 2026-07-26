const DirectMessage = require('../models/DirectMessage');

class DirectMessageRepository {
  async findByRequest(mentorRequestId) {
    return DirectMessage.find({ mentorRequest: mentorRequestId })
      .populate('sender', 'name avatar')
      .sort('createdAt');
  }
  async create(data) { return DirectMessage.create(data); }
  async findByIdPopulated(id) { return DirectMessage.findById(id).populate('sender', 'name avatar'); }
  async markRead(mentorRequestId, userId) {
  return DirectMessage.updateMany(
    { mentorRequest: mentorRequestId, readBy: { $ne: userId }, sender: { $ne: userId } },
    { $addToSet: { readBy: userId } }
  );
}

async unreadRequestIds(userId) {
  return DirectMessage.distinct('mentorRequest', { sender: { $ne: userId }, readBy: { $ne: userId } });
}
}

module.exports = new DirectMessageRepository();