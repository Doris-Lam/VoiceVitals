const WaterRecord = require('../models/WaterRecord');

// Function to check and create new day's water record
const ensureNewDayWaterRecord = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if today's record exists
    let todayRecord = await WaterRecord.findOne({
      user: userId,
      date: { $gte: today, $lt: tomorrow }
    });
    
    if (!todayRecord) {
      // Get user's preferred daily goal from last record or use default
      const lastRecord = await WaterRecord.findOne({ user: userId })
        .sort({ createdAt: -1 });
      
      const dailyGoal = lastRecord ? lastRecord.dailyGoal : 8;
      
      // Create new record for today
      todayRecord = await WaterRecord.create({
        user: userId,
        date: today,
        dailyGoal,
        totalIntake: 0,
        glasses: 0,
        entries: []
      });
      
      console.log(`💧 Created new water record for user ${userId} on ${today.toDateString()}`);
    }
    
    return todayRecord;
  } catch (error) {
    console.error('Error ensuring new day water record:', error);
    throw error;
  }
};

// Function to get all users and ensure they have today's water record
const ensureAllUsersHaveTodayRecord = async () => {
  try {
    // Get all unique user IDs from water records
    const users = await WaterRecord.distinct('user');
    
    for (const userId of users) {
      await ensureNewDayWaterRecord(userId);
    }
    
    console.log(`💧 Ensured water records for ${users.length} users`);
  } catch (error) {
    console.error('Error ensuring water records for all users:', error);
  }
};

// Function to clean up old water records (keep last 90 days)
const cleanupOldWaterRecords = async () => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const result = await WaterRecord.deleteMany({
      date: { $lt: ninetyDaysAgo }
    });
    
    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} old water records`);
    }
  } catch (error) {
    console.error('Error cleaning up old water records:', error);
  }
};

// Schedule daily tasks
const scheduleWaterTasks = () => {
  // Check every hour if we need to create new day records
  setInterval(async () => {
    const now = new Date();
    const hour = now.getHours();
    
    // At midnight (0:00), ensure all users have new day records
    if (hour === 0) {
      console.log('🕛 Midnight - Ensuring new day water records...');
      await ensureAllUsersHaveTodayRecord();
      
      // Also clean up old records weekly (on Sunday at midnight)
      const dayOfWeek = now.getDay();
      if (dayOfWeek === 0) { // Sunday
        console.log('🧹 Sunday midnight - Cleaning up old water records...');
        await cleanupOldWaterRecords();
      }
    }
  }, 60 * 60 * 1000); // Check every hour
  
  console.log('⏰ Water scheduler initialized - checking every hour for new day records');
};

// Export functions for manual use
module.exports = {
  ensureNewDayWaterRecord,
  ensureAllUsersHaveTodayRecord,
  cleanupOldWaterRecords,
  scheduleWaterTasks
};
