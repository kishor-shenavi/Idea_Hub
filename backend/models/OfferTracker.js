const mongoose = require('mongoose');

const offerTrackerSchema = new mongoose.Schema({
  // Anonymous — never expose author
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  package: { type: Number, required: true }, // in LPA
  type: { type: String, enum: ['internship', 'placement'], default: 'placement' },
  stipend: { type: Number }, // monthly in rupees for internships
  branch: { type: String },
  batch: { type: Number },
  location: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('OfferTracker', offerTrackerSchema);
