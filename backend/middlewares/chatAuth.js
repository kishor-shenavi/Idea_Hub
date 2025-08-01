const { ErrorResponse } = require('../utils/errorHandler');
const Project = require('../models/Project');
const asyncHandler = require('./async');
// Add additional checks for active project status
exports.verifyChatAccess = asyncHandler(async (req, res, next) => {
  console.log('✅ verifyChatAccess middleware triggered');

  const project = await Project.findById(req.params.projectId)
    .populate('createdBy', 'id');
  console.log('🛡️ Project CreatedBy:', project.createdBy.id);
console.log('🧑‍💻 Requesting User:', req.user.id);
console.log('📨 Route userId:', req.params.userId);

  if (!project) {
    return next(new ErrorResponse('Project not found', 404));
  }
 
  // Check if project is approved
  if (project.status !== 'approved') {
    return next(new ErrorResponse('Project is not approved for chatting', 403));
  }

  // Check if current user is either the sender or recipient
  if (
    req.user.id !== req.params.userId && 
    req.user.id !== project.createdBy.id.toString()
  ) {
    return next(new ErrorResponse('Not authorized for this conversation', 403));
  }
   
  next();
  
});