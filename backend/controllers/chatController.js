// backend/controllers/chatController.js
const messageRepository = require('../repositories/message.repository');
const projectRepository = require('../repositories/project.repository');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/async');

exports.getProjectMessages = asyncHandler(async (req, res, next) => {
  const project = await projectRepository.findById(req.params.projectId);
  if (!project) return next(AppError.notFound('Project not found'));
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const messages = await messageRepository.find(req.params.projectId, { skip: (page - 1) * limit, limit });
  res.status(200).json({ success: true, count: messages.length, data: messages });
});

exports.postProjectMessage = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const project = await projectRepository.findById(req.params.projectId);
  if (!project) return next(AppError.notFound('Project not found'));
  const message = await messageRepository.create({ project: req.params.projectId, sender: req.user.id, content });
  const populated = await messageRepository.findByIdPopulated(message._id);
  const io = req.app.get('io');
  if (io) io.to(`project_${req.params.projectId}`).emit('newProjectMessage', populated);
  res.status(201).json({ success: true, data: populated });
});

exports.markMessagesRead = asyncHandler(async (req, res) => {
  await messageRepository.markRead(req.params.projectId, req.user.id);
  res.status(200).json({ success: true });
});

exports.getUnreadCount = asyncHandler(async (req, res) => {
  const unread = await messageRepository.unreadCounts(req.user._id);
  const unreadMap = {};
  unread.forEach(e => { unreadMap[e._id.toString()] = e.count; });
  res.status(200).json({ success: true, data: unreadMap });
});