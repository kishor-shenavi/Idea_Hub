const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  startSession, getEagerness, postPersonaTurn, postStudentTurn, endSession, getHistory,
} = require('../controllers/gdController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/tmp/uploads/'),
  filename: (req, file, cb) => cb(null, `gd-${Date.now()}.webm`),
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

router.use(protect);
router.post('/start', startSession);
router.get('/:id/eagerness', getEagerness);
router.post('/:id/persona-turn', postPersonaTurn);
router.post('/:id/student-turn', upload.single('audio'), postStudentTurn);
router.post('/:id/end', endSession);
router.get('/history', getHistory);

module.exports = router;