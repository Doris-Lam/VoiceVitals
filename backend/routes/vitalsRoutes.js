const express = require('express');
const vitalsController = require('../controllers/vitalsController');
const { protect } = require('../utils/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Vitals routes
router.route('/')
  .get(vitalsController.getMyVitals)
  .post(vitalsController.createVitals);

router.get('/insights', vitalsController.getVitalsInsights);

router.route('/:id')
  .get(vitalsController.getVitals)
  .patch(vitalsController.updateVitals)
  .delete(vitalsController.deleteVitals);

router.post('/:id/regenerate-analysis', vitalsController.regenerateAIAnalysis);

module.exports = router;
