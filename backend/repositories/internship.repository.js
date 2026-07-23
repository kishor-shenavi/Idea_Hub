// backend/repositories/internship.repository.js
const Internship = require('../models/Internship');
class InternshipRepository {
  async count(query) { return Internship.countDocuments(query); }
  async find(query, { skip, limit } = {}) {
    let q = Internship.find(query).populate('postedBy', 'name avatar year branch').sort('-createdAt');
    if (skip !== undefined) q = q.skip(skip);
    if (limit !== undefined) q = q.limit(limit);
    return q;
  }
  async findById(id) { return Internship.findById(id).populate('postedBy', 'name avatar year branch linkedinUrl'); }
  async create(data) { return Internship.create(data); }
  async updateById(id, data) { return Internship.findByIdAndUpdate(id, data, { new: true }); }
}
module.exports = new InternshipRepository();