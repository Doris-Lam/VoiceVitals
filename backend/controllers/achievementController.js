const HealthRecord = require('../models/HealthRecord');
const Vitals = require('../models/Vitals');
const Medication = require('../models/Medication');
const User = require('../models/User');

// Error handling wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Helper function to calculate current streak
const calculateCurrentStreak = (records) => {
  if (records.length === 0) return 0;
  
  const sortedRecords = records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const today = new Date();
  let streak = 0;
  let currentDate = new Date(today);
  
  for (let i = 0; i < 30; i++) {
    const dateString = currentDate.toDateString();
    const hasRecord = sortedRecords.some(record => 
      new Date(record.createdAt).toDateString() === dateString
    );
    
    if (hasRecord) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

// Helper function to calculate longest streak
const calculateLongestStreak = (records) => {
  if (records.length === 0) return 0;
  
  const sortedRecords = records.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  let maxStreak = 0;
  let currentStreak = 0;
  let lastDate = null;
  
  for (const record of sortedRecords) {
    const recordDate = new Date(record.createdAt);
    
    if (lastDate === null) {
      currentStreak = 1;
    } else {
      const daysDiff = Math.floor((recordDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }
    
    lastDate = recordDate;
  }
  
  maxStreak = Math.max(maxStreak, currentStreak);
  return maxStreak;
};

// Helper function to calculate water streak
const calculateWaterStreak = (records) => {
  if (records.length === 0) return 0;
  
  const sortedRecords = records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const today = new Date();
  let streak = 0;
  let currentDate = new Date(today);
  
  for (let i = 0; i < 30; i++) {
    const dateString = currentDate.toDateString();
    const hasWaterRecord = sortedRecords.some(record => 
      new Date(record.createdAt).toDateString() === dateString && record.waterIntake && record.waterIntake > 0
    );
    
    if (hasWaterRecord) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

// Helper function to calculate sleep streak
const calculateSleepStreak = (records) => {
  if (records.length === 0) return 0;
  
  const sortedRecords = records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const today = new Date();
  let streak = 0;
  let currentDate = new Date(today);
  
  for (let i = 0; i < 30; i++) {
    const dateString = currentDate.toDateString();
    const hasSleepRecord = sortedRecords.some(record => 
      new Date(record.createdAt).toDateString() === dateString && record.sleep?.hours
    );
    
    if (hasSleepRecord) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

// Get all achievements data
const getAchievementsData = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  // Fetch all data for the user
  const [healthRecords, vitals, medications] = await Promise.all([
    HealthRecord.find({ user: userId }).sort({ createdAt: -1 }),
    Vitals.find({ user: userId }).sort({ createdAt: -1 }),
    Medication.find({ user: userId }).sort({ createdAt: -1 })
  ]);

  // Calculate achievements
  const achievements = [];
  
  // First Recording Achievement
  if (healthRecords.length > 0) {
    achievements.push({
      id: '1',
      name: 'First Steps',
      description: 'Complete your first health recording',
      earned: true,
      earnedDate: healthRecords[0].createdAt,
      requirement: 'Record 1 health entry',
      category: 'milestone',
      rarity: 'common'
    });
  }

  // Streak Achievements
  const currentStreak = calculateCurrentStreak(healthRecords);
  const longestStreak = calculateLongestStreak(healthRecords);
  
  if (currentStreak >= 3) {
    achievements.push({
      id: '2',
      name: 'Streak Starter',
      description: 'Log symptoms for 3 consecutive days',
      earned: true,
      earnedDate: new Date(),
      requirement: '3-day streak',
      category: 'streak',
      rarity: 'common'
    });
  }

  if (currentStreak >= 7) {
    achievements.push({
      id: '3',
      name: 'Dedication',
      description: 'Maintain a 7-day health tracking streak',
      earned: true,
      earnedDate: new Date(),
      requirement: '7-day streak',
      category: 'streak',
      rarity: 'rare'
    });
  }

  if (currentStreak >= 30) {
    achievements.push({
      id: '4',
      name: 'Health Champion',
      description: 'Achieve a 30-day tracking streak',
      earned: true,
      earnedDate: new Date(),
      requirement: '30-day streak',
      category: 'streak',
      rarity: 'epic'
    });
  } else {
    achievements.push({
      id: '4',
      name: 'Health Champion',
      description: 'Achieve a 30-day tracking streak',
      earned: false,
      requirement: '30-day streak',
      category: 'streak',
      rarity: 'epic',
      progress: currentStreak,
      target: 30
    });
  }

  // Recording Count Achievements
  if (healthRecords.length >= 100) {
    achievements.push({
      id: '5',
      name: 'Wellness Warrior',
      description: 'Complete 100 health recordings',
      earned: true,
      earnedDate: new Date(),
      requirement: '100 recordings',
      category: 'milestone',
      rarity: 'legendary'
    });
  } else {
    achievements.push({
      id: '5',
      name: 'Wellness Warrior',
      description: 'Complete 100 health recordings',
      earned: false,
      requirement: '100 recordings',
      category: 'milestone',
      rarity: 'legendary',
      progress: healthRecords.length,
      target: 100
    });
  }

  // Water Tracking Achievement
  const waterStreak = calculateWaterStreak(healthRecords);
  if (waterStreak >= 14) {
    achievements.push({
      id: '6',
      name: 'Hydration Hero',
      description: 'Track water intake for 14 consecutive days',
      earned: true,
      earnedDate: new Date(),
      requirement: '14-day hydration streak',
      category: 'consistency',
      rarity: 'rare'
    });
  } else {
    achievements.push({
      id: '6',
      name: 'Hydration Hero',
      description: 'Track water intake for 14 consecutive days',
      earned: false,
      requirement: '14-day hydration streak',
      category: 'consistency',
      rarity: 'rare',
      progress: waterStreak,
      target: 14
    });
  }

  // Vitals Tracking Achievement
  if (vitals.length > 0) {
    achievements.push({
      id: '7',
      name: 'Vitals Master',
      description: 'Track your vital signs',
      earned: true,
      earnedDate: vitals[0].createdAt,
      requirement: 'Record vitals',
      category: 'achievement',
      rarity: 'common'
    });
  }

  // Medication Management Achievement
  if (medications.length > 0) {
    achievements.push({
      id: '8',
      name: 'Medication Manager',
      description: 'Set up medication tracking',
      earned: true,
      earnedDate: new Date(medications[0].startDate),
      requirement: 'Add medications',
      category: 'achievement',
      rarity: 'common'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      achievements,
      healthRecords: healthRecords.length,
      vitals: vitals.length,
      medications: medications.length
    }
  });
});

// Get user stats
const getUserStats = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  const [healthRecords, vitals, medications] = await Promise.all([
    HealthRecord.find({ user: userId }),
    Vitals.find({ user: userId }),
    Medication.find({ user: userId })
  ]);

  const currentStreak = calculateCurrentStreak(healthRecords);
  const longestStreak = calculateLongestStreak(healthRecords);
  const totalPoints = healthRecords.length * 10 + vitals.length * 15 + medications.length * 20;
  const level = Math.floor(totalPoints / 100) + 1;
  const nextLevelPoints = level * 100;

  res.status(200).json({
    status: 'success',
    data: {
      totalPoints,
      level,
      nextLevelPoints,
      currentStreak,
      longestStreak,
      badgesEarned: healthRecords.length > 0 ? 1 : 0, // At least First Steps
      totalBadges: 8 // Total possible badges
    }
  });
});

// Get progress rings data
const getProgressRings = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  const [healthRecords, vitals, medications] = await Promise.all([
    HealthRecord.find({ user: userId }),
    Vitals.find({ user: userId }),
    Medication.find({ user: userId })
  ]);

  const today = new Date();
  const todayRecords = healthRecords.filter(record => {
    const recordDate = new Date(record.createdAt);
    return recordDate.toDateString() === today.toDateString();
  });

  const todayVitals = vitals.filter(vital => {
    const vitalDate = new Date(vital.createdAt);
    return vitalDate.toDateString() === today.toDateString();
  });

  const todayMedications = medications.filter(med => med.isActive);

  const rings = [
    {
      id: '1',
      title: 'Daily Symptoms',
      current: todayRecords.length,
      target: 3,
      unit: 'entries',
      color: 'from-blue-500 to-blue-600',
      streak: calculateCurrentStreak(healthRecords)
    },
    {
      id: '2',
      title: 'Water Intake',
      current: todayRecords.reduce((total, record) => total + (record.waterIntake || 0), 0) / 250, // Convert ml to cups
      target: 8,
      unit: 'cups',
      color: 'from-cyan-500 to-cyan-600',
      streak: calculateWaterStreak(healthRecords)
    },
    {
      id: '3',
      title: 'Medication',
      current: todayMedications.length,
      target: Math.max(todayMedications.length, 1),
      unit: 'doses',
      color: 'from-green-500 to-green-600',
      streak: Math.min(todayMedications.length * 2, 7)
    },
    {
      id: '4',
      title: 'Sleep Hours',
      current: todayRecords.reduce((total, record) => total + (record.sleep?.hours || 0), 0) / Math.max(todayRecords.length, 1),
      target: 8,
      unit: 'hours',
      color: 'from-purple-500 to-purple-600',
      streak: calculateSleepStreak(healthRecords)
    }
  ];

  res.status(200).json({
    status: 'success',
    data: rings
  });
});

// Get challenges data
const getChallenges = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  const [healthRecords, medications] = await Promise.all([
    HealthRecord.find({ user: userId }),
    Medication.find({ user: userId })
  ]);

  const today = new Date();
  const todayRecords = healthRecords.filter(record => {
    const recordDate = new Date(record.createdAt);
    return recordDate.toDateString() === today.toDateString();
  });

  const thisWeekRecords = healthRecords.filter(record => {
    const recordDate = new Date(record.createdAt);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return recordDate >= weekAgo;
  });

  const thisMonthRecords = healthRecords.filter(record => {
    const recordDate = new Date(record.createdAt);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    return recordDate >= monthAgo;
  });

  const challenges = [
    {
      id: '1',
      title: 'Daily Hydration Goal',
      description: 'Drink 8 glasses of water today',
      type: 'daily',
      progress: Math.min(todayRecords.reduce((total, record) => total + (record.waterIntake || 0), 0) / 250, 8),
      target: 8,
      reward: '+10 Health Points',
      expiresAt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      category: 'hydration'
    },
    {
      id: '2',
      title: 'Symptom Tracker',
      description: 'Log your symptoms 3 times this week',
      type: 'weekly',
      progress: thisWeekRecords.length,
      target: 3,
      reward: 'Streak Badge',
      expiresAt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
      category: 'symptoms'
    },
    {
      id: '3',
      title: 'Medication Adherence',
      description: 'Take medications on time for 7 days',
      type: 'weekly',
      progress: Math.min(medications.filter(med => med.isActive).length * 2, 7),
      target: 7,
      reward: 'Consistency Badge',
      expiresAt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
      category: 'medication'
    },
    {
      id: '4',
      title: 'Sleep Quality Focus',
      description: 'Track sleep quality for 10 days this month',
      type: 'monthly',
      progress: thisMonthRecords.filter(record => record.sleep?.quality).length,
      target: 10,
      reward: 'Rest Master Badge',
      expiresAt: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
      category: 'sleep'
    }
  ];

  res.status(200).json({
    status: 'success',
    data: challenges
  });
});

// Get badges data
const getBadges = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  const [healthRecords, vitals, medications] = await Promise.all([
    HealthRecord.find({ user: userId }),
    Vitals.find({ user: userId }),
    Medication.find({ user: userId })
  ]);

  // This will return the same data as getAchievementsData
  // but formatted specifically for the badges tab
  const badges = [];
  
  // First Recording Badge
  if (healthRecords.length > 0) {
    badges.push({
      id: '1',
      name: 'First Steps',
      description: 'Complete your first health recording',
      earned: true,
      earnedDate: healthRecords[0].createdAt,
      requirement: 'Record 1 health entry',
      category: 'milestone',
      rarity: 'common'
    });
  }

  // Add more badges based on achievements logic...
  // (Same logic as in getAchievementsData)

  res.status(200).json({
    status: 'success',
    data: badges
  });
});

module.exports = {
  getAchievementsData,
  getUserStats,
  getProgressRings,
  getChallenges,
  getBadges
};
