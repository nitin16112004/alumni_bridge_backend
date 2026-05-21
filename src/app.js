const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUEST) || 500;

const limiter = rateLimit({ windowMs, max: maxRequests });
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs,
  max: process.env.NODE_ENV === 'production' ? Math.min(maxRequests, 20) : maxRequests,
});
app.use('/api/auth/', authLimiter);

app.use('/api/auth', require('../routes/auth'));
app.use('/api/users', require('../routes/users'));
app.use('/api/colleges', require('../routes/colleges'));
app.use('/api/mentors', require('../routes/mentors'));
app.use('/api/mentorship', require('../routes/mentorship'));
app.use('/api/chat', require('../routes/chat'));
app.use('/api/ai', require('../routes/ai'));
app.use('/api/discussions', require('../routes/discussions'));
app.use('/api/jobs', require('../routes/jobs'));
app.use('/api/events', require('../routes/events'));
app.use('/api/notifications', require('../routes/notifications'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
