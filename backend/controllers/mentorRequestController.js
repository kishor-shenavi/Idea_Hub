// backend/controllers/mentorRequestController.js
const mentorRequestRepository = require('../repositories/mentorRequest.repository');
const userRepository = require('../repositories/user.repository');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/async');

exports.sendRequest = asyncHandler(async (req, res, next) => {
  const { seniorId, projectId, message } = req.body;
  if (seniorId === req.user.id) return next(AppError.validation('Cannot send request to yourself'));
  const senior = await userRepository.findById(seniorId);
  if (!senior) return next(AppError.notFound('Senior not found'));
  const existing = await mentorRequestRepository.findPending(req.user.id, seniorId);
  if (existing) return next(AppError.validation('You already have a pending request to this senior'));
  const request = await mentorRequestRepository.create({ student: req.user.id, senior: seniorId, project: projectId || null, message });
  const populated = await mentorRequestRepository.findByIdPopulated(request._id);
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
  res.status(200).json({ success: true, data: request });
});

exports.cancelRequest = asyncHandler(async (req, res, next) => {
  const request = await mentorRequestRepository.findById(req.params.id);
  if (!request) return next(AppError.notFound('Request not found'));
  if (request.student.toString() !== req.user.id) return next(AppError.forbidden());
  if (request.status !== 'pending') return next(AppError.validation('Cannot cancel a request that has already been responded to'));
  await request.deleteOne();
  res.status(200).json({ success: true, data: {} });
});