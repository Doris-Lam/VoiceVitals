const mongoose = require('mongoose');
const HealthRecord = require('./models/HealthRecord');
const Vitals = require('./models/Vitals');
const Medication = require('./models/Medication');
require('dotenv').config();

// Test data for achievements
const testHealthRecord = {
  user: '507f1f77bcf86cd799439011', // Test user ID
  transcript: 'I have a headache and feel tired today',
  symptoms: [
    {
      name: 'headache',
      severity: 6,
      duration: '2 hours',
      notes: 'Moderate headache'
    },
    {
      name: 'fatigue',
      severity: 4,
      duration: '1 day',
      notes: 'Feeling tired'
    }
  ],
  severity: 5,
  waterIntake: 2000, // 8 cups in ml
  sleep: {
    hours: 7.5,
    quality: 'good'
  },
  notes: 'Test health record for achievements',
  recordType: 'voice'
};

const testVitals = {
  user: '507f1f77bcf86cd799439011',
  bloodPressure: {
    systolic: 120,
    diastolic: 80
  },
  heartRate: 72,
  temperature: 98.6,
  weight: 150
};

const testMedication = {
  user: '507f1f77bcf86cd799439011',
  name: 'Test Medication',
  dosage: '10mg',
  frequency: 'daily',
  timeOfDay: ['morning'],
  startDate: new Date(),
  isActive: true
};

async function testAchievements() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voicevitals');
    console.log('✅ Connected to MongoDB');

    // Clear existing test data
    await HealthRecord.deleteMany({ user: '507f1f77bcf86cd799439011' });
    await Vitals.deleteMany({ user: '507f1f77bcf86cd799439011' });
    await Medication.deleteMany({ user: '507f1f77bcf86cd799439011' });
    console.log('🧹 Cleared existing test data');

    // Create test data
    const healthRecord = await HealthRecord.create(testHealthRecord);
    const vitals = await Vitals.create(testVitals);
    const medication = await Medication.create(testMedication);
    
    console.log('✅ Created test data:');
    console.log(`  - Health Record: ${healthRecord._id}`);
    console.log(`  - Vitals: ${vitals._id}`);
    console.log(`  - Medication: ${medication._id}`);

    // Test achievements calculation
    const healthRecords = await HealthRecord.find({ user: '507f1f77bcf86cd799439011' });
    const vitalsRecords = await Vitals.find({ user: '507f1f77bcf86cd799439011' });
    const medications = await Medication.find({ user: '507f1f77bcf86cd799439011' });

    console.log('\n📊 Data Summary:');
    console.log(`  - Health Records: ${healthRecords.length}`);
    console.log(`  - Vitals: ${vitalsRecords.length}`);
    console.log(`  - Medications: ${medications.length}`);

    // Test streak calculation
    const today = new Date();
    const todayRecords = healthRecords.filter(record => {
      const recordDate = new Date(record.createdAt);
      return recordDate.toDateString() === today.toDateString();
    });

    console.log('\n🏆 Achievement Calculations:');
    console.log(`  - Today's Records: ${todayRecords.length}`);
    console.log(`  - Water Intake: ${healthRecords[0].waterIntake}ml (${healthRecords[0].waterIntake / 250} cups)`);
    console.log(`  - Sleep Hours: ${healthRecords[0].sleep?.hours || 0}`);
    console.log(`  - Active Medications: ${medications.filter(m => m.isActive).length}`);

    console.log('\n🎯 Test completed successfully!');
    console.log('🚀 You can now start the server with: npm start');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testAchievements();
