const express = require('express');
const {
  getProjects,
  approveProject,
  getUsers,
  updateUser,
  deleteUser,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');
//const { isAdmin } = require('../middlewares/admin');

const router = express.Router();

// Admin routes
router.use(protect);
router.use(authorize('admin'));
//router.use(isAdmin);

router.get('/projects', getProjects);
router.put('/projects/:id/approve', approveProject);
router.get('/users', getUsers);
router.route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;