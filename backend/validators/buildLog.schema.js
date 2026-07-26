const { z } = require('zod');
const buildLogSchema = z.object({ projectTitle: z.string().trim().min(1, 'Project title is required') }).passthrough();
module.exports = { buildLogSchema };