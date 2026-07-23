const { z } = require('zod');

const startSessionSchema = z.object({
  topic: z.string().trim().min(3, 'Topic must be at least 3 characters'),
});

const personaTurnSchema = z.object({
  personaId: z.string().trim().min(1, 'personaId is required'),
});

const studentTurnSchema = z.object({
  wasInterruption: z.string().optional(), // arrives as string 'true'/'false' from multipart — controller does the === 'true' check
});

module.exports = { startSessionSchema, personaTurnSchema, studentTurnSchema };