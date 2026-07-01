const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getRegrets, createRegret, upvoteRegret, deleteRegret,
} = require('../controllers/regretController');

router.get('/', getRegrets);

router.use(protect);
router.post('/', createRegret);
router.put('/:id/upvote', upvoteRegret);
router.delete('/:id', deleteRegret);

module.exports = router;
