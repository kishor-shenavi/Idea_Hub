// const express = require('express');
// const { protect } = require('../middlewares/auth');
// const {
//   getOrCreateConversation,
//   sendMessage,
//   getMessages,
//   getUserConversations,
//   deleteMessages,
//   replyToMessage,
//   markAsRead
// } = require('../controllers/chatController');

// const router = express.Router();

// router.use(protect);

// // Get all conversations for user
// router.get('/', getUserConversations);

// // Get or create conversation
// router.get('/:projectId/:recipientId', getOrCreateConversation);

// // Get conversation messages
// router.get('/:conversationId/messages', getMessages);

// // Send message
// router.post('/:conversationId/messages', sendMessage);

// // Delete conversation messages
// router.delete('/:conversationId/messages', deleteMessages);

// // Reply to message
// router.post('/:messageId/reply', replyToMessage);

// // Mark messages as read
// router.put('/:conversationId/read', markAsRead);

// module.exports = router;





















// // chatRoutes.js

// const express = require('express');
// const { protect } = require('../middlewares/auth');
// const { verifyChatAccess } = require('../middlewares/chatAuth');
// const {
//   sendMessage,
//   deleteMessages,
//   getConversation,
//   markAsRead
// ,getChatHistory,
//   replyToMessage 
// } = require('../controllers/chatController');

// const router = express.Router();

// router.use(protect);

// // Send a message
// router.route('/')
//   .post(sendMessage);

// // ✅ Add verifyChatAccess middleware to protected chat history route
// router.route('/:projectId/:userId/messages')
//   .get(verifyChatAccess, getConversation)
//   .delete(verifyChatAccess, deleteMessages);

// // ✅ Add middleware if needed to replies
// router.route('/:messageId/reply')
//   .post(replyToMessage);

//   // chat.routes.js
// router.get('/chat/:projectId/:userId/messages', getChatHistory);
// router.put('/chat/:projectId/:userId/read', markAsRead);

// // ✅ Add auth to read receipts if needed
// //router.put('/:projectId/:userId/read', markAsRead);

// module.exports = router;



















//corrected

// // chatRoutes.js
// const express = require('express');
// const { protect } = require('../middlewares/auth');
// const { verifyChatAccess } = require('../middlewares/chatAuth');
// const {
//   sendMessage,
//   deleteMessages,
//   getConversation,
//   markAsRead,
//   replyToMessage
// } = require('../controllers/chatController');

// const router = express.Router();

// // 🔐 All routes below require authentication
// router.use(protect);

// // Send a message
// router.post('/', sendMessage);

// // Get paginated chat history and delete conversation (with access control)
// router
//   .route('/:projectId/:userId/messages')
//   .get(verifyChatAccess, getConversation)
//   .delete(verifyChatAccess, deleteMessages);

// // Mark messages as read (with access control)
// router.put('/:projectId/:userId/read', verifyChatAccess, markAsRead);

// // Reply to a specific message
// router.post('/:messageId/reply', replyToMessage);

// module.exports = router;


const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  getProjectMessages,
  postProjectMessage,
  checkUnreadMessages,  // Add this line to your chatController.js file
} = require('../controllers/chatController');

const router = express.Router();
router.get('/has-unread', protect, checkUnreadMessages);


router.use(protect);

// All messages related to a project
router
  .route('/:projectId/messages')
  .get(getProjectMessages)
  .post(postProjectMessage);

module.exports = router;
