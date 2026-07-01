const mongoose = require('mongoose');

const regretPostSchema = new mongoose.Schema({
  content: { type: String, required: true, maxlength: 500 },
  yearItHappened: { type: Number, enum: [1, 2, 3, 4] },
  category: { type: String, enum: ['academics', 'projects', 'internship', 'skills', 'networking', 'other'], default: 'other' },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // author is intentionally NOT populated in responses — anonymous
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RegretPost', regretPostSchema);
