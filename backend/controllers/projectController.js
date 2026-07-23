// backend/controllers/projectController.js
const projectRepository = require('../repositories/project.repository');
const commentRepository = require('../repositories/comment.repository');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/async');
const { cacheAside, invalidatePattern } = require('../utils/cache');

// add this import at the top, alongside your existing requires

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
  const sort = req.query.sort === 'likes' ? { likesCount: -1 } : { createdAt: -1 };

  // cache key encodes every param that changes the result — admin sees unapproved projects too, so isAdmin is part of the key
  const isAdmin = !!!(req.user && req.user.role === 'admin');
  const cacheKey = `projects:list:${isAdmin}:${req.query.category || ''}:${req.query.difficulty || ''}:${req.query.search || ''}:${page}:${limit}:${req.query.sort || 'default'}`;

  const result = await cacheAside(cacheKey, 60, async () => {
    const total = await projectRepository.count(query);
    const projects = await projectRepository.find(query, {
      populate: { path: 'createdBy', select: 'name avatar year branch' },
      sort, skip, limit,
    });
    return { count: projects.length, total, totalPages: Math.ceil(total / limit), page, data: projects };
  });

  res.status(200).json({ success: true, ...result });
});

exports.getProject = asyncHandler(async (req, res, next) => {
  // const project = await projectRepository.findById(req.params.id, [
  //   { path: 'createdBy', select: 'name avatar year branch bio linkedinUrl githubUrl' },
  //   { path: 'approvedBy', select: 'name' },
  // ]);
  const projects = await projectRepository.find(query, {
  populate: { path: 'createdBy', select: 'name avatar year branch' },
  sort, skip, limit,
});
// And update project.repository.js's find method to pass populate straight to .populate() as-is (Mongoose accepts both string and object forms natively) — no repository code change needed, just make sure every controller call site passes the object form when field-selection matters. This is exactly the kind of subtle regression that's easy to miss in a big batch — flagging it explicitly rather than let you discover it as a silent data-leak bug.
  if (!project) return next(AppError.notFound('Project not found'));
  if (project.status !== 'approved' && (!req.user || (project.createdBy._id.toString() !== req.user.id && req.user.role !== 'admin'))) {
    return next(AppError.forbidden('Not authorized to view this project'));
  }
  res.status(200).json({ success: true, data: project });
});

exports.createProject = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user.id;
  const project = await projectRepository.create(req.body);
  await invalidatePattern('projects:list:*');
  res.status(201).json({ success: true, data: project });
});

exports.updateProject = asyncHandler(async (req, res, next) => {
  let project = await projectRepository.findById(req.params.id);
  if (!project) return next(AppError.notFound('Project not found'));
  const isOwner = project.createdBy.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) return next(AppError.forbidden());
  if (req.body.status && !isAdmin) delete req.body.status;
  project = await projectRepository.updateById(req.params.id, req.body);
  await invalidatePattern('projects:list:*');
  res.status(200).json({ success: true, data: project });
});

exports.deleteProject = asyncHandler(async (req, res, next) => {
  const project = await projectRepository.findById(req.params.id);
  if (!project) return next(AppError.notFound('Project not found'));
  const isOwner = project.createdBy.toString() === req.user.id;
  if (!isOwner && req.user.role !== 'admin') return next(AppError.forbidden());
  await project.deleteOne();
  await invalidatePattern('projects:list:*');
  res.status(200).json({ success: true, data: {} });
});

exports.getMyProjects = asyncHandler(async (req, res) => {
  const projects = await projectRepository.find({ createdBy: req.user.id }, { sort: '-createdAt' });
  res.status(200).json({ success: true, count: projects.length, data: projects });
});

exports.likeProject = asyncHandler(async (req, res, next) => {
  const project = await projectRepository.findById(req.params.id);
  if (!project) return next(AppError.notFound('Project not found'));
  const alreadyLiked = project.likes.includes(req.user.id);
  if (alreadyLiked) project.likes.pull(req.user.id); else project.likes.push(req.user.id);
  await project.save();
  await invalidatePattern('projects:list:*');
  res.status(200).json({ success: true, isLiked: !alreadyLiked, likeCount: project.likes.length });
});

exports.shareProject = asyncHandler(async (req, res, next) => {
  const project = await projectRepository.incrementShares(req.params.id);
  if (!project) return next(AppError.notFound('Project not found'));
  res.status(200).json({ success: true, shares: project.shares });
});

exports.bookmarkProject = asyncHandler(async (req, res, next) => {
  const project = await projectRepository.findById(req.params.id);
  if (!project) return next(AppError.notFound('Project not found'));
  const user = req.user;
  const isBookmarked = user.bookmarkedProjects.includes(req.params.id);
  if (isBookmarked) user.bookmarkedProjects.pull(req.params.id); else user.bookmarkedProjects.push(req.params.id);
  await user.save();
  res.status(200).json({ success: true, isBookmarked: !isBookmarked });
});

exports.getBookmarks = asyncHandler(async (req, res) => {
  const user = await req.user.populate({ path: 'bookmarkedProjects', populate: { path: 'createdBy', select: 'name avatar' } });
  res.status(200).json({ success: true, data: user.bookmarkedProjects });
});

exports.getComments = asyncHandler(async (req, res) => {
  const comments = await commentRepository.findTopLevel(req.params.id);
  const withReplies = await Promise.all(comments.map(async (c) => {
    const replies = await commentRepository.findReplies(c._id);
    return { ...c.toObject(), replies };
  }));
  res.status(200).json({ success: true, data: withReplies });
});

exports.addComment = asyncHandler(async (req, res, next) => {
  const { content, parentComment } = req.body;
  const project = await projectRepository.findById(req.params.id);
  if (!project) return next(AppError.notFound('Project not found'));
  const comment = await commentRepository.create({ project: req.params.id, author: req.user.id, content, parentComment: parentComment || null });
  const populated = await commentRepository.findByIdPopulated(comment._id);
  res.status(201).json({ success: true, data: populated });
});

exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await commentRepository.findById(req.params.commentId);
  if (!comment) return next(AppError.notFound('Comment not found'));
  if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') return next(AppError.forbidden());
  await comment.deleteOne();
  res.status(200).json({ success: true, data: {} });
});