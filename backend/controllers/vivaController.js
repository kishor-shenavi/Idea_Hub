const fs = require('fs');
const pdfParse = require('pdf-parse');
const vivaSessionRepository = require('../repositories/vivaSession.repository');
const { generateFirstQuestion, evaluateAndContinue } = require('../services/ai/vivaExaminerService');
const { generateVivaReport } = require('../services/ai/vivaReportService');
const { transcribeAudio } = require('../services/speech/transcriptionService');
const asyncHandler = require('../middlewares/async');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

exports.startViva = asyncHandler(async (req, res, next) => {
  let reportText = '';

  if (req.file) {
    try {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      reportText = pdfData.text;
      logger.info('PDF parsed for viva', { requestId: req.id, pages: pdfData.numpages, chars: reportText.trim().length });
      fs.unlinkSync(req.file.path);
    } catch (err) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return next(AppError.validation('Failed to parse PDF. Please try pasting the report text instead.'));
    }
  } else if (req.body.reportText) {
    reportText = req.body.reportText;
  } else {
    return next(AppError.validation('Please upload a PDF or paste report text'));
  }

  if (reportText.trim().length < 50) {
    return next(AppError.validation('Report text is too short to conduct a viva on'));
  }

  const { question } = await generateFirstQuestion(reportText);

  const session = await vivaSessionRepository.create({
    user: req.user.id,
    reportText,
    reportTitle: req.body.reportTitle || 'Untitled Project',
    exchanges: [{ question, answer: '' }],
  });

  res.status(200).json({ success: true, data: { sessionId: session._id, question } });
});

exports.answerQuestion = asyncHandler(async (req, res, next) => {
  const session = await vivaSessionRepository.findByIdForUser(req.params.id, req.user.id);
  if (!session) return next(AppError.notFound('Session not found'));
  if (session.status === 'ended') return next(AppError.validation('Viva already ended'));
  if (!req.file) return next(AppError.validation('No audio provided'));

  const transcriptData = await transcribeAudio(req.file.path);
  fs.unlink(req.file.path, () => {});

  if (!transcriptData.text || transcriptData.text.trim().length === 0) {
    return next(AppError.validation('No speech detected'));
  }

  const current = session.exchanges[session.exchanges.length - 1];
  current.answer = transcriptData.text;

  const result = await evaluateAndContinue({
    reportText: session.reportText,
    exchanges: session.exchanges,
    latestAnswer: transcriptData.text,
  });

  logger.info('Viva answer evaluated', { requestId: req.id, userId: req.user.id, sessionId: session._id, depth: result.rubric.depth, action: result.action });

  current.rubric = result.rubric;
  current.action = result.action;

  session.exchanges.push({ question: result.nextQuestion, answer: '' });
  await session.save();

  res.status(200).json({
    success: true,
    data: { answerText: transcriptData.text, rubric: result.rubric, action: result.action, nextQuestion: result.nextQuestion },
  });
});

exports.endViva = asyncHandler(async (req, res, next) => {
  const session = await vivaSessionRepository.findByIdForUser(req.params.id, req.user.id);
  if (!session) return next(AppError.notFound('Session not found'));

  session.exchanges = session.exchanges.filter(e => e.answer && e.answer.trim().length > 0);
  if (session.exchanges.length === 0) return next(AppError.validation('No answered questions to evaluate'));

  const report = await generateVivaReport(session);
  session.status = 'ended';
  session.report = report;
  await session.save();

  res.status(200).json({ success: true, data: session });
});

exports.getHistory = asyncHandler(async (req, res) => {
  const sessions = await vivaSessionRepository.findByUser(req.user.id);
  res.status(200).json({ success: true, count: sessions.length, data: sessions });
});