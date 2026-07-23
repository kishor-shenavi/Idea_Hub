const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  year: { type: Number, enum: [1, 2, 3, 4] },
  branch: { type: String },
  goalType: { type: String, enum: ['startup', 'product', 'service', 'research', 'govt'] },
  interests: [String],

  weeks: [{
    week: Number,
    title: String,
    description: String,
    resources: [{ title: String, url: String, type: { type: String, enum: ['video', 'article', 'course', 'book', 'other'] } }],
    completed: { type: Boolean, default: false },
  }],
   title: { type: String, default: 'Generating your roadmap...' }, // was required — must allow a placeholder since title doesn't exist until the AI job finishes
status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
errorMessage: { type: String },
  isAIGenerated: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
