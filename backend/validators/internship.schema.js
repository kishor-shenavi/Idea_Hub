// backend/validators/internship.schema.js
const { z } = require('zod');
const internshipSchema = z.object({
  company: z.string().trim().min(1, 'Company is required'),
  role: z.string().trim().min(1, 'Role is required'),
}).passthrough();
module.exports = { internshipSchema };