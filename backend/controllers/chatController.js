// // const Conversation = require('../models/Conversation');
// // const Message = require('../models/Chat');
// // const { ErrorResponse } = require('../utils/errorHandler');
// // const asyncHandler = require('../middlewares/async');

// // // Start or get conversation
// // exports.getOrCreateConversation = asyncHandler(async (req, res, next) => {
// //   const { projectId, recipientId } = req.params;

// //   // Validate participants
// //   if (recipientId === req.user.id.toString()) {
// //     return next(new ErrorResponse('Cannot create conversation with yourself', 400));
// //   }

// //   // Find or create conversation
// //   let conversation = await Conversation.findOne({
// //     project: projectId,
// //     participants: { $all: [req.user.id, recipientId] }
// //   })
// //   .populate('participants', 'name avatar')
// //   .populate('project', 'title')
// //   .populate('lastMessage');

// //   if (!conversation) {
// //     conversation = await Conversation.create({
// //       project: projectId,
// //       participants: [req.user.id, recipientId]
// //     });
    
// //     // Populate after creation
// //     conversation = await Conversation.findById(conversation._id)
// //       .populate('participants', 'name avatar')
// //       .populate('project', 'title');
// //   }

// //   res.status(200).json({
// //     success: true,
// //     data: conversation
// //   });
// // });

// // // Send message
// // exports.sendMessage = asyncHandler(async (req, res, next) => {
// //   const { conversationId } = req.params;
// //   const { content } = req.body;

// //   // Verify conversation exists and user is participant
// //   const conversation = await Conversation.findOne({
// //     _id: conversationId,
// //     participants: req.user.id
// //   });

// //   if (!conversation) {
// //     return next(new ErrorResponse('Conversation not found or unauthorized', 404));
// //   }

// //   // Create message
// //   const message = await Message.create({
// //     conversation: conversationId,
// //     sender: req.user.id,
// //     content
// //   });

// //   // Update conversation last message
// //   conversation.lastMessage = message._id;
// //   await conversation.save();

// //   // Populate sender details
// //   const populatedMessage = await Message.findById(message._id)
// //     .populate('sender', 'name avatar');

// //   res.status(201).json({
// //     success: true,
// //     data: populatedMessage
// //   });
// // });

// // // Get conversation messages
// // exports.getMessages = asyncHandler(async (req, res, next) => {
// //   const { conversationId } = req.params;

// //   // Verify user has access to conversation
// //   const conversation = await Conversation.findOne({
// //     _id: conversationId,
// //     participants: req.user.id
// //   });

// //   if (!conversation) {
// //     return next(new ErrorResponse('Conversation not found or unauthorized', 404));
// //   }

// //   const messages = await Message.find({ conversation: conversationId })
// //     .sort('createdAt')
// //     .populate('sender', 'name avatar');

// //   res.status(200).json({
// //     success: true,
// //     count: messages.length,
// //     data: messages
// //   });
// // });

// // // Get user's conversations
// // exports.getUserConversations = asyncHandler(async (req, res, next) => {
// //   const conversations = await Conversation.find({
// //     participants: req.user.id
// //   })
// //   .populate({
// //     path: 'participants',
// //     select: 'name avatar',
// //     match: { _id: { $ne: req.user.id } } // Exclude current user
// //   })
// //   .populate('project', 'title')
// //   .populate('lastMessage')
// //   .sort('-updatedAt');

// //   res.status(200).json({
// //     success: true,
// //     count: conversations.length,
// //     data: conversations
// //   });
// // });

// // Keep your existing delete, reply, and markAsRead functions
// // but update them to work with conversationId instead of projectId/userId


































// const mongoose = require('mongoose');
// const Message = require('../models/Chat');
// const User = require('../models/User');
// const Project = require('../models/Project');
// const { ErrorResponse } = require('../utils/errorHandler');
// const asyncHandler = require('../middlewares/async');

// exports.sendMessage = asyncHandler(async (req, res, next) => {
//   const { recipientId, projectId, content } = req.body;

//   // Validate input
//   if (!recipientId || !projectId || !content) {
//     return next(new ErrorResponse('Missing required fields', 400));
//   }

//   // Validate ObjectId format
//   if (!mongoose.Types.ObjectId.isValid(recipientId)) {
//     return next(new ErrorResponse('Invalid recipient ID format', 400));
//   }

//   if (!mongoose.Types.ObjectId.isValid(projectId)) {
//     return next(new ErrorResponse('Invalid project ID format', 400));
//   }

//   // Verify recipient exists (with better error message)
//   const recipient = await User.findById(recipientId).select('_id name');
//   if (!recipient) {
//     return next(new ErrorResponse(`Recipient with ID ${recipientId} not found`, 404));
//   }

//   // Verify project exists
//   const project = await Project.findById(projectId).select('_id title');
//   if (!project) {
//     return next(new ErrorResponse(`Project with ID ${projectId} not found`, 404));
//   }

//   // Verify user isn't sending to themselves
//   if (recipientId === req.user.id.toString()) {
//     return next(new ErrorResponse('Cannot send message to yourself', 400));
//   }

//   // Create message
//   const message = await Message.create({
//     sender: req.user.id,
//     recipient: recipientId,
//     project: projectId,
//     content
//   });

//   // Populate message details
//   const populatedMessage = await Message.findById(message._id)
//     .populate('sender', 'name email avatar')
//     .populate('recipient', 'name email avatar')
//     .populate('project', 'title')
//     .lean();

