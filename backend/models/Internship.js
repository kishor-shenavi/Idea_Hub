const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  description: { type: String, required: true },
  stipend: { type: String },
  duration: { type: String },
  location: { type: String },
  applyLink: { type: String },
  deadline: { type: Date },
  type: { type: String, enum: ['internship', 'placement'], default: 'internship' },
  tags: [String],

  // Senior experience sharing
  howIGotIt: { type: String },
  interviewProcess: { type: String },

  status: { type: String, enum: ['active', 'expired', 'pending', 'rejected'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Internship', internshipSchema);
