// backend/repositories/buildLog.repository.js
const BuildLog = require('../models/BuildLog');
class BuildLogRepository {
  async count(query) { return BuildLog.countDocuments(query); }
  async find(query, { skip, limit } = {}) {
    let q = BuildLog.find(query).populate('author', 'name avatar year branch').populate('project', 'title category').sort('-createdAt');
    if (skip !== undefined) q = q.skip(skip);
    if (limit !== undefined) q = q.limit(limit);
    return q;
  }
  async findById(id) { return BuildLog.findById(id).populate('author', 'name avatar year branch bio githubUrl linkedinUrl').populate('project', 'title category'); }
  async create(data) { return BuildLog.create(data); }
  async findByIdPopulated(id) { return BuildLog.findById(id).populate('author', 'name avatar year branch'); }
  async updateById(id, data) { return BuildLog.findByIdAndUpdate(id, data, { new: true, runValidators: true }); }
  async findByAuthor(authorId) { return BuildLog.find({ author: authorId }).populate('project', 'title category').sort('-createdAt'); }
}
module.exports = new BuildLogRepository();