const express = require('express');
const achievementController = require('../controllers/achievementController');
const { protect } = require('../utils/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get achievements data
router.get('/', achievementController.getAchievementsData);

// Get user stats
router.get('/stats', achievementController.getUserStats);

// Get progress rings data
router.get('/progress-rings', achievementController.getProgressRings);

// Get challenges data
router.get('/challenges', achievementController.getChallenges);

// Get badges data
router.get('/badges', achievementController.getBadges);

module.exports = router;
