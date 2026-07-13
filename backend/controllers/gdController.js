const GDSession = require('../models/GDSession');
const { computeEagerness, generatePersonaTurn, PERSONAS } = require('../services/gd/gdEngineService');
const { generateGDReport } = require('../services/ai/gdReportService');
const { transcribeAudio } = require('../services/speech/transcriptionService');
const asyncHandler = require('../middlewares/async');
const { ErrorResponse } = require('../utils/errorHandler');
const fs = require('fs');

exports.startSession = asyncHandler(async (req, res, next) => {
  const { topic } = req.body;
  if (!topic) return next(new ErrorResponse('Topic is required', 400));

  const session = await GDSession.create({ user: req.user.id, topic, transcript: [] });

  // first persona kicks off the discussion
  const opener = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
  const turn = await generatePersonaTurn(session, opener.id);
  session.transcript.push({ speaker: turn.personaId, text: turn.text });
  await session.save();

  res.status(200).json({ success: true, data: { session, personas: PERSONAS.map(p => ({ id: p.id, name: p.name, style: p.style, voice: p.voice })) } });
});

// called after each persona/student turn to decide who's "eager" to speak next
exports.getEagerness = asyncHandler(async (req, res, next) => {
  const session = await GDSession.findOne({ _id: req.params.id, user: req.user.id });
  if (!session) return next(new ErrorResponse('Session not found', 404));
  res.status(200).json({ success: true, data: computeEagerness(session) });
});

exports.postPersonaTurn = asyncHandler(async (req, res, next) => {
  const session = await GDSession.findOne({ _id: req.params.id, user: req.user.id });
  if (!session) return next(new ErrorResponse('Session not found', 404));
  if (session.status === 'ended') return next(new ErrorResponse('Session already ended', 400));

  const { personaId } = req.body;
  const turn = await generatePersonaTurn(session, personaId);
  session.transcript.push({ speaker: turn.personaId, text: turn.text });
  await session.save();

  res.status(200).json({ success: true, data: turn });
});

exports.postStudentTurn = asyncHandler(async (req, res, next) => {
  const session = await GDSession.findOne({ _id: req.params.id, user: req.user.id });
  if (!session) return next(new ErrorResponse('Session not found', 404));
  if (session.status === 'ended') return next(new ErrorResponse('Session already ended', 400));
  if (!req.file) return next(new ErrorResponse('No audio provided', 400));

  const wasInterruption = req.body.wasInterruption === 'true';

  const transcriptData = await transcribeAudio(req.file.path);
  fs.unlink(req.file.path, () => {});

  if (!transcriptData.text || transcriptData.text.trim().length === 0) {
    return next(new ErrorResponse('No speech detected', 400));
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
  const session = await GDSession.findOne({ _id: req.params.id, user: req.user.id });
  if (!session) return next(new ErrorResponse('Session not found', 404));

  const report = await generateGDReport(session);
  session.status = 'ended';
  session.report = report;
  await session.save();

  res.status(200).json({ success: true, data: session });
});

exports.getHistory = asyncHandler(async (req, res) => {
  const sessions = await GDSession.find({ user: req.user.id }).sort('-createdAt');
  res.status(200).json({ success: true, count: sessions.length, data: sessions });
});