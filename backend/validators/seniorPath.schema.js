// backend/validators/seniorPath.schema.js
const { z } = require('zod');
const pathSchema = z.object({ title: z.string().trim().min(3, 'Title is required') }).passthrough();
module.exports = { pathSchema };