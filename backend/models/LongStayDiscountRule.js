const mongoose = require('mongoose');

// Keep pricing rules simple and editable by admin
// One record per long-stay rule: `minDays` -> `discountRate` (percentage)
const longStayDiscountRuleSchema = new mongoose.Schema(
  {
    minDays: {
      type: Number,
      required: true,
      min: 1,
    },
    discountRate: {
      // stored as percentage, e.g. 5 for 5%
      type: Number,
      required: true,
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

module.exports = mongoose.model('LongStayDiscountRule', longStayDiscountRuleSchema);

