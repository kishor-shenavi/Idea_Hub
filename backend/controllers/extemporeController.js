const fs = require('fs');
const extemporeSessionRepository = require('../repositories/extemporeSession.repository');
const { transcribeAudio } = require('../services/speech/transcriptionService');
const { analyzeTranscript } = require('../services/speech/speechMetricsService');
const { generateCoachFeedback } = require('../services/ai/extemporeCoachService');
const asyncHandler = require('../middlewares/async');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

exports.analyzeSpeech = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(AppError.validation('No audio file uploaded'));

  const { topic, audioAnalysis: audioAnalysisRaw } = req.body;

  let audioAnalysis;
  try {
    audioAnalysis = JSON.parse(audioAnalysisRaw);
  } catch {
    return next(AppError.validation('Invalid audio analysis payload'));
  }

  const transcriptData = await transcribeAudio(req.file.path);
  if (!transcriptData.text || transcriptData.text.trim().length === 0) {
    return next(AppError.validation('No speech detected in recording'));
  }

  logger.info('Analyzing extempore speech', { requestId: req.id, userId: req.user.id, topic, durationSeconds: transcriptData.audioDurationSeconds });

  const metrics = analyzeTranscript(transcriptData);
  const coachFeedback = await generateCoachFeedback({
    topic, transcript: transcriptData.text, metrics, audioAnalysis,
  });

  const session = await extemporeSessionRepository.create({
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
  const sessions = await extemporeSessionRepository.findByUser(req.user.id);
  res.status(200).json({ success: true, count: sessions.length, data: sessions });
});