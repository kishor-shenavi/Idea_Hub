const Project = require('../models/Project');
const User = require('../models/User');
const {ErrorResponse} = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/async');

// @desc    Get all projects for admin (including pending)
// @route   GET /api/v1/admin/projects
// @access  Private/Admin
exports.getProjects = asyncHandler(async (req, res, next) => {
  const projects = await Project.find().sort('-createdAt');

  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects,
  });
});

// @desc    Approve/reject project
// @route   PUT /api/v1/admin/projects/:id/approve
// @access  Private/Admin
exports.approveProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(
      new ErrorResponse(`Project not found with id of ${req.params.id}`, 404)
    );
  }

  if (!req.body.status) {
    return next(new ErrorResponse(`Please provide status`, 400));
  }

  if (!['approved', 'rejected'].includes(req.body.status)) {
    return next(
      new ErrorResponse(`Status can only be 'approved' or 'rejected'`, 400)
    );
  }

  project.status = req.body.status;
  project.approvedBy = req.user.id;
  project.approvedAt = Date.now();

  if (req.body.feedback) {
    project.feedback = req.body.feedback;
  }

  await project.save();

  res.status(200).json({
    success: true,
    data: project,
  });
});

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select('-password');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Update user role
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  if (req.body.role && !['student', 'admin'].includes(req.body.role)) {
    return next(
      new ErrorResponse(`Role can only be 'student' or 'admin'`, 400)
    );
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).select('-password');

  res.status(200).json({
    success: true,
    data: updatedUser,
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  await user.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});