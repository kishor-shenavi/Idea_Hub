// backend/validators/chat.schema.js
const { z } = require('zod');
const postMessageSchema = z.object({ content: z.string().trim().min(1, 'Content is required') });
module.exports = { postMessageSchema };