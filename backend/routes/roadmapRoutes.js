const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  generateUserRoadmap, getMyRoadmaps, getRoadmap,
  markWeekComplete, deleteRoadmap,
  suggestProjectIdeas, generateTopicQuiz, getWeekResources, getMarketData,
} = require('../controllers/roadmapController');
const validate = require('../middlewares/validate');
const { generateRoadmapSchema, suggestProjectsSchema, quizSchema, resourcesSchema } = require('../validators/roadmap.schema');
router.use(protect);

router.post('/generate', validate(generateRoadmapSchema), generateUserRoadmap);
router.get('/my', getMyRoadmaps);
router.get('/:id', getRoadmap);
router.put('/:id/week/:weekNumber/complete', markWeekComplete);
router.delete('/:id', deleteRoadmap);

// AI utilities
// backend/routes/roadmapRoutes.js
const aiRateLimiter = require('../middlewares/aiRateLimiter');
router.post('/generate', aiRateLimiter, validate(generateRoadmapSchema), generateUserRoadmap);
router.post('/suggest-projects', aiRateLimiter, validate(suggestProjectsSchema), suggestProjectIdeas);
router.post('/quiz', aiRateLimiter, validate(quizSchema), generateTopicQuiz);
router.post('/resources', aiRateLimiter, validate(resourcesSchema), getWeekResources);
router.post('/market-insights', getMarketData);

module.exports = router;
