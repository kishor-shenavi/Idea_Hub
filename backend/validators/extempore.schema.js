const { z } = require('zod');

const analyzeSpeechSchema = z.object({
  topic: z.string().trim().min(3, 'Topic is required'),
  audioAnalysis: z.string().min(1, 'Audio analysis data is required'), // raw JSON string, parsed in controller
});

module.exports = { analyzeSpeechSchema };