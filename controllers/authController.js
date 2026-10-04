const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.renderLogin = (req, res) => {
  res.render('login', {
    title: 'Sign In | Pack-Assist AI',
    user: req.user,
  });
};

exports.renderRegister = (req, res) => {
  res.render('register', {
    title: 'Create Account | Pack-Assist AI',
    user: req.user,
  });
};

exports.postRegister = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, company, role } = req.body;

    if (!name || !email || !password) {
      req.flash('error_msg', 'Please fill in all required fields.');
      return res.redirect('/register');
    }

    if (password.length < 6) {
      req.flash('error_msg', 'Password must be at least 6 characters long.');
      return res.redirect('/register');
    }

    if (confirmPassword && password !== confirmPassword) {
      req.flash('error_msg', 'Passwords do not match.');
      return res.redirect('/register');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      req.flash('error_msg', 'An account with that email already exists.');
      return res.redirect('/register');
    }

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      company: company ? company.trim() : 'Food Tech Innovations',
      role: role || 'Packaging Technologist',
    });

    // Auto-login newly registered user
    req.login(newUser, (err) => {
      if (err) {
        req.flash('success_msg', 'Account created! Please log in.');
        return res.redirect('/login');
      }
      req.flash('success_msg', `Welcome to Pack-Assist AI, ${newUser.name}!`);
      return res.redirect('/dashboard');
    });
  } catch (err) {
    console.error('Registration error:', err);
    req.flash('error_msg', 'Registration failed. ' + err.message);
    res.redirect('/register');
  }
};

exports.postLogin = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash('error', info && info.message ? info.message : 'Invalid email or password.');
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      req.flash('success_msg', `Welcome back, ${user.name || 'Scientist'}! Logged in successfully.`);
      return res.redirect('/dashboard');
    });
  })(req, res, next);
};

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success_msg', 'You have been logged out successfully.');
    res.redirect('/login');
  });
};



exports.issueJWT = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  const secret = process.env.JWT_SECRET || 'pack_assist_ai_super_secret_jwt_token_key_112233';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
};
