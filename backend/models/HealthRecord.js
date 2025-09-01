const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Health record must belong to a user']
  },
  transcript: {
    type: String,
    required: function() {
      return this.recordType === 'voice';
    },
    trim: true
  },
  symptoms: [{
    name: {
      type: String,
      required: true
    },
    severity: {
      type: Number,
      min: 1,
      max: 10
    },
    duration: String,
    notes: String
  }],
  severity: {
    type: Number,
    min: 1,
    max: 10,
    description: 'Overall severity of health condition'
  },
  medications: [{
    name: {
      type: String,
      required: true
    },
    dosage: String,
    frequency: String,
    timesTaken: [{
      time: Date,
      notes: String
    }]
  }],
  vitals: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      timestamp: Date
    },
    heartRate: {
      bpm: Number,
      timestamp: Date
    },
    temperature: {
      value: Number,
      unit: { type: String, enum: ['celsius', 'fahrenheit'], default: 'celsius' },
      timestamp: Date
    },
    weight: {
      value: Number,
      unit: { type: String, enum: ['kg', 'lbs'], default: 'kg' },
      timestamp: Date
    }
  },
  waterIntake: {
    type: Number,
    min: 0,
    description: 'Water intake in milliliters'
  },
  sleep: {
    hours: {
      type: Number,
      min: 0,
      max: 24,
      description: 'Hours of sleep'
    },
    quality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent'],
      description: 'Sleep quality rating'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  aiAnalysis: {
    summary: String,
    recommendations: [String],
    urgencyLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'low'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    processedAt: {
      type: Date,
      default: Date.now
    }
  },
  tags: [String],
  isPrivate: {
    type: Boolean,
    default: true
  },
  recordType: {
    type: String,
    enum: ['voice', 'manual', 'imported', 'water'],
    default: 'voice'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
healthRecordSchema.index({ user: 1, createdAt: -1 });
healthRecordSchema.index({ 'aiAnalysis.urgencyLevel': 1 });
healthRecordSchema.index({ tags: 1 });

// Virtual for days since record
healthRecordSchema.virtual('daysAgo').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);

module.exports = HealthRecord;
