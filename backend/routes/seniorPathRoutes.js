const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getPaths, getPath, createPath, updatePath, deletePath, likePath,
} = require('../controllers/seniorPathController');

router.get('/', getPaths);
router.get('/:id', getPath);

router.use(protect);
router.post('/', createPath);
router.put('/:id', updatePath);
router.delete('/:id', deletePath);
router.put('/:id/like', likePath);

module.exports = router;
