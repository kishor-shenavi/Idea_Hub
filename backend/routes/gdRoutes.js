const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  startSession, getEagerness, postPersonaTurn, postStudentTurn, endSession, getHistory,
} = require('../controllers/gdController');
const validate = require('../middlewares/validate');
const { startSessionSchema, personaTurnSchema, studentTurnSchema } = require('../validators/gd.schema');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/tmp/uploads/'),
  filename: (req, file, cb) => cb(null, `gd-${Date.now()}.webm`),
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

router.use(protect);
// backend/routes/gdRoutes.js
const aiRateLimiter = require('../middlewares/aiRateLimiter');
router.post('/start', aiRateLimiter, validate(startSessionSchema), startSession);
router.post('/:id/persona-turn', aiRateLimiter, validate(personaTurnSchema), postPersonaTurn);
router.post('/:id/student-turn', upload.single('audio'), validate(studentTurnSchema), postStudentTurn);
router.get('/:id/eagerness', getEagerness);
router.post('/:id/end', endSession);
router.get('/history', getHistory);

module.exports = router;