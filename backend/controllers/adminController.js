const Project = require('../models/Project');
const User = require('../models/User');
const Internship = require('../models/Internship');
const RegretPost = require('../models/RegretPost');
const { ErrorResponse } = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/async');

// ── Projects ──────────────────────────────────────────────────────────────────

// GET /api/v1/admin/projects
exports.getAllProjects = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};
  const projects = await Project.find(query)
    .populate('createdBy', 'name email')
    .sort('-createdAt');
  res.status(200).json({ success: true, count: projects.length, data: projects });
});

// PUT /api/v1/admin/projects/:id/approve
exports.approveProject = asyncHandler(async (req, res, next) => {
  const { status, adminFeedback } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return next(new ErrorResponse("Status must be 'approved' or 'rejected'", 400));
  }

  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { status, adminFeedback: adminFeedback || '', approvedBy: req.user.id, approvedAt: Date.now() },
    { new: true }
  );

  if (!project) return next(new ErrorResponse('Project not found', 404));
  res.status(200).json({ success: true, data: project });
});

// ── Internships ───────────────────────────────────────────────────────────────

// GET /api/v1/admin/internships
exports.getAllInternships = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};
  const internships = await Internship.find(query)
    .populate('postedBy', 'name email')
    .sort('-createdAt');
  res.status(200).json({ success: true, count: internships.length, data: internships });
});

// PUT /api/v1/admin/internships/:id/approve
exports.approveInternship = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  if (!['active', 'rejected'].includes(status)) {
    return next(new ErrorResponse("Status must be 'active' or 'rejected'", 400));
  }
  const internship = await Internship.findByIdAndUpdate(
    req.params.id,
    { status, approvedBy: req.user.id },
    { new: true }
  );
  if (!internship) return next(new ErrorResponse('Not found', 404));
  res.status(200).json({ success: true, data: internship });
});

// ── Users ─────────────────────────────────────────────────────────────────────

// GET /api/v1/admin/users
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  let query = {};
  if (role) query.role = role;
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const users = await User.find(query).sort('-createdAt');
  res.status(200).json({ success: true, count: users.length, data: users });
});

// PUT /api/v1/admin/users/:id
exports.updateUser = asyncHandler(async (req, res, next) => {
  const allowed = ['name', 'role', 'year', 'branch'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!user) return next(new ErrorResponse('User not found', 404));
  res.status(200).json({ success: true, data: user });
});

// DELETE /api/v1/admin/users/:id
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorResponse('User not found', 404));
  if (user._id.toString() === req.user.id) return next(new ErrorResponse('Cannot delete yourself', 400));
  await user.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

// ── Dashboard stats ───────────────────────────────────────────────────────────

// GET /api/v1/admin/stats
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalProjects,
    pendingProjects,
    totalInternships,
    pendingInternships,
    totalRegrets,
  ] = await Promise.all([
    User.countDocuments(),
    Project.countDocuments(),
    Project.countDocuments({ status: 'pending' }),
    Internship.countDocuments(),
    Internship.countDocuments({ status: 'pending' }),
    RegretPost.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalProjects,
      pendingProjects,
      totalInternships,
      pendingInternships,
      totalRegrets,
    },
  });
});

// DELETE /api/v1/admin/regrets/:id
exports.deleteRegret = asyncHandler(async (req, res, next) => {
  const regret = await RegretPost.findByIdAndDelete(req.params.id);
  if (!regret) return next(new ErrorResponse('Not found', 404));
  res.status(200).json({ success: true, data: {} });
});
