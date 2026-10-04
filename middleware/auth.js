const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'Please log in to access this area.');
  res.redirect('/login');
};

const ensureGuest = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  next();
};

const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Authentication internal error', details: err.message });
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or missing JWT bearer token. Use Authorization: Bearer <token>',
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = {
  ensureAuthenticated,
  ensureGuest,
  authenticateJWT,
};
