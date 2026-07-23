// backend/controllers/adminController.js
const projectRepository = require('../repositories/project.repository');
const internshipRepository = require('../repositories/internship.repository');
const regretRepository = require('../repositories/regret.repository');
const userRepository = require('../repositories/user.repository');
const Project = require('../models/Project');
const Internship = require('../models/Internship');
const RegretPost = require('../models/RegretPost');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/async');
const { invalidatePattern } = require('../utils/cache'); 
exports.getAllProjects = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};
  const projects = await projectRepository.find(query, { populate: { path: 'createdBy', select: 'name email' }, sort: '-createdAt' });
  res.status(200).json({ success: true, count: projects.length, data: projects });
});

exports.approveProject = asyncHandler(async (req, res, next) => {
  const { status, adminFeedback } = req.body;
  const project = await projectRepository.updateById(req.params.id, {
    status, adminFeedback: adminFeedback || '', approvedBy: req.user.id, approvedAt: Date.now(),
  });
  await invalidatePattern('projects:list:*');
  if (!project) return next(AppError.notFound('Project not found'));
  res.status(200).json({ success: true, data: project });
});

exports.getAllInternships = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};
  const internships = await internshipRepository.find(query);
  res.status(200).json({ success: true, count: internships.length, data: internships });
});

exports.approveInternship = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const internship = await internshipRepository.updateById(req.params.id, { status, approvedBy: req.user.id });
  if (!internship) return next(AppError.notFound('Not found'));
  res.status(200).json({ success: true, data: internship });
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  let query = {};
  if (role) query.role = role;
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  const users = await userRepository.find(query);
  res.status(200).json({ success: true, count: users.length, data: users });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  const allowed = ['name', 'role', 'year', 'branch'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const user = await userRepository.updateById(req.params.id, updates);
  if (!user) return next(AppError.notFound('User not found'));
  res.status(200).json({ success: true, data: user });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await userRepository.findById(req.params.id);
  if (!user) return next(AppError.notFound('User not found'));
  if (user._id.toString() === req.user.id) return next(AppError.validation('Cannot delete yourself'));
  await userRepository.deleteById(req.params.id);
  res.status(200).json({ success: true, data: {} });
});

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalProjects, pendingProjects, totalInternships, pendingInternships, totalRegrets] = await Promise.all([
    User.countDocuments(), Project.countDocuments(), Project.countDocuments({ status: 'pending' }),
    Internship.countDocuments(), Internship.countDocuments({ status: 'pending' }), RegretPost.countDocuments(),
  ]);
  res.status(200).json({ success: true, data: { totalUsers, totalProjects, pendingProjects, totalInternships, pendingInternships, totalRegrets } });
});

exports.deleteRegret = asyncHandler(async (req, res, next) => {
  const regret = await regretRepository.findByIdAndDelete(req.params.id);
  if (!regret) return next(AppError.notFound('Not found'));
  res.status(200).json({ success: true, data: {} });
});