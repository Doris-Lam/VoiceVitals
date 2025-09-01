const express = require('express');
const router = express.Router();
const {
  getUserSettings,
  updateUserSettings,
  updateSettingCategory,
  deleteUserData,
  resetSettings,
  changePassword
} = require('../controllers/settingsController');
const { protect } = require('../utils/auth');

// All routes require authentication
router.use(protect);

// Change password (place this first to avoid conflicts)
router.post('/change-password', changePassword);

// Settings routes
router.route('/')
  .get(getUserSettings)
  .put(updateUserSettings);

// Update specific category
router.put('/category/:category', updateSettingCategory);



// Delete all user data
router.delete('/delete-account', deleteUserData);

// Reset settings to default
router.post('/reset', resetSettings);

module.exports = router;
