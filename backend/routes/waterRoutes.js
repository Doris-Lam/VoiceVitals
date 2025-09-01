const express = require('express');
const waterController = require('../controllers/waterController');
const { protect } = require('../utils/auth');

const router = express.Router();

// Protect all routes - require authentication
router.use(protect);

// Get today's water record
router.get('/today', waterController.getTodayWater);

// Add water intake
router.post('/add', waterController.addWater);

// Get water history for charts
router.get('/history', waterController.getWaterHistory);

// Update daily water goal
router.put('/goal', waterController.updateWaterGoal);

// Get water statistics
router.get('/stats', waterController.getWaterStats);

// Reset today's water (for testing)
router.post('/reset', waterController.resetToday);

module.exports = router;
