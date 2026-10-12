const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureGuest } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateRegister, validateLogin } = require('../middleware/validator');

// Views for authentication
router.get('/login', ensureGuest, authController.renderLogin);
router.post('/login', authLimiter, validateLogin, authController.postLogin);

router.get('/register', ensureGuest, authController.renderRegister);
router.post('/register', authLimiter, validateRegister, authController.postRegister);

router.get('/logout', authController.logout);

module.exports = router;
