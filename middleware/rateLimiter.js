const rateLimit = require('express-rate-limit');

// General Rate Limiter (300 requests per 15 minutes per IP)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP address, please retry after 15 minutes.',
  },
});

// Authentication Rate Limiter (Brute-force mitigation: 20 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    if (req.xhr || req.headers.accept?.includes('application/json') || req.path.startsWith('/api/')) {
      return res.status(429).json({
        success: false,
        error: 'Too many authentication attempts. Please wait 15 minutes before retrying.',
      });
    }
    req.flash('error_msg', 'Too many login or registration attempts. Please wait 15 minutes for security.');
    return res.redirect('/login');
  },
});

// API Rate Limiter (120 requests per 15 minutes per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'API rate limit exceeded. Maximum 120 requests per 15 minutes allowed.',
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter,
};
