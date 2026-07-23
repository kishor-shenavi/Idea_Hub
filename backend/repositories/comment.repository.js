// backend/repositories/comment.repository.js
const Comment = require('../models/Comment');
class CommentRepository {
  async findTopLevel(projectId) {
    return Comment.find({ project: projectId, parentComment: null }).populate('author', 'name avatar year branch').sort('createdAt');
  }
  async findReplies(parentId) {
    return Comment.find({ parentComment: parentId }).populate('author', 'name avatar year branch').sort('createdAt');
  }
  async create(data) { return Comment.create(data); }
  async findById(id) { return Comment.findById(id); }
  async findByIdPopulated(id) { return Comment.findById(id).populate('author', 'name avatar year branch'); }
}
module.exports = new CommentRepository();