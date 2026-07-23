const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { analyzeUserResume, getResumeHistory, getResumeScan } = require('../controllers/resumeController');
const validate = require('../middlewares/validate');
const { analyzeResumeSchema } = require('../validators/resume.schema');
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
// backend/routes/resumeRoutes.js
const aiRateLimiter = require('../middlewares/aiRateLimiter');
router.post('/analyze', aiRateLimiter, upload.single('resume'), validate(analyzeResumeSchema), analyzeUserResume);
router.get('/history', getResumeHistory);
router.get('/history/:id', getResumeScan);

module.exports = router;
