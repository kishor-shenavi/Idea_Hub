// backend/validators/mentor.schema.js
const { z } = require('zod');
const sendRequestSchema = z.object({
  seniorId: z.string().min(1, 'seniorId is required'),
  projectId: z.string().optional().nullable(),
  message: z.string().trim().optional(),
});
const respondSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
  responseMessage: z.string().trim().optional(),
});
module.exports = { sendRequestSchema, respondSchema };