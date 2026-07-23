const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  getAllProjects, approveProject,
  getAllInternships, approveInternship,
  getAllUsers, updateUser, deleteUser,
  getDashboardStats, deleteRegret,
} = require('../controllers/adminController');
const validate = require('../middlewares/validate');
const { approveProjectSchema, approveInternshipSchema, updateUserSchema } = require('../validators/admin.schema');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);

router.get('/projects', getAllProjects);
router.put('/projects/:id/approve', validate(approveProjectSchema), approveProject);

router.get('/internships', getAllInternships);
router.put('/internships/:id/approve', validate(approveInternshipSchema), approveInternship);

router.get('/users', getAllUsers);
router.put('/users/:id', validate(updateUserSchema), updateUser);
router.delete('/users/:id', deleteUser);

router.delete('/regrets/:id', deleteRegret);

module.exports = router;
