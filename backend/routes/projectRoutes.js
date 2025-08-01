const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  deleteAllProjects,
  likeProject,
  shareProject,
  getUserProjects
} = require('../controllers/projectController');
const { protect } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/admin');

const router = express.Router();

// Public routes
router.route('/')
  .get(getProjects);

// Protected routes
router.use(protect);

router.route('/')
  .post(createProject);

// User's projects routes
router.route('/myprojects')
  .get(getUserProjects);

// Like/share routes
router.route('/:id/like')
  .put(likeProject);

router.route('/:id/share')
  .put(shareProject);

// Admin-only routes
router.route('/delallprojects')
  .delete(isAdmin, deleteAllProjects);

// Project detail routes
router.route('/:id')
  .get(getProject)
  // Keep PUT and DELETE here for compatibility with frontend
  .put(updateProject)
  .delete(deleteProject);

module.exports = router;