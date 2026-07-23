// backend/validators/companyWiki.schema.js
const { z } = require('zod');
const wikiSchema = z.object({ company: z.string().trim().min(1, 'Company is required') }).passthrough();
module.exports = { wikiSchema };