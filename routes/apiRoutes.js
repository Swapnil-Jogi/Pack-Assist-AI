const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { authenticateJWT } = require('../middleware/auth');
const { authLimiter, apiLimiter } = require('../middleware/rateLimiter');

// Apply general API rate limiter to all API endpoints
router.use(apiLimiter);

// Public route to exchange credentials for JWT Bearer token (with brute-force protection)
router.post('/auth/token', authLimiter, apiController.issueToken);

// Protected API routes using JWT Bearer authentication
router.post('/recommend', authenticateJWT, apiController.recommend);
router.get('/recommendations', authenticateJWT, apiController.getRecommendations);
router.get('/recommendations/:id', authenticateJWT, apiController.getRecommendationById);

module.exports = router;
