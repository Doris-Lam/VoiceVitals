const UserSettings = require('../models/UserSettings');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Error handling wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Get user settings
const getUserSettings = catchAsync(async (req, res, next) => {
  let settings = await UserSettings.findOne({ user: req.user.id });

  // If no settings exist, create default settings
  if (!settings) {
    settings = await UserSettings.create({
      user: req.user.id,
      // Default values will be applied by the schema
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      settings
    }
  });
});

// Update user settings
const updateUserSettings = catchAsync(async (req, res, next) => {
  const { general, notifications, privacy, accessibility, data } = req.body;

  // Build update object with only provided fields
  const updateData = {};
  if (general) updateData.general = general;
  if (notifications) updateData.notifications = notifications;
  if (privacy) updateData.privacy = privacy;
  if (accessibility) updateData.accessibility = accessibility;
  if (data) updateData.data = data;

  // Find and update settings, or create if doesn't exist
  let settings = await UserSettings.findOneAndUpdate(
    { user: req.user.id },
    updateData,
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      settings
    }
  });
});

// Update specific setting category
const updateSettingCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const updateData = req.body;

  // Validate category
  const allowedCategories = ['general', 'notifications', 'privacy', 'accessibility', 'data'];
  if (!allowedCategories.includes(category)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid settings category'
    });
  }

  const settings = await UserSettings.findOneAndUpdate(
    { user: req.user.id },
    { [category]: updateData },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      settings
    }
  });
});

// Delete all user data (for account deletion)
const deleteUserData = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  console.log('🗑️ Deleting user account and all data for user:', userId);

  try {
    // Import all models
    const HealthRecord = require('../models/HealthRecord');
    const Vitals = require('../models/Vitals');
    const Medication = require('../models/Medication');
    const WaterRecord = require('../models/WaterRecord');

    const User = require('../models/User');

    // Delete all user-related data
    const deletePromises = [
      UserSettings.findOneAndDelete({ user: userId }),
      HealthRecord.deleteMany({ user: userId }),
      Vitals.deleteMany({ user: userId }),
      Medication.deleteMany({ user: userId }),
      WaterRecord.deleteMany({ user: userId }),

    ];

    // Wait for all deletions to complete
    await Promise.all(deletePromises);
    console.log('✅ All user data deleted successfully');

    // Delete the user account itself
    await User.findByIdAndDelete(userId);
    console.log('✅ User account deleted successfully');

    res.status(200).json({
      status: 'success',
      message: 'User account and all associated data have been permanently deleted'
    });
  } catch (error) {
    console.error('❌ Error deleting user account:', error);
    return res.status(500).json({
      status: 'fail',
      message: 'Failed to delete user account. Please try again.'
    });
  }
});

// Reset settings to default
const resetSettings = catchAsync(async (req, res, next) => {
  // Delete existing settings (new ones with defaults will be created on next access)
  await UserSettings.findOneAndDelete({ user: req.user.id });

  // Create new default settings
  const settings = await UserSettings.create({
    user: req.user.id
  });

  res.status(200).json({
    status: 'success',
    data: {
      settings
    }
  });
});

// Change user password
const changePassword = catchAsync(async (req, res, next) => {
  console.log('🔐 Change password request received:', { userId: req.user.id });
  const { currentPassword, newPassword } = req.body;

  // Validate input
  if (!currentPassword || !newPassword) {
    console.log('❌ Missing password fields');
    return res.status(400).json({
      status: 'fail',
      message: 'Current password and new password are required'
    });
  }

  if (newPassword.length < 6) {
    console.log('❌ Password too short');
    return res.status(400).json({
      status: 'fail',
      message: 'New password must be at least 6 characters long'
    });
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    console.log('❌ User not found:', req.user.id);
    return res.status(404).json({
      status: 'fail',
      message: 'User not found'
    });
  }

  console.log('✅ User found:', user.email);

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    console.log('❌ Current password incorrect');
    return res.status(400).json({
      status: 'fail',
      message: 'Current password is incorrect'
    });
  }

  console.log('✅ Current password verified');

  // Update password (the pre-save hook will hash it automatically)
  user.password = newPassword;
  console.log('🔐 About to save user with new password');
  
  try {
    await user.save();
    console.log('✅ Password saved successfully');
  } catch (saveError) {
    console.error('❌ Error saving password:', saveError);
    return res.status(500).json({
      status: 'fail',
      message: 'Failed to save new password'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully'
  });
});

module.exports = {
  getUserSettings,
  updateUserSettings,
  updateSettingCategory,
  deleteUserData,
  resetSettings,
  changePassword
};
