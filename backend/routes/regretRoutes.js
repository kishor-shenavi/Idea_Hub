const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getRegrets, createRegret, upvoteRegret, deleteRegret,
} = require('../controllers/regretController');
const validate = require('../middlewares/validate');
const { regretSchema } = require('../validators/regret.schema');
router.get('/', getRegrets);

router.use(protect);
router.post('/', validate(regretSchema), createRegret);
router.put('/:id/upvote', upvoteRegret);
router.delete('/:id', deleteRegret);

module.exports = router;
