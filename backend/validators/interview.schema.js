// backend/validators/interview.schema.js
const { z } = require('zod');
const startInterviewSchema = z.object({
  targetRole: z.string().trim().min(1, 'Please specify a target role'),
  difficulty: z.string().optional(),
  interviewType: z.string().optional(),
  topics: z.string().optional(),
  resumeText: z.string().optional(),
  questionsLimit: z.string().optional(), // arrives as string from multipart, parseInt'd in controller
});
const respondSchema = z.object({ answer: z.string().trim().min(1, 'Please provide a text answer') });
module.exports = { startInterviewSchema, respondSchema };