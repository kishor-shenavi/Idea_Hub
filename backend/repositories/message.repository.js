const Message = require('../models/Chat');
const { encrypt, decrypt } = require('../utils/encryption');

class MessageRepository {
  async find(projectId, { skip, limit } = {}) {
    let q = Message.find({ project: projectId }).populate('sender', 'name avatar year branch').sort('createdAt');
    if (skip !== undefined) q = q.skip(skip);
    if (limit !== undefined) q = q.limit(limit);
    const docs = await q;
    docs.forEach(d => { d.content = decrypt(d.content); });
    return docs;
  }

  async create(data) {
    return Message.create({ ...data, content: encrypt(data.content) });
  }

  async findByIdPopulated(id) {
    const doc = await Message.findById(id).populate('sender', 'name avatar year branch');
    if (doc) doc.content = decrypt(doc.content);
    return doc;
  }

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