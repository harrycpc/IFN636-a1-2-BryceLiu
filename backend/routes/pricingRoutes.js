const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const pricingController = require('../controllers/pricingController');

// Public endpoint: pricing rules for display
router.get('/public', pricingController.getPublicPricing);

// Admin endpoints — protect + admin middleware
router.get('/admin/long-stay-rules', protect, admin, pricingController.getAllLongStayRules);
router.post('/admin/long-stay-rules', protect, admin, pricingController.createLongStayRule);
router.put('/admin/long-stay-rules/:id', protect, admin, pricingController.updateLongStayRule);
router.delete('/admin/long-stay-rules/:id', protect, admin, pricingController.deleteLongStayRule);

router.get('/admin/weekend-surcharge', protect, admin, pricingController.getWeekendSurcharge);
router.put('/admin/weekend-surcharge', protect, admin, pricingController.updateWeekendSurcharge);

module.exports = router;

