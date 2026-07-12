const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { analyzeSpeech, getSessionHistory } = require('../controllers/extemporeController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/tmp/uploads/'),
  filename: (req, file, cb) => cb(null, `speech-${Date.now()}.webm`),
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB, ~90s of audio is nowhere near this
});

router.use(protect);
router.post('/analyze', upload.single('audio'), analyzeSpeech);
router.get('/history', getSessionHistory);

module.exports = router;