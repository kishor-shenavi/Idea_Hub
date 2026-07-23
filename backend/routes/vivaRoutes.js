const express = require('express');
const multer = require('multer');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { startViva, answerQuestion, endViva, getHistory } = require('../controllers/vivaController');
const validate = require('../middlewares/validate');
const { startVivaSchema } = require('../validators/viva.schema');
const reportUpload = multer({ dest: '/tmp/uploads/' }); // PDF, small files, memory-safe as-is
const audioUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, '/tmp/uploads/'),
    filename: (req, file, cb) => cb(null, `viva-${Date.now()}.webm`),
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.use(protect);
// backend/routes/vivaRoutes.js
const aiRateLimiter = require('../middlewares/aiRateLimiter');
router.post('/start', aiRateLimiter, reportUpload.single('report'), validate(startVivaSchema), startViva);
router.post('/:id/answer', aiRateLimiter, audioUpload.single('audio'), answerQuestion);
router.post('/:id/end', endViva);
router.get('/history', getHistory);

module.exports = router;