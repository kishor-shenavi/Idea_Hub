const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please add a name'], trim: true },
  email: {
    type: String, required: [true, 'Please add an email'], unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Please add a valid email'],
  },
  password: { type: String, minlength: 6, select: false },
  role: { type: String, enum: ['student', 'senior', 'admin'], default: 'student' },
  googleId: { type: String, unique: true, sparse: true },
  isVerified: { type: Boolean, default: false },

  // Profile
  year: { type: Number, enum: [1, 2, 3, 4] },
  branch: { type: String, trim: true },
  bio: { type: String, maxlength: 300 },
  avatar: { type: String },
  linkedinUrl: { type: String },
  githubUrl: { type: String },
  
   githubId: { type: String, unique: true, sparse: true },
githubUsername: { type: String },
githubAccessToken: { type: String, select: false }, // needed to call GitHub API on user's behalf

  // Student preferences for Opportunity Radar
  interests: [{ type: String }],
  goalType: { type: String, enum: ['startup', 'product', 'service', 'research', 'govt', ''] },

  // Bookmarks
  bookmarkedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  bookmarkedPaths: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SeniorPath' }],
 
  publicKeyJwk: { type: mongoose.Schema.Types.Mixed }, // this user's ECDH public key, uploaded by their browser — safe to store, public keys are meant to be public

  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE + 'd',
  });
};

module.exports = mongoose.model('User', userSchema);
