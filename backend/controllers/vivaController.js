const fs = require('fs');
const pdfParse = require('pdf-parse');
const VivaSession = require('../models/VivaSession');
const { generateFirstQuestion, evaluateAndContinue } = require('../services/ai/vivaExaminerService');
const { generateVivaReport } = require('../services/ai/vivaReportService');
const { transcribeAudio } = require('../services/speech/transcriptionService');
const asyncHandler = require('../middlewares/async');
const { ErrorResponse } = require('../utils/errorHandler');

exports.startViva = asyncHandler(async (req, res, next) => {
  let reportText = '';

  if (req.file) {
    try {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      reportText = pdfData.text;
      fs.unlinkSync(req.file.path);
    } catch (err) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return next(new ErrorResponse('Failed to parse PDF. Please try pasting the report text instead.', 400));
    }
  } else if (req.body.reportText) {
    reportText = req.body.reportText;
  } else {
    return next(new ErrorResponse('Please upload a PDF or paste report text', 400));
  }

  if (reportText.trim().length < 50) {
    return next(new ErrorResponse('Report text is too short to conduct a viva on', 400));
  }

  const { question } = await generateFirstQuestion(reportText);

  const session = await VivaSession.create({
    user: req.user.id,
    reportText,
    reportTitle: req.body.reportTitle || 'Untitled Project',
    exchanges: [{ question, answer: '' }], // answer filled in when student responds
  });

  res.status(200).json({ success: true, data: { sessionId: session._id, question } });
});

exports.answerQuestion = asyncHandler(async (req, res, next) => {
  const session = await VivaSession.findOne({ _id: req.params.id, user: req.user.id });
  if (!session) return next(new ErrorResponse('Session not found', 404));
  if (session.status === 'ended') return next(new ErrorResponse('Viva already ended', 400));
  if (!req.file) return next(new ErrorResponse('No audio provided', 400));

  const transcriptData = await transcribeAudio(req.file.path);
  fs.unlink(req.file.path, () => {});

  if (!transcriptData.text || transcriptData.text.trim().length === 0) {
    return next(new ErrorResponse('No speech detected', 400));
  }

  // fill in the answer to the current open question
  const current = session.exchanges[session.exchanges.length - 1];
  current.answer = transcriptData.text;

  const result = await evaluateAndContinue({
    reportText: session.reportText,
    exchanges: session.exchanges,
    latestAnswer: transcriptData.text,
  });

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
  const session = await VivaSession.findOne({ _id: req.params.id, user: req.user.id });
  if (!session) return next(new ErrorResponse('Session not found', 404));

  session.exchanges = session.exchanges.filter(e => e.answer && e.answer.trim().length > 0);
  if (session.exchanges.length === 0) return next(new ErrorResponse('No answered questions to evaluate', 400));

  const report = await generateVivaReport(session);
  session.status = 'ended';
  session.report = report;
  await session.save();

  res.status(200).json({ success: true, data: session });
});

exports.getHistory = asyncHandler(async (req, res) => {
  const sessions = await VivaSession.find({ user: req.user.id })
    .select('reportTitle status report.overallScore createdAt')
    .sort('-createdAt');
  res.status(200).json({ success: true, count: sessions.length, data: sessions });
});