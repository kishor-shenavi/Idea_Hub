const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const ResumeScan = require('../models/ResumeScan');
const { analyzeResume } = require('../services/ai/resumeService');
const { ErrorResponse } = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/async');

// POST /api/v1/resume/analyze
// Accepts: multipart/form-data with file (PDF) OR raw resumeText in body
exports.analyzeUserResume = asyncHandler(async (req, res, next) => {
  let resumeText = '';

  // If PDF file uploaded, extract text
  if (req.file) {
    try {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      resumeText = pdfData.text;
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
    } catch (err) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return next(new ErrorResponse('Failed to parse PDF. Please try pasting resume text instead.', 400));
    }
  } else if (req.body.resumeText) {
    resumeText = req.body.resumeText;
  } else {
    return next(new ErrorResponse('Please upload a PDF or paste resume text', 400));
  }

  if (resumeText.trim().length < 100) {
    return next(new ErrorResponse('Resume text is too short to analyze', 400));
  }

  const { jobDescription, targetRole } = req.body;

  const aiResult = await analyzeResume({ resumeText, jobDescription, targetRole });

  const scan = await ResumeScan.create({
    user: req.user.id,
    jobDescription: jobDescription || '',
    targetRole: targetRole || '',
    atsScore: aiResult.atsScore,
    result: {
      strengths: aiResult.strengths,
      weaknesses: aiResult.weaknesses,
      missingKeywords: aiResult.missingKeywords,
      presentKeywords: aiResult.presentKeywords,
      improvements: aiResult.improvements,
      sectionFeedback: aiResult.sectionFeedback,
      overallFeedback: aiResult.overallFeedback,
    },
  });

  res.status(200).json({
    success: true,
    data: {
      scanId: scan._id,
      atsScore: aiResult.atsScore,
      scoreBreakdown: aiResult.scoreBreakdown,
      strengths: aiResult.strengths,
      weaknesses: aiResult.weaknesses,
      missingKeywords: aiResult.missingKeywords,
      presentKeywords: aiResult.presentKeywords,
      improvements: aiResult.improvements,
      sectionFeedback: aiResult.sectionFeedback,
      overallFeedback: aiResult.overallFeedback,
    },
  });
});

// GET /api/v1/resume/history
exports.getResumeHistory = asyncHandler(async (req, res) => {
  const scans = await ResumeScan.find({ user: req.user.id })
    .select('atsScore targetRole createdAt result.overallFeedback')
    .sort('-createdAt');
  res.status(200).json({ success: true, count: scans.length, data: scans });
});

// GET /api/v1/resume/history/:id
exports.getResumeScan = asyncHandler(async (req, res, next) => {
  const scan = await ResumeScan.findById(req.params.id);
  if (!scan) return next(new ErrorResponse('Scan not found', 404));
  if (scan.user.toString() !== req.user.id) return next(new ErrorResponse('Not authorized', 403));
  res.status(200).json({ success: true, data: scan });
});
