const MentorRequest = require('../models/MentorRequest');
const User = require('../models/User');
const { ErrorResponse } = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/async');

// POST /api/v1/mentor/request
exports.sendRequest = asyncHandler(async (req, res, next) => {
  const { seniorId, projectId, message } = req.body;

  if (seniorId === req.user.id) {
    return next(new ErrorResponse('Cannot send request to yourself', 400));
  }

  const senior = await User.findById(seniorId);
  if (!senior) return next(new ErrorResponse('Senior not found', 404));

  // Prevent duplicate pending request
  const existing = await MentorRequest.findOne({
    student: req.user.id,
    senior: seniorId,
    status: 'pending',
  });
  if (existing) return next(new ErrorResponse('You already have a pending request to this senior', 400));

  const request = await MentorRequest.create({
    student: req.user.id,
    senior: seniorId,
    project: projectId || null,
    message,
  });

  const populated = await MentorRequest.findById(request._id)
    .populate('student', 'name avatar year branch')
    .populate('senior', 'name avatar')
    .populate('project', 'title');

  res.status(201).json({ success: true, data: populated });
});

// GET /api/v1/mentor/requests/received  — for seniors
exports.getReceivedRequests = asyncHandler(async (req, res) => {
  const requests = await MentorRequest.find({ senior: req.user.id })
    .populate('student', 'name avatar year branch bio')
    .populate('project', 'title category')
    .sort('-createdAt');
  res.status(200).json({ success: true, count: requests.length, data: requests });
});

// GET /api/v1/mentor/requests/sent  — for students
exports.getSentRequests = asyncHandler(async (req, res) => {
  const requests = await MentorRequest.find({ student: req.user.id })
    .populate('senior', 'name avatar branch currentRole company')
    .populate('project', 'title')
    .sort('-createdAt');
  res.status(200).json({ success: true, count: requests.length, data: requests });
});

// PUT /api/v1/mentor/requests/:id/respond
exports.respondToRequest = asyncHandler(async (req, res, next) => {
  const { status, responseMessage } = req.body;

  if (!['accepted', 'rejected'].includes(status)) {
    return next(new ErrorResponse('Status must be accepted or rejected', 400));
  }

  const request = await MentorRequest.findById(req.params.id);
  if (!request) return next(new ErrorResponse('Request not found', 404));

  if (request.senior.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized', 403));
  }

  request.status = status;
  request.responseMessage = responseMessage || '';
  await request.save();

  res.status(200).json({ success: true, data: request });
});

// DELETE /api/v1/mentor/requests/:id  — student cancels pending request
exports.cancelRequest = asyncHandler(async (req, res, next) => {
  const request = await MentorRequest.findById(req.params.id);
  if (!request) return next(new ErrorResponse('Request not found', 404));

  if (request.student.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized', 403));
  }
  if (request.status !== 'pending') {
    return next(new ErrorResponse('Cannot cancel a request that has already been responded to', 400));
  }

  await request.deleteOne();
  res.status(200).json({ success: true, data: {} });
});
