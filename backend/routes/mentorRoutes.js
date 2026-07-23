const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  sendRequest, getReceivedRequests, getSentRequests,
  respondToRequest, cancelRequest,
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

module.exports = router;
