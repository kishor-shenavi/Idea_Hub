const mongoose = require('mongoose');

const seniorPathSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, maxlength: 150 },
  branch: { type: String, required: true },
  passingYear: { type: Number },
  currentRole: { type: String },
  company: { type: String },

  // Year-by-year breakdown
  years: [{
    year: { type: Number, enum: [1, 2, 3, 4], required: true },
    title: { type: String },
    description: { type: String },
    skills: [String],
    projects: [String],
    internships: [String],
    tips: { type: String },
  }],

  tags: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SeniorPath', seniorPathSchema);
