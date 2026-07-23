const { z } = require('zod');

const generateRoadmapSchema = z.object({
  year: z.coerce.number().int().min(1).max(4), // coerce handles both "2" and 2 cleanly
  branch: z.string().trim().min(1, 'branch is required'),
  goalType: z.string().trim().min(1, 'goalType is required'),
  interests: z.array(z.string()).optional(),
});

const suggestProjectsSchema = z.object({
  year: z.coerce.number().int().min(1).max(4),
  branch: z.string().trim().min(1, 'branch is required'),
  interests: z.array(z.string()).optional(),
  difficulty: z.string().optional(),
});

const quizSchema = z.object({
  topic: z.string().min(1, 'topic is required'),
  difficulty: z.string().optional(),
  count: z.number().optional(),
});

const resourcesSchema = z.object({
  topic: z.string().min(1, 'topic is required'),
  context: z.string().optional(),
});

module.exports = { generateRoadmapSchema, suggestProjectsSchema, quizSchema, resourcesSchema };