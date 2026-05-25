const LongStayDiscountRule = require('../models/LongStayDiscountRule');

// Long-stay discount decorator
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


/**
 * Class-based decorator: wraps an inner pricing component and applies long-stay discount
 * Discount is calculated based on the base amount (legacy behaviour) but applied after any surcharges
 * The inner component must expose an async `calculate({ car, pickupDate, returnDate })` method
 */
class LongStayDiscountDecorator {
  constructor(innerComponent) {
    this.inner = innerComponent;
  }

  async calculate({ car, pickupDate, returnDate }) {
    const inner = await this.inner.calculate({ car, pickupDate, returnDate });

    const days = inner.breakdown?.days || 0;
    const base = inner.breakdown?.base || 0;

    const { rate, amount } = await calculateDiscount(base, days);

    const total = Number((inner.total - amount).toFixed(2));

    const breakdown = {
      ...inner.breakdown,
      discount: { rate, amount: Number(amount.toFixed(2)) },
    };

    return { total, breakdown };
  }
}

// keep legacy factory
const createLongStayDecorator = (innerComponent) => new LongStayDiscountDecorator(innerComponent);

module.exports = { getDiscountRateForDays, calculateDiscount, LongStayDiscountDecorator, createLongStayDecorator };

