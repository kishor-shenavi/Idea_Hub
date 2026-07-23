// backend/repositories/message.repository.js
const Message = require('../models/Chat');
class MessageRepository {
  async find(projectId, { skip, limit } = {}) {
    let q = Message.find({ project: projectId }).populate('sender', 'name avatar year branch').sort('createdAt');
    if (skip !== undefined) q = q.skip(skip);
    if (limit !== undefined) q = q.limit(limit);
    return q;
  }
  async create(data) { return Message.create(data); }
  async findByIdPopulated(id) { return Message.findById(id).populate('sender', 'name avatar year branch'); }
  async markRead(projectId, userId) {
    return Message.updateMany(
      { project: projectId, readBy: { $ne: userId }, sender: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );
  }
  async unreadCounts(userId) {
    return Message.aggregate([
      { $match: { sender: { $ne: userId }, readBy: { $ne: userId } } },
      { $group: { _id: '$project', count: { $sum: 1 } } },
    ]);
  }
}
module.exports = new MessageRepository();