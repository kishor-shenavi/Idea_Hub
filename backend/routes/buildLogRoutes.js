const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getBuildLogs, getBuildLog, createBuildLog, updateBuildLog,
  deleteBuildLog, likeBuildLog, getMyBuildLogs,
} = require('../controllers/buildLogController');

router.get('/', getBuildLogs);
router.get('/:id', getBuildLog);

router.use(protect);
router.get('/user/my', getMyBuildLogs);
router.post('/', createBuildLog);
router.put('/:id', updateBuildLog);
router.delete('/:id', deleteBuildLog);
router.put('/:id/like', likeBuildLog);

module.exports = router;
