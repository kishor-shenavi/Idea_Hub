const Project = require('../models/Project');
const Comment = require('../models/Comment');
const { ErrorResponse } = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/async');

// GET /api/v1/projects
exports.getProjects = asyncHandler(async (req, res) => {
  let query = { status: 'approved' };

  if (req.user && req.user.role === 'admin') query = {};

  if (req.query.category) query.category = req.query.category;
  if (req.query.difficulty) query.difficulty = req.query.difficulty;
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { tags: { $in: [new RegExp(req.query.search, 'i')] } },
      { techStack: { $in: [new RegExp(req.query.search, 'i')] } },
    ];
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const sortOptions = req.query.sort === 'likes'
    ? { likesCount: -1 }
    : { createdAt: -1 };

  const total = await Project.countDocuments(query);
  const projects = await Project.find(query)
    .populate('createdBy', 'name avatar year branch')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: projects.length,
    total,
    totalPages: Math.ceil(total / limit),
    page,
    data: projects,
  });
});

// GET /api/v1/projects/:id
exports.getProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id)
    .populate('createdBy', 'name avatar year branch bio linkedinUrl githubUrl')
    .populate('approvedBy', 'name');

  if (!project) return next(new ErrorResponse('Project not found', 404));

  if (project.status !== 'approved' &&
    (!req.user || (project.createdBy._id.toString() !== req.user.id && req.user.role !== 'admin'))) {
    return next(new ErrorResponse('Not authorized to view this project', 403));
  }

  res.status(200).json({ success: true, data: project });
});

// POST /api/v1/projects
exports.createProject = asyncHandler(async (req, res, next) => {
  req.body.createdBy = req.user.id;
  const project = await Project.create(req.body);
  res.status(201).json({ success: true, data: project });
});

// PUT /api/v1/projects/:id
exports.updateProject = asyncHandler(async (req, res, next) => {
  let project = await Project.findById(req.params.id);
  if (!project) return next(new ErrorResponse('Project not found', 404));

  const isOwner = project.createdBy.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) return next(new ErrorResponse('Not authorized', 403));

  // Only admin can change status
  if (req.body.status && !isAdmin) delete req.body.status;

  project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: project });
});

// DELETE /api/v1/projects/:id
exports.deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return next(new ErrorResponse('Project not found', 404));

  const isOwner = project.createdBy.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) return next(new ErrorResponse('Not authorized', 403));

  await project.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

// GET /api/v1/projects/my
exports.getMyProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ createdBy: req.user.id }).sort('-createdAt');
  res.status(200).json({ success: true, count: projects.length, data: projects });
});

// PUT /api/v1/projects/:id/like
exports.likeProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return next(new ErrorResponse('Project not found', 404));

  const alreadyLiked = project.likes.includes(req.user.id);
  if (alreadyLiked) project.likes.pull(req.user.id);
  else project.likes.push(req.user.id);
  await project.save();

  res.status(200).json({ success: true, isLiked: !alreadyLiked, likeCount: project.likes.length });
});

// PUT /api/v1/projects/:id/share
exports.shareProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findByIdAndUpdate(req.params.id, { $inc: { shares: 1 } }, { new: true });
  if (!project) return next(new ErrorResponse('Project not found', 404));
  res.status(200).json({ success: true, shares: project.shares });
});

// PUT /api/v1/projects/:id/bookmark
exports.bookmarkProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return next(new ErrorResponse('Project not found', 404));

  const user = req.user;
  const isBookmarked = user.bookmarkedProjects.includes(req.params.id);
  if (isBookmarked) user.bookmarkedProjects.pull(req.params.id);
  else user.bookmarkedProjects.push(req.params.id);
  await user.save();

  res.status(200).json({ success: true, isBookmarked: !isBookmarked });
});

// GET /api/v1/projects/bookmarks
exports.getBookmarks = asyncHandler(async (req, res) => {
  const user = await req.user.populate({ path: 'bookmarkedProjects', populate: { path: 'createdBy', select: 'name avatar' } });
  res.status(200).json({ success: true, data: user.bookmarkedProjects });
});

// ── Comments ──────────────────────────────────────────────────────────────────

// GET /api/v1/projects/:id/comments
exports.getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ project: req.params.id, parentComment: null })
    .populate('author', 'name avatar year branch')
    .sort('createdAt');

  // Attach replies
  const withReplies = await Promise.all(comments.map(async (c) => {
    const replies = await Comment.find({ parentComment: c._id })
      .populate('author', 'name avatar year branch')
      .sort('createdAt');
    return { ...c.toObject(), replies };
  }));

  res.status(200).json({ success: true, data: withReplies });
});

// POST /api/v1/projects/:id/comments
exports.addComment = asyncHandler(async (req, res, next) => {
  const { content, parentComment } = req.body;
  if (!content) return next(new ErrorResponse('Content is required', 400));

  const project = await Project.findById(req.params.id);
  if (!project) return next(new ErrorResponse('Project not found', 404));

  const comment = await Comment.create({
    project: req.params.id,
    author: req.user.id,
    content,
    parentComment: parentComment || null,
  });

  const populated = await Comment.findById(comment._id).populate('author', 'name avatar year branch');
  res.status(201).json({ success: true, data: populated });
});

// DELETE /api/v1/projects/:id/comments/:commentId
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return next(new ErrorResponse('Comment not found', 404));

  if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized', 403));
  }

  await comment.deleteOne();
  res.status(200).json({ success: true, data: {} });
});
