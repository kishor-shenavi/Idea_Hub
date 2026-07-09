const fs = require('fs');
const pdfParse = require('pdf-parse');
const InterviewSession = require('../models/InterviewSession');
const { transcribeAudio, generateQuestion, generateFeedbackReport } = require('../services/ai/interviewService');
const { ErrorResponse } = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/async');

// @desc    Start a new mock interview session
// @route   POST /api/v1/interview/start
// @access  Private (Accepts JSON body or multipart/form-data for PDF resume file)
exports.startSession = asyncHandler(async (req, res, next) => {
  const { targetRole, difficulty, interviewType, topics, questionsLimit } = req.body;

  if (!targetRole) {
    return next(new ErrorResponse('Please specify a target role', 400));
  }

  let resumeText = req.body.resumeText || '';

  // Extract PDF text if a resume is uploaded
  if (req.file) {
    try {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      resumeText = pdfData.text;
      fs.unlinkSync(req.file.path);
    } catch (err) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return next(new ErrorResponse('Failed to parse resume PDF. Please copy/paste text instead.', 400));
    }
  }

  // Create new session
  const session = new InterviewSession({
    user: req.user.id,
    targetRole,
    difficulty: difficulty || 'mid',
    interviewType: interviewType || 'technical',
    topics: topics || '',
    resumeText: resumeText || '',
    questionsLimit: parseInt(questionsLimit) || 5,
    messages: [],
  });

  // Generate the first question from the AI interviewer
  try {
    const aiResponse = await generateQuestion(session);
    session.messages.push({
      role: 'interviewer',
      content: aiResponse.response || aiResponse,
    });
    await session.save();
  } catch (err) {
    return next(new ErrorResponse(`Failed to generate first question: ${err.message}`, 500));
  }

  res.status(201).json({
    success: true,
    data: session,
  });
});

// @desc    Transcribe candidate audio dynamically (stateless STT)
// @route   POST /api/v1/interview/transcribe
// @access  Private
exports.transcribeCandidateAudio = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload an audio file to transcribe', 400));
  }

  try {
    const text = await transcribeAudio(req.file.path);
    fs.unlinkSync(req.file.path);
    
    res.status(200).json({
      success: true,
      text,
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return next(new ErrorResponse(`Failed to transcribe candidate audio: ${err.message}`, 400));
  }
});

// @desc    Submit candidate response (text only)
// @route   POST /api/v1/interview/:id/respond
// @access  Private
exports.submitResponse = asyncHandler(async (req, res, next) => {
  const session = await InterviewSession.findById(req.params.id);

  if (!session) {
    return next(new ErrorResponse('Interview session not found', 404));
  }

  if (session.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to access this session', 403));
  }

  if (session.status === 'completed') {
    return next(new ErrorResponse('This interview session is already completed', 400));
  }

  const answerText = req.body.answer || '';

  if (!answerText || !answerText.trim()) {
    return next(new ErrorResponse('Please provide a text answer or speak into your microphone', 400));
  }

  // Save candidate's answer
  session.messages.push({
    role: 'candidate',
    content: answerText.trim(),
  });

  try {
    const aiResponse = await generateQuestion(session);
    const questionsAsked = session.messages.filter(m => m.role === 'interviewer').length;

    // Check if the AI interviewer decided to conclude the interview (or if we hit the safety hard limit)
    const shouldWrapUp = aiResponse.action === 'wrap_up' || questionsAsked >= session.questionsLimit;

    // Save interviewer response
    session.messages.push({
      role: 'interviewer',
      content: aiResponse.response || aiResponse,
    });

    if (!shouldWrapUp) {
      await session.save();
      res.status(200).json({
        success: true,
        status: 'in_progress',
        data: {
          nextQuestion: aiResponse.response || aiResponse,
          session,
        },
      });
    } else {
      // Conclude the interview!
      session.status = 'completed';
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
          modelAnswer: Array.isArray(qa.modelAnswer) ? qa.modelAnswer.join('\n') : String(qa.modelAnswer || '')
        })) : []
      };

      session.report = report;
      await session.save();

      res.status(200).json({
        success: true,
        status: 'completed',
        data: {
          report,
          session,
        },
      });
    }
  } catch (err) {
    return next(new ErrorResponse(`Failed to process interviewer next step: ${err.message}`, 500));
  }
});

// @desc    Get user's mock interview history
// @route   GET /api/v1/interview/history
// @access  Private
exports.getHistory = asyncHandler(async (req, res) => {
  const sessions = await InterviewSession.find({ user: req.user.id })
    .select('targetRole difficulty interviewType status report.overallScore createdAt')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: sessions.length,
    data: sessions,
  });
});

// @desc    Get detailed mock interview session (with dialogue and report)
// @route   GET /api/v1/interview/:id
// @access  Private
exports.getSession = asyncHandler(async (req, res, next) => {
  const session = await InterviewSession.findById(req.params.id);

  if (!session) {
    return next(new ErrorResponse('Interview session not found', 404));
  }

  if (session.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to access this session', 403));
  }

  res.status(200).json({
    success: true,
    data: session,
  });
});
