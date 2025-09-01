const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Vitals must belong to a user']
  },
  bloodPressure: {
    systolic: {
      type: Number,
      min: 70,
      max: 200,
      required: false
    },
    diastolic: {
      type: Number,
      min: 40,
      max: 130,
      required: false
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  heartRate: {
    bpm: {
      type: Number,
      min: 40,
      max: 200,
      required: false
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  temperature: {
    value: {
      type: Number,
      min: 30,
      max: 45,
      required: false
    },
    unit: {
      type: String,
      enum: ['celsius', 'fahrenheit'],
      default: 'celsius'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  weight: {
    value: {
      type: Number,
      min: 20,
      max: 300,
      required: false
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  aiAnalysis: {
    summary: String,
    insights: [String],
    recommendations: [String],
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    processedAt: {
      type: Date,
      default: Date.now
    }
  },
  isPrivate: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
vitalsSchema.index({ user: 1, createdAt: -1 });
vitalsSchema.index({ 'bloodPressure.timestamp': -1 });
vitalsSchema.index({ 'heartRate.timestamp': -1 });
vitalsSchema.index({ 'temperature.timestamp': -1 });
vitalsSchema.index({ 'weight.timestamp': -1 });

// Virtual for days since record
vitalsSchema.virtual('daysAgo').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for hasAnyVitals
vitalsSchema.virtual('hasAnyVitals').get(function() {
  return !!(this.bloodPressure || this.heartRate || this.temperature || this.weight);
});

const Vitals = mongoose.model('Vitals', vitalsSchema);

module.exports = Vitals;
