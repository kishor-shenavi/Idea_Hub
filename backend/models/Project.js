const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Please add a title'], trim: true, maxlength: [100, 'Title cannot be more than 100 characters'] },
  description: { type: String, required: [true, 'Please add a description'] },
  tags: { type: [String], required: true },
  category: { type: String, required: true, enum: ['web', 'mobile', 'desktop', 'ai', 'iot', 'other'] },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  techStack: [{ type: String }],

  createdBy: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },

  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  adminFeedback: { type: String },

  githubUrl: { type: String },
  documentationUrl: { type: String },
  demoUrl: { type: String },

  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  shares: { type: Number, default: 0 },

  // Roadmap steps for this project
  roadmap: [{
    week: Number,
    title: String,
    description: String,
  }],
});

module.exports = mongoose.model('Project', projectSchema);
