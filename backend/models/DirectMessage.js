const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema({
  mentorRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'MentorRequest', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ciphertext: { type: String, required: true },
  iv: { type: String, required: true },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

directMessageSchema.index({ mentorRequest: 1, createdAt: 1 });

module.exports = mongoose.model('DirectMessage', directMessageSchema);