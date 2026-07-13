const express = require('express');
const multer = require('multer');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { startViva, answerQuestion, endViva, getHistory } = require('../controllers/vivaController');

const reportUpload = multer({ dest: '/tmp/uploads/' }); // PDF, small files, memory-safe as-is
const audioUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, '/tmp/uploads/'),
    filename: (req, file, cb) => cb(null, `viva-${Date.now()}.webm`),
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.use(protect);
router.post('/start', reportUpload.single('report'), startViva);
router.post('/:id/answer', audioUpload.single('audio'), answerQuestion);
router.post('/:id/end', endViva);
router.get('/history', getHistory);

module.exports = router;