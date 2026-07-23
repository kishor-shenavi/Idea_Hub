const { z } = require('zod');

const analyzeResumeSchema = z.object({
  resumeText: z.string().trim().optional(),
  jobDescription: z.string().trim().max(5000, 'Job description is too long').optional(),
  targetRole: z.string().trim().max(100, 'Target role is too long').optional(),
});

module.exports = { analyzeResumeSchema };