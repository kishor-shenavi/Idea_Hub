const REQUIRED_VARS = [
  'MONGO_URL', 'JWT_SECRET', 'CLIENT_URL',
  'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET',
  'ASSEMBLYAI_API_KEY', 'MESSAGE_ENCRYPTION_KEY',
];

const AI_PROVIDER_VARS = ['GROQ_API_KEY', 'OPENROUTER_API_KEY', 'GEMINI_API_KEY'];

function validateEnv() {
  const missing = REQUIRED_VARS.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  const hasAnyProvider = AI_PROVIDER_VARS.some(key => process.env[key]);
  if (!hasAnyProvider) {
    console.error(`❌ At least one AI provider key is required: ${AI_PROVIDER_VARS.join(', ')}`);
    process.exit(1);
  }
}

validateEnv();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  mongo: { uri: process.env.MONGO_URL },
  redis: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
  jwt: { secret: process.env.JWT_SECRET, expiresIn: process.env.JWT_EXPIRE || '30d' },

  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  },

  ai: {
    groq: process.env.GROQ_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY,
    gemini: process.env.GEMINI_API_KEY,
  },

  assemblyai: { apiKey: process.env.ASSEMBLYAI_API_KEY },
 messageEncryptionKey: process.env.MESSAGE_ENCRYPTION_KEY,
  isProd: process.env.NODE_ENV === 'production',
};