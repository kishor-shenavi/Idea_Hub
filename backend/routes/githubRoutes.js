const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { getConnectionStatus, analyzeGithubProfile, getScanHistory } = require('../controllers/githubController');

router.use(protect);
router.get('/status', getConnectionStatus);
router.post('/analyze', analyzeGithubProfile);
router.get('/history', getScanHistory);

module.exports = router;