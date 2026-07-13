const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/projects', require('./projectRoutes'));
router.use('/chat', require('./chatRoutes'));
router.use('/paths', require('./seniorPathRoutes'));
router.use('/regrets', require('./regretRoutes'));
router.use('/internships', require('./internshipRoutes'));
router.use('/wiki', require('./companyWikiRoutes'));
router.use('/offers', require('./offerTrackerRoutes'));
router.use('/buildlogs', require('./buildLogRoutes'));
router.use('/mentor', require('./mentorRoutes'));
router.use('/roadmap', require('./roadmapRoutes'));
router.use('/resume', require('./resumeRoutes'));
router.use('/interview', require('./interviewRoutes'));
router.use('/admin', require('./adminRoutes'));
router.use('/github', require('./githubRoutes'));
router.use('/extempore', require('./extemporeRoutes'));
router.use('/gd', require('./gdRoutes'));

router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'IdeaHub API is running' });
});

module.exports = router;
