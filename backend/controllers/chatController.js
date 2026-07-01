const Message = require('../models/Chat');
const Project = require('../models/Project');
const { ErrorResponse } = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/async');

// GET /api/v1/chat/:projectId/messages
exports.getProjectMessages = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) return next(new ErrorResponse('Project not found', 404));

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const messages = await Message.find({ project: req.params.projectId })
    .populate('sender', 'name avatar year branch')
    .sort('createdAt')
    .skip(skip)
    .limit(limit);

  res.status(200).json({ success: true, count: messages.length, data: messages });
});

// POST /api/v1/chat/:projectId/messages  (REST fallback, socket is primary)
exports.postProjectMessage = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  if (!content) return next(new ErrorResponse('Content is required', 400));

  const project = await Project.findById(req.params.projectId);
  if (!project) return next(new ErrorResponse('Project not found', 404));

  const message = await Message.create({
    project: req.params.projectId,
    sender: req.user.id,
    content,
  });

  const populated = await Message.findById(message._id).populate('sender', 'name avatar year branch');

  const io = req.app.get('io');
  if (io) io.to(`project_${req.params.projectId}`).emit('newProjectMessage', populated);

  res.status(201).json({ success: true, data: populated });
});

// PUT /api/v1/chat/:projectId/messages/read
exports.markMessagesRead = asyncHandler(async (req, res) => {
  await Message.updateMany(
    { project: req.params.projectId, readBy: { $ne: req.user.id }, sender: { $ne: req.user.id } },
    { $addToSet: { readBy: req.user.id } }
  );
  res.status(200).json({ success: true });
});

// GET /api/v1/chat/unread
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const unread = await Message.aggregate([
    { $match: { sender: { $ne: req.user._id }, readBy: { $ne: req.user._id } } },
    { $group: { _id: '$project', count: { $sum: 1 } } },
  ]);

  const unreadMap = {};
  unread.forEach(e => { unreadMap[e._id.toString()] = e.count; });

  res.status(200).json({ success: true, data: unreadMap });
});
