const ExtemporeSession = require('../models/ExtemporeSession');
const { transcribeAudio } = require('../services/speech/transcriptionService');
const { analyzeTranscript } = require('../services/speech/speechMetricsService');
const { generateCoachFeedback } = require('../services/ai/extemporeCoachService');
const asyncHandler = require('../middlewares/async');
const { ErrorResponse } = require('../utils/errorHandler');
const fs = require('fs');

exports.analyzeSpeech = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new ErrorResponse('No audio file uploaded', 400));
  const { topic, audioAnalysis: audioAnalysisRaw } = req.body;
  if (!topic) return next(new ErrorResponse('Topic is required', 400));

  let audioAnalysis;
  try {
    audioAnalysis = JSON.parse(audioAnalysisRaw);
  } catch {
    return next(new ErrorResponse('Invalid audio analysis payload', 400));
  }

  const transcriptData = await transcribeAudio(req.file.path);
  if (!transcriptData.text || transcriptData.text.trim().length === 0) {
    return next(new ErrorResponse('No speech detected in recording', 400));
  }

  const metrics = analyzeTranscript(transcriptData);
  const coachFeedback = await generateCoachFeedback({
    topic, transcript: transcriptData.text, metrics, audioAnalysis,
  });

  const session = await ExtemporeSession.create({
    user: req.user.id,
    topic,
    durationSeconds: transcriptData.audioDurationSeconds,
    transcript: transcriptData.text,
    metrics,
    audioAnalysis,
    coachFeedback,
  });

  fs.unlink(req.file.path, () => {});

  res.status(200).json({ success: true, data: session });
});

exports.getSessionHistory = asyncHandler(async (req, res) => {
  const sessions = await ExtemporeSession.find({ user: req.user.id }).sort('-createdAt');
  res.status(200).json({ success: true, count: sessions.length, data: sessions });
});