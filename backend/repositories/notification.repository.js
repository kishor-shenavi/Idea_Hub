const Notification = require('../models/Notification');

class NotificationRepository {
  async create(data) { return Notification.create(data); }
  async findUnread(userId) { return Notification.find({ user: userId, read: false }).sort('-createdAt').limit(30); }
  async markRead(id, userId) { return Notification.findOneAndUpdate({ _id: id, user: userId }, { read: true }); }
  async markAllRead(userId) { return Notification.updateMany({ user: userId, read: false }, { read: true }); }
}

module.exports = new NotificationRepository();