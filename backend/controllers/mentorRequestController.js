// backend/controllers/mentorRequestController.js
const mentorRequestRepository = require('../repositories/mentorRequest.repository');
const userRepository = require('../repositories/user.repository');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/async');
const directMessageRepository = require('../repositories/directMessage.repository'); // add import
const notificationRepository = require('../repositories/notification.repository'); // add import

exports.sendRequest = asyncHandler(async (req, res, next) => {
  const { seniorId, projectId, message } = req.body;
  if (seniorId === req.user.id) return next(AppError.validation('Cannot send request to yourself'));
  const senior = await userRepository.findById(seniorId);
  if (!senior) return next(AppError.notFound('Senior not found'));
  const existing = await mentorRequestRepository.findPending(req.user.id, seniorId);
  if (existing) return next(AppError.validation('You already have a pending request to this senior'));
  const request = await mentorRequestRepository.create({ student: req.user.id, senior: seniorId, project: projectId || null, message });
  const populated = await mentorRequestRepository.findByIdPopulated(request._id);

 const notif = await notificationRepository.create({
  user: seniorId, type: 'mentorRequest',
  title: '🎯 New mentorship request', body: `${populated.student.name} wants guidance from you`,
  to: '/mentor', meta: {},
});
const io = req.app.get('io');
if (io) io.to(`user_${seniorId}`).emit('newMentorRequest', { ...populated.toObject(), notifId: notif._id });
  res.status(201).json({ success: true, data: populated });
});

exports.getReceivedRequests = asyncHandler(async (req, res) => {
  const requests = await mentorRequestRepository.findReceived(req.user.id);
  res.status(200).json({ success: true, count: requests.length, data: requests });
});

exports.getSentRequests = asyncHandler(async (req, res) => {
  const requests = await mentorRequestRepository.findSent(req.user.id);
  res.status(200).json({ success: true, count: requests.length, data: requests });
});

exports.respondToRequest = asyncHandler(async (req, res, next) => {
  const { status, responseMessage } = req.body;
  const request = await mentorRequestRepository.findById(req.params.id);
  if (!request) return next(AppError.notFound('Request not found'));
  if (request.senior.toString() !== req.user.id) return next(AppError.forbidden());
  request.status = status;
  request.responseMessage = responseMessage || '';
  await request.save();
  const populated = await mentorRequestRepository.findByIdPopulated(request._id);

  if (status === 'accepted' || status === 'rejected') {
  const notif = await notificationRepository.create({
    user: request.student, type: 'mentorUpdate',
    title: status === 'accepted' ? '✅ Request accepted' : 'Request declined',
    body: `${populated.senior.name} ${status === 'accepted' ? 'accepted' : 'declined'} your request`,
    to: '/mentor', meta: {},
  });
  const io = req.app.get('io');
  if (io) io.to(`user_${request.student}`).emit('mentorRequestUpdate', { ...populated.toObject(), notifId: notif._id });
}
  res.status(200).json({ success: true, data: populated });
});

exports.cancelRequest = asyncHandler(async (req, res, next) => {
  const request = await mentorRequestRepository.findById(req.params.id);
  if (!request) return next(AppError.notFound('Request not found'));
  if (request.student.toString() !== req.user.id) return next(AppError.forbidden());
  if (request.status !== 'pending') return next(AppError.validation('Cannot cancel a request that has already been responded to'));
  await request.deleteOne();
  res.status(200).json({ success: true, data: {} });
});
exports.browseSeniors = asyncHandler(async (req, res) => {
  const acceptedIds = await mentorRequestRepository.findAcceptedSeniorIds(req.user.id);
  const seniors = await userRepository.findSeniors(req.query.search, req.user.id, acceptedIds);
  res.status(200).json({ success: true, count: seniors.length, data: seniors });
});


exports.getMentorMessages = asyncHandler(async (req, res, next) => {
  const request = await mentorRequestRepository.findById(req.params.id);
  if (!request) return next(AppError.notFound('Request not found'));
  const isParticipant = [request.student.toString(), request.senior.toString()].includes(req.user.id);
  if (!isParticipant) return next(AppError.forbidden());
  if (request.status !== 'accepted') return next(AppError.validation('Chat is only available for accepted mentor requests'));

  const messages = await directMessageRepository.findByRequest(req.params.id);
  res.status(200).json({ success: true, count: messages.length, data: messages });
});

exports.getUnreadMentorChats = asyncHandler(async (req, res) => {
  const ids = await directMessageRepository.unreadRequestIds(req.user.id);
  res.status(200).json({ success: true, data: ids });
});

exports.markMentorChatRead = asyncHandler(async (req, res) => {
  await directMessageRepository.markRead(req.params.id, req.user.id);
  res.status(200).json({ success: true });
});