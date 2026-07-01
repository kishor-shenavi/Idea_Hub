const mongoose = require('mongoose');

const mentorRequestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senior: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  message: { type: String, required: true, maxlength: 500 },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  responseMessage: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MentorRequest', mentorRequestSchema);
