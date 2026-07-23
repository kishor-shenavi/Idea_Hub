// backend/repositories/project.repository.js
const Project = require('../models/Project');
class ProjectRepository {
  async count(query) { return Project.countDocuments(query); }
  async find(query, { populate, sort, skip, limit } = {}) {
    let q = Project.find(query);
    if (populate) q = q.populate(populate);
    if (sort) q = q.sort(sort);
    if (skip !== undefined) q = q.skip(skip);
    if (limit !== undefined) q = q.limit(limit);
    return q;
  }
  async findById(id, populate) { const q = Project.findById(id); return populate ? q.populate(populate) : q; }
  async create(data) { return Project.create(data); }
  async updateById(id, data) { return Project.findByIdAndUpdate(id, data, { new: true, runValidators: true }); }
  async incrementShares(id) { return Project.findByIdAndUpdate(id, { $inc: { shares: 1 } }, { new: true }); }
}
module.exports = new ProjectRepository();