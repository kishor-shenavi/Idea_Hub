const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { getUnread, markRead } = require('../controllers/notificationController');

router.use(protect);
router.get('/unread', getUnread);
router.put('/:id/read', markRead);

module.exports = router;