const { z } = require('zod');

const startVivaSchema = z.object({
  reportTitle: z.string().trim().max(150, 'Title is too long').optional(),
  reportText: z.string().trim().optional(), // only present when using the paste-text path, not the PDF path
});

module.exports = { startVivaSchema };