const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  generateUserRoadmap, getMyRoadmaps, getRoadmap,
  markWeekComplete, deleteRoadmap,
  suggestProjectIdeas, generateTopicQuiz, getWeekResources, getMarketData,
} = require('../controllers/roadmapController');

router.use(protect);

router.post('/generate', generateUserRoadmap);
router.get('/my', getMyRoadmaps);
router.get('/:id', getRoadmap);
router.put('/:id/week/:weekNumber/complete', markWeekComplete);
router.delete('/:id', deleteRoadmap);

// AI utilities
router.post('/suggest-projects', suggestProjectIdeas);
router.post('/quiz', generateTopicQuiz);
router.post('/resources', getWeekResources);
router.post('/market-insights', getMarketData);

module.exports = router;
