// backend/repositories/regret.repository.js
const RegretPost = require('../models/RegretPost');
class RegretRepository {
  async find(query) { return RegretPost.find(query).select('-author').sort('-upvotes -createdAt'); }
  async create(data) { return RegretPost.create(data); }
  async findById(id) { return RegretPost.findById(id); }
  async findByIdAndDelete(id) { return RegretPost.findByIdAndDelete(id); }
}
module.exports = new RegretRepository();