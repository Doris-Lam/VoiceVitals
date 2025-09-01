const WaterRecord = require('../models/WaterRecord');
const catchAsync = require('../utils/catchAsync');

// Get today's water record and create if doesn't exist
const getTodayWater = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { dailyGoal } = req.query;
  
  const waterRecord = await WaterRecord.getOrCreateToday(
    userId, 
    dailyGoal ? parseInt(dailyGoal) : 8
  );
  
  res.status(200).json({
    status: 'success',
    data: {
      waterRecord
    }
  });
});

// Add water intake for today
const addWater = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { glasses, notes } = req.body;
  
  if (!glasses || glasses <= 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide a valid number of glasses'
    });
  }
  
  // Get or create today's water record
  let waterRecord = await WaterRecord.getOrCreateToday(userId);
  
  // Add water intake
  waterRecord.addWater(glasses, notes);
  await waterRecord.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      waterRecord,
      message: `Added ${glasses} glass${glasses > 1 ? 'es' : ''} of water! 💧`
    }
  });
});

// Get water history for charts
const getWaterHistory = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { days = 30 } = req.query;
  
  const history = await WaterRecord.getHistory(userId, parseInt(days));
  
  // Format data for charts
  const chartData = history.map(record => ({
    date: record.date,
    glasses: record.glasses,
    milliliters: record.totalIntake,
    goal: record.dailyGoal,
    percentage: record.percentageComplete,
    isCompleted: record.isCompleted,
    entries: record.entries.length
  }));
  
  res.status(200).json({
    status: 'success',
    data: {
      history: chartData,
      totalDays: chartData.length,
      averageGlasses: chartData.length > 0 
        ? Math.round(chartData.reduce((sum, day) => sum + day.glasses, 0) / chartData.length)
        : 0,
      bestDay: chartData.length > 0 
        ? Math.max(...chartData.map(day => day.glasses))
        : 0,
      goalCompletionRate: chartData.length > 0
        ? Math.round((chartData.filter(day => day.isCompleted).length / chartData.length) * 100)
        : 0
    }
  });
});

// Update daily water goal
const updateWaterGoal = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { dailyGoal } = req.body;
  
  if (!dailyGoal || dailyGoal < 1 || dailyGoal > 20) {
    return res.status(400).json({
      status: 'fail',
      message: 'Daily goal must be between 1 and 20 glasses'
    });
  }
  
  // Update today's record
  let waterRecord = await WaterRecord.getOrCreateToday(userId, dailyGoal);
  waterRecord.dailyGoal = dailyGoal;
  await waterRecord.save();
  
  // Update all future records (optional - you might want to keep historical goals)
  await WaterRecord.updateMany(
    { 
      user: userId, 
      date: { $gte: new Date() },
      dailyGoal: { $ne: dailyGoal }
    },
    { dailyGoal }
  );
  
  res.status(200).json({
    status: 'success',
    data: {
      waterRecord,
      message: `Daily water goal updated to ${dailyGoal} glasses`
    }
  });
});

// Get water statistics
const getWaterStats = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { period = 'month' } = req.query;
  
  const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
  const history = await WaterRecord.getHistory(userId, days);
  
  if (history.length === 0) {
    return res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalDays: 0,
          averageGlasses: 0,
          bestDay: 0,
          goalCompletionRate: 0,
          totalWater: 0,
          streak: 0
        }
      }
    });
  }
  
  // Calculate statistics
  const totalGlasses = history.reduce((sum, record) => sum + record.glasses, 0);
  const averageGlasses = Math.round(totalGlasses / history.length);
  const bestDay = Math.max(...history.map(record => record.glasses));
  const goalCompletionRate = Math.round(
    (history.filter(record => record.isCompleted).length / history.length) * 100
  );
  const totalWater = history.reduce((sum, record) => sum + record.totalIntake, 0);
  
  // Calculate current streak
  let streak = 0;
  const sortedHistory = history.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  for (let i = 0; i < sortedHistory.length; i++) {
    if (sortedHistory[i].glasses > 0) {
      streak++;
    } else {
      break;
    }
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalDays: history.length,
        averageGlasses,
        bestDay,
        goalCompletionRate,
        totalWater,
        streak
      }
    }
  });
});

// Reset today's water record (for testing or manual reset)
const resetToday = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  let waterRecord = await WaterRecord.getOrCreateToday(userId);
  waterRecord.resetDaily();
  await waterRecord.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      waterRecord,
      message: 'Today\'s water intake has been reset'
    }
  });
});

module.exports = {
  getTodayWater,
  addWater,
  getWaterHistory,
  updateWaterGoal,
  getWaterStats,
  resetToday
};
