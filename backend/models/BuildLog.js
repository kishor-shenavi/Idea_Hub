const mongoose = require('mongoose');

const buildLogSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  projectTitle: { type: String, required: true },
  weekNumber: { type: Number, required: true },
  content: { type: String, required: true, maxlength: 2000 },
  techUsed: [String],
  githubUrl: { type: String },
  demoUrl: { type: String },
  stuck: { type: String }, // what they're stuck on
  nextWeekPlan: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('BuildLog', buildLogSchema);
