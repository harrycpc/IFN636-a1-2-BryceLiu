const mongoose = require('mongoose');

// Global pricing settings stored as a single document
// Keep weekend surcharge as a single configurable percentage
const pricingSettingSchema = new mongoose.Schema(
  {
    weekendSurchargeRate: {
      // stored as percentage, e.g. 20 for 20%
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PricingSetting', pricingSettingSchema);

