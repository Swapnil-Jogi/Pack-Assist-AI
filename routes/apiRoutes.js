const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { authenticateJWT } = require('../middleware/auth');
const { authLimiter, apiLimiter } = require('../middleware/rateLimiter');
const { validateApiToken, validateApiRecommendation, validateIdParam } = require('../middleware/validator');

// Apply general API rate limiter to all API endpoints
router.use(apiLimiter);

// Public route to exchange credentials for JWT Bearer token (with brute-force protection and Joi validation)
router.post('/auth/token', authLimiter, validateApiToken, apiController.issueToken);

// Protected API routes using JWT Bearer authentication and Joi validation
router.post('/recommend', authenticateJWT, validateApiRecommendation, apiController.recommend);
router.get('/recommendations', authenticateJWT, apiController.getRecommendations);
router.get('/recommendations/:id', authenticateJWT, validateIdParam, apiController.getRecommendationById);

module.exports = router;
