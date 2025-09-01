const express = require('express');
const multer = require('multer');
const healthController = require('../controllers/healthController');
const { protect } = require('../utils/auth');

const router = express.Router();

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'fail',
        message: 'File too large. Maximum size is 10MB.'
      });
    }
  } else if (error.message === 'Only audio files are allowed') {
    return res.status(400).json({
      status: 'fail',
      message: 'Only audio files are allowed.'
    });
  }
  
  return res.status(500).json({
    status: 'fail',
    message: 'File upload error.'
  });
};

// All routes require authentication
router.use(protect);

// Audio processing route
router.post('/process', upload.single('audio'), handleMulterError, healthController.processAudioRecording);

// Health record routes
router.route('/')
  .get(healthController.getMyHealthRecords)
  .post(healthController.createHealthRecord);

router.get('/insights', healthController.getHealthInsights);



router.route('/:id')
  .get(healthController.getHealthRecord)
  .patch(healthController.updateHealthRecord)
  .delete(healthController.deleteHealthRecord);

module.exports = router;
