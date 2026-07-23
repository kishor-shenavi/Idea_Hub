const gdSessionRepository = require('../repositories/gdSession.repository');
const { computeEagerness, generatePersonaTurn, PERSONAS } = require('../services/gd/gdEngineService');
const { generateGDReport } = require('../services/ai/gdReportService');
const { transcribeAudio } = require('../services/speech/transcriptionService');
const asyncHandler = require('../middlewares/async');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const fs = require('fs');

exports.startSession = asyncHandler(async (req, res, next) => {
  const { topic } = req.body;

  const session = await gdSessionRepository.create({ user: req.user.id, topic, transcript: [] });

  const opener = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
  logger.info('Starting GD session', { requestId: req.id, userId: req.user.id, topic, opener: opener.id });

  const turn = await generatePersonaTurn(session, opener.id);
  session.transcript.push({ speaker: turn.personaId, text: turn.text });
  await session.save();

  res.status(200).json({ success: true, data: { session, personas: PERSONAS.map(p => ({ id: p.id, name: p.name, style: p.style, voice: p.voice })) } });
});

exports.getEagerness = asyncHandler(async (req, res, next) => {
  const session = await gdSessionRepository.findByIdForUser(req.params.id, req.user.id);
  if (!session) return next(AppError.notFound('Session not found'));
  res.status(200).json({ success: true, data: computeEagerness(session) });
});

exports.postPersonaTurn = asyncHandler(async (req, res, next) => {
  const session = await gdSessionRepository.findByIdForUser(req.params.id, req.user.id);
  if (!session) return next(AppError.notFound('Session not found'));
  if (session.status === 'ended') return next(AppError.validation('Session already ended'));

  const { personaId } = req.body;
  const turn = await generatePersonaTurn(session, personaId);
  session.transcript.push({ speaker: turn.personaId, text: turn.text });
  await session.save();

  res.status(200).json({ success: true, data: turn });
});

exports.postStudentTurn = asyncHandler(async (req, res, next) => {
  const session = await gdSessionRepository.findByIdForUser(req.params.id, req.user.id);
  if (!session) return next(AppError.notFound('Session not found'));
  if (session.status === 'ended') return next(AppError.validation('Session already ended'));
  if (!req.file) return next(AppError.validation('No audio provided'));

  const wasInterruption = req.body.wasInterruption === 'true';

  const transcriptData = await transcribeAudio(req.file.path);
  fs.unlink(req.file.path, () => {});

  if (!transcriptData.text || transcriptData.text.trim().length === 0) {
    return next(AppError.validation('No speech detected'));
  }

  if (wasInterruption) {
    logger.info('Student interrupted a persona', { requestId: req.id, userId: req.user.id, sessionId: session._id });
  }

  session.transcript.push({
    speaker: 'student',
    text: transcriptData.text,
    wasInterruption,
    durationSeconds: transcriptData.audioDurationSeconds,
  });
  await session.save();

  res.status(200).json({ success: true, data: { text: transcriptData.text } });
});

exports.endSession = asyncHandler(async (req, res, next) => {
  const session = await gdSessionRepository.findByIdForUser(req.params.id, req.user.id);
  if (!session) return next(AppError.notFound('Session not found'));

  logger.info('Generating GD report', { requestId: req.id, userId: req.user.id, sessionId: session._id, turnCount: session.transcript.length });

  const report = await generateGDReport(session);
  session.status = 'ended';
  session.report = report;
  await session.save();

  res.status(200).json({ success: true, data: session });
});

exports.getHistory = asyncHandler(async (req, res) => {
  const sessions = await gdSessionRepository.findByUser(req.user.id);
  res.status(200).json({ success: true, count: sessions.length, data: sessions });
});