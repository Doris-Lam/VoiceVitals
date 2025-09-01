const mongoose = require('mongoose');

const waterRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Water record must belong to a user']
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  dailyGoal: {
    type: Number,
    default: 8, // Default 8 glasses (1920ml)
    min: 1,
    max: 20
  },
  totalIntake: {
    type: Number,
    default: 0,
    min: 0,
    description: 'Total water intake in milliliters for the day'
  },
  glasses: {
    type: Number,
    default: 0,
    min: 0,
    description: 'Total water intake in glasses for the day'
  },
  entries: [{
    amount: {
      type: Number,
      required: true,
      min: 1,
      description: 'Amount in glasses'
    },
    milliliters: {
      type: Number,
      required: true,
      min: 240,
      description: 'Amount in milliliters'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  isCompleted: {
    type: Boolean,
    default: false,
    description: 'Whether the daily goal was met'
  },
  completedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure one record per user per day
waterRecordSchema.index({ user: 1, date: 1 }, { unique: true });

// Virtual for percentage of daily goal
waterRecordSchema.virtual('percentageComplete').get(function() {
  if (this.dailyGoal === 0) return 0;
  return Math.min((this.glasses / this.dailyGoal) * 100, 100);
});

// Virtual for remaining glasses
waterRecordSchema.virtual('remainingGlasses').get(function() {
  return Math.max(this.dailyGoal - this.glasses, 0);
});

// Method to add water intake
waterRecordSchema.methods.addWater = function(glasses, notes = '') {
  const milliliters = glasses * 240; // 1 glass = 240ml
  
  this.entries.push({
    amount: glasses,
    milliliters,
    timestamp: new Date(),
    notes
  });
  
  this.totalIntake += milliliters;
  this.glasses += glasses;
  
  // Check if goal is completed
  if (this.glasses >= this.dailyGoal && !this.isCompleted) {
    this.isCompleted = true;
    this.completedAt = new Date();
  }
  
  return this;
};

// Method to reset daily intake (for new day)
waterRecordSchema.methods.resetDaily = function() {
  this.totalIntake = 0;
  this.glasses = 0;
  this.entries = [];
  this.isCompleted = false;
  this.completedAt = undefined;
  this.date = new Date();
  return this;
};

// Static method to get or create today's water record
waterRecordSchema.statics.getOrCreateToday = async function(userId, dailyGoal = 8) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of day
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  let waterRecord = await this.findOne({
    user: userId,
    date: { $gte: today, $lt: tomorrow }
  });
  
  if (!waterRecord) {
    waterRecord = await this.create({
      user: userId,
      date: today,
      dailyGoal,
      totalIntake: 0,
      glasses: 0,
      entries: []
    });
  }
  
  return waterRecord;
};

// Static method to get historical data
waterRecordSchema.statics.getHistory = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  
  return await this.find({
    user: userId,
    date: { $gte: startDate }
  }).sort({ date: 1 });
};

const WaterRecord = mongoose.model('WaterRecord', waterRecordSchema);

module.exports = WaterRecord;
