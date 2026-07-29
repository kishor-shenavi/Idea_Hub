const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['project', 'mentorChat', 'mentorRequest', 'mentorUpdate'], required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  to: { type: String, required: true },
  meta: { type: mongoose.Schema.Types.Mixed }, // projectId / requestId — used for suppression matching
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);