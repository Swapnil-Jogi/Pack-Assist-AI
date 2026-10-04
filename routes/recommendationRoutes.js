const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { ensureAuthenticated } = require('../middleware/auth');

// Protected User Dashboard
router.get('/dashboard', ensureAuthenticated, recommendationController.renderDashboard);

// Packaging Assessment Form & Processing
router.get('/recommend', ensureAuthenticated, recommendationController.renderRecommendForm);
router.post('/recommend', ensureAuthenticated, recommendationController.createRecommendation);

// Interactive Recommendation Result Page
router.get('/recommend/:id', ensureAuthenticated, recommendationController.renderResult);

// PDF Technical Datasheet Generation
router.get('/recommend/:id/pdf', ensureAuthenticated, recommendationController.downloadPDF);

// Delete Assessment Record
router.post('/recommend/:id/delete', ensureAuthenticated, recommendationController.deleteRecommendation);

// Legacy /history Redirect to Dashboard
router.get('/history', ensureAuthenticated, (req, res) => res.redirect('/dashboard'));

module.exports = router;
