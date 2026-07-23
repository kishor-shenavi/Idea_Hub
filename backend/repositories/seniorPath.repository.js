// backend/repositories/seniorPath.repository.js
const SeniorPath = require('../models/SeniorPath');
class SeniorPathRepository {
  async find(query) { return SeniorPath.find(query).populate('author', 'name avatar branch currentRole company').sort('-createdAt'); }
  async findById(id) { return SeniorPath.findById(id).populate('author', 'name avatar branch year currentRole company linkedinUrl'); }
  async create(data) { return SeniorPath.create(data); }
  async updateById(id, data) { return SeniorPath.findByIdAndUpdate(id, data, { new: true, runValidators: true }); }
}
module.exports = new SeniorPathRepository();