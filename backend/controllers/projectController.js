const Project = require('../models/Project');
const {ErrorResponse} = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/async');
const mongoose = require('mongoose');

// @desc    Get all projects
// @route   GET /api/v1/projects
// @access  Public
exports.getProjects = asyncHandler(async (req, res, next) => {
  // Default filtering - only show approved projects unless admin
  let query = { status: 'approved' };
  
  // If admin, show all projects
  if (req.user && req.user.role === 'admin') {
    query = {};
  }

  // Handle other query parameters
  if (req.query.category) {
    query.category = req.query.category;
  }
  if (req.query.difficulty) {
    query.difficulty = req.query.difficulty;
  }
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { tags: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Build the query
  let dbQuery = Project.find(query);

  // Sorting
  const sortOptions = {};
  if (req.query.sort === 'likes') {
    sortOptions.likeCount = -1;
  } else {
    sortOptions.createdAt = -1; // Default: newest first
  }
  dbQuery = dbQuery.sort(sortOptions);

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const startIndex = (page - 1) * limit;
  const total = await Project.countDocuments(query);

  dbQuery = dbQuery.skip(startIndex).limit(limit);

  // Execute query
  const projects = await dbQuery;

  // Pagination result
  const pagination = {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
const endIndex = page * limit;

  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }

  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: projects.length,
    pagination,
    data: projects,
  });
});






//correct without pagination

// exports.getProjects = asyncHandler(async (req, res, next) => {
//   const user = req.user;

//   let query;

//   // Clone and modify query string
//   let queryStr = JSON.stringify(req.query);
//   queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
//   query = Project.find(JSON.parse(queryStr));

//   // ✅ Only non-admins see approved projects
//   if (user.role !== 'admin') {
//     query = query.where('status').equals('approved');
//   }

//   // Field selection
//   if (req.query.select) {
//     const fields = req.query.select.split(',').join(' ');
//     query = query.select(fields);
//   }

//   // Sorting
//   if (req.query.sort) {
//     const sortBy = req.query.sort.split(',').join(' ');
//     query = query.sort(sortBy);
//   } else {
//     query = query.sort('-createdAt');
//   }

//   // Pagination
//   const page = parseInt(req.query.page, 10) || 1;
//   const limit = parseInt(req.query.limit, 10) || 10;
//   const startIndex = (page - 1) * limit;
//   const endIndex = page * limit;
//   const total = await Project.countDocuments();

//   query = query.skip(startIndex).limit(limit);

//   const projects = await query;

//   const pagination = {};
//   if (endIndex < total) {
//     pagination.next = { page: page + 1, limit };
//   }
//   if (startIndex > 0) {
//     pagination.prev = { page: page - 1, limit };
//   }

//   res.status(200).json({
//     success: true,
//     count: projects.length,
//     pagination,
//     data: projects,
//   });
// });


// @desc    Get single project
// @route   GET /api/v1/projects/:id
// @access  Public





exports.getProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id.trim()).populate({
    path: 'createdBy',
    select: 'name email',
  });

  if (!project) {
    return next(
      new ErrorResponse(`Project not found with id of ${req.params.id}`, 404)
    );
  }

  // Only show project if it's approved or if the requester is the owner or admin
  if (
    project.status !== 'approved' &&
    project.createdBy._id.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(`Not authorized to access this project`, 401)
    );
  }

  res.status(200).json({
    success: true,
    data: project,
  });
});

// @desc    Create new project
// @route   POST /api/v1/projects
// @access  Private
exports.createProject = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;

  const project = await Project.create(req.body);

  res.status(201).json({
    success: true,
    data: project,
  });
});

// @desc    Update project
// @route   PUT /api/v1/projects/:id
// @access  Private
// Update project (only accessible via /myprojects/:id)
exports.updateProject = asyncHandler(async (req, res, next) => {
  let project = await Project.findOne({
    _id: req.params.id,
    createdBy: req.user.id // Ensure the project belongs to the user
  });

  if (!project) {
    return next(
      new ErrorResponse(`Project not found or you don't have permission to update it`, 404)
    );
  }

  // If admin is approving the project
  if (req.body.status === 'approved' && req.user.role === 'admin') {
    req.body.approvedBy = req.user.id;
    req.body.approvedAt = Date.now();
  }

  project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: project,
  });
});

// Delete project (only accessible via /myprojects/:id)
exports.deleteProject = asyncHandler(async (req, res, next) => {
  const deleted = await Project.deleteOne({
    _id: req.params.id,
    createdBy: new mongoose.Types.ObjectId(req.user.id)
  });
  console.log("DELETE /api/v1/projects/:id triggered with", req.params.id);
  if (deleted.deletedCount === 0) {
    return next(
      new ErrorResponse(`Project not found or you don't have permission to delete it`, 404)
    );
  }
  console.log('Request by:', req.user.id);
const project = await Project.findById(req.params.id);
console.log('Project found:', project);

  res.status(200).json({
    success: true,
    data: {}
  });
});


// Get user's projects
exports.getUserProjects = asyncHandler(async (req, res, next) => {
  const projects = await Project.find({ createdBy: req.user.id });

  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects
  });
});

exports.deleteAllProjects = asyncHandler(async (req, res, next) => {
  if (!req.body.confirm || req.body.confirm !== "DELETE_ALL_PROJECTS") {
    return next(new ErrorResponse('Confirmation phrase required', 400));
  }

  const result = await Project.deleteMany({});
  
  res.status(200).json({
    success: true,
    message: `Successfully deleted ${result.deletedCount} projects`,
    data: null
  });
});



// Like a project
exports.likeProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new ErrorResponse('Project not found', 404));
  }

  const alreadyLiked = project.likes.includes(req.user.id);

  if (alreadyLiked) {
    project.likes.pull(req.user.id);
  } else {
    project.likes.push(req.user.id);
  }

  await project.save();

  res.status(200).json({
    success: true,
    isLiked: !alreadyLiked,              // ✅ use camelCase key
    likeCount: project.likes.length      // ✅ not nested inside `data`
  });
});

// Share a project
exports.shareProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { $inc: { shares: 1 } },
    { new: true }
  );

  if (!project) {
    return next(new ErrorResponse('Project not found', 404));
  }

  res.status(200).json({
    success: true,
    data: project
  });
});

// Add middleware to check if project can be chatted
exports.checkChatAvailability = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.projectId);
  
  if (!project) {
      console.log('⚠️ Project not found in DB:', req.params.projectId);
    return next(new ErrorResponse('Project not found', 404));
  }

  if (project.status !== 'approved') {
    return next(new ErrorResponse('Chat is not available for this project', 403));
  }

  next();
});





// GET /api/v1/chat/has-unread
exports.checkUnreadMessages = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 🔄 Group unread messages by project
  const unreadPerProject = await Message.aggregate([
    {
      $match: {
        sender: { $ne: userId },       // Not sent by the current user
        readBy: { $ne: userId }        // And not yet read by current user
      }
    },
    {
      $group: {
        _id: "$project",               // Group by project
        count: { $sum: 1 }
      }
    }
  ]);

  // Convert to object: { projectId1: true, projectId2: true, ... }
  const unreadMap = {};
  unreadPerProject.forEach(entry => {
    unreadMap[entry._id.toString()] = true;
  });

  res.json({ unreadProjects: unreadMap });
});














