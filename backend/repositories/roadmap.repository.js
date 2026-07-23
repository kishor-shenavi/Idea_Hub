// backend/repositories/roadmap.repository.js
const Roadmap = require('../models/Roadmap');
class RoadmapRepository {
  async create(data) { return Roadmap.create(data); }
  async findByUser(userId) { return Roadmap.find({ user: userId }).sort('-createdAt'); }
  async findById(id) { return Roadmap.findById(id); }
}
module.exports = new RoadmapRepository();