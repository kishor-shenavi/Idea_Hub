const User = require('../models/User');

class UserRepository {
// backend/repositories/user.repository.js — replace the existing findById method with this
async findById(id, { withGithubToken = false, withPassword = false } = {}) {
  let query = User.findById(id);
  const selects = [];
  if (withGithubToken) selects.push('+githubAccessToken');
  if (withPassword) selects.push('+password');
  if (selects.length) query = query.select(selects.join(' '));
  return query;
}
  async updateGithubLink(userId, { githubId, githubUsername, githubAccessToken }) {
    return User.findByIdAndUpdate(
      userId,
      { githubId, githubUsername, githubAccessToken },
      { new: true }
    );
  }

  // backend/repositories/user.repository.js — EDIT, add these methods to your existing file, don't replace it
async findByEmail(email, withPassword = false) {
  const q = User.findOne({ email });
  return withPassword ? q.select('+password') : q;
}
async create(data) { return User.create(data); }
async find(query) { return User.find(query).sort('-createdAt'); }
async updateById(id, data) { return User.findByIdAndUpdate(id, data, { new: true, runValidators: true }); }
async deleteById(id) { return User.findByIdAndDelete(id); }
}

module.exports = new UserRepository();