//   // Format response
//   delete populatedMessage.__v;
  
//   res.status(201).json({
//     success: true,
//     data: populatedMessage
//   });
// });
// // Delete messages in a conversation
// exports.deleteMessages = asyncHandler(async (req, res, next) => {
//   const { projectId, userId } = req.params;

//   // Delete messages where:
//   // - Belongs to the specified project
//   // - Between the current user and specified user
//   // - Current user is either sender or recipient
//   await Message.deleteMany({
//     project: projectId,
//     $or: [
//       { sender: req.user.id, recipient: userId },
//       { sender: userId, recipient: req.user.id }
//     ]
//   });

//   res.status(200).json({
//     success: true,
//     data: {}
//   });
// });
// exports.replyToMessage = asyncHandler(async (req, res, next) => {
//   const originalMessage = await Message.findById(req.params.messageId);
  
//   if (!originalMessage) {
//     return next(new ErrorResponse('Message not found', 404));
//   }

//   const reply = await Message.create({
//     sender: req.user.id,
//     recipient: originalMessage.sender._id.equals(req.user.id) 
//       ? originalMessage.recipient 
//       : originalMessage.sender,
//     project: originalMessage.project,
//     content: req.body.content,
//   replyTo: originalMessage._id

//   });

//   res.status(201).json({
//     success: true,
//     data: reply
//   });
// });
// // Get chat history
// exports.getChatHistory = asyncHandler(async (req, res, next) => {
//   const { projectId, userId } = req.params;

//   const messages = await Message.find({
//     $or: [
//       { sender: req.user.id, recipient: userId },
//       { sender: userId, recipient: req.user.id }
//     ],
//     project: projectId
//   }).sort('createdAt');

//   res.status(200).json({
//     success: true,
//     count: messages.length,
//     data: messages
//   });
// });


// // Add pagination to chat history
// exports.getConversation = asyncHandler(async (req, res, next) => {
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 20;
//   const skip = (page - 1) * limit;

//   const messages = await Message.find({
//     project: req.params.projectId,
//     $or: [
//       { sender: req.user.id, recipient: req.params.userId },
//       { sender: req.params.userId, recipient: req.user.id }
//     ]
//   })
//   .sort('-createdAt')
//   .skip(skip)
//   .limit(limit)
//   .populate('sender', 'name avatar')
//   .populate('recipient', 'name avatar');

//   const total = await Message.countDocuments({
//     project: req.params.projectId,
//     $or: [
//       { sender: req.user.id, recipient: req.params.userId },
//       { sender: req.params.userId, recipient: req.user.id }
//     ]
//   });

//   res.status(200).json({
//     success: true,
//     count: messages.length,
//     total,
//     pages: Math.ceil(total / limit),
//     data: messages
//   });
// });
 

// // Mark messages as read
// exports.markAsRead = asyncHandler(async (req, res, next) => {
//   const { userId, projectId } = req.params;

//   const updated = await Message.updateMany(
//     {
//       recipient: req.user.id,         // current user is the recipient
//       sender: userId,                 // messages sent by this user
//       project: projectId,
//       read: false
//     },
//     { $set: { read: true } }
//   );

//   // Emit socket event to notify sender that their messages were read
//   const io = req.app.get('io'); // <- Attach `io` to your app in socket server
//   io.to(`user_${userId}`).emit('messagesRead', {
//     readerId: req.user.id,
//     projectId,
//     fromUserId: userId // sender of those messages
//   });

//   res.status(200).json({
//     success: true,
//     data: null
//   });
// });




const Message = require('../models/Chat');
const Project = require('../models/Project');
const asyncHandler = require('../middlewares/async');
const { ErrorResponse } = require('../utils/errorHandler');

// GET /api/v1/chat/:projectId/messages
exports.getProjectMessages = asyncHandler(async (req, res, next) => {
  const messages = await Message.find({ project: req.params.projectId })
    .sort('createdAt')
    .populate('sender', 'name avatar');

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages
  });
});

const checkUnreadMessages = async (req, res) => {
  const userId = req.user._id;

  const hasUnread = await Message.exists({
    sender: { $ne: userId },
    readBy: { $ne: userId }
  });

  res.json({ hasUnread: !!hasUnread });
};

// POST /api/v1/chat/:projectId/messages
exports.postProjectMessage = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const { projectId } = req.params;

  if (!content) return next(new ErrorResponse('Content is required', 400));

  const projectExists = await Project.exists({ _id: projectId });
  if (!projectExists) return next(new ErrorResponse('Project not found', 404));

  const message = await Message.create({
    project: projectId,
    sender: req.user.id,
    content
  });

  const populated = await Message.findById(message._id).populate('sender', 'name avatar');

  const io = req.app.get('io');
  io.to(`project_${projectId}`).emit('newProjectMessage', populated);
  
   // Notify all users in the project except the sender
const participants = await Project.findById(projectId).select('members'); // Adjust based on your schema

participants.members
  .filter(id => id.toString() !== socket.user.id)
  .forEach(userId => {
    io.to(`user_${userId}`).emit('projectHasUnread', {
      projectId,
      messageId: message._id
    });
  });


  res.status(201).json({
    success: true,
    data: populated
  });
});

exports.checkUnreadMessages = checkUnreadMessages;
