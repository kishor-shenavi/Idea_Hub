// backend/validators/project.schema.js
const { z } = require('zod');
const createProjectSchema = z.object({
  title: z.string().trim().min(3, 'Title is required'),
  description: z.string().trim().min(10, 'Description is required'),
  category: z.string().trim().optional(),
  difficulty: z.string().trim().optional(),
  techStack: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
}).passthrough(); // your model likely has more optional fields (githubUrl, demoUrl, etc.) — passthrough avoids re-declaring every one just to allow them through
const commentSchema = z.object({
  content: z.string().trim().min(1, 'Content is required'),
  parentComment: z.string().optional().nullable(),
});
module.exports = { createProjectSchema, commentSchema };