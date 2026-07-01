const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { analyzeUserResume, getResumeHistory, getResumeScan } = require('../controllers/resumeController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/tmp/uploads/'),
  filename: (req, file, cb) => cb(null, `resume-${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  },
});

router.use(protect);

router.post('/analyze', upload.single('resume'), analyzeUserResume);
router.get('/history', getResumeHistory);
router.get('/history/:id', getResumeScan);

module.exports = router;
