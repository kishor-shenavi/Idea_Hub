// backend/controllers/chatController.js
const messageRepository = require('../repositories/message.repository');
const projectRepository = require('../repositories/project.repository');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/async');
const Project = require('../models/Project'); // add import
const Message = require('../models/Chat');
const Notification = require('../models/Notification'); // add import

exports.getProjectMessages = asyncHandler(async (req, res, next) => {
  const project = await projectRepository.findById(req.params.projectId);
  if (!project) return next(AppError.notFound('Project not found'));
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const messages = await messageRepository.find(req.params.projectId, { skip: (page - 1) * limit, limit });
  res.status(200).json({ success: true, count: messages.length, data: messages });
});


// exports.postProjectMessage = asyncHandler(async (req, res, next) => {
//   const { content } = req.body;
//   const project = await projectRepository.findById(req.params.projectId);
//   if (!project) return next(AppError.notFound('Project not found'));
//   const message = await messageRepository.create({ project: req.params.projectId, sender: req.user.id, content });
//   const populated = await messageRepository.findByIdPopulated(message._id);
//   const io = req.app.get('io');
//   if (io) {
//     io.to(`project_${req.params.projectId}`).emit('newProjectMessage', populated);

//     // notify prior participants + project creator, so they get a toast/dot even if not currently in the chat room
//     const priorSenderIds = await Message.distinct('sender', { project: req.params.projectId, sender: { $ne: req.user.id } });
//     const recipientIds = new Set(priorSenderIds.map(String));
//     if (project.createdBy.toString() !== req.user.id) recipientIds.add(project.createdBy.toString());
//     recipientIds.delete(req.user.id.toString());
//   for (const uid of recipientIds) {
//   const notif = await Notification.create({
//     user: uid, type: 'project',
//     title: `💬 ${project.title}`, body: `${populated.sender.name}: ${content.slice(0, 80)}`,
//     to: `/chat/${req.params.projectId}/${(req.user.id === project.createdBy.toString() ? req.user.id : project.createdBy.toString())}`,
//     meta: { projectId: req.params.projectId },
//   });
//   io.to(`user_${uid}`).emit('newProjectMessageNotification', {
//     projectId: req.params.projectId, projectTitle: project.title, creatorId: project.createdBy.toString(),
//     senderId: req.user.id, senderName: populated.sender.name, preview: content.slice(0, 80), notifId: notif._id,
//   });
// }
//   res.status(201).json({ success: true, data: populated });
  
exports.postProjectMessage = asyncHandler(async (req, res, next) => {
  const { content } = req.body;

  const project = await projectRepository.findById(req.params.projectId);
  if (!project) return next(AppError.notFound('Project not found'));

  const message = await messageRepository.create({
    project: req.params.projectId,
    sender: req.user.id,
    content
  });

  const populated = await messageRepository.findByIdPopulated(message._id);

  const io = req.app.get('io');

  if (io) {
    io.to(`project_${req.params.projectId}`).emit('newProjectMessage', populated);

    const priorSenderIds = await Message.distinct('sender', {
      project: req.params.projectId,
      sender: { $ne: req.user.id }
    });

    const recipientIds = new Set(priorSenderIds.map(String));

    if (project.createdBy.toString() !== req.user.id) {
      recipientIds.add(project.createdBy.toString());
    }

    recipientIds.delete(req.user.id.toString());

  for (const uid of recipientIds) {
  const notif = await Notification.create({
    user: uid, type: 'project',
    title: `💬 ${project.title}`, body: `${populated.sender.name}: ${content.slice(0, 80)}`,
    to: `/chat/${req.params.projectId}/${(req.user.id === project.createdBy.toString() ? req.user.id : project.createdBy.toString())}`,
    meta: { projectId: req.params.projectId },
  });
  io.to(`user_${uid}`).emit('newProjectMessageNotification', {
    projectId: req.params.projectId, projectTitle: project.title, creatorId: project.createdBy.toString(),
    senderId: req.user.id, senderName: populated.sender.name, preview: content.slice(0, 80), notifId: notif._id,
  });
}
  }

  // ✅ ALWAYS send response (outside if)
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