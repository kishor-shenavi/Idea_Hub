const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { startSession, submitResponse, getHistory, getSession, transcribeCandidateAudio } = require('../controllers/interviewController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/tmp/uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname || '')}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // For resume field, restrict to PDF. For audio, accept audio files.
    if (file.fieldname === 'resume') {
      if (file.mimetype === 'application/pdf') cb(null, true);
      else cb(new Error('Only PDF files are allowed for resumes'), false);
    } else {
      cb(null, true);
    }
  }
});

router.use(protect);

router.post('/transcribe', upload.single('audio'), transcribeCandidateAudio);
router.post('/start', upload.single('resume'), startSession);
router.post('/:id/respond', submitResponse);
router.get('/history', getHistory);
router.get('/:id', getSession);

module.exports = router;
