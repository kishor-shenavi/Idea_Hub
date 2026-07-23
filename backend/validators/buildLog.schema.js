// backend/validators/buildLog.schema.js
const { z } = require('zod');
const buildLogSchema = z.object({ title: z.string().trim().min(1, 'Title is required') }).passthrough();
module.exports = { buildLogSchema };