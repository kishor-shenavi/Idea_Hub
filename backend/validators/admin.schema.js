// backend/validators/admin.schema.js
const { z } = require('zod');
const approveProjectSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  adminFeedback: z.string().optional(),
});
const approveInternshipSchema = z.object({ status: z.enum(['active', 'rejected']) });
const updateUserSchema = z.object({
  name: z.string().optional(), role: z.string().optional(), year: z.string().optional(), branch: z.string().optional(),
});
module.exports = { approveProjectSchema, approveInternshipSchema, updateUserSchema };