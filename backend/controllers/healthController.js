const HealthRecord = require('../models/HealthRecord');
const { analyzeHealthTranscript, processAudioToText } = require('../services/geminiService');

// Error handling wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Process audio recording and create health record
const processAudioRecording = catchAsync(async (req, res, next) => {
  console.log('🎤 Processing audio recording...');
  console.log('👤 User ID:', req.user.id);

  if (!req.file) {
    console.log('❌ No audio file provided');
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide an audio file'
    });
  }

  try {
    console.log('🔊 Processing audio file:', req.file.originalname, 'Size:', req.file.size, 'bytes');
    
    // Process the actual audio file to extract text
    console.log('🔊 Converting audio to text...');
    const transcript = await processAudioToText(req.file.buffer);
    
    console.log('📝 Generated transcript:', transcript);
    
    // Use Gemini AI to analyze the transcript
    console.log('🔍 Starting AI analysis...');
    const aiAnalysis = await analyzeHealthTranscript(transcript);
    
    console.log('✅ AI analysis completed:', JSON.stringify(aiAnalysis, null, 2));

    // Return the processed data
    res.status(200).json({
      status: 'success',
      data: {
        transcript: transcript,
        analysis: aiAnalysis
      }
    });

  } catch (error) {
    console.error('❌ Audio processing failed:', error);
    res.status(500).json({
      status: 'fail',
      message: 'Failed to process audio recording'
    });
  }
});

// Process voice transcript and create health record
const createHealthRecord = catchAsync(async (req, res, next) => {
  const { 
    transcript, 
    vitals, 
    recordType = 'voice',
    symptoms = [],
    severity,
    waterIntake,
    sleep,
    notes
  } = req.body;

  console.log('🎤 Received health record request:', { 
    transcript, 
    vitals, 
    recordType, 
    symptoms, 
    severity, 
    waterIntake, 
    sleep 
  });
  console.log('👤 User ID:', req.user.id);

  // For manual vitals entry, transcript is optional
  if (!transcript && recordType === 'voice') {
    console.log('❌ No transcript provided for voice record');
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide a transcript for voice records'
    });
  }

  // For manual vitals entry, at least one vital sign should be provided
  if (recordType === 'manual' && (!vitals || Object.keys(vitals).length === 0)) {
    // Allow water intake records to bypass vitals requirement
    if (!waterIntake || waterIntake <= 0) {
      console.log('❌ No vitals data provided for manual record');
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide at least one vital sign for manual records'
      });
    }
  }

  // For water intake records, waterIntake is required and we skip AI analysis
  if (waterIntake && waterIntake > 0) {
    console.log('💧 Water intake record detected, skipping AI analysis');
    recordType = 'water'; // Override record type for water records
  }

  let aiAnalysis = {};
  
  // Only perform AI analysis for voice records that aren't just water intake
  if (transcript && recordType === 'voice' && !waterIntake) {
    console.log('🔍 Starting AI analysis...');
    aiAnalysis = await analyzeHealthTranscript(transcript);
    console.log('✅ AI analysis completed:', JSON.stringify(aiAnalysis, null, 2));
  }

  const healthRecord = await HealthRecord.create({
    user: req.user.id,
    transcript: transcript || (recordType === 'water' ? 'Water intake logged' : 'Manual entry'),
    vitals: vitals || {},
    symptoms,
    severity,
    waterIntake,
    sleep,
    notes,
    ...aiAnalysis,
    recordType
  });

  console.log('💾 Health record saved:', healthRecord._id);

  res.status(201).json({
    status: 'success',
    data: {
      healthRecord
    }
  });
});

// Get all health records for current user
const getMyHealthRecords = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const records = await HealthRecord.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip(skip);

  const total = await HealthRecord.countDocuments({ user: req.user.id });

  res.status(200).json({
    status: 'success',
    results: records.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      records
    }
  });
});

// Get specific health record
const getHealthRecord = catchAsync(async (req, res, next) => {
  const record = await HealthRecord.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!record) {
    return res.status(404).json({
      status: 'fail',
      message: 'No health record found with that ID'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      record
    }
  });
});

// Update health record
const updateHealthRecord = catchAsync(async (req, res, next) => {
  const allowedFields = [
    'symptoms', 
    'medications', 
    'vitals', 
    'tags', 
    'isPrivate',
    'severity',
    'waterIntake',
    'sleep',
    'notes'
  ];
  const filteredBody = {};
  Object.keys(req.body).forEach(el => {
    if (allowedFields.includes(el)) {
      filteredBody[el] = req.body[el];
    }
  });

  const record = await HealthRecord.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    filteredBody,
    {
      new: true,
      runValidators: true
    }
  );

  if (!record) {
    return res.status(404).json({
      status: 'fail',
      message: 'No health record found with that ID'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      record
    }
  });
});

// Delete health record
const deleteHealthRecord = catchAsync(async (req, res, next) => {
  const record = await HealthRecord.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id
  });

  if (!record) {
    return res.status(404).json({
      status: 'fail',
      message: 'No health record found with that ID'
    });
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});



// Get health insights/analytics
const getHealthInsights = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  // Get records from last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const recentRecords = await HealthRecord.find({
    user: userId,
    createdAt: { $gte: thirtyDaysAgo }
  }).sort({ createdAt: -1 });

  // Calculate insights
  const insights = {
    totalRecords: recentRecords.length,
    symptomsFrequency: {},
    medicationsFrequency: {},
    urgencyLevels: {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0
    },
    averageSymptomSeverity: 0,
    recentTrends: []
  };

  let totalSeverity = 0;
  let severityCount = 0;

  recentRecords.forEach(record => {
    // Count symptoms
    record.symptoms?.forEach(symptom => {
      insights.symptomsFrequency[symptom.name] = 
        (insights.symptomsFrequency[symptom.name] || 0) + 1;
      
      if (symptom.severity) {
        totalSeverity += symptom.severity;
        severityCount++;
      }
    });

    // Count medications
    record.medications?.forEach(medication => {
      insights.medicationsFrequency[medication.name] = 
        (insights.medicationsFrequency[medication.name] || 0) + 1;
    });

    // Count urgency levels
    if (record.aiAnalysis?.urgencyLevel) {
      insights.urgencyLevels[record.aiAnalysis.urgencyLevel]++;
    }
  });

  if (severityCount > 0) {
    insights.averageSymptomSeverity = totalSeverity / severityCount;
  }

  res.status(200).json({
    status: 'success',
    data: {
      insights
    }
  });
});



module.exports = {
  processAudioRecording,
  createHealthRecord,
  getMyHealthRecords,
  getHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  getHealthInsights
};
