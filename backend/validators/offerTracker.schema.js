// backend/validators/offerTracker.schema.js
const { z } = require('zod');
const offerSchema = z.object({ company: z.string().trim().min(1, 'Company is required') }).passthrough();
module.exports = { offerSchema };