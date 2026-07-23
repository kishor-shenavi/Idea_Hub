const fs = require('fs');
const pdfParse = require('pdf-parse');
const resumeScanRepository = require('../repositories/resumeScan.repository');
const { analyzeResume } = require('../services/ai/resumeService');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/async');
const logger = require('../utils/logger');
const aiQueue=require('../queues/aiQueue');

// POST /api/v1/resume/analyze

exports.analyzeUserResume = asyncHandler(async (req, res, next) => {
  let resumeText = '';

  if (req.file) {
    try {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      resumeText = pdfData.text;
      fs.unlinkSync(req.file.path);
    } catch (err) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return next(AppError.validation('Failed to parse PDF. Please try pasting resume text instead.'));
    }
  } else if (req.body.resumeText) {
    resumeText = req.body.resumeText;
  } else {
    return next(AppError.validation('Please upload a PDF or paste resume text'));
  }

  if (resumeText.trim().length < 100) {
    return next(AppError.validation('Resume text is too short to analyze'));
  }

  const { jobDescription, targetRole } = req.body;

  const scan = await resumeScanRepository.create({
    user: req.user.id,
    resumeText,
    jobDescription: jobDescription || '',
    targetRole: targetRole || '',
    status: 'pending',
  });

  await aiQueue.add('resume-analyze', { scanId: scan._id.toString() });

  logger.info('Resume analysis queued', { requestId: req.id, userId: req.user.id, scanId: scan._id });

  res.status(202).json({ success: true, data: { scanId: scan._id, status: 'pending' } });
});

// GET /api/v1/resume/history
exports.getResumeHistory = asyncHandler(async (req, res) => {
  const scans = await resumeScanRepository.findByUser(req.user.id);
  res.status(200).json({ success: true, count: scans.length, data: scans });
});

// GET /api/v1/resume/history/:id
exports.getResumeScan = asyncHandler(async (req, res, next) => {
  const scan = await resumeScanRepository.findById(req.params.id);
  if (!scan) return next(AppError.notFound('Scan not found'));
  if (scan.user.toString() !== req.user.id) return next(AppError.unauthorized('Not authorized'));
  res.status(200).json({ success: true, data: scan });
});