const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Medication must belong to a user']
  },
  name: {
    type: String,
    required: [true, 'Please provide medication name'],
    trim: true,
    maxlength: [100, 'Medication name cannot be more than 100 characters']
  },
  dosage: {
    type: String,
    required: [true, 'Please provide dosage information'],
    trim: true,
    maxlength: [50, 'Dosage cannot be more than 50 characters']
  },
  frequency: {
    type: String,
    required: [true, 'Please provide frequency information'],
    trim: true,
    maxlength: [100, 'Frequency cannot be more than 100 characters']
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: [500, 'Instructions cannot be more than 500 characters']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['prescription', 'over-the-counter', 'supplement', 'other'],
    default: 'prescription'
  },
  sideEffects: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  prescribedBy: {
    type: String,
    trim: true,
    maxlength: [100, 'Prescriber name cannot be more than 100 characters']
  },
  pharmacy: {
    type: String,
    trim: true,
    maxlength: [100, 'Pharmacy name cannot be more than 100 characters']
  },
  refillReminder: {
    type: Boolean,
    default: false
  },
  refillDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
medicationSchema.index({ user: 1, isActive: 1 });
medicationSchema.index({ user: 1, category: 1 });
medicationSchema.index({ refillReminder: 1, refillDate: 1 });

// Virtual for medication duration
medicationSchema.virtual('duration').get(function() {
  if (this.endDate && this.startDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return null;
});

// Pre-save middleware to handle end date logic
medicationSchema.pre('save', function(next) {
  if (this.endDate && this.endDate < new Date()) {
    this.isActive = false;
  }
  next();
});

const Medication = mongoose.model('Medication', medicationSchema);

module.exports = Medication;
