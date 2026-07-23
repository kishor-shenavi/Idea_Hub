// backend/repositories/companyWiki.repository.js
const CompanyWiki = require('../models/CompanyWiki');
class CompanyWikiRepository {
  async count(query) { return CompanyWiki.countDocuments(query); }
  async find(query, { skip, limit } = {}) {
    let q = CompanyWiki.find(query).populate('postedBy', 'name avatar year branch').sort('-createdAt');
    if (skip !== undefined) q = q.skip(skip);
    if (limit !== undefined) q = q.limit(limit);
    return q;
  }
  async findById(id) { return CompanyWiki.findById(id).populate('postedBy', 'name avatar year branch linkedinUrl'); }
  async distinctCompanies() { return CompanyWiki.distinct('company'); }
  async create(data) { return CompanyWiki.create(data); }
  async updateById(id, data) { return CompanyWiki.findByIdAndUpdate(id, data, { new: true, runValidators: true }); }
}
module.exports = new CompanyWikiRepository();