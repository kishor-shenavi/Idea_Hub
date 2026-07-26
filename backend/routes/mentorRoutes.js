const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  sendRequest, getReceivedRequests, getSentRequests,
  respondToRequest, cancelRequest,browseSeniors,getMentorMessages,markMentorChatRead,getUnreadMentorChats
} = require('../controllers/mentorRequestController');

router.use(protect);

router.post('/request', sendRequest);
router.get('/requests/received', getReceivedRequests);
// backend/routes/mentorRoutes.js — add
const validate = require('../middlewares/validate');
const { sendRequestSchema, respondSchema } = require('../validators/mentor.schema');
router.post('/request', validate(sendRequestSchema), sendRequest);
router.put('/requests/:id/respond', validate(respondSchema), respondToRequest);
router.delete('/requests/:id', cancelRequest);
router.get('/seniors', browseSeniors); // add browseSeniors to the destructured controller import at top
router.get('/requests/sent', getSentRequests); // this was missing entirely — getSentRequests existed but was unreachable
router.get('/:id/messages', getMentorMessages); // add getMentorMessages to the destructured controller import at top
router.get('/unread', getUnreadMentorChats);
router.put('/:id/messages/read', markMentorChatRead);
module.exports = router;
