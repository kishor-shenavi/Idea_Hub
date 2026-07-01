const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getInternships, getInternship, createInternship,
  updateInternship, deleteInternship, likeInternship,
} = require('../controllers/internshipController');

router.get('/', getInternships);
router.get('/:id', getInternship);

router.use(protect);
router.post('/', createInternship);
router.put('/:id', updateInternship);
router.delete('/:id', deleteInternship);
router.put('/:id/like', likeInternship);

module.exports = router;
