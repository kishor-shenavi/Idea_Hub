//correct 

// const express = require('express');
// const path = require('path');
// const cookieParser = require('cookie-parser');
// const cors = require('cors');
// const mongoSanitize = require('express-mongo-sanitize');
// const helmet = require('helmet');
// const xss = require('xss-clean');
// const rateLimit = require('express-rate-limit');
// const hpp = require('hpp');
// const { errorHandler } = require('./utils/errorHandler');
// const connectDB = require('./config/db');
// const routes = require('./routes');
// // Load env vars
// require('dotenv').config();

// // Connect to database
// connectDB();

// const app = express();

// // Body parser
// app.use(express.json());

// // Cookie parser
// app.use(cookieParser());

// // Sanitize data
// app.use(mongoSanitize());

// // Set security headers
// app.use(helmet());

// // Prevent XSS attacks
// app.use(xss());

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 10 * 60 * 1000, // 10 mins
//   max: 500,  
// });
// // app.use(limiter);
// app.use('/api/v1/auth', limiter);

// // Prevent http param pollution
// app.use(hpp());
 

// app.use((req, res, next) => {
//   console.log(`➡️ Route hit: ${req.method} ${req.originalUrl}`);
//   next();
// });
// app.set('trust proxy', 1);
// // Enable CORS
// app.use(cors({
//   origin: process.env.CLIENT_URL,
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// }));

// app.options('*', cors({
//   origin: process.env.CLIENT_URL,
//   credentials: true,
// }));
// console.log('✅ CORS Origin Allowed:', process.env.CLIENT_URL);


// // Set static folder
// app.use(express.static(path.join(__dirname, 'public')));

// // Mount routers
// // const routes = require('./routes');
// // app.use('/api/v1', routes);

// app.use('/api/v1', require('./routes/index'));
// app.get('/', (req, res) => {
//   res.send('✅ Welcome to Idea Hub Backend');
// });

// // Error handler (must come after all other middleware/routes)
// app.use(errorHandler);

// module.exports = app;












const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const { errorHandler } = require('./utils/errorHandler');
const connectDB = require('./config/db');

require('dotenv').config();
connectDB();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(hpp());

const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 500 });
app.use('/api/v1/auth', limiter);

app.use(cors({
  origin: process.env.CLIENT_URL,   // ✅ single source of truth
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use('/api/v1', require('./routes/index'));

app.get('/', (req, res) => {
  res.send('✅ Welcome to Idea Hub Backend');
});

app.use(errorHandler);

module.exports = app;
