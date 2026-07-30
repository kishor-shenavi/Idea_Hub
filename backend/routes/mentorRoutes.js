const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { sendRequestSchema, respondSchema } = require('../validators/mentor.schema');
const {
  sendRequest, getReceivedRequests, getSentRequests,
  respondToRequest, cancelRequest, browseSeniors, getMentorMessages,
  markMentorChatRead, getUnreadMentorChats,getRequestById
} = require('../controllers/mentorRequestController');

router.use(protect);

router.post('/request', validate(sendRequestSchema), sendRequest);
router.get('/requests/received', getReceivedRequests);
router.get('/requests/sent', getSentRequests);
router.put('/requests/:id/respond', validate(respondSchema), respondToRequest);
router.delete('/requests/:id', cancelRequest);
router.get('/seniors', browseSeniors);
router.get('/:id/messages', getMentorMessages);
router.get('/unread', getUnreadMentorChats);
router.put('/:id/messages/read', markMentorChatRead);

router.get('/requests/:id', getRequestById);

module.exports = router;