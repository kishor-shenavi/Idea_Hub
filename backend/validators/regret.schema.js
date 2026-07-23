// backend/validators/regret.schema.js
const { z } = require('zod');
const regretSchema = z.object({
  content: z.string().trim().min(5, 'Content is required'),
  yearItHappened: z.string().optional(),
  category: z.string().optional(),
});
module.exports = { regretSchema };