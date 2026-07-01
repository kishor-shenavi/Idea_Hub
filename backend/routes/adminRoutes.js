const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  getAllProjects, approveProject,
  getAllInternships, approveInternship,
  getAllUsers, updateUser, deleteUser,
  getDashboardStats, deleteRegret,
} = require('../controllers/adminController');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);

router.get('/projects', getAllProjects);
router.put('/projects/:id/approve', approveProject);

router.get('/internships', getAllInternships);
router.put('/internships/:id/approve', approveInternship);

router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.delete('/regrets/:id', deleteRegret);

module.exports = router;
