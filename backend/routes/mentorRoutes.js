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
router.get('/requests/sent', getSentRequests);
router.put('/requests/:id/respond', respondToRequest);
router.delete('/requests/:id', cancelRequest);

module.exports = router;
