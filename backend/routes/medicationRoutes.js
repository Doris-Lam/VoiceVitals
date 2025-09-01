const express = require('express');
const medicationController = require('../controllers/medicationController');
const { protect } = require('../utils/auth');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Medication CRUD operations
router.route('/')
  .get(medicationController.getUserMedications)
  .post(medicationController.createMedication);

router.route('/:id')
  .get(medicationController.getMedication)
  .patch(medicationController.updateMedication)
  .delete(medicationController.deleteMedication);

// Additional medication routes
router.get('/category/:category', medicationController.getMedicationsByCategory);
router.get('/active', medicationController.getActiveMedications);
router.patch('/:id/toggle-status', medicationController.toggleMedicationStatus);
router.get('/refill-reminders', medicationController.getRefillReminders);
router.get('/search', medicationController.searchMedications);

module.exports = router;
