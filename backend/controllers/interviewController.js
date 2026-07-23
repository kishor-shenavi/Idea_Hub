// backend/controllers/interviewController.js
const fs = require('fs');
const pdfParse = require('pdf-parse');
const interviewSessionRepository = require('../repositories/interviewSession.repository');
const { transcribeAudio, generateQuestion, generateFeedbackReport } = require('../services/ai/interviewService');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/async');
const logger = require('../utils/logger');

exports.startSession = asyncHandler(async (req, res, next) => {
  const { targetRole, difficulty, interviewType, topics, questionsLimit } = req.body;
  let resumeText = req.body.resumeText || '';

  if (req.file) {
    try {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      resumeText = pdfData.text;
      fs.unlinkSync(req.file.path);
    } catch (err) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return next(AppError.validation('Failed to parse resume PDF. Please copy/paste text instead.'));
    }
  }

  const session = await interviewSessionRepository.create({
    user: req.user.id, targetRole, difficulty: difficulty || 'mid', interviewType: interviewType || 'technical',
    topics: topics || '', resumeText: resumeText || '', questionsLimit: parseInt(questionsLimit) || 5, messages: [],
  });

  try {
    const aiResponse = await generateQuestion(session);
    session.messages.push({ role: 'interviewer', content: aiResponse.response || aiResponse });
    await session.save();
  } catch (err) {
    return next(AppError.externalService(`Failed to generate first question: ${err.message}`));
  }

  res.status(201).json({ success: true, data: session });
});

exports.transcribeCandidateAudio = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(AppError.validation('Please upload an audio file to transcribe'));
  try {
    const text = await transcribeAudio(req.file.path);
    fs.unlinkSync(req.file.path);
    res.status(200).json({ success: true, text });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return next(AppError.externalService(`Failed to transcribe candidate audio: ${err.message}`));
  }
});

exports.submitResponse = asyncHandler(async (req, res, next) => {
  const session = await interviewSessionRepository.findById(req.params.id);
  if (!session) return next(AppError.notFound('Interview session not found'));
  if (session.user.toString() !== req.user.id) return next(AppError.forbidden('Not authorized to access this session'));
  if (session.status === 'completed') return next(AppError.validation('This interview session is already completed'));

  const answerText = req.body.answer.trim();
  session.messages.push({ role: 'candidate', content: answerText });

  try {
    const aiResponse = await generateQuestion(session);
    const questionsAsked = session.messages.filter(m => m.role === 'interviewer').length;
    const shouldWrapUp = aiResponse.action === 'wrap_up' || questionsAsked >= session.questionsLimit;

    session.messages.push({ role: 'interviewer', content: aiResponse.response || aiResponse });

    if (!shouldWrapUp) {
      await session.save();
      res.status(200).json({ success: true, status: 'in_progress', data: { nextQuestion: aiResponse.response || aiResponse, session } });
    } else {
      session.status = 'completed';
      logger.info('Generating interview feedback report', { requestId: req.id, userId: req.user.id, sessionId: session._id });
      const rawReport = await generateFeedbackReport(session);

      const report = {
        overallScore: typeof rawReport.overallScore === 'number' ? rawReport.overallScore : parseInt(rawReport.overallScore) || 70,
        summary: Array.isArray(rawReport.summary) ? rawReport.summary.join(' ') : String(rawReport.summary || ''),
        strengths: Array.isArray(rawReport.strengths) ? rawReport.strengths : [String(rawReport.strengths || '')],
        weaknesses: Array.isArray(rawReport.weaknesses) ? rawReport.weaknesses : [String(rawReport.weaknesses || '')],
        qaFeedback: Array.isArray(rawReport.qaFeedback) ? rawReport.qaFeedback.map(qa => ({
          question: Array.isArray(qa.question) ? qa.question.join(' ') : String(qa.question || ''),
          answer: Array.isArray(qa.answer) ? qa.answer.join(' ') : String(qa.answer || ''),
          score: typeof qa.score === 'number' ? qa.score : parseInt(qa.score) || 70,
          critique: Array.isArray(qa.critique) ? qa.critique.join(' ') : String(qa.critique || ''),
          modelAnswer: Array.isArray(qa.modelAnswer) ? qa.modelAnswer.join('\n') : String(qa.modelAnswer || ''),
        })) : [],
      };

      session.report = report;
      await session.save();
      res.status(200).json({ success: true, status: 'completed', data: { report, session } });
    }
  } catch (err) {
    return next(AppError.externalService(`Failed to process interviewer next step: ${err.message}`));
  }
});

exports.getHistory = asyncHandler(async (req, res) => {
  const sessions = await interviewSessionRepository.findByUser(req.user.id);
  res.status(200).json({ success: true, count: sessions.length, data: sessions });
});

exports.getSession = asyncHandler(async (req, res, next) => {
  const session = await interviewSessionRepository.findById(req.params.id);
  if (!session) return next(AppError.notFound('Interview session not found'));
  if (session.user.toString() !== req.user.id) return next(AppError.forbidden('Not authorized to access this session'));
  res.status(200).json({ success: true, data: session });
});