const LongStayDiscountRule = require('../models/LongStayDiscountRule');

// Long-stay discount strategy
// Provides helpers to determine discount rate/amount based on rental days

/**
 * Find the applicable discount rate (percentage) for given days.
 * Returns 0 if no rule matches.
 */
const getDiscountRateForDays = async (days) => {
  if (!days || days < 1) return 0;

  // Get active rules sorted by minDays descending so we can pick the best match
  const rules = await LongStayDiscountRule.find({ active: true }).sort({ minDays: -1 });

  for (const r of rules) {
    if (days >= r.minDays) {
      return Number(r.discountRate) || 0;
    }
  }

  return 0;
};

/**
 * Calculate discount amount given base price and days.
 * Returns { rate, amount }
 */
const calculateDiscount = async (baseAmount, days) => {
  const rate = await getDiscountRateForDays(days);
  const amount = (baseAmount * rate) / 100;
  return { rate, amount };
};

module.exports = { getDiscountRateForDays, calculateDiscount };

