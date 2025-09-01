const Vitals = require('../models/Vitals');
const { analyzeVitalsData } = require('../services/geminiService');

// Error handling wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Create new vitals record
const createVitals = catchAsync(async (req, res, next) => {
  const { bloodPressure, heartRate, temperature, weight, notes } = req.body;

  console.log('💓 Creating new vitals record:', { bloodPressure, heartRate, temperature, weight, notes });
  console.log('👤 User ID:', req.user.id);

  // Check if at least one vital sign is provided
  const hasVitals = bloodPressure || heartRate || temperature || weight;
  if (!hasVitals) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide at least one vital sign'
    });
  }

  // Generate AI analysis for the vitals
  let aiAnalysis = {};
  try {
    console.log('🤖 Generating AI analysis for vitals...');
    const vitalsForAnalysis = { bloodPressure, heartRate, temperature, weight };
    console.log('📊 Vitals being analyzed:', JSON.stringify(vitalsForAnalysis, null, 2));
    
    aiAnalysis = await analyzeVitalsData(vitalsForAnalysis);
    console.log('✅ AI analysis completed:', JSON.stringify(aiAnalysis, null, 2));
  } catch (error) {
    console.error('❌ AI analysis failed:', error);
    console.error('Error details:', error.message, error.stack);
    // Use the same medical fallback analysis as the AI service
    console.log('🔄 Using medical fallback analysis in controller...');
    const { generateMedicalFallbackAnalysis } = require('../services/geminiService');
    aiAnalysis = generateMedicalFallbackAnalysis({ bloodPressure, heartRate, temperature, weight });
  }

  // Create vitals record with AI analysis
  const vitalsRecord = await Vitals.create({
    user: req.user.id,
    bloodPressure,
    heartRate,
    temperature,
    weight,
    notes,
    aiAnalysis
  });

  console.log('✅ Vitals record created:', vitalsRecord._id);

  res.status(201).json({
    status: 'success',
    data: {
      vitals: vitalsRecord
    }
  });
});

// Get all vitals for current user
const getMyVitals = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const vitals = await Vitals.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await Vitals.countDocuments({ user: req.user.id });

  res.status(200).json({
    status: 'success',
    results: vitals.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      vitals
    }
  });
});

// Get specific vitals record
const getVitals = catchAsync(async (req, res, next) => {
  const vitals = await Vitals.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!vitals) {
    return res.status(404).json({
      status: 'fail',
      message: 'No vitals record found with that ID'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      vitals
    }
  });
});

// Update vitals record
const updateVitals = catchAsync(async (req, res, next) => {
  const allowedFields = ['bloodPressure', 'heartRate', 'temperature', 'weight', 'notes', 'isPrivate'];
  const filteredBody = {};
  Object.keys(req.body).forEach(el => {
    if (allowedFields.includes(el)) {
      filteredBody[el] = req.body[el];
    }
  });

  const vitals = await Vitals.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    filteredBody,
    {
      new: true,
      runValidators: true
    }
  );

  if (!vitals) {
    return res.status(404).json({
      status: 'fail',
      message: 'No vitals record found with that ID'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      vitals
    }
  });
});

// Delete vitals record
const deleteVitals = catchAsync(async (req, res, next) => {
  const vitals = await Vitals.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id
  });

  if (!vitals) {
    return res.status(404).json({
      status: 'fail',
      message: 'No vitals record found with that ID'
    });
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Regenerate AI analysis for a specific vitals record
const regenerateAIAnalysis = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  console.log('🤖 Regenerating AI analysis for vitals record:', id);
  
  const vitals = await Vitals.findOne({
    _id: id,
    user: req.user.id
  });

  if (!vitals) {
    return res.status(404).json({
      status: 'fail',
      message: 'No vitals record found with that ID'
    });
  }

  try {
    // Extract vitals data for analysis
    const vitalsData = {};
    if (vitals.bloodPressure) vitalsData.bloodPressure = vitals.bloodPressure;
    if (vitals.heartRate) vitalsData.heartRate = vitals.heartRate;
    if (vitals.temperature) vitalsData.temperature = vitals.temperature;
    if (vitals.weight) vitalsData.weight = vitals.weight;

    // Check if we have any vitals data to analyze
    if (Object.keys(vitalsData).length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No vitals data available for analysis'
      });
    }

    console.log('📊 Regenerating analysis for:', vitalsData);
    console.log('🔑 Gemini API Key present:', !!process.env.GEMINI_API_KEY);
    
    // Generate new AI analysis
    const newAIAnalysis = await analyzeVitalsData(vitalsData);
    
    if (!newAIAnalysis) {
      throw new Error('AI analysis returned null or undefined');
    }
    
    console.log('🔍 New analysis result:', JSON.stringify(newAIAnalysis, null, 2));
    
    // Update the vitals record with new AI analysis
    vitals.aiAnalysis = newAIAnalysis;
    await vitals.save();
    
    console.log('✅ AI analysis regenerated:', newAIAnalysis);
    
    res.status(200).json({
      status: 'success',
      data: {
        vitals
      }
    });
  } catch (error) {
    console.error('❌ Failed to regenerate AI analysis:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to regenerate AI analysis';
    if (error.message.includes('GEMINI_API_KEY')) {
      errorMessage = 'AI service configuration error';
    } else if (error.message.includes('JSON')) {
      errorMessage = 'AI response parsing error';
    } else if (error.message.includes('network') || error.message.includes('timeout')) {
      errorMessage = 'AI service temporarily unavailable';
    }
    
    res.status(500).json({
      status: 'fail',
      message: errorMessage
    });
  }
});

