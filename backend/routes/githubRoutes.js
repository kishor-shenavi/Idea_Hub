const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { getConnectionStatus, analyzeGithubProfile, getScanHistory ,getScanById} = require('../controllers/githubController');

router.use(protect);
router.get('/status', getConnectionStatus);
// backend/routes/githubRoutes.js
const aiRateLimiter = require('../middlewares/aiRateLimiter');
router.post('/analyze', aiRateLimiter, analyzeGithubProfile);
router.get('/history', getScanHistory);

router.get('/scan/:id', getScanById); // add getScanById to the destructured controller import at top of file

module.exports = router;