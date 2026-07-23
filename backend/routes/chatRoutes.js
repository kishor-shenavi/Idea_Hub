const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getProjectMessages, postProjectMessage, markMessagesRead, getUnreadCount,
} = require('../controllers/chatController');
const validate = require('../middlewares/validate');
const { postMessageSchema } = require('../validators/chat.schema');
router.use(protect);

router.get('/unread', getUnreadCount);
router.get('/:projectId/messages', getProjectMessages);
router.post('/:projectId/messages', validate(postMessageSchema), postProjectMessage);
router.put('/:projectId/messages/read', markMessagesRead);

module.exports = router;
