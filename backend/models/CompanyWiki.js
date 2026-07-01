const mongoose = require('mongoose');

const companyWikiSchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true },
  type: { type: String, enum: ['internship', 'placement'], default: 'placement' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  rounds: [{
    roundNumber: Number,
    roundType: { type: String, enum: ['online-test', 'dsa', 'system-design', 'hr', 'technical', 'group-discussion', 'other'] },
    description: String,
    tips: String,
  }],

  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  result: { type: String, enum: ['selected', 'rejected', 'on-hold'] },
  batch: { type: Number },
  package: { type: String },
  tips: { type: String },

  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

companyWikiSchema.index({ company: 1 });

module.exports = mongoose.model('CompanyWiki', companyWikiSchema);
