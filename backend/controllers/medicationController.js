const Medication = require('../models/Medication');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Helper function to create AppError
const createAppError = (message, statusCode) => {
  return new AppError(message, statusCode);
};

// Get all medications for a user
exports.getUserMedications = catchAsync(async (req, res, next) => {
  const medications = await Medication.find({ user: req.user.id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: medications.length,
    data: {
      medications
    }
  });
});

// Get a single medication
exports.getMedication = catchAsync(async (req, res, next) => {
  const medication = await Medication.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!medication) {
    return next(createAppError('No medication found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      medication
    }
  });
});

// Create a new medication
exports.createMedication = catchAsync(async (req, res, next) => {
  // Add user ID to the request body
  req.body.user = req.user.id;

  const medication = await Medication.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      medication
    }
  });
});

// Update a medication
exports.updateMedication = catchAsync(async (req, res, next) => {
  const medication = await Medication.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user.id
    },
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!medication) {
    return next(createAppError('No medication found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      medication
    }
  });
});

// Delete a medication
exports.deleteMedication = catchAsync(async (req, res, next) => {
  const medication = await Medication.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id
  });

  if (!medication) {
    return next(createAppError('No medication found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get medications by category
exports.getMedicationsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  
  const medications = await Medication.find({
    user: req.user.id,
    category: category
  }).sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: medications.length,
    data: {
      medications
    }
  });
});

// Get active medications
exports.getActiveMedications = catchAsync(async (req, res, next) => {
  const medications = await Medication.find({
    user: req.user.id,
    isActive: true
  }).sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: medications.length,
    data: {
      medications
    }
  });
});

// Toggle medication active status
exports.toggleMedicationStatus = catchAsync(async (req, res, next) => {
  const medication = await Medication.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!medication) {
    return next(createAppError('No medication found with that ID', 404));
  }

  medication.isActive = !medication.isActive;
  await medication.save();

  res.status(200).json({
    status: 'success',
    data: {
      medication
    }
  });
});

// Get medications with refill reminders
exports.getRefillReminders = catchAsync(async (req, res, next) => {
  const medications = await Medication.find({
    user: req.user.id,
    refillReminder: true,
    refillDate: { $lte: new Date() }
  }).sort({ refillDate: 1 });

  res.status(200).json({
    status: 'success',
    results: medications.length,
    data: {
      medications
    }
  });
});

// Search medications
exports.searchMedications = catchAsync(async (req, res, next) => {
  const { query } = req.query;
  
  if (!query) {
    return next(createAppError('Please provide a search query', 400));
  }

  const medications = await Medication.find({
    user: req.user.id,
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { notes: { $regex: query, $options: 'i' } },
      { prescribedBy: { $regex: query, $options: 'i' } }
    ]
  }).sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: medications.length,
    data: {
      medications
    }
  });
});
