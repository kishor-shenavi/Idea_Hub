const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getProjects, getProject, createProject, updateProject, deleteProject,
  getMyProjects, likeProject, shareProject, bookmarkProject, getBookmarks,
  getComments, addComment, deleteComment,
} = require('../controllers/projectController');

// Public
router.get('/', getProjects);
router.get('/:id', getProject);
router.get('/:id/comments', getComments);

// Protected
router.use(protect);

router.post('/', createProject);
router.get('/user/my', getMyProjects);
router.get('/user/bookmarks', getBookmarks);

router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.put('/:id/like', likeProject);
router.put('/:id/share', shareProject);
router.put('/:id/bookmark', bookmarkProject);

router.post('/:id/comments', addComment);
router.delete('/:id/comments/:commentId', deleteComment);

module.exports = router;