// Get vitals insights/analytics
const getVitalsInsights = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  // Get vitals from last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const recentVitals = await Vitals.find({
    user: userId,
    createdAt: { $gte: thirtyDaysAgo }
  }).sort({ createdAt: -1 });

  // Calculate insights
  const insights = {
    totalRecords: recentVitals.length,
    bloodPressureTrends: [],
    heartRateTrends: [],
    temperatureTrends: [],
    weightTrends: [],
    averageValues: {
      bloodPressure: { systolic: 0, diastolic: 0 },
      heartRate: 0,
      temperature: 0,
      weight: 0
    }
  };

  let systolicSum = 0, diastolicSum = 0, systolicCount = 0, diastolicCount = 0;
  let heartRateSum = 0, heartRateCount = 0;
  let temperatureSum = 0, temperatureCount = 0;
  let weightSum = 0, weightCount = 0;

  recentVitals.forEach(vital => {
    // Blood pressure trends
    if (vital.bloodPressure && vital.bloodPressure.systolic && vital.bloodPressure.diastolic) {
      insights.bloodPressureTrends.push({
        date: vital.createdAt,
        systolic: vital.bloodPressure.systolic,
        diastolic: vital.bloodPressure.diastolic
      });
      systolicSum += vital.bloodPressure.systolic;
      diastolicSum += vital.bloodPressure.diastolic;
      systolicCount++;
      diastolicCount++;
    }

    // Heart rate trends
    if (vital.heartRate && vital.heartRate.bpm) {
      insights.heartRateTrends.push({
        date: vital.createdAt,
        bpm: vital.heartRate.bpm
      });
      heartRateSum += vital.heartRate.bpm;
      heartRateCount++;
    }

    // Temperature trends
    if (vital.temperature && vital.temperature.value) {
      insights.temperatureTrends.push({
        date: vital.createdAt,
        value: vital.temperature.value,
        unit: vital.temperature.unit
      });
      temperatureSum += vital.temperature.value;
      temperatureCount++;
    }

    // Weight trends
    if (vital.weight && vital.weight.value) {
      insights.weightTrends.push({
        date: vital.createdAt,
        value: vital.weight.value,
        unit: vital.weight.unit
      });
      weightSum += vital.weight.value;
      weightCount++;
    }
  });

  // Calculate averages
  if (systolicCount > 0) {
    insights.averageValues.bloodPressure.systolic = Math.round(systolicSum / systolicCount);
    insights.averageValues.bloodPressure.diastolic = Math.round(diastolicSum / diastolicCount);
  }
  if (heartRateCount > 0) {
    insights.averageValues.heartRate = Math.round(heartRateSum / heartRateCount);
  }
  if (temperatureCount > 0) {
    insights.averageValues.temperature = Math.round((temperatureSum / temperatureCount) * 10) / 10;
  }
  if (weightCount > 0) {
    insights.averageValues.weight = Math.round((weightSum / weightCount) * 10) / 10;
  }

  res.status(200).json({
    status: 'success',
    data: {
      insights
    }
  });
});

module.exports = {
  createVitals,
  getMyVitals,
  getVitals,
  updateVitals,
  deleteVitals,
  regenerateAIAnalysis,
  getVitalsInsights
};
