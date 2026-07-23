require('dotenv').config();
const config =require('./config');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const fs = require('fs');

const connectDB = require('./config/db');
const { errorHandler } = require('./utils/errorHandler');
require('./config/passport');

// Ensure temp upload dir exists
if (!fs.existsSync('/tmp/uploads')) fs.mkdirSync('/tmp/uploads', { recursive: true });

connectDB();

const app = express();

const requestId = require('./middlewares/requestId');
const requestLogger = require('./middlewares/requestLogger');

app.use(requestId);
app.use(requestLogger);

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

app.use('/api/v1', require('./routes/healthRoute')); 


// ── Rate limiting ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50, // loosened — 20 was too tight given how often /auth/me gets called per session
  skip: (req) => req.method === 'OPTIONS',
  message: { success: false, error: 'Too many requests, please try again later' },
});
const generalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 500,
  skip: (req) => req.method === 'OPTIONS',
});
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1', generalLimiter);

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
   origin: process.env.CLIENT_URL || "http://localhost:3000", 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.options('*', cors({                                        // ← pass same options here too
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Passport ──────────────────────────────────────────────────────────────────
app.use(passport.initialize());



// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/v1', require('./routes/index'));

app.get('/', (req, res) => {
  res.json({ success: true, message: '✅ IdeaHub Backend is running' });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
