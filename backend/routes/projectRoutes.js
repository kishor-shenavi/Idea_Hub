const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getProjects, getProject, createProject, updateProject, deleteProject,
  getMyProjects, likeProject, shareProject, bookmarkProject, getBookmarks,
  getComments, addComment, deleteComment,
} = require('../controllers/projectController');
const validate = require('../middlewares/validate');
const { createProjectSchema, commentSchema } = require('../validators/project.schema');
// Public
router.get('/', getProjects);
router.get('/:id', getProject);
router.get('/:id/comments', getComments);

// Protected
router.use(protect);

router.post('/', validate(createProjectSchema), createProject);

router.get('/user/my', getMyProjects);
router.get('/user/bookmarks', getBookmarks);

router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.put('/:id/like', likeProject);
router.put('/:id/share', shareProject);
router.put('/:id/bookmark', bookmarkProject);


router.post('/:id/comments', validate(commentSchema), addComment);
router.delete('/:id/comments/:commentId', deleteComment);

module.exports = router;
